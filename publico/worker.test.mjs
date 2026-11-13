// Pruebas del Worker del piloto (v0.7 E2–E5). Sin red, sin Cloudflare real y sin Gemini real.
//   cd publico && node --test
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { manejar, validarMensajes, revisarConfiguracion, leerCodigos, sha256 } from "./worker.js";
import { SISTEMA } from "./gemini.js";
import { entorno, redSimulada, peticion, espacioCuotas, ORIGEN, CODIGO, CODIGO2, CLAVE_FICTICIA } from "./pruebas/apoyo.mjs";

const llamar = async (req, env, red = redSimulada()) => ({ r: await manejar(req, env, {}, { fetch: red.fetch }), red });
const cuerpo = async (r) => r.json();
const conTurnstile = (texto = "Hola", token = "token-valido") => JSON.stringify({ messages: [{ role: "user", text: texto }], turnstile: token });

// ── Validación de la conversación (casos heredados del prototipo) ─────────────
test("mensajes válidos y alternados", () => {
  assert.equal(validarMensajes({ messages: [{ role: "user", text: "Hola" }] }).length, 1);
  assert.equal(validarMensajes({ messages: [{ role: "user", text: "A" }, { role: "model", text: "B" }, { role: "user", text: "C" }] }).length, 3);
});
test("mensajes inválidos", () => {
  for (const d of [null, {}, { messages: [] }, { messages: [{ role: "model", text: "Hola" }] },
    { messages: [{ role: "user", text: "A" }, { role: "user", text: "B" }] }, { messages: [{ role: "user", text: "A" }, { role: "model", text: "B" }] },
    { messages: [{ role: "user", text: "x".repeat(2501) }] }, { messages: [{ role: "user", text: { a: 1 } }] },
    { messages: [{ role: "system", text: "x" }] }, { messages: [{ role: "user", text: "" }] },
    { messages: Array.from({ length: 13 }, (_, i) => ({ role: i % 2 ? "model" : "user", text: "x" })) }])
    assert.equal(validarMensajes(d), null, JSON.stringify(d)?.slice(0, 60));
});

// ── Cierre por defecto ────────────────────────────────────────────────────────
test("sin configuración esencial queda cerrado (503) y no llama a nada externo", async () => {
  const base = await entorno();
  for (const falta of ["GEMINI_API_KEY", "TURNSTILE_SECRET", "AIRI_TURNSTILE_SITEKEY", "AIRI_SAL", "AIRI_CODIGOS", "AIRI_ORIGEN", "AIRI_PAISES_PERMITIDOS", "CUOTAS"]) {
    const env = { ...base, [falta]: undefined };
    const { r, red } = await llamar(peticion(), env);
    assert.equal(r.status, 503, falta);
    assert.equal(red.turnstile.length + red.gemini.length, 0, falta);
  }
  assert.equal(base.CUOTAS.llamadas, 0);
});
test("configuración mal formada también cierra", async () => {
  const base = await entorno();
  for (const [k, v] of [["AIRI_ORIGEN", "http://airi.example"], ["AIRI_ORIGEN", "https://airi.example/ruta"], ["AIRI_CODIGOS", "p01:abc"],
    ["AIRI_PAISES_PERMITIDOS", "mx"], ["AIRI_LIMITE_MINUTO", "0"], ["AIRI_LIMITE_DIA", "-3"], ["AIRI_MODELO", "../otro"], ["AIRI_SAL", "corta"]])
    assert.equal(revisarConfiguracion({ ...base, [k]: v }).ok, false, `${k}=${v}`);
  assert.equal(revisarConfiguracion(base).ok, true);
});
test("interruptor: apagado salvo AIRI_CHAT_APAGADO=\"0\"", async () => {
  for (const v of [undefined, "", "1", "true", "no"]) {
    const env = await entorno({ AIRI_CHAT_APAGADO: v });
    const { r, red } = await llamar(peticion(), env);
    assert.equal(r.status, 503, String(v));
    assert.equal(red.gemini.length + red.turnstile.length, 0);
  }
});
test("/api/estado no expone secretos y refleja el estado", async () => {
  const env = await entorno({ AIRI_CHAT_APAGADO: "1" });
  let d = await cuerpo(await manejar(peticion({ metodo: "GET", ruta: "/api/estado" }), env));
  assert.deepEqual([d.modo, d.activo, d.turnstile_sitekey], ["publico", false, null]);
  const env2 = await entorno();
  const texto = await (await manejar(peticion({ metodo: "GET", ruta: "/api/estado" }), env2)).text();
  d = JSON.parse(texto);
  assert.equal(d.activo, true); assert.equal(d.turnstile_sitekey, env2.AIRI_TURNSTILE_SITEKEY);
  for (const s of [env2.GEMINI_API_KEY, env2.TURNSTILE_SECRET, env2.AIRI_SAL, env2.AIRI_CODIGOS]) assert.ok(!texto.includes(s));
});

