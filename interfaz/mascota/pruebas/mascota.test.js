// Pruebas unitarias de la lógica pura de la mascota (sin dependencias).
// Ejecutar desde la raíz del repositorio:  node --test interfaz/mascota/pruebas/mascota.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../mascota.js");

test("define los estados de v0.1", () => {
  for (const e of ["bienvenida", "espera", "analisis", "insuficiente", "error", "alerta"]) {
    assert.ok(M.ESTADOS.includes(e), e);
  }
});

test("hay un mensaje contextual para cada una de las cuatro pestañas", () => {
  assert.deepEqual(Object.keys(M.MENSAJES_PESTANA).sort(), ["agua", "especies", "futuro", "inicio"]);
  for (const m of Object.values(M.MENSAJES_PESTANA)) {
    assert.ok(M.ESTADOS.includes(m.estado));
    assert.ok(m.texto.length > 20);
  }
});

test("listaHumana une con comas e «y»", () => {
  assert.equal(M.listaHumana([]), "");
  assert.equal(M.listaHumana(["pH"]), "pH");
  assert.equal(M.listaHumana(["pH", "Nitritos"]), "pH y Nitritos");
  assert.equal(M.listaHumana(["A", "B", "C"]), "A, B y C");
});

test("dato faltante → estado insuficiente con advertencia informativa (no anomalía)", () => {
  const r = M.interpretarValidacion({ insuficientes: ["pH"], invalidos: [], validos: ["Temperatura"] });
  assert.equal(r.estado, "insuficiente");
  assert.equal(r.tipo, "advertencia");
  assert.match(r.texto, /pH/);
  assert.match(r.texto, /no es una alerta del acuario/);
});

test("valor inválido → estado error; menciona también los faltantes", () => {
  const r = M.interpretarValidacion({ insuficientes: ["Nitratos"], invalidos: ["pH", "Salinidad"], validos: [] });
  assert.equal(r.estado, "error");
  assert.equal(r.tipo, "error");
  assert.match(r.texto, /pH y Salinidad/);
  assert.match(r.texto, /falta Nitratos/);
});

test("todos válidos → no declara normalidad ni seguridad", () => {
  const r = M.interpretarValidacion({ insuficientes: [], invalidos: [], validos: Array(6).fill("x") });
  assert.equal(r.estado, "espera");
  assert.equal(r.tipo, "implementado");
  assert.match(r.texto, /formato válido/);
  assert.match(r.texto, /no evalúo/);
});

test("ningún mensaje inventa diagnósticos (normal, saludable, seguro, compatible afirmados)", () => {
  const textos = [
    ...Object.values(M.MENSAJES_PESTANA).map((m) => m.texto),
    M.MENSAJE_ANALISIS.texto, M.MENSAJE_LIMPIO.texto,
    M.interpretarValidacion({ validos: ["a"] }).texto,
    M.interpretarValidacion({ insuficientes: ["a"] }).texto,
    M.interpretarValidacion({ invalidos: ["a"] }).texto,
    M.mensajeBusqueda("payaso", 1).texto, M.mensajeBusqueda("zz", 0).texto,
  ];
  for (const t of textos) {
    assert.doesNotMatch(t, /\b(está normal|es normal|saludable|es seguro|son compatibles|es compatible|anomalía detectada)\b/i, t);
  }
});

test("el análisis está marcado como demostrativo", () => {
  assert.equal(M.MENSAJE_ANALISIS.tipo, "demostrativo");
  assert.equal(M.ETIQUETAS.demostrativo, "Animación demostrativa");
});

test("mensajeBusqueda refleja la cantidad real de resultados", () => {
  assert.match(M.mensajeBusqueda("payaso", 1).texto, /1 ficha para «payaso»/);
  assert.match(M.mensajeBusqueda("x", 3).texto, /3 fichas/);
  assert.match(M.mensajeBusqueda("zz", 0).texto, /No encontré/);
  assert.equal(M.mensajeBusqueda("  ", 6), M.MENSAJES_PESTANA.especies);
});

test("preferencias: guarda, respeta el sistema si no hay elección y tolera almacenamiento bloqueado", () => {
  const datos = {};
  const almacen = { getItem: (k) => (k in datos ? datos[k] : null), setItem: (k, v) => { datos[k] = v; } };
  let sistema = true;
  const p = M.crearPreferencias(almacen, () => sistema);
  assert.equal(p.oculta(), false);
  assert.equal(p.reducida(), true, "sigue al sistema");
  sistema = false;
  assert.equal(p.reducida(), false);
  p.fijarReducida(true); assert.equal(p.reducida(), true, "la elección de la persona manda");
  p.fijarOculta(true); assert.equal(p.oculta(), true);
  const roto = { getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("bloqueado"); } };
  const q = M.crearPreferencias(roto, () => true);
  assert.doesNotThrow(() => q.fijarOculta(true));
  assert.equal(q.oculta(), false);
  assert.equal(q.reducida(), true);
  assert.equal(M.crearPreferencias(null, null).reducida(), false);
});

test("pasoNado: nunca sale de la pecera y cambia de dirección en los bordes", () => {
  let s = { x: 10, dir: 1, giro: 0, t: 0 };
  const p = { min: 10, max: 400, estado: "espera", amplitud: 12, azar: () => 0.99 };
  let cambios = 0, prev = s.dir;
  for (let i = 0; i < 6000; i++) {
    s = M.pasoNado(s, 1 / 60, p);
    assert.ok(s.x >= p.min && s.x <= p.max, `x=${s.x}`);
    assert.ok(Math.abs(s.y) <= p.amplitud * 1.6 + 1e-9);
    if (s.dir !== prev) { cambios++; prev = s.dir; }
  }
  assert.ok(cambios >= 10, `cambios de dirección: ${cambios}`);
});

test("pasoNado: giros naturales a mitad de recorrido y pausa al centro en análisis", () => {
  let s = { x: 200, dir: 1, giro: 0, t: 0 };
  const azar = () => 0.0001;  // fuerza un giro espontáneo en la zona central
  s = M.pasoNado(s, 1 / 60, { min: 10, max: 400, estado: "espera", amplitud: 10, azar });
  assert.equal(s.dir, -1); assert.ok(s.giro > 0);
  let a = { x: 20, dir: 1, giro: 0, t: 0 };
  for (let i = 0; i < 300; i++) a = M.pasoNado(a, 1 / 60, { min: 10, max: 400, estado: "analisis", amplitud: 10 });
  assert.ok(Math.abs(a.x - 205) < 2, `x=${a.x}`);
});
