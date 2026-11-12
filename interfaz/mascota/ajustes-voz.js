/* ═══ AIRI · Ajustes de voz v0.3 ════════════════════════════════════════════
   Diálogo para elegir la voz de AIRI y ajustar su tono y velocidad. Permite
   escuchar demostraciones y comparar perfiles o voces ANTES de guardar.
   Solo modifica tono y velocidad de las voces instaladas: no crea voces nuevas.
   Expone window.AIRIAjustesVoz. Depende de window.AIRIVoz. */
(function () {
  "use strict";
  if (typeof window === "undefined") return;

  function el(etiqueta, atributos, texto) {
    var e = document.createElement(etiqueta);
    for (var k in (atributos || {})) {
      if (k === "className") e.className = atributos[k]; else e.setAttribute(k, atributos[k]);
    }
    if (texto != null) e.textContent = texto;
    return e;
  }
  function formato(n) { return Number(n).toFixed(2); }

  function crear(voz, opciones) {
    opciones = opciones || {};
    var V = window.AIRIVoz;
    var borrador = V.normalizarConfig(voz.config);
    var disparador = null;

    // ── Estructura ──────────────────────────────────────────────────────────
    var capa = el("div", { className: "airi-m-capa-dialogo airi-m-raiz" });
    capa.hidden = true;
    var dialogo = el("div", { className: "airi-m-dialogo", role: "dialog", "aria-modal": "true",
                              "aria-labelledby": "airi-m-ajustes-titulo", "aria-describedby": "airi-m-ajustes-nota" });
    capa.appendChild(dialogo);
    dialogo.appendChild(el("h2", { id: "airi-m-ajustes-titulo" }, "Ajustes de voz de AIRI"));
    dialogo.appendChild(el("p", { id: "airi-m-ajustes-nota", className: "airi-m-nota" },
      "Elige una de las voces instaladas en tu dispositivo y ajusta su tono y velocidad. Estos ajustes " +
      "no crean una voz nueva: modifican cómo suena la voz elegida. Escúchala antes de guardar."));
    var avisoVoces = el("p", { className: "airi-m-aviso-voces" });
    dialogo.appendChild(avisoVoces);
    var cuerpo = el("div", { className: "airi-m-ajustes-cuerpo" });
    dialogo.appendChild(cuerpo);

    // Perfil
    var grupoPerfil = el("fieldset", { className: "airi-m-campo" });
    grupoPerfil.appendChild(el("legend", null, "Perfil de voz"));
    var radios = {};
    Object.keys(V.PERFILES).concat(["personalizada"]).forEach(function (id) {
      var p = V.PERFILES[id] || { nombre: "Personalizada", descripcion: "Tus propios valores de tono y velocidad." };
      var etiqueta = el("label", { className: "airi-m-radio" });
      var r = el("input", { type: "radio", name: "airi-m-perfil", value: id });
      etiqueta.appendChild(r);
      etiqueta.appendChild(el("span", { className: "airi-m-radio-nombre" }, p.nombre));
      etiqueta.appendChild(el("span", { className: "airi-m-radio-desc" }, p.descripcion));
      grupoPerfil.appendChild(etiqueta);
      radios[id] = r;
      r.addEventListener("change", function () {
        if (!r.checked) return;
        if (id === "personalizada") { borrador.perfil = "personalizada"; }
        else { var voz0 = borrador.voz, aut = borrador.enLineaAutorizada, mat = borrador.matices;
               borrador = V.configDePerfil(id, borrador); borrador.voz = voz0; borrador.enLineaAutorizada = aut; borrador.matices = mat; }
        pintar();
      });
    });
    cuerpo.appendChild(grupoPerfil);

    // Voz
    var campoVoz = el("div", { className: "airi-m-campo" });
    campoVoz.appendChild(el("label", { "for": "airi-m-select-voz" }, "Voz"));
    var selectVoz = el("select", { id: "airi-m-select-voz" });
    campoVoz.appendChild(selectVoz);
    var avisoEnLinea = el("div", { className: "airi-m-aviso-enlinea" });
    avisoEnLinea.appendChild(el("p", null, "Esta es una voz en línea: para leer los mensajes, el navegador envía su texto " +
      "al servicio de voz del proveedor (por ejemplo, Google o Microsoft). Las voces del dispositivo no envían nada."));
    var etqAutorizar = el("label", { className: "airi-m-check" });
    var chkAutorizar = el("input", { type: "checkbox", id: "airi-m-autorizar-enlinea" });
    etqAutorizar.appendChild(chkAutorizar);
    etqAutorizar.appendChild(document.createTextNode(" Autorizo usar esta voz en línea"));
    avisoEnLinea.appendChild(etqAutorizar);
    campoVoz.appendChild(avisoEnLinea);
    cuerpo.appendChild(campoVoz);
    selectVoz.addEventListener("change", function () {
      borrador.voz = selectVoz.value || null;
      pintar();
    });
    chkAutorizar.addEventListener("change", function () { borrador.enLineaAutorizada = chkAutorizar.checked; pintar(); });

    // Tono y velocidad
    function deslizador(id, texto, rango, paso, clave) {
      var campo = el("div", { className: "airi-m-campo airi-m-deslizador" });
      var etiqueta = el("label", { "for": id });
      etiqueta.appendChild(document.createTextNode(texto + " "));
      var salida = el("output", { "for": id });
      etiqueta.appendChild(salida);
      var input = el("input", { type: "range", id: id, min: String(rango[0]), max: String(rango[1]), step: String(paso) });
      campo.appendChild(etiqueta); campo.appendChild(input);
      input.addEventListener("input", function () {
        borrador[clave] = Number(input.value);
        borrador.perfil = "personalizada";
        pintar();
      });
      cuerpo.appendChild(campo);
      return { input: input, salida: salida };
    }
    var tono = deslizador("airi-m-tono", "Tono", V.LIMITES.tono, 0.05, "tono");
    var velocidad = deslizador("airi-m-velocidad", "Velocidad", V.LIMITES.velocidad, 0.02, "velocidad");

    var etqMatices = el("label", { className: "airi-m-check airi-m-campo" });
    var chkMatices = el("input", { type: "checkbox", id: "airi-m-matices" });
    etqMatices.appendChild(chkMatices);
    etqMatices.appendChild(document.createTextNode(" Matices de personalidad: un poco más alegre al saludar, " +
      "más tranquilo con datos faltantes y más serio en advertencias"));
    cuerpo.appendChild(etqMatices);
    chkMatices.addEventListener("change", function () { borrador.matices = chkMatices.checked; });

    // Demostración
    var demo = el("div", { className: "airi-m-campo airi-m-demo" });
    demo.appendChild(el("label", { "for": "airi-m-frase" }, "Frase de prueba"));
    var selectFrase = el("select", { id: "airi-m-frase" });
    Object.keys(V.FRASES_DEMO).forEach(function (k) { selectFrase.appendChild(el("option", { value: k }, V.FRASES_DEMO[k].nombre)); });
    demo.appendChild(selectFrase);
    var botonesDemo = el("div", { className: "airi-m-fila-botones" });
    var bEscuchar = el("button", { type: "button", className: "airi-m-boton airi-m-btn-escuchar" }, "Escuchar demostración");
    var bPerfiles = el("button", { type: "button", className: "airi-m-boton airi-m-btn-comparar-perfiles" }, "Comparar perfiles");
    var bVoces = el("button", { type: "button", className: "airi-m-boton airi-m-btn-comparar-voces" }, "Comparar voces");
    var bDetener = el("button", { type: "button", className: "airi-m-boton airi-m-btn-detener-demo" }, "Detener");
    [bEscuchar, bPerfiles, bVoces, bDetener].forEach(function (b) { botonesDemo.appendChild(b); });
    demo.appendChild(botonesDemo);
    var estadoDemo = el("p", { className: "airi-m-estado-demo", role: "status", "aria-live": "polite" });
    demo.appendChild(estadoDemo);
    cuerpo.appendChild(demo);

    // Pie
    var pie = el("div", { className: "airi-m-fila-botones airi-m-pie-dialogo" });
    var bRestablecer = el("button", { type: "button", className: "airi-m-boton airi-m-btn-restablecer" }, "Restablecer recomendada");
    var bCancelar = el("button", { type: "button", className: "airi-m-boton airi-m-btn-cancelar" }, "Cancelar");
    var bGuardar = el("button", { type: "button", className: "airi-m-boton airi-m-btn-guardar" }, "Guardar");
    [bRestablecer, bCancelar, bGuardar].forEach(function (b) { pie.appendChild(b); });
    dialogo.appendChild(pie);
    document.body.appendChild(capa);

    // ── Pintado ─────────────────────────────────────────────────────────────
    function pintarVoces() {
      selectVoz.textContent = "";
      var lista = voz.voces;
      var locales = lista.filter(function (v) { return !v.enLinea; });
      var enLinea = lista.filter(function (v) { return v.enLinea; });
      var auto = voz.vozPara({ voz: null });
      selectVoz.appendChild(el("option", { value: "" },
        "Automática" + (auto ? " (" + auto.name + ")" : " (voz predeterminada del sistema)")));
      [["En este dispositivo", locales], ["En línea: envían el texto al proveedor", enLinea]].forEach(function (g) {
        if (!g[1].length) return;
        var grupo = el("optgroup", { label: g[0] });
        g[1].forEach(function (v) {
          grupo.appendChild(el("option", { value: v.id }, v.nombre + " · " + v.idioma + (v.mexico ? " · México" : "")));
        });
        selectVoz.appendChild(grupo);
      });
      var mexicoLocal = locales.some(function (v) { return v.mexico; });
      var mexicoEnLinea = enLinea.some(function (v) { return v.mexico; });
      if (!lista.length) {
        avisoVoces.textContent = "No se encontraron voces en español en este dispositivo. AIRI pedirá español a la voz " +
          "predeterminada del sistema; el resultado depende de las voces instaladas.";
      } else if (!mexicoLocal) {
        avisoVoces.textContent = "No hay voces de español de México instaladas en este dispositivo" +
          (mexicoEnLinea ? " (solo en línea)" : "") + ". Se usa la voz en español más cercana disponible. " +
          "Puedes instalar voces de español de México en la configuración de voz de tu sistema operativo.";
      } else {
        avisoVoces.textContent = "Se encontraron " + lista.length + " voces en español; las de México aparecen primero.";
      }
    }
    function pintar() {
      Object.keys(radios).forEach(function (id) { radios[id].checked = borrador.perfil === id; });
      selectVoz.value = borrador.voz || "";
      if (selectVoz.value !== (borrador.voz || "")) { borrador.voz = null; selectVoz.value = ""; }
      var elegida = voz.voces.filter(function (v) { return v.id === borrador.voz; })[0];
      avisoEnLinea.hidden = !(elegida && elegida.enLinea);
      chkAutorizar.checked = !!borrador.enLineaAutorizada;
      tono.input.value = String(borrador.tono); tono.salida.textContent = formato(borrador.tono);
      velocidad.input.value = String(borrador.velocidad); velocidad.salida.textContent = formato(borrador.velocidad);
      chkMatices.checked = borrador.matices !== false;
      var bloqueada = elegida && elegida.enLinea && !borrador.enLineaAutorizada;
      [bEscuchar, bPerfiles].forEach(function (b) { b.disabled = !voz.soportada || bloqueada; });
      bVoces.disabled = !voz.soportada || voz.voces.filter(function (v) { return !v.enLinea; }).length < 2;
      bGuardar.disabled = !voz.soportada || bloqueada;
      bGuardar.title = bloqueada ? "Autoriza la voz en línea o elige una voz del dispositivo para guardar." : "";
    }

    // ── Demostraciones ──────────────────────────────────────────────────────
    function frase() { return V.FRASES_DEMO[selectFrase.value] || V.FRASES_DEMO.saludo; }
    function nombreVoz(config) { var v = voz.vozPara(config); return v ? v.name : "voz predeterminada"; }
    bEscuchar.addEventListener("click", function () {
      var f = frase();
      estadoDemo.textContent = "Escuchando: " + nombreVoz(borrador) + ", tono " + formato(borrador.tono) +
        ", velocidad " + formato(borrador.velocidad) + ".";
      voz.probar(f.texto, borrador, f.estado);
    });
    bPerfiles.addEventListener("click", function () {
      var f = frase();
      var elementos = Object.keys(V.PERFILES).map(function (id) {
        var c = V.configDePerfil(id, borrador);
        c.voz = borrador.voz; c.enLineaAutorizada = borrador.enLineaAutorizada; c.matices = borrador.matices;
        var nombre = V.PERFILES[id].nombre.replace(/ \(.*\)$/, "");
        return { texto: "Perfil " + nombre + ". " + f.texto, estado: f.estado, config: c,
                 alIniciar: function () { estadoDemo.textContent = "Comparando perfiles · ahora: " + V.PERFILES[id].nombre + "."; } };
      });
      estadoDemo.textContent = "Comparando " + elementos.length + " perfiles con " + nombreVoz(borrador) + ".";
      voz.probarVarias(elementos);
    });
    bVoces.addEventListener("click", function () {
      var f = frase();
      var elementos = voz.voces.filter(function (v) { return !v.enLinea; }).map(function (v) {
        var c = V.normalizarConfig(borrador); c.voz = v.id;
        return { texto: "Voz " + v.nombre.replace(/^Microsoft |^Google /, "").replace(/ - .*$/, "") + ". " + f.texto,
                 estado: f.estado, config: c,
                 alIniciar: function () { estadoDemo.textContent = "Comparando voces · ahora: " + v.nombre + " (" + v.idioma + ")."; } };
      });
      estadoDemo.textContent = "Comparando " + elementos.length + " voces del dispositivo.";
      voz.probarVarias(elementos);
    });
    bDetener.addEventListener("click", function () { voz.detener(); estadoDemo.textContent = "Demostración detenida."; });

    // ── Abrir, cerrar, guardar ──────────────────────────────────────────────
    function abrir(origen) {
      disparador = origen || document.activeElement;
      borrador = V.normalizarConfig(voz.config);
      estadoDemo.textContent = voz.soportada ? "" : "Este navegador no permite la síntesis de voz.";
      pintarVoces(); pintar();
      firmaVoces = voz.voces.map(function (v) { return v.id; }).join("|");
      capa.hidden = false;
      document.body.classList.add("airi-m-dialogo-abierto");
      var marcado = dialogo.querySelector('input[name="airi-m-perfil"]:checked') || dialogo.querySelector("select, input, button");
      if (marcado) marcado.focus();
    }
    function cerrar() {
      voz.detener();
      capa.hidden = true;
      document.body.classList.remove("airi-m-dialogo-abierto");
      if (disparador && disparador.focus) disparador.focus();
    }
    bCancelar.addEventListener("click", function () { cerrar(); if (opciones.alCancelar) opciones.alCancelar(); });
    bRestablecer.addEventListener("click", function () {
      borrador = V.configDePerfil(V.PERFIL_PREDETERMINADO, { matices: true });
      borrador.voz = null;
      estadoDemo.textContent = "Se restableció la configuración recomendada. Pulsa Guardar para conservarla.";
      pintar();
    });
    bGuardar.addEventListener("click", function () {
      var guardada = voz.configurar(borrador);
      cerrar();
      if (opciones.alGuardar) opciones.alGuardar(guardada);
    });
    capa.addEventListener("click", function (e) { if (e.target === capa) bCancelar.click(); });
    dialogo.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); bCancelar.click(); return; }
      if (e.key !== "Tab") return;                       // el foco no sale del diálogo
      var focos = Array.prototype.filter.call(
        dialogo.querySelectorAll("button, input, select, [tabindex]"),
        function (n) { return !n.disabled && n.offsetParent !== null; });
      if (!focos.length) return;
      var primero = focos[0], ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    });
    var firmaVoces = "";
    voz.alCambiar(function () {          // solo se repinta si cambió la lista de voces
      var firma = voz.voces.map(function (v) { return v.id; }).join("|");
      if (!capa.hidden && firma !== firmaVoces) { firmaVoces = firma; pintarVoces(); pintar(); }
    });

    return { abrir: abrir, cerrar: cerrar, abierto: function () { return !capa.hidden; }, elemento: capa };
  }

  window.AIRIAjustesVoz = { crear: crear };
})();