// ── Ruta, método, origen y forma ──────────────────────────────────────────────
test("ruta, método, origen, tipo y tamaño", async () => {
  const env = await entorno();
  assert.equal((await manejar(new Request(ORIGEN + "/otra"), env)).status, 404);
  assert.equal((await manejar(peticion({ metodo: "GET" }), env)).status, 405);
  assert.equal((await manejar(peticion({ metodo: "OPTIONS" }), env)).status, 405);
  assert.equal((await manejar(peticion({ cabeceras: { origin: "https://ajeno.example" } }), env)).status, 403);
  assert.equal((await manejar(peticion({ cabeceras: { origin: null } }), env)).status, 403);
  assert.equal((await manejar(peticion({ cabeceras: { "content-type": "text/plain" } }), env)).status, 415);
  assert.equal((await manejar(peticion({ cabeceras: { "content-length": "999999" } }), env)).status, 413);
  assert.equal((await manejar(peticion({ cuerpo: JSON.stringify({ messages: [{ role: "user", text: "x".repeat(70000) }] }) }), env)).status, 413);
  assert.equal((await manejar(peticion({ cuerpo: "{no json" }), env)).status, 400);
  assert.equal((await manejar(peticion({ cuerpo: JSON.stringify({ messages: [{ role: "model", text: "x" }] }) }), env)).status, 400);
});

// ── Región: solo request.cf.country (Cloudflare) ─────────────────────────────
test("región: permitida solo según request.cf; la cabecera del cliente se ignora", async () => {
  const env = await entorno({ AIRI_PAISES_PERMITIDOS: "MX,ES" });   // ES se rechaza aunque se liste por error
  const casos = [["MX", 200], ["ES", 403], ["GB", 403], ["CH", 403], ["US", 403], ["XX", 403], ["T1", 403]];
  for (const [pais, esperado] of casos) assert.equal((await llamar(peticion({ pais, ip: "198.51.100." + pais.charCodeAt(0) }), env)).r.status, esperado, pais);
  assert.equal((await llamar(peticion({ sinCf: true, cabeceras: { "cf-ipcountry": "MX" } }), env)).r.status, 403);
  assert.equal((await llamar(peticion({ pais: "ES", cabeceras: { "cf-ipcountry": "MX" } }), env)).r.status, 403);
});
test("sin CF-Connecting-IP se rechaza", async () => {
  const env = await entorno();
  assert.equal((await llamar(peticion({ cabeceras: { "cf-connecting-ip": null } }), env)).r.status, 403);
});

// ── Turnstile (solo servidor) ─────────────────────────────────────────────────
test("Turnstile: se verifica en el servidor con secreto, IP y comprobación de dominio y acción", async () => {
  const env = await entorno();
  const { r, red } = await llamar(peticion(), env);
  assert.equal(r.status, 200);
  assert.equal(red.turnstile.length, 1);
  assert.deepEqual([red.turnstile[0].secret, red.turnstile[0].response, red.turnstile[0].remoteip], [env.TURNSTILE_SECRET, "token-valido", "203.0.113.7"]);
  assert.match(red.turnstile[0].idempotency_key, /^[0-9a-f-]{36}$/);
});
test("Turnstile: token ausente, inválido, demasiado largo, de otro dominio, otra acción o sin red → 403 sin Gemini", async () => {
  const env = await entorno();
  const host = new URL(ORIGEN).hostname;
  const casos = [
    [{ cuerpo: JSON.stringify({ messages: [{ role: "user", text: "Hola" }] }) }, null],
    [{ cuerpo: conTurnstile("Hola", "token-falso") }, null],
    [{ cuerpo: conTurnstile("Hola", "x".repeat(2049)) }, null],
    [{}, { turnstileRespuesta: { success: true, hostname: "otro.example", action: "airi-chat" } }],
    [{}, { turnstileRespuesta: { success: true, hostname: host, action: "otra" } }],
    [{}, { turnstileFalla: true }]
  ];
  let i = 0;
  for (const [opc, red] of casos) {
    const { r, red: rr } = await llamar(peticion({ ...opc, ip: "192.0.2." + (++i) }), env, redSimulada(red || {}));
    assert.equal(r.status, 403, String(i)); assert.equal(rr.gemini.length, 0);
  }
});

