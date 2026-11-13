/* ═══ AIRI · Voz v0.3 ═══════════════════════════════════════════════════════
   Síntesis de voz del navegador (Web Speech API: speechSynthesis). Separada de
   la parte visual de la mascota. Expone window.AIRIVoz (o module.exports).

   Garantías:
   - Nunca habla sola al abrir la página: solo tras una acción de la persona.
   - No usa el micrófono. Solo usa voces del dispositivo, salvo que la persona
     autorice expresamente una voz «en línea» (esas envían el texto al proveedor).
   - Cada mensaje nuevo cancela el anterior: la cola nunca acumula mensajes.
   - Si el navegador no tiene síntesis de voz, todo sigue funcionando por escrito.

   v0.3 · Personalidad: perfiles de tono y velocidad, y matices según el estado
   del mensaje (alegre al saludar, paciente al explicar, tranquilo con datos
   faltantes, serio sin alarmar en advertencias). Importante: solo se ajustan el
   TONO y la VELOCIDAD de las voces instaladas; no se crea una voz nueva.
*/
(function (raiz, fabrica) {
  var api = fabrica(raiz);
  if (typeof module === "object" && module.exports) { module.exports = api; }
  else { raiz.AIRIVoz = api; }
})(typeof window !== "undefined" ? window : globalThis, function (raiz) {
  "use strict";

  var CLAVE = "airi.voz.activada";
  var CLAVE_CONFIG = "airi.voz.config";
  var PREFERENCIA_IDIOMA = ["es-MX", "es-US", "es-419", "es-ES"];

  // Límites para que la voz no suene exageradamente aguda, grave, lenta o rápida
  var LIMITES = { tono: [0.8, 1.4], velocidad: [0.8, 1.25] };

  /** Perfiles para comparar. «clasica» conserva exactamente la voz de v0.2. */
  var PERFILES = {
    airi:      { nombre: "AIRI juvenil (recomendada)", tono: 1.15, velocidad: 1.04,
                 descripcion: "Un poco más aguda y ágil: juvenil y amigable, sin exagerar." },
    clasica:   { nombre: "Clásica (v0.2)", tono: 1.05, velocidad: 1.0,
                 descripcion: "La configuración original de la versión 0.2." },
    tranquila: { nombre: "Tranquila", tono: 1.05, velocidad: 0.94,
                 descripcion: "Más pausada, para explicaciones largas." },
    energica:  { nombre: "Enérgica", tono: 1.25, velocidad: 1.1,
                 descripcion: "Más aguda y rápida; la más expresiva sin perder claridad." }
  };
  var PERFIL_PREDETERMINADO = "airi";

  /** Matices de personalidad por estado del mensaje (se suman al perfil). */
  var MATICES = {
    bienvenida:   { tono: 0.06,  velocidad: 0.04 },   // alegre y curioso
    espera:       { tono: 0,     velocidad: -0.02 },  // claro y paciente
    analisis:     { tono: 0,     velocidad: 0 },
    insuficiente: { tono: -0.03, velocidad: -0.05 },  // tranquilo
    error:        { tono: -0.08, velocidad: -0.06 },  // serio, sin alarmar
    alerta:       { tono: -0.08, velocidad: -0.07 },
    conversacion: { tono: -0.03, velocidad: -0.04 }   // v0.6: respuestas largas del chat, más pausadas
  };

  /** Frases para la demostración, una por rasgo de personalidad. */
  var FRASES_DEMO = {
    saludo:       { estado: "bienvenida", nombre: "Saludo (alegre y curioso)",
                    texto: "¡Hola! Soy AIRI, tu guía en este acuario marino. ¿Exploramos juntos la interfaz?" },
    explicacion:  { estado: "espera", nombre: "Explicación (clara y paciente)",
                    texto: "Para validar las mediciones, escribe los seis valores y pulsa «Validar entradas». Yo reviso que cada dato tenga un formato válido." },
    faltante:     { estado: "insuficiente", nombre: "Dato faltante (tranquilo)",
                    texto: "Falta el dato de pH. No pasa nada: agrégalo cuando lo tengas y lo reviso contigo." },
    advertencia:  { estado: "error", nombre: "Advertencia (seria, sin alarmar)",
                    texto: "Hay un valor inválido en la temperatura. Revisa ese campo antes de continuar." }
  };

  function limitar(valor, rango) {
    var n = Number(valor);
    if (!isFinite(n)) n = 1;
    return Math.round(Math.min(rango[1], Math.max(rango[0], n)) * 100) / 100;
  }

  /** Configuración válida a partir de cualquier valor (p. ej. lo guardado). */
  function normalizarConfig(c) {
    c = c && typeof c === "object" ? c : {};
    var perfil = PERFILES[c.perfil] ? c.perfil : (c.perfil === "personalizada" ? "personalizada" : PERFIL_PREDETERMINADO);
    var base = PERFILES[perfil] || PERFILES[PERFIL_PREDETERMINADO];
    return {
      perfil: perfil,
      voz: typeof c.voz === "string" && c.voz ? c.voz : null,
      tono: limitar(c.tono != null ? c.tono : base.tono, LIMITES.tono),
      velocidad: limitar(c.velocidad != null ? c.velocidad : base.velocidad, LIMITES.velocidad),
      matices: c.matices !== false,
      enLineaAutorizada: c.enLineaAutorizada === true
    };
  }
  function configDePerfil(perfil, actual) {
    var p = PERFILES[perfil] || PERFILES[PERFIL_PREDETERMINADO];
    var c = normalizarConfig(actual);
    c.perfil = PERFILES[perfil] ? perfil : PERFIL_PREDETERMINADO;
    c.tono = p.tono; c.velocidad = p.velocidad;
    return c;
  }
  /** Tono y velocidad finales para un mensaje, con el matiz de su estado. */
  function prosodia(config, estado) {
    var c = normalizarConfig(config);
    var m = (c.matices && MATICES[estado]) || { tono: 0, velocidad: 0 };
    return { tono: limitar(c.tono + m.tono, LIMITES.tono), velocidad: limitar(c.velocidad + m.velocidad, LIMITES.velocidad) };
  }

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

  /** Divide en fragmentos de hasta `maximo` caracteres por oraciones. */
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

  function esEspanol(v) { return !!v && /^es([-_]|$)/i.test(v.lang || ""); }
  function esEnLinea(v) { return !!v && v.localService === false; }
  function idVoz(v) { return v ? (v.voiceURI || v.name) : null; }
  /** v0.6: voz elegida por el proyecto (prueba de E1): Microsoft Sabina, español de México, local. */
  var VOCES_PREFERIDAS = [/\bSabina\b/i];
  function rangoPreferida(v) {
    for (var i = 0; i < VOCES_PREFERIDAS.length; i++) if (VOCES_PREFERIDAS[i].test(v.name || "")) return i;
    return VOCES_PREFERIDAS.length;
  }
  function rangoIdioma(v) {
    var i = PREFERENCIA_IDIOMA.indexOf((v.lang || "").replace("_", "-"));
    return i < 0 ? PREFERENCIA_IDIOMA.length : i;
  }

  /** Voces en español ordenadas: las del dispositivo antes que las en línea; dentro de ellas, la preferida
      del proyecto (Sabina) y después México primero. */
  function listarVoces(voces) {
    return (voces || []).filter(esEspanol).slice().sort(function (a, b) {
      return (esEnLinea(a) - esEnLinea(b)) || (rangoPreferida(a) - rangoPreferida(b)) || (rangoIdioma(a) - rangoIdioma(b)) ||
             ((b.default ? 1 : 0) - (a.default ? 1 : 0)) || String(a.name).localeCompare(String(b.name));
    }).map(function (v) {
      return { id: idVoz(v), nombre: v.name, idioma: (v.lang || "").replace("_", "-"), enLinea: esEnLinea(v),
               mexico: /^es[-_]MX$/i.test(v.lang || ""), voz: v };
    });
  }

  /** Elige automáticamente la mejor voz en español DEL DISPOSITIVO (o null). */
  function elegirVoz(voces, opciones) {
    var permitirEnLinea = opciones && opciones.permitirEnLinea;
    var lista = listarVoces(voces).filter(function (v) { return permitirEnLinea || !v.enLinea; });
    return lista.length ? lista[0].voz : null;
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
    var temporizador = entorno.temporizador || {   // envoltorios: setTimeout no admite otro «this»
      poner: function (f, ms) { return setTimeout(f, ms); },
      quitar: function (id) { clearTimeout(id); }
    };
    var soportada = !!(sintesis && typeof sintesis.speak === "function" && typeof Utterance === "function");

    var ctl = { soportada: soportada, hablando: false, ultimo: "", ultimoEstado: null, voz: null,
                activada: false, voces: [], config: normalizarConfig(null) };
    var oyentes = [], generacion = 0, respaldo = null;

    function leer(clave) { try { return almacen ? almacen.getItem(clave) : null; } catch (e) { return null; } }
    function guardar(clave, valor) { try { if (almacen) almacen.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ } }
    ctl.activada = soportada && leer(CLAVE) === "1";
    try { ctl.config = normalizarConfig(JSON.parse(leer(CLAVE_CONFIG) || "null")); }
    catch (e) { ctl.config = normalizarConfig(null); }      // dato guardado dañado: se ignora

    function avisar() {
      var estado = { hablando: ctl.hablando, activada: ctl.activada, soportada: ctl.soportada, voz: ctl.voz };
      oyentes.forEach(function (f) { try { f(estado); } catch (e) { /* un oyente no rompe la voz */ } });
    }
    /** Voz que corresponde a una configuración: la elegida si existe y está permitida; si no, la automática. */
    function resolverVoz(config) {
      var lista = ctl.voces;
      if (config.voz) {
        for (var i = 0; i < lista.length; i++) {
          if (lista[i].id === config.voz && (!lista[i].enLinea || config.enLineaAutorizada)) return lista[i].voz;
        }
      }
      return elegirVoz(lista.map(function (v) { return v.voz; }));
    }
    function cargarVoces() {
      if (!soportada) return;
      try { ctl.voces = listarVoces(sintesis.getVoices()); } catch (e) { ctl.voces = []; }
      ctl.voz = resolverVoz(ctl.config);
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

    /** Pronuncia una lista de elementos {texto, estado, config} uno tras otro (interno). */
    function pronunciar(elementos, alTerminar) {
      generacion++;
      var gen = generacion;
      try { sintesis.cancel(); } catch (e) { /* nada que cancelar */ }
      var total = 0;
      elementos.forEach(function (el) { total += el.texto.length; });
      elementos.forEach(function (el, j) {
        var config = normalizarConfig(el.config || ctl.config);
        var voz = resolverVoz(config);
        var p = prosodia(config, el.estado);
        var partes = dividir(prepararTexto(el.texto));
        partes.forEach(function (parte, i) {
          var u = new Utterance(parte);
          u.lang = voz ? voz.lang : "es-MX";
          if (voz) u.voice = voz;
          u.rate = p.velocidad; u.pitch = p.tono;
          if (j === 0 && i === 0) u.onstart = function () { if (gen === generacion && !ctl.hablando) { ctl.hablando = true; avisar(); } };
          if (el.alIniciar && i === 0) u.onstart = (function (previo) {
            return function () { if (previo) previo(); if (gen === generacion) el.alIniciar(); };
          })(u.onstart);
          if (j === elementos.length - 1 && i === partes.length - 1) u.onend = function () { terminar(gen); if (alTerminar && gen === generacion) alTerminar(); };
          u.onerror = function () { terminar(gen); };
          sintesis.speak(u);
        });
      });
      // Respaldo: algunos navegadores no emiten «end»; la animación no queda colgada
      temporizador.quitar(respaldo);
      respaldo = temporizador.poner(function () { terminar(gen); }, 4000 + total * 90);
      return true;
    }

    /** Habla un mensaje con la configuración guardada. Devuelve false si la voz está desactivada o no existe. */
    ctl.hablar = function (texto, opciones) {
      if (texto) { ctl.ultimo = String(texto); ctl.ultimoEstado = (opciones && opciones.estado) || null; }
      if (!soportada || !ctl.activada || !ctl.ultimo) return false;
      return pronunciar([{ texto: ctl.ultimo, estado: ctl.ultimoEstado }]);
    };
    ctl.repetir = function () { return ctl.hablar(ctl.ultimo, { estado: ctl.ultimoEstado }); };

    /** Demostración con una configuración SIN guardar. Funciona aunque la voz esté
        desactivada, porque siempre la inicia la persona desde los ajustes. */
    ctl.probar = function (texto, config, estado) {
      if (!soportada) return false;
      return pronunciar([{ texto: texto, estado: estado || null, config: config }]);
    };
    /** Comparación: varias configuraciones seguidas; se puede detener en cualquier momento. */
    ctl.probarVarias = function (elementos) {
      if (!soportada || !elementos || !elementos.length) return false;
      return pronunciar(elementos);
    };

    ctl.detener = function () {
      generacion++;
      temporizador.quitar(respaldo);
      if (soportada) { try { sintesis.cancel(); } catch (e) { /* sin cola */ } }
      if (ctl.hablando) { ctl.hablando = false; }
      avisar();
    };
    ctl.activar = function (valor) {
      ctl.activada = soportada && !!valor;
      guardar(CLAVE, ctl.activada ? "1" : "0");
      if (!ctl.activada) ctl.detener(); else avisar();
      return ctl.activada;
    };
    /** Guarda la configuración (voz, perfil, tono, velocidad, matices). */
    ctl.configurar = function (config) {
      ctl.config = normalizarConfig(config);
      guardar(CLAVE_CONFIG, JSON.stringify(ctl.config));
      ctl.voz = resolverVoz(ctl.config);
      avisar();
      return ctl.config;
    };
    ctl.vozPara = function (config) { return resolverVoz(normalizarConfig(config)); };
    ctl.alCambiar = function (f) { oyentes.push(f); return ctl; };
    return ctl;
  }

  return { prepararTexto: prepararTexto, dividir: dividir, elegirVoz: elegirVoz, listarVoces: listarVoces,
           crearVoz: crearVoz, normalizarConfig: normalizarConfig, configDePerfil: configDePerfil,
           prosodia: prosodia, PERFILES: PERFILES, PERFIL_PREDETERMINADO: PERFIL_PREDETERMINADO,
           MATICES: MATICES, FRASES_DEMO: FRASES_DEMO, LIMITES: LIMITES, CLAVE: CLAVE, CLAVE_CONFIG: CLAVE_CONFIG };
});
