/* ═══ AIRI v0.6 · Lectura en voz alta de las respuestas del chat (E3) ══════════
   - Usa la MISMA voz y el MISMO interruptor que la mascota (voz.js, v0.2–v0.3): desactivada por defecto;
     la decisión de la persona se recuerda en este navegador.
   - Voz preferida: Microsoft Sabina (es-MX, local); si no existe, la mejor voz LOCAL en español.
     Las voces en línea solo se usan si se autorizan en «Ajustes de voz».
   - Lee el texto preparado por habla-markdown.js (sin símbolos de Markdown).
   - Una sola lectura a la vez: una respuesta nueva, una pregunta nueva o «Nueva conversación» detienen la anterior.
   - La animación de habla de la mascota la aplica interaccion.js cuando la voz empieza y termina.
   - No usa el micrófono ni envía el texto a ningún servicio (las voces locales se generan en el equipo). */
(function () {
  "use strict";
  var seccion = document.getElementById("chat");
  var H = window.AIRIHablaMarkdown;
  var voz = window.airiInteraccion && window.airiInteraccion.voz;
  if (!seccion || !H || !voz) return;   // sin voz o sin mascota, el chat sigue igual que en v0.5

  var log = seccion.querySelector("#airi-chat-log");
  var barra = document.createElement("div");
  barra.className = "airi-chat-voz";
  barra.setAttribute("role", "group");
  barra.setAttribute("aria-label", "Voz de AIRI");
  var leer = document.createElement("button");
  leer.type = "button"; leer.id = "airi-chat-voz-leer";
  var detener = document.createElement("button");
  detener.type = "button"; detener.id = "airi-chat-voz-detener"; detener.textContent = "Detener voz"; detener.hidden = true;
  var estado = document.createElement("span");
  estado.className = "airi-chat-voz-estado"; estado.id = "airi-chat-voz-estado";
  barra.append(leer, detener, estado);
  log.parentNode.insertBefore(barra, log);

  function nombreCorto(v) { return String(v.name).replace(/^Microsoft\s+/, "").replace(/\s+-\s+.*$/, ""); }
  function pintar() {
    if (!voz.soportada) {
      leer.disabled = true; leer.textContent = "Voz no disponible"; leer.removeAttribute("aria-pressed");
      estado.textContent = "Este navegador no puede leer en voz alta; las respuestas siguen por escrito.";
    } else {
      leer.textContent = voz.activada ? "Leer respuestas: activado" : "Leer respuestas: desactivado";
      leer.setAttribute("aria-pressed", String(voz.activada));
      estado.textContent = voz.voz
        ? "Voz: " + nombreCorto(voz.voz) + " (" + voz.voz.lang + (voz.voz.localService === false ? ", en línea" : ", en este equipo") + ")"
        : (voz.voces || []).some(function (v) { return v.enLinea; })
          ? "Solo hay voces en español en línea: puedes autorizarlas en «Ajustes de voz»; mientras, se usa la del sistema."
          : "No hay una voz en español: se usará la predeterminada del sistema.";
    }
    detener.hidden = !voz.hablando;
    log.querySelectorAll(".airi-chat-escuchar").forEach(function (b) { b.disabled = !voz.soportada; });
  }

  function hablarRespuesta(texto, aPeticion) {
    var hablado = H.paraVoz(texto);
    if (!hablado) return false;
    if (voz.activada) return voz.hablar(hablado, { estado: "conversacion" });
    // «Escuchar» en una respuesta concreta es una acción explícita: se lee aunque la lectura automática esté apagada
    return aPeticion ? voz.probar(hablado, voz.config, "conversacion") : false;
  }

  leer.addEventListener("click", function () { voz.activar(!voz.activada); pintar(); });
  detener.addEventListener("click", function () { voz.detener(); });

  document.addEventListener("airi:chat-pregunta", function () { voz.detener(); });
  document.addEventListener("airi:chat-reiniciar", function () { voz.detener(); });
  document.addEventListener("airi:chat-respuesta", function (e) {
    var d = e.detail || {};
    if (d.elemento) {
      var boton = document.createElement("button");
      boton.type = "button";
      boton.className = "airi-chat-escuchar";
      boton.textContent = "Escuchar";
      boton.setAttribute("aria-label", "Escuchar esta respuesta en voz alta");
      boton.disabled = !voz.soportada;
      boton.addEventListener("click", function () { hablarRespuesta(d.texto, true); });
      d.elemento.appendChild(boton);
    }
    hablarRespuesta(d.texto, false);   // solo si la persona activó «Leer respuestas»
  });

  voz.alCambiar(pintar);
  pintar();
  window.airiVozChat = { paraVoz: H.paraVoz };
})();