// ── Código de acceso individual ───────────────────────────────────────────────
test("código: correcto (normaliza espacios y minúsculas), incorrecto y revocado", async () => {
  const env = await entorno();
  assert.equal((await llamar(peticion({ cabeceras: { "x-airi-acceso": "  " + CODIGO.toLowerCase() + " " } }), env)).r.status, 200);
  const mal = await llamar(peticion({ cabeceras: { "x-airi-acceso": "PRUEB-AFICT-ICIA0-99999" }, ip: "192.0.2.50" }), env);
  assert.equal(mal.r.status, 403); assert.equal(mal.red.gemini.length, 0);
  assert.equal((await llamar(peticion({ cabeceras: { "x-airi-acceso": null }, ip: "192.0.2.51" }), env)).r.status, 403);
  // revocar p02: se quita su línea de AIRI_CODIGOS
  const revocado = { ...env, AIRI_CODIGOS: `p01:${await sha256(CODIGO)}` };
  assert.equal((await llamar(peticion({ cabeceras: { "x-airi-acceso": CODIGO2 }, ip: "192.0.2.52" }), revocado)).r.status, 403);
  assert.equal((await llamar(peticion({ cabeceras: { "x-airi-acceso": CODIGO2 }, ip: "192.0.2.52" }), env)).r.status, 200);
});
test("leerCodigos rechaza identificadores o huellas repetidas", async () => {
  const h = await sha256(CODIGO);
  assert.equal(leerCodigos(`p01:${h},p02:${h}`), null);
  assert.equal(leerCodigos(`p01:${h},p01:${await sha256(CODIGO2)}`), null);
  assert.equal(leerCodigos(`P01:${h}`), null);
});
test("fuerza bruta: tras 10 fallos desde la misma IP se bloquea (429) sin consultar Turnstile", async () => {
  const env = await entorno();
  for (let i = 0; i < 10; i++)
    assert.equal((await llamar(peticion({ cabeceras: { "x-airi-acceso": "MAL-CODIGO-" + i }, ip: "192.0.2.99" }), env)).r.status, 403);
  const { r, red } = await llamar(peticion({ ip: "192.0.2.99" }), env);
  assert.equal(r.status, 429); assert.equal(red.turnstile.length, 0);
  assert.ok(Number(r.headers.get("retry-after")) > 0);
  assert.equal((await llamar(peticion({ ip: "192.0.2.100" }), env)).r.status, 200);   // otra conexión no se afecta
});

