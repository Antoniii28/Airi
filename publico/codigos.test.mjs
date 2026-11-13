// Pruebas de la forma canónica de los códigos (regresión del 13-11-2026). Credenciales ficticias.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { normalizarCodigo, huellaCodigo, formatoGenerado } from "./codigos.mjs";
import { leerCodigos } from "./worker.js";

const C = "ABCDE-FGHJK-LMNPQ-RS234";
const hexAntiguo = (s) => createHash("sha256").update(s).digest("hex");   // método del generador anterior

test("variantes de escritura y pegado producen la misma forma canónica", () => {
  for (const v of [C, C.toLowerCase(), ` ${C} `, C + "\n", C + "\r\n", C.replaceAll("-", ""), C.replaceAll("-", " "),
    C.replaceAll("-", "‑"), C.replaceAll("-", "‐"), C.replaceAll("-", "–"), C.replaceAll("-", "—"),
    C.replaceAll("-", "−"), C + "​", "﻿" + C, C.replace("-", "- "), C.replaceAll("-", "­"),
    C.replace("A", "Ａ"), C.replaceAll("-", "－"), C.replaceAll("-", "　")])
    assert.equal(normalizarCodigo(v), C, JSON.stringify(v));
});
test("no cambia letras ni números: códigos distintos siguen siendo distintos", () => {
  assert.notEqual(normalizarCodigo(C.replace("A", "B")), C);
  assert.equal(normalizarCodigo(C.slice(0, -1)), "ABCDEFGHJKLMNPQRS23");   // 19 símbolos: sin agrupar, no coincide
  for (const malo of ["", "   ", "ABC", "ABCDE_FGHJK", "ABCDÉ-FGHJK-LMNPQ-RS234", "x".repeat(201), null, 42])
    assert.equal(normalizarCodigo(malo), null, String(malo));
});
test("compatibilidad: huellas ya cargadas con el generador anterior siguen siendo válidas", async () => {
  assert.equal(await huellaCodigo(C), hexAntiguo(C));
  assert.equal(await huellaCodigo(C.replaceAll("-", "")), hexAntiguo(C));
});
test("formato del generador", () => {
  assert.equal(formatoGenerado(C), true);
  assert.equal(formatoGenerado("ABCDEFGH"), false);
});
test("generar-codigos.mjs: cada código impreso corresponde a su huella en AIRI_CODIGOS", async () => {
  const salida = execFileSync("node", ["herramientas/generar-codigos.mjs", "p01", "p02", "p03"], { encoding: "utf-8" });
  const codigos = [...salida.matchAll(/^\s+(p\d\d)\s+([A-Z0-9]{5}(?:-[A-Z0-9]{5}){3})$/gm)].map((m) => [m[1], m[2]]);
  const linea = salida.split("\n").find((l) => /^p01:[0-9a-f]{64},/.test(l));
  const mapa = leerCodigos(linea);
  assert.equal(codigos.length, 3); assert.ok(mapa);
  for (const [id, codigo] of codigos) assert.equal(mapa.get(await huellaCodigo(codigo)), id);
});
test("comprobar-codigo.mjs: indica coincidencia sin mostrar huellas ni el código", async () => {
  const lista = `p01:${await huellaCodigo(C)},p02:${hexAntiguo("ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ")}`;
  const ok = execFileSync("node", ["herramientas/comprobar-codigo.mjs"], { input: C.replaceAll("-", " ") + "\n", env: { ...process.env, AIRI_CODIGOS: lista }, encoding: "utf-8" });
  assert.match(ok, /COINCIDE con el participante «p01»/);
  const r = spawnSync("node", ["herramientas/comprobar-codigo.mjs"], { input: "ABCDE-FGHJK-LMNPQ-RS235\n", env: { ...process.env, AIRI_CODIGOS: lista }, encoding: "utf-8" });
  assert.equal(r.status, 1);
  const no = r.stdout;
  assert.match(no, /NO coincide/);
  for (const s of [ok, no]) { assert.ok(!s.includes(await huellaCodigo(C))); assert.ok(!s.includes(C)); }
});

