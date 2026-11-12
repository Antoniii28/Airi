// Pruebas unitarias de la personalización de voz de AIRI v0.3.
// Ejecutar desde la raíz:  node --test interfaz/mascota/pruebas/voz_personalidad.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const V = require("../voz.js");

class Utterance { constructor(t) { this.text = t; } }
const almacen = (inicial = {}) => { const d = { ...inicial }; return { d, getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = v; } }; };
const manual = () => ({ poner: () => 0, quitar: () => {} });
const VOCES = [
  { name: "Microsoft Helena", lang: "es-ES", localService: true, default: true, voiceURI: "helena" },
  { name: "Microsoft Laura", lang: "es-ES", localService: true, voiceURI: "laura" },
  { name: "Google español de Estados Unidos", lang: "es-US", localService: false, voiceURI: "google-us" },
  { name: "Microsoft Sabina", lang: "es-MX", localService: true, voiceURI: "sabina" },
  { name: "Microsoft Dalia Online (Natural)", lang: "es-MX", localService: false, voiceURI: "dalia-online" },
  { name: "Samantha", lang: "en-US", localService: true, voiceURI: "samantha" },
];
function sintesis(voces = VOCES) {
  return { cola: [], habladas: [], getVoices: () => voces, addEventListener() {},
    speak(u) { this.cola.push(u); this.habladas.push(u); }, cancel() { this.cola = []; } };
}

test("perfiles dentro de límites; el predeterminado es juvenil sin exagerar", () => {
  for (const [id, p] of Object.entries(V.PERFILES)) {
    assert.ok(p.tono >= V.LIMITES.tono[0] && p.tono <= V.LIMITES.tono[1], id);
    assert.ok(p.velocidad >= V.LIMITES.velocidad[0] && p.velocidad <= V.LIMITES.velocidad[1], id);
  }
  const d = V.PERFILES[V.PERFIL_PREDETERMINADO];
  assert.equal(V.PERFIL_PREDETERMINADO, "airi");
  assert.ok(d.tono > 1.05 && d.tono <= 1.2, "algo más agudo que la v0.2, sin pasar de 1.2");
  assert.ok(d.velocidad >= 1 && d.velocidad <= 1.08);
  assert.deepEqual([V.PERFILES.clasica.tono, V.PERFILES.clasica.velocidad], [1.05, 1.0], "la voz de v0.2 se conserva para comparar");
});

test("listarVoces: México primero, dispositivo antes que en línea, sin otros idiomas", () => {
  const l = V.listarVoces(VOCES);
  assert.deepEqual(l.map((v) => v.id), ["sabina", "helena", "laura", "dalia-online", "google-us"]);
  assert.equal(l.find((v) => v.id === "dalia-online").enLinea, true);
  assert.equal(l[0].mexico, true);
});

test("la selección automática nunca usa una voz en línea", () => {
  assert.equal(V.elegirVoz(VOCES).voiceURI, "sabina");
  const soloEnLinea = VOCES.filter((v) => !v.localService);
  assert.equal(V.elegirVoz(soloEnLinea), null);
  assert.equal(V.elegirVoz(soloEnLinea, { permitirEnLinea: true }).voiceURI, "dalia-online");
  // equipo real del usuario: solo voces de España → la predeterminada del sistema primero
  assert.equal(V.elegirVoz(VOCES.filter((v) => v.lang === "es-ES")).voiceURI, "helena");
});

test("normalizarConfig limita valores extremos y tolera datos dañados", () => {
  const c = V.normalizarConfig({ tono: 3, velocidad: 0.1, perfil: "xyz", voz: 42 });
  assert.equal(c.tono, V.LIMITES.tono[1]); assert.equal(c.velocidad, V.LIMITES.velocidad[0]);
  assert.equal(c.perfil, "airi"); assert.equal(c.voz, null); assert.equal(c.matices, true);
  assert.deepEqual(V.normalizarConfig("basura"), V.normalizarConfig(null));
  assert.equal(V.normalizarConfig({ tono: "abc" }).tono, 1);
});

test("matices de personalidad por estado: alegre, paciente, tranquilo y serio", () => {
  const base = V.configDePerfil("airi");
  const s = V.prosodia(base, "bienvenida"), e = V.prosodia(base, "espera"),
        i = V.prosodia(base, "insuficiente"), x = V.prosodia(base, "error");
  assert.ok(s.tono > base.tono && s.velocidad > base.velocidad, "saludo más alegre");
  assert.ok(e.velocidad < base.velocidad, "explicación más pausada");
  assert.ok(i.tono < base.tono && i.velocidad < e.velocidad, "dato faltante tranquilo");
  assert.ok(x.tono < i.tono && x.velocidad < base.velocidad, "advertencia seria");
  assert.ok(x.tono >= 1.0, "seria pero no grave ni alarmista");
  const sin = V.prosodia({ ...base, matices: false }, "error");
  assert.deepEqual(sin, { tono: base.tono, velocidad: base.velocidad }, "sin matices: siempre igual");
  assert.ok(V.prosodia({ tono: 1.4, velocidad: 1.25 }, "bienvenida").tono <= V.LIMITES.tono[1], "los matices respetan los límites");
});

