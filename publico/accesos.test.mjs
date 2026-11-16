// v0.7.4 — Administración de accesos personales: altas y bajas sin invalidar códigos existentes, y registro que
// identifica cada acceso por el id seudónimo del participante sin exponer secretos. Todo con secretos FICTICIOS.
import test from "node:test";
import assert from "node:assert/strict";
import * as fsReal from "node:fs";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
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

// ── Escritura todo o nada (revisión del PR #20) ─────────────────────────────

/** fs real que falla en la llamada número `n` (desde 1) de la operación `op`; `antes` se ejecuta en lugar de fallar. */
function fsConFallo(op, n, { codigo = "EIO", antes = null } = {}) {
  let cuenta = 0;
  const envoltura = { ...fsReal, constants: fsReal.constants };
  envoltura[op] = (...args) => {
    if (++cuenta === n) {
      if (antes) { antes(...args); return fsReal[op](...args); }
      throw Object.assign(new Error("fallo simulado de " + op), { code: codigo });
    }
    return fsReal[op](...args);
  };
  return envoltura;
}

async function carpetaConActual() {
  const dir = mkdtempSync(join(tmpdir(), "airi-fallos-"));
  writeFileSync(join(dir, "actual.txt"), await lineaBase());
  return dir;
}
const argumentos = (dir) => ["--actual", join(dir, "actual.txt"), "--salida", join(dir, "nueva.txt"),
  "--entregas", join(dir, "entregas.txt"), "--agregar", "p03", "p04"];

