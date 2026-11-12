// Pruebas unitarias de la voz y la ayuda de AIRI v0.2 (sin dependencias).
// Ejecutar desde la raíz:  node --test interfaz/mascota/pruebas/voz.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const V = require("../voz.js");
const A = require("../ayuda.js");

// ── Síntesis simulada ─────────────────────────────────────────────────────
function crearSintesis(voces = [{ lang: "en-US", name: "Inglés" }, { lang: "es-ES", name: "España" },
                                { lang: "es-MX", name: "México", localService: true }]) {
  const s = { cola: [], habladas: [], cancelaciones: 0, oyentes: {},
    getVoices: () => voces,
    addEventListener(tipo, f) { this.oyentes[tipo] = f; },
    speak(u) { this.cola.push(u); this.habladas.push(u); },
    cancel() { this.cancelaciones++; const c = this.cola; this.cola = []; c.forEach((u) => u.onerror && u.onerror({ error: "interrupted" })); },
    // simula que el navegador reproduce el primer fragmento y termina el mensaje
    reproducir() { const c = this.cola; if (!c.length) return; c[0].onstart && c[0].onstart(); },
    terminar() { const c = this.cola; this.cola = []; c.forEach((u) => u.onend && u.onend()); },
  };
  return s;
}
class Utterance { constructor(t) { this.text = t; } }
const almacen = () => { const d = {}; return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = v; } }; };
const temporizadorManual = () => { const t = { tareas: new Map(), n: 0,
  poner(f) { const id = ++t.n; t.tareas.set(id, f); return id; }, quitar(id) { t.tareas.delete(id); },
  correr() { const fs = [...t.tareas.values()]; t.tareas.clear(); fs.forEach((f) => f()); } }; return t; };

test("elegirVoz prefiere español de México y voces locales; null si no hay español", () => {
  assert.equal(V.elegirVoz(crearSintesis().getVoices()).name, "México");
  assert.equal(V.elegirVoz([{ lang: "es-ES", name: "a" }, { lang: "es-AR", name: "b" }]).name, "a");
  assert.equal(V.elegirVoz([{ lang: "es_US", name: "guion bajo" }]).name, "guion bajo");
  assert.equal(V.elegirVoz([{ lang: "en-GB" }]), null);
  assert.equal(V.elegirVoz([]), null);
});

test("prepararTexto adapta unidades y símbolos para la lectura", () => {
  const t = V.prepararTexto("temperatura en °C, pH, salinidad en ppt, nitritos en mg/L. Pulsa «Validar». AIRI v0.1");
  assert.match(t, /grados Celsius/); assert.match(t, /pe hache/); assert.match(t, /partes por mil/);
  assert.match(t, /miligramos por litro/); assert.doesNotMatch(t, /[«»]/); assert.match(t, /Airi versión 0 punto 1/);
});

test("dividir no supera el máximo y no pierde texto", () => {
  const largo = A.RESPUESTAS.proyecto.texto;
  const partes = V.dividir(largo, 180);
  assert.ok(partes.length > 1);
  partes.forEach((p) => assert.ok(p.length <= 180 || !p.includes(". "), p));
  assert.equal(partes.join(" ").replace(/\s+/g, " "), largo.replace(/\s+/g, " "));
});

test("no habla si la voz está desactivada (por defecto) ni al crearse", () => {
  const s = crearSintesis();
  const v = V.crearVoz({ sintesis: s, Utterance, almacen: almacen() });
  assert.equal(v.soportada, true);
  assert.equal(v.activada, false);
  assert.equal(v.hablar("Hola"), false);
  assert.equal(s.habladas.length, 0);
  assert.equal(v.ultimo, "Hola", "recuerda el último mensaje aunque no hable");
});

test("habla en español, cancela antes de cada mensaje y nunca acumula cola", () => {
  const s = crearSintesis();
  const v = V.crearVoz({ sintesis: s, Utterance, almacen: almacen(), temporizador: temporizadorManual() });
  v.activar(true);
  for (let i = 0; i < 5; i++) v.hablar(`Mensaje ${i}.`);
  assert.equal(s.cancelaciones, 5);
  assert.equal(s.cola.length, 1, "solo queda el último mensaje en cola");
  assert.equal(s.cola[0].text, "Mensaje 4.");
  assert.equal(s.cola[0].lang, "es-MX");
  assert.equal(s.cola[0].voice.name, "México");
});

test("estado hablando: inicia con onstart y termina con onend; un mensaje viejo no lo apaga", () => {
  const s = crearSintesis();
  const v = V.crearVoz({ sintesis: s, Utterance, almacen: almacen(), temporizador: temporizadorManual() });
  const estados = [];
  v.alCambiar((e) => estados.push(e.hablando));
  v.activar(true);
  v.hablar("Primero."); s.reproducir();
  assert.equal(v.hablando, true);
  const viejo = s.cola[0];
  v.hablar("Segundo."); s.reproducir();
  viejo.onend && viejo.onend();               // evento tardío del mensaje cancelado
  assert.equal(v.hablando, true, "el fin del mensaje viejo no detiene el nuevo");
  s.terminar();
  assert.equal(v.hablando, false);
  assert.ok(estados.includes(true) && estados[estados.length - 1] === false);
});

