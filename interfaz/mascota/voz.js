/* ═══ AIRI · Voz v0.2 ═══════════════════════════════════════════════════════
   Síntesis de voz del navegador (Web Speech API: speechSynthesis). Separada de
   la parte visual de la mascota. Expone window.AIRIVoz (o module.exports).

   Garantías:
   - Nunca habla sola al abrir la página: solo tras una acción de la persona.
   - No usa el micrófono ni servicios externos; el texto no sale del navegador.
   - Cada mensaje nuevo cancela el anterior: la cola nunca acumula mensajes.
   - Si el navegador no tiene síntesis de voz, todo sigue funcionando por escrito.
*/
(function (raiz, fabrica) {
  var api = fabrica(raiz);
  if (typeof module === "object" && module.exports) { module.exports = api; }
  else { raiz.AIRIVoz = api; }
})(typeof window !== "undefined" ? window : globalThis, function (raiz) {
  "use strict";

  var CLAVE = "airi.voz.activada";
  var PREFERENCIA_IDIOMA = ["es-MX", "es-US", "es-419", "es-ES"];

  /** Adapta el texto escrito para que la voz lo lea con naturalidad. */
  var REEMPLAZOS = [
    [/«|»|“|”/g, ""],
    [/NH₃\/NH₄⁺ total/g, "amoníaco total"],
    [/NO₂⁻/g, "nitritos"], [/NO₃⁻/g, "nitratos"],
    [/°C/g, " grados Celsius"],
    [/\bmg\/L\b/g, "miligramos por litro"],
    [/\bppt\b/g, "partes por mil"],
    [/\bpH\b/g, "pe hache"],
    [/\bAIRI\b/g, "Airi"],
    [/\bv(\d+)\.(\d+)\b/g, "versión $1 punto $2"],
    [/\s{2,}/g, " "]
  ];
  function prepararTexto(texto) {
    var t = String(texto || "");
    REEMPLAZOS.forEach(function (r) { t = t.replace(r[0], r[1]); });
    return t.trim();
  }

  /** Divide en fragmentos de hasta `maximo` caracteres por oraciones (algunos
      navegadores cortan las locuciones largas). */
  function dividir(texto, maximo) {
    maximo = maximo || 180;
    var oraciones = String(texto).match(/[^.!?;:]+[.!?;:]*\s*/g) || [String(texto)];
    var partes = [], actual = "";
    oraciones.forEach(function (o) {
      if ((actual + o).length > maximo && actual) { partes.push(actual.trim()); actual = ""; }
      actual += o;
    });
    if (actual.trim()) partes.push(actual.trim());
    return partes;
  }

  /** Elige la mejor voz en español disponible, o null. */
  function elegirVoz(voces) {
    var lista = (voces || []).filter(function (v) { return v && /^es([-_]|$)/i.test(v.lang || ""); });
    if (!lista.length) return null;
    function rango(v) {
      var i = PREFERENCIA_IDIOMA.indexOf((v.lang || "").replace("_", "-"));
      return (i < 0 ? PREFERENCIA_IDIOMA.length : i) * 2 + (v.localService ? 0 : 1);
    }
    return lista.slice().sort(function (a, b) { return rango(a) - rango(b); })[0];
  }

  /**
   * Crea el controlador de voz.
   * entorno: { sintesis, Utterance, almacen, temporizador } — inyectables para pruebas.
   */
  function crearVoz(entorno) {
    entorno = entorno || {};
    var sintesis = entorno.sintesis !== undefined ? entorno.sintesis : raiz.speechSynthesis;
    var Utterance = entorno.Utterance !== undefined ? entorno.Utterance : raiz.SpeechSynthesisUtterance;
    var almacen = entorno.almacen !== undefined ? entorno.almacen : null;
    var temporizador = entorno.temporizador || { poner: setTimeout, quitar: clearTimeout };
    var soportada = !!(sintesis && typeof sintesis.speak === "function" && typeof Utterance === "function");

    var ctl = { soportada: soportada, hablando: false, ultimo: "", voz: null, activada: false };
    var oyentes = [], generacion = 0, respaldo = null;

    try { ctl.activada = soportada && !!almacen && almacen.getItem(CLAVE) === "1"; } catch (e) { ctl.activada = false; }

    function avisar() {
      var estado = { hablando: ctl.hablando, activada: ctl.activada, soportada: ctl.soportada, voz: ctl.voz };
      oyentes.forEach(function (f) { try { f(estado); } catch (e) { /* un oyente no rompe la voz */ } });
    }
    function cargarVoces() {
      if (!soportada) return;
      try { ctl.voz = elegirVoz(sintesis.getVoices()); } catch (e) { ctl.voz = null; }
      avisar();
    }
    if (soportada) {
      cargarVoces();
      if (typeof sintesis.addEventListener === "function") sintesis.addEventListener("voiceschanged", cargarVoces);
    }

    function terminar(gen) {
      if (gen !== generacion) return;          // un mensaje viejo cancelado no afecta al actual
      temporizador.quitar(respaldo);
      if (ctl.hablando) { ctl.hablando = false; avisar(); }
    }

    /** Habla un texto. Devuelve false si la voz está desactivada o no existe. */
    ctl.hablar = function (texto) {
      if (texto) ctl.ultimo = String(texto);
      if (!soportada || !ctl.activada || !ctl.ultimo) return false;
      generacion++;
      var gen = generacion;
      try { sintesis.cancel(); } catch (e) { /* nada que cancelar */ }
      var partes = dividir(prepararTexto(ctl.ultimo));
      partes.forEach(function (parte, i) {
        var u = new Utterance(parte);
        u.lang = ctl.voz ? ctl.voz.lang : "es-MX";
        if (ctl.voz) u.voice = ctl.voz;
        u.rate = 1; u.pitch = 1.05;
        if (i === 0) u.onstart = function () { if (gen === generacion && !ctl.hablando) { ctl.hablando = true; avisar(); } };
        if (i === partes.length - 1) u.onend = function () { terminar(gen); };
        u.onerror = function () { terminar(gen); };
        sintesis.speak(u);
      });
      // Respaldo: algunos navegadores no emiten «end»; la animación no queda colgada
      temporizador.quitar(respaldo);
      respaldo = temporizador.poner(function () { terminar(gen); }, 4000 + ctl.ultimo.length * 90);
      return true;
    };
    ctl.repetir = function () { return ctl.hablar(ctl.ultimo); };
    ctl.detener = function () {
      generacion++;
      temporizador.quitar(respaldo);
      if (soportada) { try { sintesis.cancel(); } catch (e) { /* sin cola */ } }
      if (ctl.hablando) { ctl.hablando = false; }
      avisar();
    };
    ctl.activar = function (valor) {
      ctl.activada = soportada && !!valor;
      try { if (almacen) almacen.setItem(CLAVE, ctl.activada ? "1" : "0"); } catch (e) { /* sin almacenamiento */ }
      if (!ctl.activada) ctl.detener(); else avisar();
      return ctl.activada;
    };
    ctl.alCambiar = function (f) { oyentes.push(f); return ctl; };
    return ctl;
  }

  return { prepararTexto: prepararTexto, dividir: dividir, elegirVoz: elegirVoz, crearVoz: crearVoz,
           CLAVE: CLAVE };
});