test("escritura: ante cualquier fallo no queda ningún archivo nuevo (ni temporales, ni códigos, ni línea)", async () => {
  const fallos = [
    ["writeFileSync", 1], ["writeFileSync", 2],            // temporal de códigos / temporal de la línea
    ["linkSync", 1], ["linkSync", 2],                      // publicación de códigos / de la línea (los códigos ya publicados se borran)
    ["linkSync", 2, { codigo: "ENOSPC" }],
  ];
  for (const [op, n, opciones] of fallos) {
    const dir = await carpetaConActual();
    const impreso = [];
    try {
      await assert.rejects(principal(argumentos(dir), (t) => impreso.push(t), fsConFallo(op, n, opciones)),
        (e) => e instanceof ErrorUso && /No se dejó ningún archivo nuevo/.test(e.message), `${op} #${n}`);
      assert.deepEqual(readdirSync(dir), ["actual.txt"], `${op} #${n}: quedaron archivos`);
      assert.deepEqual(impreso, [], "no informa de éxito");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
});

test("escritura: sin enlaces duros usa copia exclusiva, y una copia parcial también se deshace", async () => {
  let dir = await carpetaConActual();
  try {   // FAT o similar: linkSync no está permitido → copia; resultado completo y sin temporales
    const r = await principal(argumentos(dir), () => {}, fsConFallo("linkSync", 1, { codigo: "EPERM" }));
    assert.deepEqual(readdirSync(dir).sort(), ["actual.txt", "entregas.txt", "nueva.txt"]);
    assert.equal(readFileSync(join(dir, "nueva.txt"), "utf-8"), r.linea);
  } finally { rmSync(dir, { recursive: true, force: true }); }
  dir = await carpetaConActual();
  try {   // sin enlaces y la copia falla a medias
    const sinEnlaces = fsConFallo("linkSync", 1, { codigo: "EPERM" });
    let copias = 0;
    sinEnlaces.copyFileSync = (o, d, f) => {
      if (++copias === 1) { fsReal.writeFileSync(d, "PARCIAL"); throw Object.assign(new Error("disco lleno"), { code: "ENOSPC" }); }
      return fsReal.copyFileSync(o, d, f);
    };
    await assert.rejects(principal(argumentos(dir), () => {}, sinEnlaces), /No se dejó ningún archivo nuevo/);
    assert.deepEqual(readdirSync(dir), ["actual.txt"]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("escritura: si el destino aparece a mitad (carrera), no se sobrescribe ni quedan restos", async () => {
  const dir = await carpetaConActual();
  try {
    const ajeno = join(dir, "nueva.txt");
    const fsx = fsConFallo("linkSync", 2, { antes: () => writeFileSync(ajeno, "ARCHIVO AJENO") });
    await assert.rejects(principal(argumentos(dir), () => {}, fsx), /ya existe: no se sobrescribe/);
    assert.equal(readFileSync(ajeno, "utf-8"), "ARCHIVO AJENO", "el archivo ajeno queda intacto");
    assert.deepEqual(readdirSync(dir).sort(), ["actual.txt", "nueva.txt"]);   // ni códigos ni temporales
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("escritura: si tampoco se puede borrar, avisa de las rutas a borrar a mano sin mostrar su contenido", async () => {
  const dir = await carpetaConActual();
  try {
    const fsx = fsConFallo("linkSync", 2);
    fsx.unlinkSync = () => { throw Object.assign(new Error("bloqueado"), { code: "EBUSY" }); };
    let mensaje = "";
    await assert.rejects(principal(argumentos(dir), () => {}, fsx), (e) => { mensaje = e.message; return e instanceof ErrorUso; });
    assert.match(mensaje, /BORRA A MANO/);
    assert.ok(mensaje.includes(join(dir, "entregas.txt")));
    const restos = readdirSync(dir).filter((f) => f !== "actual.txt");
    for (const f of restos) assert.ok(mensaje.includes(join(dir, f)), "se avisa de " + f);
    for (const f of restos) for (const linea of readFileSync(join(dir, f), "utf-8").split(/[\n,]/))
      for (const parte of linea.split(/\s+|:/).filter((x) => x.length >= 20)) assert.ok(!mensaje.includes(parte), "el aviso no lleva códigos ni huellas");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("escritura correcta: no deja temporales «.airi-tmp-*»", async () => {
  const dir = await carpetaConActual();
  try {
    await principal(argumentos(dir), () => {});
    assert.deepEqual(readdirSync(dir).sort(), ["actual.txt", "entregas.txt", "nueva.txt"]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("generar-codigos.mjs funciona sin node:crypto y sigue sugiriendo una sal de 24 bytes", () => {
  const fuente = readFileSync(join(AQUI, "herramientas", "generar-codigos.mjs"), "utf-8");
  assert.ok(!/randomBytes|node:crypto/.test(fuente));
  const salida = execFileSync(process.execPath, [join(AQUI, "herramientas", "generar-codigos.mjs"), "x1"], { encoding: "utf-8" }).trim().split(/\r?\n/);
  assert.match(salida.at(-1), /^[A-Za-z0-9_-]{32}$/);                  // 24 bytes en base64url
  assert.match(salida.find((l) => l.startsWith("x1:")), /^x1:[0-9a-f]{64}$/);
});

// ── Límites: apagón, cierre abrupto y borrado imposible (revisión 2 del PR #20) ──
test("escritura: cada temporal se vuelca a disco (fsync) ANTES de publicarse; si fsync falla, se deshace todo", async () => {
  let dir = await carpetaConActual();
  try {
    const orden = [];
    const fsx = { ...fsReal, constants: fsReal.constants };
    for (const op of ["writeFileSync", "fsyncSync", "linkSync"]) fsx[op] = (...a) => { orden.push(op); return fsReal[op](...a); };
    await principal(argumentos(dir), () => {}, fsx);
    assert.deepEqual(orden, ["writeFileSync", "fsyncSync", "writeFileSync", "fsyncSync", "linkSync", "linkSync"]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
  dir = await carpetaConActual();
  try {
    await assert.rejects(principal(argumentos(dir), () => {}, fsConFallo("fsyncSync", 2)), /No se dejó ningún archivo nuevo/);
    assert.deepEqual(readdirSync(dir), ["actual.txt"]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("éxito con temporales imposibles de borrar: el resultado vale, pero se avisa de sus rutas (sin contenido)", async () => {
  const dir = await carpetaConActual();
  try {
    const fsx = { ...fsReal, constants: fsReal.constants, unlinkSync: () => { throw Object.assign(new Error("bloqueado"), { code: "EBUSY" }); } };
    const impreso = [];
    const r = await principal(argumentos(dir), (t) => impreso.push(t), fsx);
    const tmp = readdirSync(dir).filter((f) => f.startsWith(".airi-tmp-"));
    assert.equal(tmp.length, 2);
    const aviso = impreso.find((t) => t.includes("no se pudieron borrar"));
    assert.ok(aviso, "debe avisar");
    for (const f of tmp) assert.ok(aviso.includes(join(dir, f)));
    assert.ok(!impreso.join("\n").includes(r.entregas[0][1]) && !impreso.join("\n").includes(r.linea));
    assert.equal(readFileSync(join(dir, "nueva.txt"), "utf-8"), r.linea);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("restos de una ejecución interrumpida: se detectan y se avisa, sin borrarlos ni leerlos", async () => {
  const dir = await carpetaConActual();
  try {
    const resto = join(dir, ".airi-tmp-0000-entregas.txt");
    writeFileSync(resto, "contenido-de-un-cierre-abrupto");
    const impreso = [];
    await principal(argumentos(dir), (t) => impreso.push(t));
    const aviso = impreso.find((t) => t.includes("ejecución anterior interrumpida"));
    assert.ok(aviso && aviso.includes(resto));
    assert.ok(!impreso.join("\n").includes("contenido-de-un-cierre-abrupto"));
    assert.equal(readFileSync(resto, "utf-8"), "contenido-de-un-cierre-abrupto", "no se toca");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("la herramienta recuerda que --actual debe ser la línea vigente en producción", async () => {
  const dir = await carpetaConActual();
  try {
    const impreso = [];
    await principal(argumentos(dir), (t) => impreso.push(t));
    assert.match(impreso.join("\n"), /ANTES DE CARGARLA: --actual debe ser exactamente la línea cargada hoy en producción/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
