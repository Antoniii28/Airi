/* ═══ AIRI v0.6 · Dictado por micrófono en el chat (E5–E6) ══════════════════════
   - Solo escucha cuando la persona pulsa «Hablar» y una sola frase (continuous = false, máximo LIMITE_MS).
     Sin escucha permanente ni palabra de activación.
   - Español de México (es-MX). Prioriza el reconocimiento EN EL DISPOSITIVO (processLocally) si el navegador lo
     ofrece; si hace falta descargar el paquete de idioma, lo pide con un botón y no descarga nada por su cuenta.
   - Si solo existe el reconocimiento en el servidor del navegador, explica a quién va el audio y exige marcar un
     consentimiento explícito (válido solo en esta página; no se guarda).
   - Antes de escuchar detiene la voz de AIRI; si AIRI empieza a hablar mientras escucha, deja de escuchar
     (así no se «oye» a sí misma).
   - La transcripción se escribe en el campo de pregunta: se puede corregir y luego enviar o descartar.
     Nunca se envía sola. El envío pasa por chat.js, así que sigue haciendo falta el consentimiento de Gemini.
   - No graba ni guarda audio, no usa getUserMedia y no envía audio a Gemini: a Gemini solo llega el texto.
   - Sin SpeechRecognition (Firefox, Opera…) el botón queda desactivado con una explicación y el chat escrito
     funciona igual. */
