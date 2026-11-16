// v0.7.4 — Administración de accesos personales: altas y bajas sin invalidar códigos existentes, y registro que
// identifica cada acceso por el id seudónimo del participante sin exponer secretos. Todo con secretos FICTICIOS.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { manejar, leerCodigos, sha256 } from "./worker.js";
import { generarCodigo, normalizarCodigo, formatoGenerado, huellaCodigo } from "./codigos.mjs";
import { actualizar, principal, rutaSegura, ErrorUso } from "./herramientas/actualizar-codigos.mjs";
import { entorno, redSimulada, peticion, CODIGO, CODIGO2 } from "./pruebas/apoyo.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const lineaBase = async () => `p01:${await sha256(CODIGO)},p02:${await sha256(CODIGO2)}`;
const conCodigo = (codigo, ip) => peticion({ cabeceras: { "x-airi-acceso": codigo }, ip });
const estado = async (env, codigo, ip) => (await manejar(conCodigo(codigo, ip), env, {}, { fetch: redSimulada().fetch })).status;

function capturarRegistros() {
  const registros = []; const original = console.log;
  console.log = (...a) => registros.push(a.join(" "));
  return { registros, restaurar: () => { console.log = original; } };
}

// ── Generación ──────────────────────────────────────────────────────────────
test("generarCodigo: formato del generador, canónico y sin repeticiones", () => {
  const vistos = new Set();
  for (let i = 0; i < 2000; i++) {
    const c = generarCodigo();
    assert.ok(formatoGenerado(c), c.length);
    assert.equal(normalizarCodigo(c), c);
    assert.ok(!/[01OI]/.test(c));
    vistos.add(c);
  }
  assert.equal(vistos.size, 2000);
});

// ── Altas y bajas ───────────────────────────────────────────────────────────
test("alta: los códigos existentes siguen funcionando y los nuevos funcionan", async () => {
  const actual = await lineaBase();
  const r = await actualizar(actual, { agregar: ["p03", "p04"] });
  assert.ok(r.linea.startsWith(actual + ","), "las huellas existentes se copian sin cambios");
  assert.equal(leerCodigos(r.linea).size, 4);
  assert.deepEqual(r.resumen, { conservados: ["p01", "p02"], agregados: ["p03", "p04"], revocados: [] });
  const env = await entorno({ AIRI_CODIGOS: r.linea, AIRI_FALLOS_MAX_HORA: "1000" });
  const { registros, restaurar } = capturarRegistros();
  try {
    assert.equal(await estado(env, CODIGO, "198.51.100.1"), 200);
    assert.equal(await estado(env, CODIGO2, "198.51.100.2"), 200);
    for (const [i, [, codigo]] of r.entregas.entries()) assert.equal(await estado(env, codigo, "198.51.100." + (3 + i)), 200);
  } finally { restaurar(); }
  const ids = registros.map((l) => JSON.parse(l)).filter((x) => x.resultado === "ok").map((x) => x.participante);
  assert.deepEqual(ids, ["p01", "p02", "p03", "p04"], "cada acceso queda identificado por su id seudónimo");
});

test("baja: el código revocado se rechaza y los demás siguen funcionando", async () => {
  const r = await actualizar(await lineaBase(), { revocar: ["p02"] });
  const env = await entorno({ AIRI_CODIGOS: r.linea, AIRI_FALLOS_MAX_HORA: "1000" });
  const { restaurar } = capturarRegistros();
  try {
    assert.equal(await estado(env, CODIGO2, "198.51.100.10"), 403);
    assert.equal(await estado(env, CODIGO, "198.51.100.11"), 200);
  } finally { restaurar(); }
});

test("alta y baja a la vez (rotación de un participante con id nuevo)", async () => {
  const r = await actualizar(await lineaBase(), { agregar: ["p02b"], revocar: ["p02"] });
  assert.deepEqual([...leerCodigos(r.linea).values()], ["p01", "p02b"]);
  assert.equal(leerCodigos(r.linea).get(await huellaCodigo(r.entregas[0][1])), "p02b");
});

test("se niega a producir una línea que cerraría el chat o perdería códigos", async () => {
  const actual = await lineaBase();
  const casos = [
    [actual, { agregar: ["p01"] }, /ya tiene código/],
    [actual, { revocar: ["p09"] }, /no está en la línea/],
    [actual, { revocar: ["p01", "p02"] }, /quedaría vacía/],
    [actual, { agregar: ["P03"] }, /no válido/],
    [actual, { agregar: ["p03", "p03"] }, /repetido/],
    [actual, { agregar: ["p03"], revocar: ["p03"] }, /repetido/],
    [actual, {}, /al menos un id/],
    ["", { agregar: ["p03"] }, /formato/],
    [`"${actual}"`, { agregar: ["p03"] }, /formato/],
    [actual + ",p01:" + "a".repeat(64), { agregar: ["p03"] }, /formato/],
  ];
  for (const [linea, op, error] of casos) await assert.rejects(actualizar(linea, op), (e) => e instanceof ErrorUso && error.test(e.message), JSON.stringify(op));
});

test("línea con espacios, BOM o salto final se acepta y se normaliza", async () => {
  const actual = await lineaBase();
  const r = await actualizar(actual.replace(",", ", ") + "\r\n", { agregar: ["p03"] });
  assert.ok(r.linea.startsWith(actual + ","));
});

