// Pruebas del evaluador de compatibilidad (node --test compatibilidad/pruebas/). Sin dependencias.
// Con otro catálogo real: AIRI_CATALOGO=ruta/catalogo.json node --test compatibilidad/pruebas/
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

test("pH obligatorio para «compatible»: sin rango de pH de una especie → sin_datos", () => {
  const cat = JSON.parse(JSON.stringify(PRUEBA));
  cat.especies.find((e) => e.id === "prueba_pacifico_b").ph = null;
  const p = C.evaluar({ especies: ["prueba_pacifico_a", "prueba_pacifico_b"] }, cat).pares[0];
  assert.equal(p.estado, "sin_datos");
  assert.deepEqual(criterios(p, "compatible"), ["relacion"]);
  assert.deepEqual(p.datos_faltantes, [{ especie: "prueba_pacifico_b", campo: "ph" }]);
});

test("fuentes de relaciones: deben existir en catalogo.fuentes (propias y con URL); si no, la relación no cuenta", () => {
  const casos = [
    ["fuente_que_no_existe"], ["toString"], ["__proto__"], ["constructor"], ["prueba_fuente_1", "fuente_que_no_existe"], ["sin_url"]
  ];
  for (const fuentes of casos) {
    const cat = JSON.parse(JSON.stringify(PRUEBA));
    cat.fuentes.sin_url = { tipo: "prueba", titulo: "Registro incompleto", url: "" };
    cat.especies.find((e) => e.id === "prueba_pacifico_a").convivencia.relaciones[0].fuentes = fuentes;
    const r = C.evaluar({ especies: ["prueba_pacifico_a", "prueba_pacifico_b"] }, cat);
    const p = r.pares[0];
    assert.equal(p.estado, "sin_datos", JSON.stringify(fuentes));
    assert.deepEqual(criterios(p, "compatible"), [], JSON.stringify(fuentes));
    const aviso = p.motivos.find((m) => m.criterio === "relacion");
    assert.equal(aviso.efecto, "sin_datos");
    assert.match(aviso.texto, /no están registradas/);
    assert.ok(p.datos_faltantes.some((x) => x.especie === "prueba_pacifico_a" && x.campo === "convivencia.relaciones.fuentes"));
  }
  // Una relación negativa con fuente inexistente tampoco cuenta.
  const cat = JSON.parse(JSON.stringify(PRUEBA));
  cat.especies.find((e) => e.id === "prueba_agresivo").convivencia.relaciones[0].fuentes = ["inventada"];
  const p = C.evaluar({ especies: ["prueba_agresivo", "prueba_agresivo_2"] }, cat).pares[0];
  assert.deepEqual(criterios(p, "incompatible"), []);
  assert.equal(p.estado, "precaucion"); // queda la territorialidad
});

test("las fuentes citadas que no están registradas se marcan en la salida", () => {
  const cat = JSON.parse(JSON.stringify(PRUEBA));
  cat.especies.find((e) => e.id === "prueba_pacifico_b").ficha_airi.temperatura_c.fuentes = ["__proto__", "toString"];
  const r = C.evaluar({ especies: ["prueba_pacifico_a", "prueba_pacifico_b"] }, cat);
  assert.ok(Object.prototype.hasOwnProperty.call(r.fuentes, "__proto__"));
  assert.equal(r.fuentes["toString"].no_registrada, true);
  assert.equal(Object.getPrototypeOf(r.fuentes), Object.prototype);
  assert.ok(JSON.stringify(r.fuentes).includes('"__proto__":{'));
});