// ── Cuotas compartidas y atómicas ─────────────────────────────────────────────
test("límite por minuto, por día y global", async () => {
  let env = await entorno({ AIRI_LIMITE_MINUTO: "2", AIRI_LIMITE_DIA: "30" });
  for (let i = 0; i < 2; i++) assert.equal((await llamar(peticion(), env)).r.status, 200);
  let x = await llamar(peticion(), env);
  assert.equal(x.r.status, 429); assert.ok(Number(x.r.headers.get("retry-after")) > 0); assert.equal(x.red.gemini.length, 0);
  assert.match((await cuerpo(x.r)).error, /espera un minuto/i);
  assert.equal((await llamar(peticion({ cabeceras: { "x-airi-acceso": CODIGO2 } }), env)).r.status, 200);   // p02 es independiente

  env = await entorno({ AIRI_LIMITE_MINUTO: "60", AIRI_LIMITE_DIA: "3" });
  for (let i = 0; i < 3; i++) await llamar(peticion(), env);
  x = await llamar(peticion(), env);
  assert.equal(x.r.status, 429); assert.match((await cuerpo(x.r)).error, /límite de preguntas de hoy/);

  env = await entorno({ AIRI_LIMITE_MINUTO: "60", AIRI_LIMITE_GLOBAL_DIA: "3" });
  await llamar(peticion(), env); await llamar(peticion(), env);
  await llamar(peticion({ cabeceras: { "x-airi-acceso": CODIGO2 } }), env);
  x = await llamar(peticion({ cabeceras: { "x-airi-acceso": CODIGO2 } }), env);
  assert.equal(x.r.status, 429); assert.match((await cuerpo(x.r)).error, /El piloto alcanzó/);
});
test("concurrencia: 25 peticiones simultáneas con límite 5 → exactamente 5 llegan a Gemini", async () => {
  const env = await entorno({ AIRI_LIMITE_MINUTO: "5" });
  const red = redSimulada();
  const rs = await Promise.all(Array.from({ length: 25 }, () => manejar(peticion(), env, {}, { fetch: red.fetch })));
  assert.equal(rs.filter((r) => r.status === 200).length, 5);
  assert.equal(rs.filter((r) => r.status === 429).length, 20);
  assert.equal(red.gemini.length, 5);
});
test("cuota global compartida entre dos «instancias» del Worker (mismo Durable Object)", async () => {
  const cuotas = espacioCuotas();
  const env1 = await entorno({ AIRI_LIMITE_GLOBAL_DIA: "4", AIRI_LIMITE_MINUTO: "60", CUOTAS: cuotas });
  const env2 = { ...env1 };                         // otra instancia del Worker, mismo binding
  const red = redSimulada();
  const rs = await Promise.all(Array.from({ length: 10 }, (_, i) => manejar(peticion({ cabeceras: { "x-airi-acceso": i % 2 ? CODIGO : CODIGO2 } }), i % 2 ? env1 : env2, {}, { fetch: red.fetch })));
  assert.equal(rs.filter((r) => r.status === 200).length, 4);
  assert.equal(red.gemini.length, 4);
});
test("las cuotas persisten si el Durable Object se reinicia", async () => {
  const cuotas = espacioCuotas();
  const env = await entorno({ AIRI_LIMITE_DIA: "2", AIRI_LIMITE_MINUTO: "60", CUOTAS: cuotas });
  await llamar(peticion(), env); await llamar(peticion(), env);
  cuotas.reiniciar();
  assert.equal((await llamar(peticion(), env)).r.status, 429);
});
test("si el Durable Object falla (p. ej., límite del plan gratuito) queda cerrado sin llamar a Gemini", async () => {
  const env = await entorno({ CUOTAS: { idFromName: () => "x", get: () => ({ fetch: async () => { throw new Error("límite diario"); } }) } });
  const { r, red } = await llamar(peticion(), env);
  assert.equal(r.status, 503); assert.equal(red.gemini.length, 0);
});

// ── Gemini y apagado preventivo ───────────────────────────────────────────────
test("Gemini: respuesta correcta; clave solo en la cabecera; mismas instrucciones que servidor.py", async () => {
  const env = await entorno();
  const { r, red } = await llamar(peticion({ cuerpo: conTurnstile("¿Qué comen los peces payaso?") }), env);
  const d = await cuerpo(r);
  assert.equal(r.status, 200); assert.equal(d.answer, "Respuesta **simulada**."); assert.equal(d.truncada, false);
  const g = red.gemini[0];
  assert.equal(g.cabeceras.get("x-goog-api-key"), CLAVE_FICTICIA);
  assert.ok(!g.url.includes(CLAVE_FICTICIA) && !g.url.includes("key="));
  assert.equal(g.cuerpo.systemInstruction.parts[0].text, SISTEMA);
  assert.deepEqual(g.cuerpo.contents, [{ role: "user", parts: [{ text: "¿Qué comen los peces payaso?" }] }]);
  assert.equal(g.cuerpo.turnstile, undefined);       // el token no se reenvía a Google
});
test("paridad con servidor.py: instrucciones del sistema idénticas", () => {
  const py = execFileSync("python3", ["-c", "import sys,json;sys.path.insert(0,'../chat');import servidor;print(json.dumps(servidor.SISTEMA))"], { encoding: "utf-8" });
  assert.equal(SISTEMA, JSON.parse(py));
});
test("Gemini 429 → mensaje claro y pausa automática: la siguiente consulta no llega a Gemini", async () => {
  const env = await entorno();
  const r1 = await llamar(peticion(), env, redSimulada({ geminiRespuesta: [429, { error: { status: "RESOURCE_EXHAUSTED" } }] }));
  assert.equal(r1.r.status, 429); assert.match((await cuerpo(r1.r)).error, /pausó/);
  const r2 = await llamar(peticion({ cabeceras: { "x-airi-acceso": CODIGO2 } }), env);
  assert.equal(r2.r.status, 503); assert.equal(r2.red.gemini.length, 0);
  assert.match((await cuerpo(r2.r)).error, /pausa preventiva/);
});
test("errores de Gemini sin filtrar detalles internos", async () => {
  const casos = [[[500, {}], 502], [[403, { error: { status: "PERMISSION_DENIED", message: "API key not valid" } }], 502],
    [[200, { promptFeedback: { blockReason: "SAFETY" } }], 422], [[200, { candidates: [] }], 502],
    [[200, { candidates: [{ content: { parts: [] }, finishReason: "SAFETY" }] }], 422]];
  for (const [resp, esperado] of casos) {
    const env = await entorno();
    const { r } = await llamar(peticion(), env, redSimulada({ geminiRespuesta: resp }));
    const t = await r.text();
    assert.equal(r.status, esperado, t);
    assert.ok(!/API key|PERMISSION_DENIED|AIza/.test(t), t);
  }
  const env = await entorno();
  assert.equal((await llamar(peticion(), env, redSimulada({ geminiFalla: true }))).r.status, 504);
});