// ── Regresión (13-11-2026): códigos ESCRITOS A MANO ───────────────────────────────────────────────────────────────
import { formasCodigo, huellasCodigo } from "./codigos.mjs";
import { manejar } from "./worker.js";
import { entorno, redSimulada, peticion } from "./pruebas/apoyo.mjs";

test("códigos manuales: forma anterior al PR #11 (mayúsculas) y forma exacta se aceptan; ninguna otra", async () => {
  const casos = [["Airi-Piloto-2026", (c) => hexAntiguo(c.toUpperCase())], ["Acuario_Marino.26", (c) => hexAntiguo(c.toUpperCase())],
    ["Airi-Piloto-2026", (c) => hexAntiguo(c)], [C, (c) => hexAntiguo(c)]];
  let ip = 0;
  for (const [codigo, huella] of casos) {
    const env = await entorno({ AIRI_CODIGOS: `p09:${huella(codigo)}`, AIRI_LIMITE_MINUTO: "60", AIRI_FALLOS_MAX_HORA: "1000" });
    const pedir = async (v) => (await manejar(peticion({ cabeceras: { "x-airi-acceso": v }, ip: "198.51.100." + (++ip) }), env, {}, { fetch: redSimulada().fetch })).status;
    assert.equal(await pedir(codigo), 200, codigo);
    assert.equal(await pedir("  " + codigo + "  "), 200, codigo + " con espacios");
    // No se debilita: un carácter distinto, otro código o la huella de otra forma no entran
    assert.equal(await pedir(codigo.replace(/.$/, "X")), 403, codigo + " alterado");
    assert.equal(await pedir("Otro-Codigo-2026"), 403);
  }
  assert.ok(formasCodigo("Airi-Piloto-2026").length <= 3);
  assert.deepEqual(formasCodigo("corto"), []);                 // < 8 caracteres y sin forma canónica
  assert.equal((await huellasCodigo(C)).length, 1);            // código del generador: una sola forma
});

test("comprobar-codigo.mjs: códigos manuales y huellas calculadas de forma incorrecta", async () => {
  const correr = (codigo, lista, ...args) => spawnSync("node", ["herramientas/comprobar-codigo.mjs", ...args],
    { input: codigo + "\n", env: { ...process.env, AIRI_CODIGOS: lista }, encoding: "utf-8" });
  let r = correr("Airi-Piloto-2026", `p09:${hexAntiguo("AIRI-PILOTO-2026")}`);
  assert.equal(r.status, 0); assert.match(r.stdout, /escrito a mano/); assert.match(r.stdout, /COINCIDE con el participante «p09» usando la MAYÚSCULAS/);
  r = correr("Airi-Piloto-2026", `p09:${hexAntiguo("Airi-Piloto-2026\n")}`);           // huella con salto de línea (p. ej. echo)
  assert.equal(r.status, 1); assert.match(r.stdout, /salto de línea final \(\\n\)/); assert.doesNotMatch(r.stdout, /[0-9a-f]{64}/);
  r = correr("Airi-Piloto-2026", `p09:${hexAntiguo("Airi-Piloto-2026\n")}`, "--mostrar-linea-corregida");
  assert.match(r.stdout, new RegExp(`p09:${await huellaCodigo("Airi-Piloto-2026")}`));
  assert.ok(!r.stdout.includes("Airi-Piloto-2026"));
  r = correr("Otro-Codigo-2026", `p09:${hexAntiguo("AIRI-PILOTO-2026")}`);
  assert.equal(r.status, 1); assert.match(r.stdout, /NO coincide/);
});

// ── Revisión final del PR #13 (13-11-2026): caracteres de control y coherencia interfaz/Worker ───────────────────
test("caracteres de control: ninguna forma los acepta, aunque la huella cargada los incluya", async () => {
  for (const v of ["Airi\tPiloto-26", "Airi\u0000Piloto26", "\u001b[31mAiriPiloto26", "Airi\nPiloto26", "Airi\u007FPiloto26", "Airi\u0085Piloto26"])
    assert.deepEqual(formasCodigo(v), [], JSON.stringify(v));
  const env = await entorno({ AIRI_CODIGOS: `p09:${hexAntiguo("AIRI\u001b[31M2026")}`, AIRI_FALLOS_MAX_HORA: "1000" });
  const r = await manejar(peticion({ cabeceras: { "x-airi-acceso": "Airi\u001b[31m2026" }, ip: "198.51.100.90" }), env, {}, { fetch: redSimulada().fetch });
  assert.equal(r.status, 403);
  // Saltos de línea y tabuladores ALREDEDOR se siguen tolerando (trim), como antes
  assert.ok(formasCodigo("\tAiri-Piloto-2026\r\n").length >= 2);
});

