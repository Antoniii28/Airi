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

test("los 34 casos de conformidad coinciden con Python", () => {
  assert.equal(CASOS.casos.length, 34);
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
