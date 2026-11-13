/* ═══ AIRI v0.5 · Chat con AIRI (Gemini mediante el servidor local) ═══════════
   - El navegador NUNCA tiene la clave: llama a /api/chat del servidor local
     (chat/servidor.py), que sirve también esta página (mismo origen, sin CORS).
   - Abierto con doble clic (file://) o desde GitHub Pages, el chat explica cómo
     usarlo y no intenta conectarse.
   - Antes de la primera pregunta se pide consentimiento: las preguntas se
     envían a Google (Gemini).
   - Todo se muestra como texto (textContent): las respuestas no pueden inyectar HTML.
   - El historial vive solo en la memoria de la pestaña. */
(function () {
  "use strict";
  var seccion = document.getElementById("chat");
  if (!seccion) return;
  var form = seccion.querySelector("#airi-chat-form");
  var input = seccion.querySelector("#airi-chat-input");
  var log = seccion.querySelector("#airi-chat-log");
  var enviar = seccion.querySelector("#airi-chat-send");
  var limpiar = seccion.querySelector("#airi-chat-clear");
  var consentimiento = seccion.querySelector("#airi-chat-consentimiento");
  var estadoServidor = seccion.querySelector("#airi-chat-estado");

  var MAX_PREGUNTA = 2500, MAX_MENSAJES = 12, MAX_TOTAL = 30000, ESPERA_MS = 60000;
  var historial = [];
  var conversacion = 0;          // cambia con «Nueva conversación»: descarta respuestas atrasadas
  var pendiente = null;          // AbortController de la consulta en curso
  var local = location.protocol === "http:" && /^(127\.0\.0\.1|localhost)$/.test(location.hostname);

  var MD = window.AIRIMarkdown;

  /** Añade un mensaje. Las respuestas del modelo se muestran con Markdown SEGURO (markdown.js:
      solo createElement + textContent, nunca innerHTML); lo demás, como texto plano. */
  function linea(rol, texto, clase, conMarkdown) {
    var msg = document.createElement("div");
    msg.className = "airi-chat-msg airi-chat-" + rol + (clase ? " " + clase : "");
    var autor = document.createElement("span");
    autor.className = "airi-chat-autor";
    autor.textContent = rol === "user" ? "Tú" : "AIRI";
    var cuerpo = document.createElement("div");
    cuerpo.className = "airi-chat-cuerpo";
    if (conMarkdown && MD) cuerpo.appendChild(MD.renderizar(texto, document));
    else cuerpo.textContent = texto;
    msg.append(autor, cuerpo);
    log.append(msg);
    log.scrollTop = log.scrollHeight;
    return msg;
  }

  /** Indicador de espera: puntos en la conversación y la mascota en su estado «pensando» (v0.6 E4; en v0.5
      era «analisis»), sin mensaje: no abre el globo ni habla. Al llegar la respuesta vuelve a «espera»; si
      la lectura está activada, voz-chat.js empieza a hablar y la mascota muestra la animación de habla. */
  function esperaMascota(activa) {
    var m = window.airiMascota;
    if (!m || typeof m.cambiarEstado !== "function") return;
    if (activa) m.cambiarEstado("pensando");
    else if (m.estado === "pensando") m.cambiarEstado("espera");
  }

  /** Últimos mensajes que caben en los límites del servidor, empezando por una pregunta. */
  function contexto() {
    var salida = [], total = 0;
    for (var i = historial.length - 1; i >= 0 && salida.length < MAX_MENSAJES; i--) {
      total += historial[i].text.length;
      if (total > MAX_TOTAL) break;
      salida.unshift(historial[i]);
    }
    while (salida.length && salida[0].role !== "user") salida.shift();
    return salida;
  }

  function bloquear(sí) {
    enviar.disabled = sí;
    log.setAttribute("aria-busy", String(sí));
  }

  function saludo() {
    if (local) {
      linea("model", "¡Hola! Soy AIRI. Puedo conversar sobre acuarios marinos. Mis respuestas son orientativas: " +
        "no diagnostico ni analizo tus mediciones aquí (para eso está «Parámetros del agua»).");
    } else {
      linea("model", "Para usar el chat, inicia el servidor local con «python chat/servidor.py» y abre " +
        "http://127.0.0.1:8765/ en este equipo. Desde un archivo abierto con doble clic o desde el sitio " +
        "público el chat no puede conectarse de forma segura.", "airi-chat-aviso");
    }
  }

  async function comprobarServidor() {
    if (!local) {
      estadoServidor.textContent = "Chat no disponible en esta página (necesita el servidor local).";
      form.querySelectorAll("input, button[type=submit]").forEach(function (e) { e.disabled = true; });
      return;
    }
    try {
      var r = await fetch("/api/estado", { cache: "no-store" });
      var d = await r.json();
      estadoServidor.textContent = d.clave_configurada
        ? "Servidor local activo · modelo " + d.modelo + "."
        : "Servidor local activo, pero sin clave de Gemini: el chat no podrá responder.";
    } catch (e) {
      estadoServidor.textContent = "No se pudo contactar con el servidor local.";
    }
  }

  form.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    var pregunta = input.value.trim();
    if (!local || !pregunta || enviar.disabled) return;
    if (pregunta.length > MAX_PREGUNTA) {
      linea("model", "La pregunta es demasiado larga (máximo " + MAX_PREGUNTA + " caracteres).", "airi-chat-error");
      return;
    }
    if (consentimiento && !consentimiento.checked) {
      linea("model", "Antes de enviar, marca la casilla para confirmar que entiendes que la pregunta se envía a Google.", "airi-chat-error");
      consentimiento.focus();
      return;
    }
    var mia = conversacion;
    document.dispatchEvent(new CustomEvent("airi:chat-pregunta"));   // v0.6: detiene una lectura en curso
    historial.push({ role: "user", text: pregunta });
    linea("user", pregunta);
    input.value = "";
    bloquear(true);
    var pensando = linea("model", "", "airi-chat-pensando");
    var cuerpoEspera = pensando.querySelector(".airi-chat-cuerpo"), puntos = document.createElement("span");
    cuerpoEspera.textContent = "Pensando";
    puntos.className = "airi-chat-puntos"; puntos.setAttribute("aria-hidden", "true");
    for (var n = 0; n < 3; n++) { var punto = document.createElement("span"); punto.textContent = "."; puntos.appendChild(punto); }
    cuerpoEspera.appendChild(puntos);
    esperaMascota(true);
    pendiente = new AbortController();
    var temporizador = setTimeout(function () { pendiente && pendiente.abort(); }, ESPERA_MS);
    try {
      var r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: contexto() }), signal: pendiente.signal
      });
      var datos = null;
      try { datos = await r.json(); } catch (e) { /* respuesta no JSON */ }
      if (mia !== conversacion) return;
      pensando.remove();
      if (!r.ok || !datos || typeof datos.answer !== "string") {
        throw new Error((datos && datos.error) || "El servidor local respondió con un error (" + r.status + ").");
      }
      historial.push({ role: "model", text: datos.answer });
      var respuesta = linea("model", datos.answer, "", true);
      // v0.6: aviso para la lectura en voz alta (voz-chat.js); el texto es el Markdown original
      document.dispatchEvent(new CustomEvent("airi:chat-respuesta", { detail: { texto: datos.answer, elemento: respuesta } }));
      if (datos.truncada) {
        var aviso = document.createElement("p");
        aviso.className = "airi-chat-recortada";
        aviso.textContent = "[Respuesta recortada por longitud.]";
        respuesta.querySelector(".airi-chat-cuerpo").appendChild(aviso);
      }
    } catch (error) {
      if (mia !== conversacion) return;
      pensando.remove();
      historial.pop();   // la pregunta sin respuesta no queda en el contexto
      var texto = error.name === "AbortError" ? "Gemini tardó demasiado en responder. Inténtalo de nuevo."
        : error instanceof TypeError ? "No hay conexión con el servidor local. ¿Sigue encendido?"
        : error.message;
      linea("model", "No pude responder: " + texto, "airi-chat-error");
    } finally {
      clearTimeout(temporizador);
      if (mia === conversacion) { pendiente = null; bloquear(false); esperaMascota(false); input.focus(); }
    }
  });

  limpiar.addEventListener("click", function () {
    conversacion++;
    if (pendiente) { pendiente.abort(); pendiente = null; }
    historial.length = 0;
    document.dispatchEvent(new CustomEvent("airi:chat-reiniciar"));
    log.replaceChildren();
    bloquear(false);
    esperaMascota(false);
    linea("model", "Conversación nueva. ¿Qué te gustaría saber del acuario?");
  });

  // Mensaje de la mascota al abrir esta pestaña (si la mascota está cargada).
  if (window.AIRIMascota && window.AIRIMascota.MENSAJES_PESTANA) {
    window.AIRIMascota.MENSAJES_PESTANA.chat = { estado: "espera", tipo: "informativo",
      texto: "Aquí puedes hacerme preguntas sobre acuarios marinos. Respondo con ayuda de Gemini a través del " +
        "servidor local; mis respuestas son orientativas y no sustituyen a una persona experta." };
  }

  saludo();
  comprobarServidor();
  window.airiChat = { local: local };
})();