(function () {
  "use strict";
  var seccion = document.getElementById("chat");
  if (!seccion) return;
  var form = seccion.querySelector("#airi-chat-form");
  var input = seccion.querySelector("#airi-chat-input");
  var log = seccion.querySelector("#airi-chat-log");
  var enviar = seccion.querySelector("#airi-chat-send");
  var consentimientoGemini = seccion.querySelector("#airi-chat-consentimiento");
  if (!form || !input || !log || !enviar) return;

  var IDIOMA = "es-MX";
  var LIMITE_MS = 15000;                       // tope de una escucha, aunque el navegador no la cierre
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var voz = window.airiInteraccion && window.airiInteraccion.voz;

  function el(tag, props) { var e = document.createElement(tag); for (var k in props) e[k] = props[k]; return e; }

  // ── Interfaz (dentro del formulario, antes del consentimiento de Gemini) ──
  var caja = el("div", { className: "airi-chat-micro", id: "airi-chat-micro" });
  caja.setAttribute("role", "group"); caja.setAttribute("aria-label", "Dictado por micrófono");
  var fila = el("div", { className: "airi-chat-micro-fila" });
  var hablar = el("button", { type: "button", id: "airi-chat-micro-hablar", textContent: "🎤 Hablar" });
  hablar.setAttribute("aria-pressed", "false");
  var cancelar = el("button", { type: "button", id: "airi-chat-micro-cancelar", textContent: "Cancelar dictado", hidden: true });
  var turno = el("span", { className: "airi-chat-turno", id: "airi-chat-turno" });
  turno.setAttribute("role", "status");
  fila.append(hablar, cancelar, turno);

  var aviso = el("p", { className: "airi-chat-micro-aviso", id: "airi-chat-micro-aviso" });
  aviso.setAttribute("aria-live", "polite");
  var descargar = el("button", { type: "button", id: "airi-chat-micro-descargar", hidden: true,
    textContent: "Descargar el paquete de español para reconocer la voz en este equipo" });
  var remoto = el("label", { className: "airi-chat-micro-remoto", hidden: true });
  var remotoCasilla = el("input", { type: "checkbox", id: "airi-chat-micro-remoto" });
  var remotoTexto = el("span", {});
  remoto.append(remotoCasilla, remotoTexto);

  var revision = el("div", { className: "airi-chat-micro-revision", id: "airi-chat-micro-revision", hidden: true });
  var revisionTexto = el("span", { textContent: "Revisa o corrige la transcripción en el campo de pregunta." });
  var confirmar = el("button", { type: "button", id: "airi-chat-micro-enviar", className: "primary", textContent: "Enviar transcripción" });
  var descartar = el("button", { type: "button", id: "airi-chat-micro-descartar", textContent: "Descartar" });
  revision.append(revisionTexto, confirmar, descartar);

  caja.append(fila, aviso, descargar, remoto, revision);
  var etiquetaConsentimiento = consentimientoGemini && consentimientoGemini.closest("label");
  form.insertBefore(caja, etiquetaConsentimiento && etiquetaConsentimiento.parentNode === form ? etiquetaConsentimiento : null);

  // ── Estado ──
  var modo = SR ? "comprobando" : "ninguno";  // local | descargable | descargando | remoto | ninguno
  var rec = null, escuchando = false, cancelado = false, limite = null;
  var textoPrevio = "", transcrito = "";

  function proveedor() {
    var ua = navigator.userAgent || "";
    if (/Edg\//.test(ua)) return "Microsoft";
    if (!window.SpeechRecognition && window.webkitSpeechRecognition && /Safari\//.test(ua) && !/Chrom/.test(ua)) return "Apple";
    return "Google";
  }
  remotoTexto.textContent = "Autorizo usar el reconocimiento en línea del navegador para esta página: mientras " +
    "dicto, el audio de mi voz se envía a " + proveedor() + " para convertirlo en texto. AIRI no graba ni guarda el audio.";

  var ocupado = function () { return log.getAttribute("aria-busy") === "true"; };

  function pintarTurno() {
    var t = escuchando ? "escuchando" : ocupado() ? "pensando" : voz && voz.hablando ? "hablando" : "reposo";
    var textos = { escuchando: "Escuchando… habla ahora", pensando: "Pensando…", hablando: "Hablando", reposo: "En reposo" };
    if (turno.dataset.turno === t) return;     // sin cambios no se reescribe (evita repeticiones del lector de pantalla)
    turno.dataset.turno = t;
    turno.textContent = "AIRI: " + textos[t];
  }

  function pintar() {
    var puedeRemoto = modo === "remoto" && remotoCasilla.checked;
    var listo = modo === "local" || puedeRemoto;
    hablar.disabled = !escuchando && (!listo || ocupado());
    hablar.textContent = escuchando ? "■ Terminar de hablar" : "🎤 Hablar";
    hablar.setAttribute("aria-pressed", String(escuchando));
    hablar.setAttribute("aria-label", escuchando ? "Terminar el dictado y revisar la transcripción" : "Dictar una pregunta con el micrófono");
    cancelar.hidden = !escuchando;
    descargar.hidden = modo !== "descargable";
    remoto.hidden = modo !== "remoto";
    caja.dataset.modo = modo;
    pintarTurno();
  }

  function decir(texto) { if (aviso.textContent !== texto) aviso.textContent = texto; }
  // Aviso de reposo según el modo (sustituye a los avisos temporales como «Transcripción lista»)
  function avisoBase() {
    decir(modo === "remoto" && remotoCasilla.checked
      ? "Dictado en línea autorizado para esta página. El micrófono solo se activa al pulsar «Hablar»."
      : MENSAJES_MODO[modo]);
  }

  var MENSAJES_MODO = {
    ninguno: "El dictado por voz no está disponible en este navegador. Puedes seguir escribiendo tus preguntas. " +
             "(Funciona en Chrome para escritorio y Android; Firefox y Opera no lo ofrecen.)",
    local: "Dictado en este equipo: el audio no sale de tu computadora.",
    descargable: "Para reconocer tu voz en este equipo, el navegador necesita descargar una vez el paquete de español " +
                 "(unos 60 MB en Chrome). Nada se descarga sin que lo pidas.",
    descargando: "Descargando el paquete de español…",
    remoto: "Este navegador solo reconoce la voz en línea. Para usar el micrófono, lee y marca la autorización; " +
            "si no, sigue escribiendo tus preguntas."
  };

  // ── Detección del reconocimiento en el dispositivo ──
  function consultar() {
    var opciones = { langs: [IDIOMA], processLocally: true };
    try {
      if (typeof SR.available === "function") return Promise.resolve(SR.available(opciones));
      if (typeof SR.availableOnDevice === "function") return Promise.resolve(SR.availableOnDevice(IDIOMA));
    } catch (e) { return Promise.resolve("unavailable"); }
    return Promise.resolve("unavailable");
  }
  function detectar() {
    if (!SR) { modo = "ninguno"; decir(MENSAJES_MODO.ninguno); pintar(); return Promise.resolve(); }
    return consultar().then(function (r) {
      modo = r === "available" ? "local" : r === "downloadable" ? "descargable" : r === "downloading" ? "descargando" : "remoto";
    }, function () { modo = "remoto"; }).then(function () { decir(MENSAJES_MODO[modo]); pintar(); });
  }

  descargar.addEventListener("click", function () {
    var opciones = { langs: [IDIOMA], processLocally: true };
    var instalar = typeof SR.install === "function" ? function () { return SR.install(opciones); }
      : typeof SR.installOnDevice === "function" ? function () { return SR.installOnDevice(IDIOMA); } : null;
    if (!instalar) { modo = "remoto"; decir(MENSAJES_MODO.remoto); pintar(); return; }
    modo = "descargando"; decir(MENSAJES_MODO.descargando); pintar();
    Promise.resolve().then(instalar).then(function (ok) {
      if (ok === false) throw new Error("no instalado");
      return detectar();
    }).catch(function () {
      modo = "descargable";
      decir("No se pudo descargar el paquete de español. Puedes intentarlo de nuevo o seguir escribiendo.");
      pintar();
    });
  });
  remotoCasilla.addEventListener("change", function () { avisoBase(); pintar(); });

  // ── Escucha ──
  var ERRORES = {
    "not-allowed": "El permiso del micrófono está bloqueado. Puedes permitirlo desde el icono del candado en la barra de direcciones, o seguir escribiendo.",
    "service-not-allowed": "El navegador no permite el reconocimiento de voz en esta página. Puedes seguir escribiendo.",
    "audio-capture": "No se encontró un micrófono. Revisa que esté conectado y seleccionado en el sistema.",
    "no-speech": "No escuché nada. Pulsa «Hablar» e inténtalo de nuevo, cerca del micrófono.",
    "network": "El reconocimiento en línea no tiene conexión. Puedes seguir escribiendo.",
    "language-not-supported": "El reconocimiento de español no está disponible en este equipo ahora mismo.",
    "phrases-not-supported": "El navegador no admite esta configuración de dictado."
  };

  function terminarEscucha() {
    escuchando = false; clearTimeout(limite); limite = null; rec = null; pintar();
  }

  function empezar() {
    if (escuchando || hablar.disabled) return;
    if (voz) voz.detener();                       // primero se calla AIRI, para que su voz no entre al micrófono
    cerrarRevision(false);
    textoPrevio = input.value; transcrito = ""; cancelado = false;
    try {
      rec = new SR();
      rec.lang = IDIOMA; rec.continuous = false; rec.interimResults = true; rec.maxAlternatives = 1;
      if (modo === "local") rec.processLocally = true;
    } catch (e) { rec = null; decir("No se pudo iniciar el dictado en este navegador."); return; }

    rec.onresult = function (ev) {
      var t = "";
      for (var i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript;
      transcrito = t.trim();
      if (!cancelado) input.value = transcrito;
    };
    rec.onerror = function (ev) {
      var codigo = ev && ev.error;
      if (codigo === "aborted") return;
      if (codigo === "language-not-supported" && modo === "local") detectar();
      decir(ERRORES[codigo] || "El dictado falló (" + (codigo || "error desconocido") + "). Puedes seguir escribiendo.");
    };
    rec.onend = function () {
      var habia = escuchando;
      terminarEscucha();
      if (!habia) return;
      if (cancelado) { input.value = textoPrevio; return; }
      if (transcrito) {
        input.value = transcrito;
        revision.hidden = false;
        decir("Transcripción lista. Corrígela si hace falta y pulsa «Enviar transcripción», o «Descartar».");
        input.focus();
      }
    };
    try { rec.start(); } catch (e) { rec = null; decir("No se pudo iniciar el dictado. Inténtalo de nuevo."); return; }
    escuchando = true;
    decir(modo === "local" ? "Escuchando en este equipo…" : "Escuchando (reconocimiento en línea de " + proveedor() + ")…");
    limite = setTimeout(function () { if (rec) try { rec.stop(); } catch (e) { /* ya terminó */ } }, LIMITE_MS);
    pintar();
  }

  function parar(descartarTexto) {
    if (!escuchando || !rec) return;
    cancelado = !!descartarTexto;
    try { descartarTexto ? rec.abort() : rec.stop(); } catch (e) { terminarEscucha(); }
    if (descartarTexto) decir("Dictado cancelado.");
  }

  function cerrarRevision(borrar) {
    if (borrar) { input.value = textoPrevio; decir("Transcripción descartada."); }
    revision.hidden = true;
  }

  hablar.addEventListener("click", function () { escuchando ? parar(false) : empezar(); });
  cancelar.addEventListener("click", function () { parar(true); hablar.focus(); });
  confirmar.addEventListener("click", function () {
    if (!input.value.trim()) { input.focus(); return; }
    revision.hidden = true;
    if (typeof form.requestSubmit === "function") form.requestSubmit(); else enviar.click();
  });
  descartar.addEventListener("click", function () { cerrarRevision(true); input.focus(); });
  caja.addEventListener("keydown", function (e) { if (e.key === "Escape" && escuchando) { e.preventDefault(); parar(true); } });
  input.addEventListener("keydown", function (e) { if (e.key === "Escape" && escuchando) { e.preventDefault(); parar(true); } });

  // Se detiene al ocultar la pestaña, al empezar a hablar AIRI o al reiniciar la conversación
  document.addEventListener("visibilitychange", function () { if (document.hidden) parar(true); });
  // Al enviar la pregunta (con «Enviar transcripción», «Enviar» o Enter) la transcripción deja de estar pendiente
  document.addEventListener("airi:chat-pregunta", function () { revision.hidden = true; avisoBase(); pintar(); });
  document.addEventListener("airi:chat-reiniciar", function () { parar(true); revision.hidden = true; avisoBase(); pintar(); });
  if (voz) voz.alCambiar(function () { if (voz.hablando && escuchando) parar(true); pintar(); });
  new MutationObserver(pintar).observe(log, { attributes: true, attributeFilter: ["aria-busy"] });

  pintar();
  detectar();
  window.airiMicrofono = {
    get modo() { return modo; }, get escuchando() { return escuchando; },
    detener: function () { parar(true); }
  };
})();