// ── Herramienta de línea de órdenes ─────────────────────────────────────────
test("herramienta: escribe fuera del repositorio, nunca sobrescribe y no imprime códigos ni huellas", async () => {
  const dir = mkdtempSync(join(tmpdir(), "airi-accesos-"));
  try {
    const actual = join(dir, "actual.txt");
    writeFileSync(actual, "﻿" + await lineaBase());
    const salida = join(dir, "nueva.txt"), entregas = join(dir, "entregas.txt");
    const impreso = [];
    const r = await principal(["--actual", actual, "--salida", salida, "--entregas", entregas, "--agregar", "p03"], (t) => impreso.push(t));
    const texto = impreso.join("\n");
    assert.equal(readFileSync(salida, "utf-8"), r.linea);
    assert.match(readFileSync(entregas, "utf-8"), new RegExp(`^p03  ${r.entregas[0][1]}$`, "m"));
    for (const s of [r.entregas[0][1], ...r.linea.split(",").map((p) => p.split(":")[1]), r.linea]) assert.ok(!texto.includes(s), "se imprimió un dato sensible");
    assert.match(texto, /Conservados .*p01, p02/);
    assert.match(texto, /No se ha cambiado ningún secreto/);
    // No sobrescribe: ni la línea ni los códigos
    await assert.rejects(principal(["--actual", actual, "--salida", salida, "--entregas", join(dir, "otra.txt"), "--agregar", "p04"], () => {}), /ya existe/);
    await principal(["--actual", actual, "--salida", join(dir, "n2.txt"), "--revocar", "p01"], () => {});   // revocar no necesita --entregas
    assert.equal(readFileSync(join(dir, "n2.txt"), "utf-8"), `p02:${await sha256(CODIGO2)}`);
    await assert.rejects(principal(["--actual", actual, "--salida", join(dir, "n3.txt"), "--agregar", "p05"], () => {}), /--entregas/);
    await assert.rejects(principal(["--actual", actual, "--salida", join(dir, "n4.txt"), "--entregas", join(dir, "n4.txt"), "--agregar", "p05"], () => {}), /distintos/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("herramienta: rechaza rutas dentro del repositorio", () => {
  assert.throws(() => rutaSegura(join(AQUI, "codigos-nuevos.txt")), /dentro del repositorio/);
  assert.throws(() => rutaSegura(resolve(AQUI, "..", "documentacion", "x.txt")), /dentro del repositorio/);
  assert.throws(() => rutaSegura(join(AQUI, "carpeta-que-no-existe", "x.txt")), /no existe/);
  assert.ok(rutaSegura(join(tmpdir(), "airi-no-existe-" + Date.now() + ".txt")));
});

// ── Registro: identificación individual sin secretos ────────────────────────
test("registro: identifica al participante solo tras validar el código y nunca expone el código", async () => {
  const env = await entorno({ AIRI_LIMITE_MINUTO: "1", AIRI_FALLOS_MAX_HORA: "1000" });
  const { registros, restaurar } = capturarRegistros();
  try {
    await estado(env, CODIGO, "198.51.100.20");                    // ok
    await estado(env, CODIGO, "198.51.100.21");                    // cuota por minuto de p01
    await estado(env, "PRUEB-AFICT-ICIA0-00009", "198.51.100.22"); // desconocido
    await manejar(peticion({ pais: "ES", cabeceras: { "x-airi-acceso": CODIGO } }), env, {}, { fetch: redSimulada().fetch });   // región
  } finally { restaurar(); }
  const r = registros.map((l) => JSON.parse(l));
  assert.deepEqual(r.map((x) => [x.resultado, x.participante ?? null]),
    [["ok", "p01"], ["cuota_minuto", "p01"], ["codigo_desconocido", null], ["region", null]]);
  const todo = registros.join("\n");
  for (const s of [CODIGO, "PRUEB-AFICT-ICIA0-00009", await sha256(CODIGO), "198.51.100.2", env.AIRI_SAL]) assert.ok(!todo.includes(s), s);
});

// ── Restricciones intactas ──────────────────────────────────────────────────
test("las restricciones siguen activas con la línea ampliada (región, Turnstile, origen, interruptor)", async () => {
  const r = await actualizar(await lineaBase(), { agregar: ["p03"] });
  const nuevo = r.entregas[0][1];
  const env = await entorno({ AIRI_CODIGOS: r.linea, AIRI_FALLOS_MAX_HORA: "1000" });
  const { restaurar } = capturarRegistros();
  try {
    const llamar = async (opciones, e = env) => (await manejar(peticion({ cabeceras: { "x-airi-acceso": nuevo }, ...opciones }), e, {}, { fetch: redSimulada().fetch })).status;
    assert.equal(await llamar({ pais: "ES" }), 403);
    assert.equal(await llamar({ pais: "US" }), 403);
    assert.equal(await llamar({ cuerpo: JSON.stringify({ messages: [{ role: "user", text: "Hola" }], turnstile: "" }) }), 403);
    assert.equal(await llamar({ cabeceras: { "x-airi-acceso": nuevo, origin: "https://otro.example" } }), 403);
    assert.equal(await llamar({}, await entorno({ AIRI_CODIGOS: r.linea, AIRI_CHAT_APAGADO: "1" })), 503);
    assert.equal(await llamar({ ip: "198.51.100.30" }), 200);
  } finally { restaurar(); }
});
