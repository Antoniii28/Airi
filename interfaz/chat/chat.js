(function () {
  "use strict";
  const section = document.getElementById("chat");
  if (!section) return;
  const form = section.querySelector("#airi-chat-form");
  const input = section.querySelector("#airi-chat-input");
  const log = section.querySelector("#airi-chat-log");
  const send = section.querySelector("#airi-chat-send");
  const clear = section.querySelector("#airi-chat-clear");
  const history = [];
  function add(role, text) {
    const p = document.createElement("p");
    p.className = "airi-chat-line";
    const strong = document.createElement("strong");
    strong.textContent = role === "user" ? "Tú: " : "AIRI: ";
    p.append(strong, document.createTextNode(text));
    log.append(p);
    log.scrollTop = log.scrollHeight;
  }
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || question.length > 2500 || send.disabled) return;
    history.push({role:"user", text:question});
    add("user", question);
    input.value = "";
    send.disabled = true;
    try {
      const response = await fetch("http://127.0.0.1:8765/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:history.slice(-12)})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo responder");
      history.push({role:"model", text:data.answer});
      add("model", data.answer);
    } catch (error) {
      history.pop();
      add("model", "No pude responder: " + (error instanceof TypeError ? "comprueba que el servidor local esté encendido." : error.message));
    } finally {
      send.disabled = false;
      input.focus();
    }
  });
  clear.addEventListener("click", function () {
    history.length = 0;
    log.replaceChildren();
    add("model", "Conversación nueva. ¿Qué te gustaría saber del acuario?");
  });
  add("model", "¡Hola! Soy AIRI. Puedo conversar sobre acuarios marinos. Para activar la IA, inicia el servidor local.");
})();
