// Pruebas del evaluador de compatibilidad (node --test compatibilidad/pruebas/). Sin dependencias.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const C = require("../airi-compatibilidad.js");
const Motor = require("../../interfaz/motor/airi-motor.js");
const RAIZ = path.join(__dirname, "..", "..");
const PRUEBA = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "datos_prueba", "catalogo_prueba.json"), "utf8"));

function congelar(x) { if (x && typeof x === "object") { Object.values(x).forEach(congelar); Object.freeze(x); } return x; }
congelar(PRUEBA);
const ev = (entrada, cat) => C.evaluar(entrada, cat || PRUEBA);
const par = (r, a, b) => r.pares.find((p) => p.especies[0] === a && p.especies[1] === b);
const criterios = (p, efecto) => p.motivos.filter((m) => m.efecto === efecto).map((m) => m.criterio);

test("los datos de prueba están identificados como ficticios y no se mezclan con el catálogo real", () => {
  assert.match(PRUEBA.estado, /PRUEBA/);
  for (const e of PRUEBA.especies) assert.match(e.id, /^prueba_/);
  for (const f of Object.values(PRUEBA.fuentes)) assert.equal(f.tipo, "prueba");
});

test("coincidencia sustentada: convivencia declarada con fuente + sin conflictos → compatible", () => {
  const r = ev({ especies: ["prueba_pacifico_a", "prueba_pacifico_b"] });
  const p = r.pares[0];
  assert.equal(p.estado, "compatible");
  assert.equal(r.estado_global, "compatible");
  assert.equal(p.contradiccion, false);
  assert.deepEqual(criterios(p, "compatible"), ["relacion"]);
  assert.deepEqual(criterios(p, "sin_conflicto"), ["temperatura", "ph", "temperamento"]);
  assert.ok(r.fuentes.prueba_fuente_1.url.startsWith("https://"));
  for (const m of p.motivos) assert.ok(Array.isArray(m.fuentes) && m.fuentes.length, m.criterio + " sin fuentes");
});

test("compartir rangos de agua y temperamento pacífico NO basta: sin evidencia positiva → sin_datos", () => {
  const p = ev({ especies: ["prueba_pacifico_b", "prueba_contradictoria"] }).pares[0];
  assert.deepEqual(criterios(p, "sin_conflicto"), ["temperatura", "ph", "temperamento"]);
  assert.equal(p.estado, "sin_datos");
  assert.match(p.resumen, /ninguna fuente confirma/);
  assert.match(p.motivos[0].texto, /no demuestra que puedan convivir/);
});

test("incompatibilidad sustentada: rangos de temperatura documentados que no se solapan", () => {
  const p = ev({ especies: ["prueba_pacifico_b", "prueba_frio"] }).pares[0];
  assert.equal(p.estado, "incompatible");
  assert.deepEqual(criterios(p, "incompatible"), ["temperatura"]);
  assert.match(p.motivos[0].texto, /no se solapan/);
  assert.deepEqual(p.motivos[0].fuentes, ["prueba_fuente_1", "prueba_fuente_2"]);
});

test("incompatibilidad sustentada: relación declarada por género (y territorialidad como precaución)", () => {
  const p = ev({ especies: ["prueba_agresivo", "prueba_agresivo_2"] }).pares[0];
  assert.equal(p.estado, "incompatible");
  assert.deepEqual(criterios(p, "incompatible"), ["relacion"]);
  assert.deepEqual(criterios(p, "precaucion"), ["territorialidad"]);
});

test("contradicción entre fichas: A declara compatible, la otra declara incompatible → lo más restrictivo", () => {
  const p = ev({ especies: ["prueba_pacifico_a", "prueba_contradictoria"] }).pares[0];
  assert.equal(p.estado, "incompatible");
  assert.equal(p.contradiccion, true);
  assert.deepEqual(criterios(p, "compatible"), ["relacion"]);
  assert.deepEqual(criterios(p, "incompatible"), ["relacion"]);
  assert.match(p.resumen, /contradictoria/);
});

test("contradicción entre relación positiva y rangos incompatibles", () => {
  const p = ev({ especies: ["prueba_pacifico_a", "prueba_frio"] }).pares[0];
  assert.equal(p.estado, "incompatible");
  assert.equal(p.contradiccion, true);
});