test("detener cancela y apaga el estado; repetir vuelve a decir el último mensaje", () => {
  const s = crearSintesis();
  const v = V.crearVoz({ sintesis: s, Utterance, almacen: almacen(), temporizador: temporizadorManual() });
  v.activar(true); v.hablar("Uno."); s.reproducir();
  v.detener();
  assert.equal(v.hablando, false); assert.equal(s.cola.length, 0);
  assert.equal(v.repetir(), true);
  assert.equal(s.cola[0].text, "Uno.");
});

test("desactivar detiene y guarda la preferencia; respaldo si el navegador no emite «end»", () => {
  const s = crearSintesis(); const al = almacen(); const t = temporizadorManual();
  const v = V.crearVoz({ sintesis: s, Utterance, almacen: al, temporizador: t });
  v.activar(true); v.hablar("Hola."); s.reproducir();
  t.correr();                                  // el respaldo termina la locución colgada
  assert.equal(v.hablando, false);
  v.hablar("Otra."); s.reproducir(); v.activar(false);
  assert.equal(v.hablando, false); assert.equal(al.getItem(V.CLAVE), "0");
  assert.equal(V.crearVoz({ sintesis: s, Utterance, almacen: al }).activada, false);
  v.activar(true);
  assert.equal(V.crearVoz({ sintesis: s, Utterance, almacen: al }).activada, true, "recuerda la elección");
});

test("navegador sin síntesis de voz: no falla y no se puede activar", () => {
  const v = V.crearVoz({ sintesis: null, Utterance: null, almacen: almacen() });
  assert.equal(v.soportada, false);
  assert.equal(v.activar(true), false);
  assert.equal(v.hablar("Hola"), false);
  assert.doesNotThrow(() => v.detener());
  assert.doesNotThrow(() => v.repetir());
});

test("sin voces instaladas: habla con idioma es-MX y la voz predeterminada", () => {
  const s = crearSintesis([]);
  const v = V.crearVoz({ sintesis: s, Utterance, almacen: almacen(), temporizador: temporizadorManual() });
  v.activar(true); v.hablar("Hola.");
  assert.equal(v.voz, null);
  assert.equal(s.cola[0].lang, "es-MX"); assert.equal(s.cola[0].voice, undefined);
});

test("almacenamiento bloqueado no impide usar la voz", () => {
  const roto = { getItem() { throw new Error("x"); }, setItem() { throw new Error("x"); } };
  const v = V.crearVoz({ sintesis: crearSintesis(), Utterance, almacen: roto });
  assert.equal(v.activada, false);
  assert.equal(v.activar(true), true);
});

// ── Ayuda ───────────────────────────────────────────────────────────────────
test("el menú tiene las seis acciones de v0.2 y «Ajustes de voz» (v0.3)", () => {
  assert.deepEqual(A.ACCIONES.map((a) => a.texto), ["¿Qué puedes hacer?", "Ayúdame con los parámetros del agua",
    "Explícame las fichas de especies", "¿Qué funciones llegarán después?", "Repetir mensaje", "Silenciar AIRI",
    "Ajustes de voz"]);
});

test("la acción de la pestaña actual va primero y marcada como recomendada", () => {
  for (const [pestana, id] of [["inicio", "proyecto"], ["agua", "agua"], ["especies", "especies"], ["futuro", "futuro"]]) {
    const l = A.accionesPara(pestana);
    assert.equal(l[0].id, id); assert.equal(l[0].recomendada, true);
    assert.equal(l.length, 7); assert.equal(l.filter((a) => a.recomendada).length, 1);
  }
});

test("ayuda del agua: seis parámetros con sus unidades y límites de la validación", () => {
  const t = A.respuesta("agua").texto;
  for (const p of ["temperatura en °C", "pH", "salinidad en ppt", "amoníaco total en mg/L", "nitritos en mg/L", "nitratos en mg/L"]) {
    assert.ok(t.includes(p), p);
  }
  assert.match(t, /no indico si un valor es adecuado/);
});

test("ayuda de fichas y futuro: advierte sin compatibilidad y separa implementado de planeado", () => {
  assert.match(A.respuesta("especies").texto, /no determinan compatibilidad/);
  const f = A.respuesta("futuro").texto;
  assert.match(f, /Ya funcionan/); assert.match(f, /planeadas, pero todavía no disponibles/);
});

test("ninguna respuesta afirma analizar el agua ni identificar peces por fotografía", () => {
  const textos = [...Object.values(A.RESPUESTAS), ...Object.values(A.MENSAJES_VOZ)].map((r) => r.texto);
  for (const t of textos) {
    for (const m of t.matchAll(/(analizo el agua|identifico peces|evalúo compatibilidad)/g)) {
      const antes = t.slice(Math.max(0, m.index - 15), m.index);
      assert.match(antes, /\bno\s*$/, `afirmación sin negar: «${antes}${m[0]}»`);
    }
    assert.doesNotMatch(t, /\b(es seguro|está sano|son compatibles)\b/i);
  }
});
