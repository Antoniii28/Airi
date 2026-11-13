// AIRI v0.7 — Verifica un despliegue del piloto SIN modificarlo (solo lecturas y peticiones rechazadas de antemano).
//   node publico/herramientas/verificar-despliegue.mjs https://airi-piloto.<subdominio>.workers.dev
// Comprueba versión, archivos (contra publico/dist local), cabeceras de seguridad y que /api/chat rechace un origen
// ajeno. NO envía códigos de acceso, NO usa Turnstile, NO consulta Gemini y NO cuenta como intento fallido
// (el origen se valida antes de tocar las cuotas). No necesita ni muestra secretos.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VERSION } from "../version.mjs";
import { huellaArchivo } from "../preparar-estaticos.mjs";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const base = (process.argv[2] || "").replace(/\/+$/, "");
if (!/^https?:\/\/[^/]+$/.test(base)) { console.error("Uso: node publico/herramientas/verificar-despliegue.mjs https://<dominio-del-piloto>"); process.exit(2); }

const resultados = [];
const ok = (cond, texto) => { resultados.push(!!cond); console.log((cond ? "OK    " : "FALLA ") + texto); };
const aviso = (texto) => console.log("AVISO " + texto);
const pedir = async (ruta, init) => { try { return await fetch(base + ruta, { redirect: "manual", ...init }); } catch (e) { return { status: 0, headers: new Headers(), text: async () => "", arrayBuffer: async () => new ArrayBuffer(0), error: e }; } };
const SECRETO = /AIza[0-9A-Za-z_-]{20,}|"secret"|GEMINI_API_KEY|TURNSTILE_SECRET|AIRI_SAL|AIRI_CODIGOS/;

// 1. Estado del Worker
const re = await pedir("/api/estado");
if (re.status === 0) { console.log(`FALLA no se pudo conectar con ${base}: ${re.error?.cause?.code || re.error?.message}`); process.exit(1); }
const textoEstado = await re.text();
let estado = {};
try { estado = JSON.parse(textoEstado); } catch { /* se informa abajo */ }
ok(re.status === 200 && estado.modo === "publico", `/api/estado responde (HTTP ${re.status}, modo ${estado.modo})`);
ok(estado.version === VERSION, `versión del Worker desplegado = versión local (${estado.version ?? "sin versión: despliegue anterior a 0.7.3"} / ${VERSION})`);
ok(!SECRETO.test(textoEstado), "/api/estado no contiene secretos");
ok(re.headers.get("cache-control") === "no-store" && /default-src 'none'/.test(re.headers.get("content-security-policy") || ""), "/api/estado con cabeceras de seguridad");
console.log(`INFO  chat ${estado.activo ? "ACTIVO" : "desactivado"} · Turnstile ${estado.turnstile_sitekey ? "configurado" : "sin sitekey (normal si está desactivado)"}`);

// 2. Archivos publicados frente a publico/dist local
const local = existsSync(join(DIST, "version.json")) ? JSON.parse(readFileSync(join(DIST, "version.json"), "utf-8")) : null;
const rv = await pedir("/version.json");
let remoto = null;
try { remoto = rv.status === 200 ? JSON.parse(await rv.text()) : null; } catch { /* inválido */ }
if (!local) aviso("no hay publico/dist/version.json local: ejecuta antes «node publico/preparar-estaticos.mjs» para comparar");
ok(remoto, `version.json publicado (HTTP ${rv.status}${remoto ? `, versión ${remoto.version}, commit ${remoto.commit}` : ""})`);
if (local && remoto) ok(remoto.huella === local.huella, `los archivos publicados son idénticos a publico/dist local (commit local ${local.commit})`);
for (const ruta of ["/interfaz/chat/acceso-publico.js", "/interfaz/chat/chat.js", "/interfaz/prototipo/index.html"]) {
  const r = await pedir(ruta);
  const bytes = Buffer.from(await r.arrayBuffer());
  const archivoLocal = join(DIST, ruta);
  if (r.status === 200 && existsSync(archivoLocal))
    ok(huellaArchivo(bytes, ruta) === huellaArchivo(readFileSync(archivoLocal), ruta), `${ruta} coincide con la copia local`);
  else ok(r.status === 200, `${ruta} disponible (HTTP ${r.status})`);
  if (ruta.endsWith("acceso-publico.js")) {
    const t = bytes.toString("utf-8");
    ok(t.includes("airi-chat-codigo-mostrar") && t.includes("normalizarCodigo"), "la interfaz publicada incluye la corrección de códigos (PR #11)");
    ok(t.includes("mayores de 18"), "la interfaz publicada conserva el aviso de mayoría de edad");
  }
}

// 3. Cabeceras de la página
const rp = await pedir("/interfaz/prototipo/index.html");
const csp = rp.headers.get("content-security-policy") || "";
ok(/script-src 'self' 'sha256-/.test(csp) && /frame-ancestors 'none'/.test(csp), "CSP estricta en la página");
if (existsSync(join(DIST, "_headers"))) {
  const cspLocal = (readFileSync(join(DIST, "_headers"), "utf-8").match(/Content-Security-Policy: (.*)/) || [])[1];
  ok(csp === cspLocal, "la CSP publicada coincide con la local (huella del script en línea correcta)");
}
ok((rp.headers.get("permissions-policy") || "").includes("microphone=(self)") && rp.headers.get("x-frame-options") === "DENY", "Permissions-Policy y X-Frame-Options");

// 4. Lo que NO debe publicarse
for (const ruta of ["/_headers", "/chat/servidor.py", "/publico/worker.js", "/interfaz/chat/pruebas/e2e_chat.py", "/.dev.vars"]) {
  const r = await pedir(ruta);
  ok(r.status !== 200 || !(await r.text()).trim(), `${ruta} no se publica (HTTP ${r.status})`);
}

// 5. Controles del Worker sin consumir nada
const r405 = await pedir("/api/chat");
ok(r405.status === 405, `GET /api/chat → 405 (HTTP ${r405.status})`);
const r403 = await pedir("/api/chat", { method: "POST", headers: { origin: "https://origen-ajeno.invalid", "content-type": "application/json" }, body: "{}" });
ok(estado.activo ? r403.status === 403 : [403, 503].includes(r403.status), `POST desde un origen ajeno rechazado (HTTP ${r403.status})`);
ok(!SECRETO.test(await r403.text()), "el rechazo no contiene secretos");

const n = resultados.filter(Boolean).length;
console.log(`\n${n} de ${resultados.length} comprobaciones superadas.`);
process.exit(n === resultados.length ? 0 : 1);