test("identificadores especiales: «__proto__», «constructor», «toString» se tratan como ids normales", () => {
  const cat = JSON.parse(JSON.stringify(PRUEBA));
  const base = cat.especies.find((e) => e.id === "prueba_pacifico_b");
  for (const id of ["__proto__", "constructor", "hasOwnProperty"]) cat.especies.push(Object.assign(JSON.parse(JSON.stringify(base)), { id: id }));
  const r = C.evaluar({ especies: ["__proto__", "constructor", "__proto__", "toString", " prueba_pacifico_a "] }, cat);
  assert.deepEqual(r.especies.map((e) => [e.id, e.cantidad, e.encontrada]),
    [["__proto__", 2, true], ["constructor", 1, true], ["toString", 1, false], ["prueba_pacifico_a", 1, true]]);
  assert.ok(r.pares.some((p) => p.especies[0] === "__proto__" && p.especies[1] === "__proto__"));
  assert.equal(par(r, "__proto__", "prueba_pacifico_a").estado, "compatible"); // A declara «compatible con pacíficos»
  assert.equal(par(r, "constructor", "toString").estado, "sin_datos");
  assert.ok(r.datos_faltantes.some((x) => x.especie === "toString" && x.campo === "ficha"));
  assert.equal(({}).polucion, undefined);
  assert.equal(Object.prototype.cantidad, undefined);
});

test("ids repetidos en el catálogo: la ficha no se usa (sin_datos) y se explica", () => {
  const cat = JSON.parse(JSON.stringify(PRUEBA));
  cat.especies.push(JSON.parse(JSON.stringify(cat.especies.find((e) => e.id === "prueba_pacifico_b"))));
  const p = C.evaluar({ especies: ["prueba_pacifico_a", "prueba_pacifico_b"] }, cat).pares[0];
  assert.equal(p.estado, "sin_datos");
  assert.match(p.motivos[0].texto, /repetido en el catálogo/);
});

