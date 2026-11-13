// Pruebas de la forma canónica de los códigos (regresión del 13-11-2026). Credenciales ficticias.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
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
