// v0.7.3 — Despliegue verificable: versión en /api/estado, version.json, verificador de solo lectura y coherencia
// generador → Worker. Sin red externa; el «despliegue» es la vista previa local con todo lo externo simulado.
import test from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync, execFileSync } from "node:child_process";
import { mkdtempSync, cpSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { manejar, leerCodigos } from "./worker.js";
import { VERSION } from "./version.mjs";
import { preparar } from "./preparar-estaticos.mjs";
import { entorno, redSimulada, peticion } from "./pruebas/apoyo.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..");

async function vistaPrevia(dist, puerto) {
  const proc = spawn("node", [join(AQUI, "dev/servidor-dev.mjs")], { env: { ...process.env, DEV_PUERTO: String(puerto), DEV_DIST: dist }, stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try { await fetch(`http://127.0.0.1:${puerto}/api/estado`); return proc; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
  proc.kill(); throw new Error("no arrancó la vista previa");
}
const verificar = (url) => spawnSync("node", [join(AQUI, "herramientas/verificar-despliegue.mjs"), url], { encoding: "utf-8" });

test("/api/estado publica la versión (sin secretos)", async () => {
  const r = await manejar(peticion({ metodo: "GET", ruta: "/api/estado" }), await entorno());
  assert.equal((await r.json()).version, VERSION);
});

test("generador → Worker: los códigos generados entran, escritos de cualquier forma; uno ajeno no", async () => {
  const salida = execFileSync("node", [join(AQUI, "herramientas/generar-codigos.mjs"), "p01", "p02"], { encoding: "utf-8" });
  const codigos = [...salida.matchAll(/^\s+(p\d\d)\s+(\S+)$/gm)].map((m) => m[2]);
  const linea = salida.split("\n").find((l) => /^p01:[0-9a-f]{64},p02:/.test(l));
  assert.ok(leerCodigos(linea));
  const env = await entorno({ AIRI_CODIGOS: linea, AIRI_LIMITE_MINUTO: "60" });
  let ip = 0;
  for (const c of codigos)
    for (const v of [c, c.toLowerCase(), c.replaceAll("-", ""), c.replaceAll("-", " "), c.replace("-", "- ")])
      assert.equal((await manejar(peticion({ cabeceras: { "x-airi-acceso": v }, ip: "198.51.100." + (++ip) }), env, {}, { fetch: redSimulada().fetch })).status, 200, v);
  const ajeno = execFileSync("node", [join(AQUI, "herramientas/generar-codigos.mjs"), "p01"], { encoding: "utf-8" }).match(/^\s+p01\s+(\S+)$/m)[1];
  assert.equal((await manejar(peticion({ cabeceras: { "x-airi-acceso": ajeno }, ip: "198.51.100.200" }), env, {}, { fetch: redSimulada().fetch })).status, 403);
});

test("version.json: versión, commit y huella estable entre LF y CRLF", () => {
  const base = mkdtempSync(join(tmpdir(), "airi-ver-"));
  try {
    preparar(RAIZ, join(base, "a"));
    const v = JSON.parse(readFileSync(join(base, "a/version.json"), "utf-8"));
    assert.equal(v.version, VERSION); assert.match(v.commit, /^[0-9a-f]{7}|desconocido/); assert.match(v.huella, /^[0-9a-f]{64}$/);
    for (const d of ["interfaz", "identidad-visual"]) cpSync(join(RAIZ, d), join(base, "crlf", d), { recursive: true });
    for (const f of ["interfaz/chat/chat.js", "interfaz/chat/chat.css", "interfaz/prototipo/index.html"]) {
      const p = join(base, "crlf", f); writeFileSync(p, readFileSync(p, "utf-8").replace(/\r?\n/g, "\r\n"));
    }
    preparar(join(base, "crlf"), join(base, "b"));
    assert.equal(JSON.parse(readFileSync(join(base, "b/version.json"), "utf-8")).huella, v.huella);
  } finally { rmSync(base, { recursive: true, force: true }); }
});

test("verificar-despliegue.mjs: despliegue al día → todo OK; interfaz anterior al PR #11 → detectado", async () => {
  preparar();                                                   // publico/dist local = versión actual
  const base = mkdtempSync(join(tmpdir(), "airi-despl-"));
  const procesos = [];
  try {
    procesos.push(await vistaPrevia(join(AQUI, "dist"), 8811));
    const bien = verificar("http://127.0.0.1:8811");
    assert.equal(bien.status, 0, bien.stdout);
    assert.match(bien.stdout, /de \d+ comprobaciones superadas/);
    assert.doesNotMatch(bien.stdout, /FALLA/);

    // «Despliegue» desactualizado: interfaz sin la corrección del PR #11 (commit 5e68c60)
    for (const d of ["interfaz", "identidad-visual"]) cpSync(join(RAIZ, d), join(base, "viejo", d), { recursive: true });
    writeFileSync(join(base, "viejo/interfaz/chat/acceso-publico.js"),
      execFileSync("git", ["show", "5e68c60:interfaz/chat/acceso-publico.js"], { cwd: RAIZ, encoding: "utf-8" }));
    preparar(join(base, "viejo"), join(base, "dist-viejo"));
    procesos.push(await vistaPrevia(join(base, "dist-viejo"), 8812));
    const mal = verificar("http://127.0.0.1:8812");
    assert.equal(mal.status, 1);
    assert.match(mal.stdout, /FALLA los archivos publicados son idénticos/);
    assert.match(mal.stdout, /FALLA la interfaz publicada incluye la corrección de códigos/);
    assert.match(mal.stdout, /FALLA \/interfaz\/chat\/acceso-publico\.js coincide/);
  } finally {
    procesos.forEach((p) => p.kill());
    rmSync(base, { recursive: true, force: true });
  }
});

const leerJsonc = (f) => JSON.parse(readFileSync(join(AQUI, f), "utf-8").replace(/^\s*\/\/.*$/gm, ""));
const build = (args, wranglerCommand) => spawnSync("node", [join(AQUI, "preparar-estaticos.mjs"), ...args],
  { cwd: AQUI, encoding: "utf-8", env: { ...process.env, WRANGLER_COMMAND: wranglerCommand || "" } });

test("wrangler.jsonc es solo plantilla: «wrangler dev» funciona y «wrangler deploy» se cancela", () => {
  const cfg = leerJsonc("wrangler.jsonc");
  assert.equal(cfg.build.command, "node preparar-estaticos.mjs --plantilla");
  assert.equal(cfg.vars.AIRI_CHAT_APAGADO, "1");
  assert.equal(build(["--plantilla"], "dev").status, 0);
  for (const cmd of ["deploy", "versions upload"]) {
    const r = build(["--plantilla"], cmd);
    assert.equal(r.status, 1, cmd); assert.match(r.stderr, /PLANTILLA/);
  }
});

test("wrangler.produccion.jsonc: Worker existente «airi», sin secretos, y el despliegue se cancela si falta algo", async () => {
  const { revisarProduccion } = await import("./preparar-estaticos.mjs");
  const texto = readFileSync(join(AQUI, "wrangler.produccion.jsonc"), "utf-8");
  const cfg = leerJsonc("wrangler.produccion.jsonc");
  assert.equal(cfg.name, "airi");
  assert.equal(cfg.vars.AIRI_ORIGEN, "https://airi.florescuamatzijoseantonio.workers.dev");
  assert.equal(cfg.vars.AIRI_PAISES_PERMITIDOS, "MX");
  assert.deepEqual(cfg.assets.run_worker_first, ["/api/*"]);
  assert.deepEqual(cfg.migrations, leerJsonc("wrangler.jsonc").migrations);   // misma migración que el Worker creado con la plantilla
  for (const s of ["GEMINI_API_KEY", "TURNSTILE_SECRET", "AIRI_CODIGOS", "AIRI_SAL"]) assert.ok(!(s in cfg.vars), s);
  // Con el texto de ejemplo en la sitekey, el build (y por tanto el despliegue) se cancela
  const r = build(["--produccion", "wrangler.produccion.jsonc"], "deploy");
  assert.equal(r.status, 1); assert.match(r.stderr, /AIRI_TURNSTILE_SITEKEY/);
  // Una configuración completa (sitekey ficticia) pasa; errores típicos se detectan
  const completa = texto.replace("PEGAR-AQUI-LA-SITEKEY-PUBLICA", "0x4AAAAAAAficticiaXYZ");
  assert.deepEqual(revisarProduccion(completa), []);
  const casos = [[/"name": "airi"/, '"name": "airi-piloto"', /name/], [/"AIRI_CHAT_APAGADO": "0"/, '"AIRI_CHAT_APAGADO": "no"', /APAGADO/],
    [/"AIRI_ORIGEN": "[^"]+"/, '"AIRI_ORIGEN": ""', /ORIGEN/], [/"AIRI_PAISES_PERMITIDOS": "MX",/, '"AIRI_PAISES_PERMITIDOS": "MX", "GEMINI_API_KEY": "x",', /SECRETO/],
    [/0x4AAAAAAAficticiaXYZ/, "1x00000000000000000000AA", /PRUEBA/]];
  for (const [busca, cambia, error] of casos) assert.match(revisarProduccion(completa.replace(busca, cambia)).join(" "), error, String(cambia));
  // Cerrar el chat en producción (emergencia) debe poder desplegarse
  assert.deepEqual(revisarProduccion(completa.replace('"AIRI_CHAT_APAGADO": "0"', '"AIRI_CHAT_APAGADO": "1"')), []);
});

test("cierre de emergencia: con AIRI_CHAT_APAGADO=\"1\" el chat queda cerrado, la interfaz sigue y los controles no cambian", async () => {
  const { revisarProduccion } = await import("./preparar-estaticos.mjs");
  const cfg = leerJsonc("wrangler.produccion.jsonc");
  const cerrado = { ...cfg.vars, AIRI_CHAT_APAGADO: "1", AIRI_TURNSTILE_SITEKEY: "0x4AAAAAAAficticiaXYZ" };
  const texto = readFileSync(join(AQUI, "wrangler.produccion.jsonc"), "utf-8")
    .replace("PEGAR-AQUI-LA-SITEKEY-PUBLICA", "0x4AAAAAAAficticiaXYZ").replace('"AIRI_CHAT_APAGADO": "0"', '"AIRI_CHAT_APAGADO": "1"');
  assert.deepEqual(revisarProduccion(texto), []);
  for (const v of ["", "true", "2", "abierto"])
    assert.match(revisarProduccion(texto.replace('"AIRI_CHAT_APAGADO": "1"', `"AIRI_CHAT_APAGADO": "${v}"`)).join(" "), /APAGADO/, v);
  // Worker con esas variables: estado inactivo sin sitekey, chat 503 sin llamar a nada, límites y región iguales
  const env = await entorno(cerrado);
  const red = redSimulada();
  const est = await (await manejar(peticion({ metodo: "GET", ruta: "/api/estado" }), env)).json();
  assert.deepEqual([est.activo, est.turnstile_sitekey], [false, null]);
  const r = await manejar(peticion(), env, {}, { fetch: red.fetch });
  assert.equal(r.status, 503); assert.equal(red.turnstile.length + red.gemini.length, 0);
  assert.deepEqual([cerrado.AIRI_PAISES_PERMITIDOS, cerrado.AIRI_LIMITE_MINUTO, cerrado.AIRI_LIMITE_DIA, cerrado.AIRI_FALLOS_MAX_HORA], ["MX", "5", "30", "10"]);
});