test("datos insuficientes: ficha vacía o especie inexistente → sin_datos con faltantes, nunca compatible", () => {
  const r = ev({ especies: ["prueba_pacifico_a", "prueba_sin_datos", "especie_inexistente"] });
  assert.equal(r.estado_global, "sin_datos");
  const p = par(r, "prueba_pacifico_a", "prueba_sin_datos");
  assert.equal(p.estado, "sin_datos");
  const campos = p.datos_faltantes.filter((x) => x.especie === "prueba_sin_datos").map((x) => x.campo);
  assert.deepEqual(campos, ["temperatura", "ph", "temperamento"]);
  const q = par(r, "prueba_pacifico_a", "especie_inexistente");
  assert.equal(q.estado, "sin_datos");
  assert.deepEqual(q.datos_faltantes, [{ especie: "especie_inexistente", campo: "ficha" }]);
  assert.equal(r.especies.find((e) => e.id === "especie_inexistente").encontrada, false);
  assert.ok(r.datos_faltantes.some((x) => x.especie === "especie_inexistente" && x.campo === "ficha"));
  assert.equal(r.intervalo_comun.temperatura_c, null);
});

test("una relación positiva no basta si faltan datos esenciales", () => {
  // A declara «compatible con pacíficos»; se fabrica una especie pacífica sin rango de temperatura.
  const cat = JSON.parse(JSON.stringify(PRUEBA));
  const b = cat.especies.find((e) => e.id === "prueba_pacifico_b");
  b.ficha_airi.temperatura_c = null;
  const p = C.evaluar({ especies: ["prueba_pacifico_a", "prueba_pacifico_b"] }, cat).pares[0];
  assert.equal(p.estado, "sin_datos");
  assert.ok(p.datos_faltantes.some((x) => x.especie === "prueba_pacifico_b" && x.campo === "temperatura"));
});

test("una relación sin fuentes no cuenta como evidencia", () => {
  const cat = JSON.parse(JSON.stringify(PRUEBA));
  cat.especies.find((e) => e.id === "prueba_pacifico_a").convivencia.relaciones[0].fuentes = [];
  assert.equal(C.evaluar({ especies: ["prueba_pacifico_a", "prueba_pacifico_b"] }, cat).pares[0].estado, "sin_datos");
});

test("varios ejemplares de una especie solitaria/territorial → precaución; una sola especie sin acuario → sin_datos", () => {
  const r = ev({ especies: [{ id: "prueba_agresivo", cantidad: 2 }] });
  assert.equal(r.estado_global, "precaucion");
  assert.deepEqual(r.pares[0].especies, ["prueba_agresivo", "prueba_agresivo"]);
  assert.deepEqual(criterios(r.pares[0], "precaucion"), ["misma_especie"]);
  // ids repetidos se suman
  assert.equal(ev({ especies: ["prueba_agresivo", "prueba_agresivo"] }).especies[0].cantidad, 2);
  const s = ev({ especies: ["prueba_pacifico_a"] });
  assert.equal(s.estado_global, "sin_datos");
  assert.deepEqual(s.pares, []);
});

test("acuario: volumen, arrecife y condiciones medidas por el motor de agua (contrato §8)", () => {
  const cond = Motor.condicionesMedidas(Motor.evaluar({
    temperatura: { valor: "29", unidad: "°C" }, ph: { valor: "8.2", unidad: "pH" }, salinidad: { valor: "35", unidad: "ppt" }
  }));
  const antes = JSON.stringify(cond);
  const r = ev({ especies: ["prueba_pacifico_a", "prueba_agresivo"], acuario: { volumen_l: 200, tipo: "arrecife", condiciones: cond } });
  assert.equal(JSON.stringify(cond), antes, "no modifica la salida del motor");
  const a = r.acuario.find((x) => x.especie === "prueba_pacifico_a");
  const d = r.acuario.find((x) => x.especie === "prueba_agresivo");
  assert.deepEqual(criterios(a, "precaucion"), ["agua_temperatura"]);      // 29 °C fuera de 24–27
  assert.deepEqual(criterios(a, "sin_conflicto"), ["volumen", "arrecife", "agua_ph"]);
  assert.match(a.motivos.find((m) => m.criterio === "agua_temperatura").texto, /no evalúa este parámetro/); // EP3
  assert.deepEqual(criterios(a, "sin_datos"), ["agua_salinidad"]);         // gravedad específica vs ppt
  assert.equal(d.estado, "incompatible");                                  // adecuado_arrecife = "no"
  assert.deepEqual(criterios(d, "precaucion"), ["volumen", "agua_temperatura"]); // 200 L < 400 L; 29 °C > 28 °C
  assert.equal(r.estado_global, "incompatible");
});

