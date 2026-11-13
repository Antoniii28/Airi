/* ═══ AIRI v0.7 · Acceso al piloto cerrado (solo cuando el chat lo sirve el Worker) ═══════════════
   - chat.js lo activa si /api/estado responde {modo: "publico"}. Con el servidor local (v0.5–v0.6) no hace nada.
   - Pide el CÓDIGO PERSONAL del piloto. El código solo vive en el campo de esta pestaña: no se guarda en el
     navegador ni está escrito en la página; el Worker solo conoce su huella SHA-256.
   - Muestra la verificación de Cloudflare Turnstile. El token se comprueba EN EL SERVIDOR y es de un solo uso:
     tras cada consulta se pide uno nuevo.
   - Explica qué datos salen del equipo (Cloudflare y Google Gemini). */
(function () {
  "use strict";
  var widget = null, token = null, campo = null, caja = null, avisoTs = null;
  var SCRIPT_TS = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

  // Misma forma canónica que publico/codigos.mjs (el Worker vuelve a normalizar; esto evita además que un guion
  // tipográfico o un carácter invisible haga fallar fetch con un falso «No hay conexión»).
  var SEPARADORES = /[\s\u00A0\u00AD\u180E\u200B-\u200D\u2060\uFEFF\p{Dash_Punctuation}\u2212\u2043\uFE63\uFF0D]/gu;
  function normalizarCodigo(texto) {
    var limpio = String(texto || "").normalize("NFKC").toUpperCase().replace(SEPARADORES, "");
    if (!/^[A-Z0-9]{8,64}$/.test(limpio)) return null;
    return limpio.length === 20 ? limpio.match(/.{5}/g).join("-") : limpio;
  }

  function el(tag, props) { var e = document.createElement(tag); for (var k in props) e[k] = props[k]; return e; }

  function renderizar(sitekey, contenedor) {
    if (!window.turnstile || widget !== null) return;
    widget = window.turnstile.render(contenedor, {
      sitekey: sitekey, action: "airi-chat", language: "es", theme: "light", size: "flexible",
      callback: function (t) { token = t; avisoTs.textContent = ""; },
      "expired-callback": function () { token = null; },
      "error-callback": function () {
        token = null;
        avisoTs.textContent = "No se pudo completar la verificación. Recarga la página o inténtalo más tarde.";
      }
    });
  }

  function cargarTurnstile(sitekey, contenedor) {
    if (window.turnstile) return renderizar(sitekey, contenedor);
    var s = el("script", { src: SCRIPT_TS, async: true, defer: true });
    s.onload = function () { renderizar(sitekey, contenedor); };
    s.onerror = function () { avisoTs.textContent = "No se pudo cargar la verificación de Cloudflare. Revisa tu conexión."; };
    document.head.appendChild(s);
  }

  window.airiChatPublico = {
    iniciar: function (estado, opciones) {
      var form = opciones.form;
      if (caja) return;
      // Los textos de v0.5–v0.6 hablan del servidor local; en el piloto el servidor es el Worker de Cloudflare.
      var seccion = form.closest("#chat");
      var intro = seccion && seccion.querySelector("p.muted");
      if (intro) intro.textContent = "Conversación orientativa sobre acuarios marinos con ayuda de Gemini (Google), a través " +
        "del servidor del piloto de AIRI. No analiza tus mediciones (eso lo hace «Parámetros del agua»), no diagnostica y " +
        "no busca información en internet.";
      var notas = seccion ? seccion.querySelectorAll(":scope > p.airi-chat-note") : [];
      if (notas.length) notas[notas.length - 1].textContent = "La conversación solo se guarda en esta pestaña y se borra " +
        "al cerrarla o con «Nueva conversación». La clave de Gemini está guardada como secreto en el servidor del piloto; " +
        "el navegador nunca la recibe.";
      caja = el("div", { className: "airi-chat-piloto", id: "airi-chat-piloto" });
      caja.setAttribute("role", "group"); caja.setAttribute("aria-label", "Acceso al piloto de AIRI");
      var titulo = el("p", { className: "airi-chat-piloto-titulo", textContent: "Piloto académico cerrado" });
      caja.appendChild(titulo);
      if (!estado.activo) {
        caja.appendChild(el("p", { textContent: estado.mensaje || "El chat del piloto está desactivado por ahora. " +
          "Las demás secciones de AIRI siguen disponibles." }));
      } else {
        var etiqueta = el("label", { htmlFor: "airi-chat-codigo", textContent: "Código de acceso personal" });
        campo = el("input", { id: "airi-chat-codigo", type: "password", autocomplete: "off", spellcheck: false, maxLength: 64 });
        campo.setAttribute("autocapitalize", "characters");
        campo.setAttribute("aria-describedby", "airi-chat-piloto-ayuda");
        var mostrar = el("button", { type: "button", id: "airi-chat-codigo-mostrar", textContent: "Mostrar" });
        mostrar.setAttribute("aria-pressed", "false");
        mostrar.setAttribute("aria-controls", "airi-chat-codigo");
        mostrar.addEventListener("click", function () {
          var ver = campo.type === "password";
          campo.type = ver ? "text" : "password";
          mostrar.textContent = ver ? "Ocultar" : "Mostrar";
          mostrar.setAttribute("aria-pressed", String(ver));
        });
        var fila = el("div", { className: "airi-chat-piloto-fila" });
        fila.append(campo, mostrar);
        var ayuda = el("p", { id: "airi-chat-piloto-ayuda", className: "airi-chat-note",
          textContent: "Es el código que te entregó el equipo de AIRI: 20 letras y números en grupos de 5 " +
            "(puedes escribirlo con o sin guiones). Es personal: no lo compartas. No se guarda en este navegador." });
        var ts = el("div", { id: "airi-chat-turnstile", className: "airi-chat-turnstile" });
        avisoTs = el("p", { className: "airi-chat-note", id: "airi-chat-turnstile-aviso" });
        avisoTs.setAttribute("aria-live", "polite");
        var privacidad = el("p", { className: "airi-chat-note", id: "airi-chat-piloto-privacidad",
          textContent: "En el piloto tus preguntas pasan por el servidor de AIRI en Cloudflare y se envían a Google Gemini " +
            "(nivel gratuito: Google puede usarlas para mejorar sus productos y personas revisoras pueden leerlas). " +
            "El servidor no guarda el texto de tus preguntas: solo cuenta cuántas haces para aplicar los límites. " +
            "Cloudflare Turnstile comprueba que eres una persona. Uso exclusivo para personas mayores de 18 años." });
        caja.append(etiqueta, fila, ayuda, ts, avisoTs, privacidad);
        cargarTurnstile(estado.turnstile_sitekey, ts);
      }
      var consentimiento = form.querySelector(".airi-chat-consentimiento");
      form.insertBefore(caja, consentimiento || null);
    },
    /** Devuelve {codigo, token} o {error} con un mensaje comprensible. */
    preparar: function () {
      var escrito = campo ? campo.value.trim() : "";
      if (!escrito) { if (campo) campo.focus(); return { error: "Escribe tu código de acceso del piloto antes de enviar." }; }
      // Se envía tal cual si cabe en una cabecera HTTP (el Worker prueba la forma canónica, la anterior y la exacta,
      // para que también funcionen los códigos escritos a mano); si lleva guiones tipográficos o invisibles, se
      // envía su forma canónica (si no, fetch fallaría con un falso «No hay conexión»).
      var codigo = /^[\x20-\x7E\u00A0-\u00FF]+$/.test(escrito) ? escrito : normalizarCodigo(escrito);
      if (!codigo) {
        campo.focus();
        return { error: "El código de acceso tiene caracteres que no se pueden enviar. Revísalo con «Mostrar»." };
      }
      var t = token || (window.turnstile && widget !== null ? window.turnstile.getResponse(widget) : null);
      if (!t) return { error: "Completa la verificación de Cloudflare («Verifica que eres una persona») antes de enviar." };
      return { codigo: codigo, token: t };
    },
    /** Tras cada consulta: el token ya no sirve; se reinicia la verificación. */
    despues: function () {
      token = null;
      if (window.turnstile && widget !== null) { try { window.turnstile.reset(widget); } catch (e) { /* sin widget */ } }
    }
  };
})();