test("hablar usa la configuración guardada y el matiz del estado", () => {
  const s = sintesis(); const v = V.crearVoz({ sintesis: s, Utterance, almacen: almacen(), temporizador: manual() });
  v.activar(true);
  v.hablar("Falta el pH.", { estado: "insuficiente" });
  const p = V.prosodia(V.configDePerfil("airi"), "insuficiente");
  assert.equal(s.cola[0].pitch, p.tono); assert.equal(s.cola[0].rate, p.velocidad);
  assert.equal(s.cola[0].voice.voiceURI, "sabina");
  v.repetir();
  assert.equal(s.cola[0].pitch, p.tono, "repetir conserva el matiz del mensaje");
});

test("configurar guarda y se recupera al recargar; datos guardados dañados no rompen", () => {
  const al = almacen(); const s = sintesis();
  const v = V.crearVoz({ sintesis: s, Utterance, almacen: al, temporizador: manual() });
  v.configurar({ perfil: "personalizada", voz: "laura", tono: 1.2, velocidad: 0.95, matices: false });
  const w = V.crearVoz({ sintesis: s, Utterance, almacen: al, temporizador: manual() });
  assert.deepEqual(w.config, { perfil: "personalizada", voz: "laura", tono: 1.2, velocidad: 0.95, matices: false, enLineaAutorizada: false });
  assert.equal(w.voz.voiceURI, "laura");
  const roto = V.crearVoz({ sintesis: s, Utterance, almacen: almacen({ [V.CLAVE_CONFIG]: "{no json" }), temporizador: manual() });
  assert.equal(roto.config.perfil, "airi");
});

test("una voz en línea solo se usa con autorización expresa", () => {
  const s = sintesis(); const v = V.crearVoz({ sintesis: s, Utterance, almacen: almacen(), temporizador: manual() });
  v.configurar({ voz: "dalia-online" });
  assert.equal(v.voz.voiceURI, "sabina", "sin autorización vuelve a una voz del dispositivo");
  v.configurar({ voz: "dalia-online", enLineaAutorizada: true });
  assert.equal(v.voz.voiceURI, "dalia-online");
});

test("probar: demostración con configuración sin guardar, aunque la voz esté desactivada", () => {
  const al = almacen(); const s = sintesis();
  const v = V.crearVoz({ sintesis: s, Utterance, almacen: al, temporizador: manual() });
  assert.equal(v.activada, false);
  v.probar(V.FRASES_DEMO.saludo.texto, { perfil: "energica", tono: 1.25, velocidad: 1.1, voz: "laura" }, "bienvenida");
  assert.equal(s.cola[0].voice.voiceURI, "laura");
  assert.equal(s.cola[0].pitch, V.prosodia({ tono: 1.25, velocidad: 1.1 }, "bienvenida").tono);
  assert.equal(al.getItem(V.CLAVE_CONFIG), null, "no guarda nada");
  assert.equal(v.config.perfil, "airi");
});

test("probarVarias encadena las opciones para compararlas y detener corta todo", () => {
  const s = sintesis(); const v = V.crearVoz({ sintesis: s, Utterance, almacen: almacen(), temporizador: manual() });
  const opciones = Object.keys(V.PERFILES).map((id) => ({ texto: `Opción ${id}.`, estado: "espera", config: V.configDePerfil(id) }));
  v.probarVarias(opciones);
  assert.deepEqual(s.cola.map((u) => u.text), opciones.map((o) => o.texto));
  assert.deepEqual(s.cola.map((u) => u.pitch), opciones.map((o) => V.prosodia(o.config, "espera").tono));
  v.detener();
  assert.equal(s.cola.length, 0);
});

test("las frases de demostración cubren los cuatro rasgos y no afirman análisis real", () => {
  assert.deepEqual(Object.keys(V.FRASES_DEMO), ["saludo", "explicacion", "faltante", "advertencia"]);
  for (const f of Object.values(V.FRASES_DEMO)) {
    assert.ok(V.MATICES[f.estado]);
    assert.doesNotMatch(f.texto, /analizo el agua|es seguro|peligro/i);
  }
});