test("acuario sin conflictos nunca da «compatible» (la salinidad no se puede comparar) y sin datos los pide", () => {
  const cond = Motor.condicionesMedidas(Motor.evaluar({ temperatura: { valor: "25", unidad: "°C" }, ph: { valor: "8.2", unidad: "pH" } }));
  const r = ev({ especies: ["prueba_pacifico_a"], acuario: { volumen_l: 500, tipo: "solo_peces", condiciones: cond } });
  assert.equal(r.acuario[0].estado, "sin_datos");
  assert.ok(r.acuario[0].datos_faltantes.some((x) => x.campo === "acuario.condiciones.salinidad"));
  const vacio = ev({ especies: ["prueba_pacifico_a"], acuario: {} });
  const campos = vacio.acuario[0].datos_faltantes.map((x) => x.campo);
  for (const c of ["acuario.volumen_l", "acuario.tipo", "acuario.condiciones.temperatura", "acuario.condiciones.ph"]) assert.ok(campos.includes(c), c);
  assert.equal(vacio.acuario[0].estado, "sin_datos");
});

test("amoníaco u otros intervalos del motor se comparan por ambos extremos", () => {
  const cond = { condiciones: { temperatura: { disponible: true, valor: [26, 28], intervalo: true, unidad: "°C", estado: "EP3" } } };
  const a = ev({ especies: ["prueba_pacifico_a"], acuario: { condiciones: cond } }).acuario[0];
  assert.equal(a.motivos.find((m) => m.criterio === "agua_temperatura").efecto, "precaucion");
});

test("contrato de salida: claves, estados y etiquetas", () => {
  const r = ev({ especies: ["prueba_pacifico_a", "prueba_pacifico_b"], acuario: { volumen_l: 300 } });
  assert.deepEqual(Object.keys(r), ["version", "catalogo_version", "estado_global", "etiqueta_global", "especies", "pares",
    "acuario", "intervalo_comun", "datos_faltantes", "fuentes", "aviso"]);
  assert.deepEqual(Object.keys(r.pares[0]), ["especies", "estado", "etiqueta", "contradiccion", "resumen", "motivos", "datos_faltantes"]);
  assert.deepEqual(Object.keys(r.acuario[0]), ["especie", "estado", "etiqueta", "contradiccion", "resumen", "motivos", "datos_faltantes"]);
  assert.deepEqual(Object.keys(r.pares[0].motivos[0]), ["criterio", "nombre", "efecto", "texto", "fuentes", "confianza"]);
  assert.deepEqual(Object.values(C.ESTADOS), ["compatible", "precaucion", "incompatible", "sin_datos"]);
  assert.equal(C.ETIQUETAS.sin_datos, "Información insuficiente");  // F-06
  assert.deepEqual(r.intervalo_comun.temperatura_c, { min: 24, max: 26 });
  for (const t of JSON.stringify(r).match(/peligro|urgente|emergencia|garantiza que/gi) || []) assert.fail("término no permitido: " + t);
});

test("validación de entrada", () => {
  for (const malo of [null, [], "x", {}, { especies: [] }, { especies: [3] }, { especies: [{ id: "a", cantidad: 0 }] },
    { especies: ["a"], acuario: "grande" }, { especies: ["a"], acuario: { tipo: "dulce" } }]) {
    assert.throws(() => ev(malo), TypeError, JSON.stringify(malo));
  }
  assert.throws(() => C.evaluar({ especies: ["a"] }, null), TypeError);
  assert.throws(() => C.evaluar({ especies: ["a"] }, { especies: "no" }), TypeError);
});

test("catálogo real (especies/datos/catalogo_inicial.json, cualquier versión): no falla ni afirma compatibilidad sin evidencia", () => {
  const real = JSON.parse(fs.readFileSync(path.join(RAIZ, "especies", "datos", "catalogo_inicial.json"), "utf8"));
  const ids = real.especies.map((e) => e.id).filter(Boolean);
  const tieneRelaciones = real.especies.some((e) => e.convivencia && Array.isArray(e.convivencia.relaciones) && e.convivencia.relaciones.length);
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const r = C.evaluar({ especies: [ids[i], ids[j]] }, real);
      assert.ok(Object.values(C.ESTADOS).includes(r.estado_global));
      if (!tieneRelaciones) assert.notEqual(r.estado_global, "compatible", ids[i] + "+" + ids[j]);
    }
  }
  // Catálogo de main sin ids (v0.1): todo queda sin datos.
  if (!ids.length) assert.equal(C.evaluar({ especies: ["amphiprion_ocellaris"] }, real).estado_global, "sin_datos");
});

test("no modifica el catálogo (objeto congelado) y es determinista", () => {
  const e = { especies: ["prueba_pacifico_a", "prueba_frio", "prueba_contradictoria"], acuario: { volumen_l: 90, tipo: "arrecife" } };
  assert.deepEqual(ev(e), ev(e));
});

test("los ejemplos JSON para la interfaz están al día", () => {
  execFileSync(process.execPath, [path.join(__dirname, "..", "herramientas", "generar_ejemplos.js"), "--comprobar"], { stdio: "pipe" });
});
