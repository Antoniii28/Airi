// Pruebas del motor JavaScript (node --test). Sin dependencias.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Motor = require("../airi-motor.js");

const CASOS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "motor", "casos_conformidad.json"), "utf8"));
const r6 = (v) => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : Array.isArray(v) ? v.map(r6) : v);

function esperado(inf) {   // misma proyección que motor/herramientas/generar_casos.py
  const res = {};
  for (const r of inf.resultados) {
    res[r.parametro] = { estado: r.estado, severidad: r.severidad, valor_canonico: r6(r.valor_canonico), unidad_canonica: r.unidad_canonica };
  }
  return { clasificacion: inf.clasificacion, A: inf.A, I: inf.I, resultados: res,
    alertas: inf.alertas.map((a) => [a.parametro, a.severidad]),
    solicitudes: inf.solicitudes.map((s) => [s.parametro, s.tipo]),
    traza: inf.traza.map((t) => [t.de, t.a, t.etiqueta].concat(t.parametro ? [t.parametro] : [])) };
}

test("todos los casos de conformidad coinciden con Python", () => {
  assert.equal(CASOS.casos.length, 43);   // 34 de v0.4.0 + 9 de entradas mal formadas (v0.4.1)
  assert.equal(CASOS.version_motor, Motor.VERSION);
  for (const c of CASOS.casos) {
    assert.deepEqual(esperado(Motor.evaluar(c.mediciones, c.perfil || null)), c.esperado, c.id);
  }
});

test("usa los mismos datos que Python (versión de referencias)", () => {
  assert.equal(Motor.datos.referencias.version, CASOS.version_referencias);
  assert.equal(Motor.perfil().referencias.nitratos.estado, "pendiente");
  assert.equal(Motor.perfil().referencias.temperatura.estado, "sin_referencia");
  assert.equal(Motor.perfil().referencias.salinidad.estado, "sin_referencia");
});

test("fmtG reproduce format(n, '.4g') de Python", () => {
  const casos = [[0, "0"], [8.4, "8.4"], [0.465891, "0.4659"], [25, "25"], [1024.5, "1024"], [1025.5, "1026"], [8.125, "8.125"], [8.375, "8.375"], [12345, "1.234e+04"], [1.234e-05, "1.234e-05"], [0.0001234, "0.0001234"], [9999.5, "1e+04"], [-3, "-3"], [1e+30, "1e+30"], [99.995, "100"], [0.5, "0.5"], [100, "100"], [0.12345, "0.1235"], [1.00005, "1"], [10.245, "10.24"], [2.5e-07, "2.5e-07"], [123456789, "1.235e+08"]];  // valores esperados obtenidos de Python
  for (const [n, s] of casos) assert.equal(Motor.fmtG(n), s, String(n));
});

test("leerNumero: coma decimal, solo dígitos ASCII, finitos", () => {
  assert.equal(Motor.leerNumero("8,1"), 8.1);
  for (const malo of ["٣", "８", "abc", "", "nan", "inf", "1e999", "8.1.2", true, null, "-"]) assert.equal(Motor.leerNumero(malo), null, String(malo));
});

test("el informe nunca afirma seguridad ni diagnóstico", () => {
  const inf = Motor.evaluar({ ph: { valor: "9", unidad: "pH" }, amoniaco: { valor: "2", unidad: "mg/L TAN-N" } });
  const t = JSON.stringify(inf);
  assert.doesNotMatch(t, /\b(es seguro|está sano|condiciones seguras garantizadas|enfermedad detectada|es peligroso)\b/i);
  assert.match(inf.aviso, /No diagnostica/);
});

// ── v0.4.1: validación de la estructura de entrada (igual que Python) ───────────
const P = Motor.perfil();
const ev = (parametro, medicion) => Motor.evaluarParametro(parametro, medicion, P);

test("una medición que no es objeto es INVÁLIDA en Q2 (no faltante ni en rango)", () => {
  for (const malo of ["8.1", 8.1, 0, "", ["8.1", "pH"], [], true]) {
    const r = ev("ph", malo);
    assert.equal(r.estado, "EP2", JSON.stringify(malo));
    assert.deepEqual(r.decisiones, [["Q1", "V"], ["Q2", "F"]]);
  }
  assert.equal(ev("ph", null).estado, "EP1");
  assert.equal(ev("ph", undefined).estado, "EP1");
});

test("un valor dentro de una lista nunca queda EN RANGO", () => {
  for (const malo of [[8.1], [], { v: 8.1 }, true, false]) {
    const r = ev("ph", { valor: malo, unidad: "pH" });
    assert.equal(r.estado, "EP2", JSON.stringify(malo));
    assert.equal(r.motivo, "El valor recibido no es un número finito ni un texto numérico.");
  }
});

test("la unidad debe ser texto y el método no textual se ignora", () => {
  for (const malo of [["mg/L TAN-N"], 7, 0, false]) {
    const r = ev("amoniaco", { valor: "0", unidad: malo });
    assert.deepEqual([r.estado, r.decisiones[r.decisiones.length - 1]], ["EP2", ["Q3", "F"]], JSON.stringify(malo));
  }
  assert.equal(ev("ph", { valor: "8.1", unidad: null }).estado, "EP4");
  assert.equal(ev("amoniaco", { valor: "1", unidad: "mg/L TAN-N", metodo: ["nessler"] }).severidad, "alerta_alta");
  assert.equal(ev("amoniaco", { valor: "1", unidad: "mg/L TAN-N", metodo: 5 }).severidad, "alerta_alta");
});

test("mediciones que no son objeto lanzan TypeError; null equivale a vacío", () => {
  for (const malo of [[1, 2], "ph=8", 8]) assert.throws(() => Motor.evaluar(malo), TypeError);
  assert.equal(Motor.evaluar(null).clasificacion, "R3");
});

test("BOM y espacios Unicode se recortan igual que en Python", () => {
  for (const e of ["\ufeff", "\u00a0", "\u3000", "\x1c", "\x85"]) {
    assert.equal(ev("ph", { valor: e + "8.1" + e, unidad: e + "pH" }).estado, "EP4", JSON.stringify(e));
    assert.equal(ev("ph", { valor: e, unidad: "pH" }).estado, "EP1", JSON.stringify(e));
    assert.equal(ev("amoniaco", { valor: "1", unidad: "mg/L TAN-N", metodo: e + "Nessler" + e }).severidad,
      "revision_recomendada", JSON.stringify(e));
  }
  assert.equal(ev("ph", { valor: "\u200b8.1", unidad: "pH" }).estado, "EP2");
});