test("notas de convivencia (condiciones y riesgos en texto) se devuelven con fuentes y no cambian el estado", () => {
  const cat = JSON.parse(JSON.stringify(PRUEBA));
  const b = cat.especies.find((e) => e.id === "prueba_pacifico_b");
  b.convivencia = { condiciones: ["Mejor en grupo (dato ficticio)."], riesgos: ["Defiende su refugio (dato ficticio).", "  "],
    fuentes: ["prueba_fuente_2"], confianza: "baja" };
  const antes = ev({ especies: ["prueba_pacifico_a", "prueba_pacifico_b"] }).pares[0];
  const r = C.evaluar({ especies: ["prueba_pacifico_a", "prueba_pacifico_b"], acuario: {} }, cat);
  const p = r.pares[0];
  assert.equal(p.estado, antes.estado);
  assert.deepEqual(p.motivos, antes.motivos);
  assert.deepEqual(p.notas_convivencia, [
    { especie: "prueba_pacifico_b", tipo: "condicion", texto: "Mejor en grupo (dato ficticio).", fuentes: ["prueba_fuente_2"], confianza: "baja" },
    { especie: "prueba_pacifico_b", tipo: "riesgo", texto: "Defiende su refugio (dato ficticio).", fuentes: ["prueba_fuente_2"], confianza: "baja" }
  ]);
  assert.ok(r.fuentes.prueba_fuente_2.url);
  assert.equal(r.acuario.find((a) => a.especie === "prueba_pacifico_b").notas_convivencia.length, 2);
  assert.deepEqual(r.acuario.find((a) => a.especie === "prueba_pacifico_a").notas_convivencia, []);
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
  const claves = ["estado", "etiqueta", "contradiccion", "resumen", "motivos", "notas_convivencia", "datos_faltantes"];
  assert.deepEqual(Object.keys(r.pares[0]), ["especies"].concat(claves));
  assert.deepEqual(Object.keys(r.acuario[0]), ["especie"].concat(claves));
  assert.deepEqual(Object.keys(ev({ especies: ["prueba_pacifico_a", "no_existe"] }).pares[0]), ["especies"].concat(claves));
  assert.deepEqual(Object.keys(r.pares[0].motivos[0]), ["criterio", "nombre", "efecto", "texto", "fuentes", "confianza"]);
  assert.deepEqual(Object.values(C.ESTADOS), ["compatible", "precaucion", "incompatible", "sin_datos"]);
  assert.equal(C.ETIQUETAS.sin_datos, "Faltan datos");  // F-06
  assert.equal(C.ETIQUETAS.compatible, "Compatible");
  assert.equal(C.ETIQUETAS.incompatible, "No compatibles");
  assert.equal(C.ESCENARIOS_DEMO.length, 6);
  assert.ok(C.DESCRIPCION_MODULO.includes("seleccionar cualquiera"));
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

// Catálogo real de Brayan. Por defecto el del repositorio; con AIRI_CATALOGO=ruta se puede probar otra versión.
const RUTA_REAL = process.env.AIRI_CATALOGO || path.join(RAIZ, "especies", "datos", "catalogo_inicial.json");
const REAL = JSON.parse(fs.readFileSync(RUTA_REAL, "utf8"));
const CON_FICHAS = REAL.especies.some((e) => e && e.ficha_airi);

test("catálogo real (cualquier versión): no falla ni afirma compatibilidad sin evidencia", () => {
  const real = REAL;
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

test("fichas reales de Brayan: resultados esperados", { skip: CON_FICHAS ? false : "el catálogo " + REAL.version + " aún no tiene fichas (PR #17)" }, () => {
  const real = congelar(JSON.parse(JSON.stringify(REAL)));
  const ids = new Set(real.especies.map((e) => e.id));
  for (const id of ["amphiprion_ocellaris", "zebrasoma_flavescens", "lysmata_amboinensis", "zanclus_cornutus"]) assert.ok(ids.has(id), id);
  // Sin conflictos documentados pero sin evidencia positiva: sin_datos.
  assert.equal(C.evaluar({ especies: ["amphiprion_ocellaris", "lysmata_amboinensis"] }, real).estado_global, "sin_datos");
  // Pacífico con semiagresivo y ambos territoriales.
  const p = C.evaluar({ especies: ["amphiprion_ocellaris", "zebrasoma_flavescens"] }, real).pares[0];
  assert.equal(p.estado, "precaucion");
  assert.deepEqual(criterios(p, "precaucion"), ["temperamento", "territorialidad"]);
  // El ídolo moro no tiene pH documentado ni es apto para arrecife según su ficha.
  const z = C.evaluar({ especies: ["zanclus_cornutus", "amphiprion_ocellaris"], acuario: { tipo: "arrecife" } }, real);
  assert.ok(z.datos_faltantes.some((x) => x.especie === "zanclus_cornutus" && x.campo === "ph"));
  assert.equal(z.acuario.find((a) => a.especie === "zanclus_cornutus").estado, "incompatible");
  // Toda fuente citada existe en el registro del catálogo.
  const todas = C.evaluar({ especies: [...ids].slice(0, 12) }, real);
  for (const [id, f] of Object.entries(todas.fuentes)) assert.ok(!f.no_registrada && f.url, id);
  // Las condiciones y riesgos en texto de las fichas llegan al resultado.
  const notas = p.notas_convivencia;
  assert.ok(notas.some((n) => n.especie === "amphiprion_ocellaris" && n.tipo === "riesgo"));
  assert.ok(notas.some((n) => n.especie === "zebrasoma_flavescens"));
  for (const n of notas) assert.ok(n.fuentes.length && n.texto, JSON.stringify(n));
});

test("no modifica el catálogo (objeto congelado) y es determinista", () => {
  const e = { especies: ["prueba_pacifico_a", "prueba_frio", "prueba_contradictoria"], acuario: { volumen_l: 90, tipo: "arrecife" } };
  assert.deepEqual(ev(e), ev(e));
});

test("los ejemplos JSON para la interfaz están al día", () => {
  execFileSync(process.execPath, [path.join(__dirname, "..", "herramientas", "generar_ejemplos.js"), "--comprobar"], { stdio: "pipe" });
});