// ── Secretos y registros ──────────────────────────────────────────────────────
test("ninguna respuesta ni registro contiene secretos, IP, código ni texto de la pregunta", async () => {
  const env = await entorno();
  const registros = []; const original = console.log;
  console.log = (...a) => registros.push(a.join(" "));
  const respuestas = [];
  try {
    for (const p of [peticion({ cuerpo: conTurnstile("pregunta-secreta-123") }), peticion({ cabeceras: { "x-airi-acceso": "MAL-CODIGO-X" } }),
      peticion({ pais: "ES" }), peticion({ metodo: "GET", ruta: "/api/estado" })])
      respuestas.push(await (await manejar(p, env, {}, { fetch: redSimulada().fetch })).text());
  } finally { console.log = original; }
  const todo = respuestas.join("\n") + "\n" + registros.join("\n");
  for (const s of [CLAVE_FICTICIA, env.TURNSTILE_SECRET, env.AIRI_SAL, CODIGO, "MAL-CODIGO-X", "203.0.113.7", "pregunta-secreta-123"])
    assert.ok(!todo.includes(s), "se filtró: " + s);
  assert.ok(registros.length >= 3);
});
test("cabeceras de seguridad en las respuestas de la API", async () => {
  const r = await manejar(peticion(), await entorno(), {}, { fetch: redSimulada().fetch });
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.match(r.headers.get("content-security-policy"), /default-src 'none'/);
  assert.equal(r.headers.get("access-control-allow-origin"), null);
});

// ── Regresión (13-11-2026): códigos válidos rechazados por cómo se escribieron o pegaron ──────────────────────────
// Caso real: Turnstile aprobado, /api/estado activo y respuesta «Código de acceso no válido o revocado».
test("código válido escrito sin guiones, con espacios o con espacio no separable (U+00A0) se acepta", async () => {
  const env = await entorno({ AIRI_FALLOS_MAX_HORA: "1000", AIRI_LIMITE_MINUTO: "60" });
  const variantes = [CODIGO.replaceAll("-", ""), CODIGO.replaceAll("-", " "), CODIGO.toLowerCase().replaceAll("-", ""),
    CODIGO.replace("-", "- "), " " + CODIGO + " ", CODIGO.replaceAll("-", " - ")];
  let i = 0;
  for (const v of variantes)
    assert.equal((await llamar(peticion({ cabeceras: { "x-airi-acceso": v }, ip: "198.51.100." + (++i) }), env)).r.status, 200, JSON.stringify(v));
});
test("la normalización no debilita el control: códigos distintos o incompletos siguen rechazados", async () => {
  const env = await entorno({ AIRI_FALLOS_MAX_HORA: "1000" });
  const malos = [CODIGO.slice(0, -1), CODIGO + "2", CODIGO.replace("P", "R"), CODIGO.slice(0, 5), "PRUEB-AFICT-ICIA0-0000I"];
  let i = 0;
  for (const v of malos)
    assert.equal((await llamar(peticion({ cabeceras: { "x-airi-acceso": v }, ip: "198.51.101." + (++i) }), env)).r.status, 403, v);
});