test("límites de longitud: 8 a 64 caracteres por forma; entradas enormes se descartan", () => {
  assert.deepEqual(formasCodigo("Airi-26"), []);                         // 7
  assert.equal(formasCodigo("A".repeat(64)).length, 1);
  assert.deepEqual(formasCodigo("A".repeat(65)), []);
  assert.deepEqual(formasCodigo("x".repeat(201)), []);
  for (const [, f] of formasCodigo("Airi-Piloto-2026-Acuario-Marino")) assert.ok(f.length >= 8 && f.length <= 64);
});

test("variantes tipográficas solo producen formas del MISMO código (sin coincidencias con otros)", async () => {
  const registrado = `p09:${hexAntiguo("STRASSE-AIRI-26")}`;
  const env = await entorno({ AIRI_CODIGOS: registrado, AIRI_FALLOS_MAX_HORA: "1000", AIRI_LIMITE_MINUTO: "60" });
  const st = async (v, ip) => (await manejar(peticion({ cabeceras: { "x-airi-acceso": v }, ip }), env, {}, { fetch: redSimulada().fetch })).status;
  assert.equal(await st("Straße-Airi-26", "198.51.100.91"), 200);       // igual que el Worker anterior (toUpperCase)
  assert.equal(await st("Strase-Airi-26", "198.51.100.92"), 403);
  assert.equal(await st("STRASSE-AIRI-27", "198.51.100.93"), 403);
});

test("interfaz y Worker: lo que la interfaz envía siempre produce formas evaluables en el Worker", () => {
  // Réplica de la regla de acceso-publico.js: tal cual si es transmisible (sin controles), si no la forma canónica
  const fuente = readFileSync(new URL("../interfaz/chat/acceso-publico.js", import.meta.url), "utf-8");
  assert.match(fuente, /\/\^\[\\x20-\\x7E\\u00A0-\\u00FF\]\+\$\//);    // la interfaz excluye controles C0, DEL y C1
  const interfaz = (t) => (/^[\x20-\x7E -ÿ]+$/.test(t) ? t : normalizarCodigo(t));
  for (const v of ["ABCDE-FGHJK-LMNPQ-RS234", "Airi-Piloto-2026", "Acuario_Marino.26", "ABCDE‑FGHJK‑LMNPQ‑RS234", "Airi\tPiloto-2026"]) {
    const enviado = interfaz(v);
    assert.ok(enviado && !/[\u0000-\u001F\u007F-\u009F]/.test(enviado), v);
    assert.ok(formasCodigo(enviado).length >= 1, v);
  }
});

test("comprobar-codigo.mjs: --mostrar-linea-corregida advierte que la salida es sensible y no cambia secretos", async () => {
  const r = spawnSync("node", ["herramientas/comprobar-codigo.mjs", "--mostrar-linea-corregida"],
    { input: "Airi-Piloto-2026\n", env: { ...process.env, AIRI_CODIGOS: `p09:${hexAntiguo("Airi-Piloto-2026\n")}` }, encoding: "utf-8" });
  assert.match(r.stdout, /SALIDA SENSIBLE/); assert.match(r.stdout, /NO cambia el secreto/);
  const sin = spawnSync("node", ["herramientas/comprobar-codigo.mjs"],
    { input: "Airi-Piloto-2026\n", env: { ...process.env, AIRI_CODIGOS: `p09:${hexAntiguo("Airi-Piloto-2026\n")}` }, encoding: "utf-8" });
  assert.doesNotMatch(sin.stdout, /[0-9a-f]{64}/);                       // sin la opción explícita no hay huellas
  assert.doesNotMatch(readFileSync(new URL("./herramientas/comprobar-codigo.mjs", import.meta.url), "utf-8"), /secret put AIRI_CODIGOS[^»]*execFile|spawn/);
});
