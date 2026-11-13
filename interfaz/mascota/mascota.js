/* ═══ AIRI · Mascota interactiva v0.1 ══════════════════════════════════════
   Pecera animada (pestaña Inicio) y asistente flotante (demás pestañas).
   Sin dependencias. Script clásico: funciona también al abrir el HTML con
   doble clic (file://). Expone window.AIRIMascota.

   Qué es real y qué es demostrativo:
   - La mascota NO analiza el agua por sí misma: muestra lo que calculan el
     formulario del prototipo y, desde v0.4, el motor de análisis
     (interfaz/motor), que activa el estado «alerta» con referencias con fuente.
   - La pausa del estado «análisis» es una animación demostrativa.
   (Módulo creado en v0.1; voz en v0.2, ajustes en v0.3, botón «×» en v0.4.)
*/
(function (raiz, fabrica) {
  var api = fabrica(raiz);
  if (typeof module === "object" && module.exports) { module.exports = api; }
  else { raiz.AIRIMascota = api; }
})(typeof window !== "undefined" ? window : globalThis, function (raiz) {
  "use strict";

  var VERSION = "0.2.0";
  var ESTADOS = ["bienvenida", "espera", "analisis", "insuficiente", "error", "alerta"];
  var ETIQUETAS = {
    informativo: "Información",
    implementado: "Resultado del formulario",
    demostrativo: "Animación demostrativa",
    advertencia: "Advertencia informativa",
    error: "Error de entrada"
  };

  // ── Mensajes ──────────────────────────────────────────────────────────────
  var MENSAJES_PESTANA = {
    inicio: { estado: "bienvenida", tipo: "informativo",
      texto: "¡Hola! Soy AIRI, el agente de este acuario marino. Esta versión de prueba te guía por la " +
             "interfaz; todavía no analizo el agua ni observo un acuario real." },
    agua: { estado: "espera", tipo: "informativo",
      texto: "Escribe las mediciones y pulsa «Validar entradas». Reviso que cada dato exista y tenga " +
             "un formato válido; aún no evalúo si los valores son adecuados." },
    especies: { estado: "espera", tipo: "informativo",
      texto: "Busca por nombre común o científico. Las fichas son preliminares: no indican " +
             "compatibilidad ni recomiendan introducir peces." },
    futuro: { estado: "espera", tipo: "informativo",
      texto: "Estas funciones están planeadas para próximas versiones y todavía no están disponibles." }
  };
  var MENSAJE_ANALISIS = { estado: "analisis", tipo: "demostrativo",
    texto: "Revisando el formato de las entradas…" };
  var MENSAJE_LIMPIO = { estado: "espera", tipo: "informativo",
    texto: "Formulario limpio. Cuando quieras, escribe nuevas mediciones." };

  function listaHumana(elementos) {
    var l = (elementos || []).filter(Boolean);
    if (l.length <= 1) return l.join("");
    return l.slice(0, -1).join(", ") + " y " + l[l.length - 1];
  }
  function plural(n, uno, varios) { return n === 1 ? uno : varios; }

  /** Traduce el resultado REAL del formulario a un estado y un mensaje. */
  function interpretarValidacion(r) {
    var faltan = (r && r.insuficientes) || [];
    var invalidos = (r && r.invalidos) || [];
    var validos = (r && r.validos) || [];
    if (invalidos.length) {
      var texto = plural(invalidos.length, "Hay un valor inválido en ", "Hay valores inválidos en ") +
        listaHumana(invalidos) + ". Revisa " + plural(invalidos.length, "ese campo", "esos campos") + ".";
      if (faltan.length) texto += " También " + plural(faltan.length, "falta ", "faltan ") + listaHumana(faltan) + ".";
      return { estado: "error", tipo: "error", texto: texto };
    }
    if (faltan.length) {
      return { estado: "insuficiente", tipo: "advertencia",
        texto: "Información insuficiente: " + plural(faltan.length, "falta el dato de ", "faltan los datos de ") +
               listaHumana(faltan) + ". Esto no es una alerta del acuario; solo indica que la validación está incompleta." };
    }
    if (validos.length) {
      return { estado: "espera", tipo: "implementado",
        texto: plural(validos.length, "El dato tiene", "Los " + validos.length + " datos tienen") +
               " un formato válido. Como aún no hay referencias biológicas verificadas, no evalúo si los valores son adecuados." };
    }
    return MENSAJE_LIMPIO;
  }

  /** Mensaje según el resultado REAL del buscador de fichas. */
  function mensajeBusqueda(consulta, cantidad) {
    var q = String(consulta || "").trim();
    if (!q) return MENSAJES_PESTANA.especies;
    if (cantidad === 0) {
      return { estado: "espera", tipo: "implementado",
        texto: "No encontré fichas que coincidan con «" + q + "». Prueba con otro nombre común o científico." };
    }
    return { estado: "espera", tipo: "implementado",
      texto: "Encontré " + cantidad + " " + plural(cantidad, "ficha", "fichas") + " para «" + q +
             "». Recuerda que son preliminares." };
  }

  // ── Preferencias (ocultar / reducir animaciones) ──────────────────────────
  var CLAVES = { oculta: "airi.mascota.oculta", reducida: "airi.mascota.reducida" };
  function crearPreferencias(almacen, sistemaReduce) {
    function leer(clave) {
      try { return almacen ? almacen.getItem(clave) : null; } catch (e) { return null; }
    }
    function guardar(clave, valor) {
      try { if (almacen) almacen.setItem(clave, valor); } catch (e) { /* sin almacenamiento: no pasa nada */ }
    }
    return {
      oculta: function () { return leer(CLAVES.oculta) === "1"; },
      fijarOculta: function (v) { guardar(CLAVES.oculta, v ? "1" : "0"); },
      /** Si la persona no eligió, se respeta la preferencia del sistema. */
      reducida: function () {
        var v = leer(CLAVES.reducida);
        if (v === "1") return true;
        if (v === "0") return false;
        return !!(sistemaReduce && sistemaReduce());
      },
      fijarReducida: function (v) { guardar(CLAVES.reducida, v ? "1" : "0"); }
    };
  }

  // ── Movimiento de nado (función pura, probada con Node) ────────────────────
  var VELOCIDAD = { bienvenida: 70, espera: 45, analisis: 0, insuficiente: 30, error: 20, alerta: 30 };
  function pasoNado(s, dt, p) {
    var n = { x: s.x, dir: s.dir, giro: Math.max(0, (s.giro || 0) - dt), t: (s.t || 0) + dt };
    var vel = VELOCIDAD[p.estado] != null ? VELOCIDAD[p.estado] : 45;
    if (p.estado === "analisis") {
      n.x += ((p.min + p.max) / 2 - n.x) * Math.min(1, dt * 2);     // se acerca al centro
    } else {
      n.x += n.dir * vel * dt * (n.giro > 0 ? 0.25 : 1);
      var azar = p.azar ? p.azar() : 0.5;
      var centro = n.x > p.min + (p.max - p.min) * 0.25 && n.x < p.min + (p.max - p.min) * 0.75;
      if ((n.x >= p.max && n.dir > 0) || (n.x <= p.min && n.dir < 0) ||
          (centro && n.giro === 0 && azar < dt * 0.05)) {
        n.dir = -n.dir; n.giro = 0.45;                              // cambio de dirección
      }
    }
    n.x = Math.min(p.max, Math.max(p.min, n.x));
    n.y = Math.sin(n.t * 1.3) * p.amplitud + Math.sin(n.t * 0.37) * p.amplitud * 0.6;
    n.inclinacion = Math.cos(n.t * 1.3) * 3 * (vel ? 1 : 0.3);
    return n;
  }

  // ── Construcción del DOM ──────────────────────────────────────────────────
  function rutaBase() {
    if (typeof document === "undefined") return "";
    var s = document.currentScript || document.querySelector('script[src*="mascota.js"]');
    return s ? s.src.replace(/mascota\.js(\?.*)?$/, "") : "";
  }
  var BASE = rutaBase();

  function el(etiqueta, clase, atributos) {
    var e = document.createElement(etiqueta);
    if (clase) e.className = clase;
    for (var k in (atributos || {})) e.setAttribute(k, atributos[k]);
    return e;
  }

  function crearPez() {
    var pez = el("div", "airi-m-pez", { role: "img",
      "aria-label": "AIRI, pez tecnológico naranja y blanco con visor y antena" });
    var giro = el("div", "airi-m-giro");
    var capas = el("div", "airi-m-capas");
    [["cola", "airi-pez-cola.png"], ["dorsal", "airi-pez-dorsal.png"], ["cuerpo", "airi-pez-cuerpo.png"],
     ["antena", "airi-pez-antena.png"]].forEach(function (c) {
      var capa = el("div", "airi-m-capa airi-m-" + c[0]);
      var img = el("img", "", { src: BASE + "assets/" + c[1], alt: "", draggable: "false" });
      capa.appendChild(img);
      if (c[0] === "antena") capa.appendChild(el("span", "airi-m-luz", { "aria-hidden": "true" }));
      capas.appendChild(capa);
    });
    capas.appendChild(el("span", "airi-m-escaneo", { "aria-hidden": "true" }));
    giro.appendChild(capas);
    giro.appendChild(el("span", "airi-m-senal", { "aria-hidden": "true" }));
    pez.appendChild(giro);
    return pez;
  }

  function crearGlobo() {
    var globo = el("div", "airi-m-globo");
    var p = el("p", "airi-m-texto");
    var etiqueta = el("span", "airi-m-etiqueta");
    globo.appendChild(p); globo.appendChild(etiqueta);
    return globo;
  }

  function crearControles(ctl) {
    var caja = el("div", "airi-m-controles");
    var reducir = el("button", "airi-m-boton airi-m-btn-reducir", { type: "button", "aria-pressed": "false" });
    reducir.textContent = "Reducir animaciones";
    reducir.addEventListener("click", function () { ctl.reducirMovimiento(!ctl.reducida); });
    var ocultar = el("button", "airi-m-boton airi-m-btn-ocultar", { type: "button" });
    ocultar.textContent = "Ocultar mascota";
    ocultar.addEventListener("click", function () { ctl.oculta ? ctl.mostrar() : ctl.ocultar(); });
    caja.appendChild(reducir); caja.appendChild(ocultar);
    return caja;
  }

  // ── Controlador ──────────────────────────────────────────────────────────
  function iniciar(opciones) {
    opciones = opciones || {};
    var sistema = raiz.matchMedia ? raiz.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var almacen = null;
    try { almacen = raiz.localStorage; } catch (e) { almacen = null; }
    var prefs = opciones.preferencias || crearPreferencias(almacen, function () { return !!(sistema && sistema.matches); });

    var ctl = { version: VERSION, modo: opciones.modo || "pecera", estado: "espera",
                oculta: prefs.oculta(), reducida: prefs.reducida(), mensaje: null };
    var botonesReducir = [], botonesOcultar = [];

    // Región anunciada a lectores de pantalla (una sola para no repetir)
    var vivo = el("div", "airi-m-solo-lector", { role: "status", "aria-live": "polite" });
    document.body.appendChild(vivo);

    // Pecera
    var pecera = null, agua = null, nadador = null, pezPecera = null, globoPecera = null;
    if (opciones.pecera) {
      // Un <div role="region"> y no un <section>: el prototipo oculta todos los
      // <section> de <main> al cambiar de pestaña.
      pecera = el("div", "airi-m-pecera airi-m-raiz", { role: "region", "aria-label": "Pecera animada de AIRI" });
      agua = el("div", "airi-m-agua");
      agua.appendChild(el("div", "airi-m-rayos", { "aria-hidden": "true" }));
      agua.appendChild(el("div", "airi-m-superficie", { "aria-hidden": "true" }));
      [[8, 9, 0], [14, 11, 2.5], [22, 7, 5], [37, 8, 1.2], [58, 10, 3.6], [71, 12, 0.6], [84, 8, 4.4], [92, 10, 2]]
        .forEach(function (b, i) {
          var burbuja = el("span", "airi-m-burbuja", { "aria-hidden": "true" });
          burbuja.style.left = b[0] + "%";
          burbuja.style.setProperty("--t", b[1] + "px");
          burbuja.style.setProperty("--d", (6 + (i % 3) * 1.5) + "s");
          burbuja.style.setProperty("--r", b[2] + "s");
          agua.appendChild(burbuja);
        });
      agua.appendChild(el("div", "airi-m-arena", { "aria-hidden": "true" }));
      nadador = el("div", "airi-m-nadador");
      pezPecera = crearPez();
      nadador.appendChild(pezPecera);
      agua.appendChild(nadador);
      globoPecera = crearGlobo();
      pecera.appendChild(agua);
      pecera.appendChild(globoPecera);     // encima del agua en escritorio; debajo en celular
      var aviso = el("p", "airi-m-pecera-aviso");
      aviso.textContent = "Pecera ilustrativa: la animación es decorativa y no representa un acuario real ni mediciones.";
      pecera.appendChild(aviso);
      var ctrlPecera = crearControles(ctl);
      pecera.appendChild(ctrlPecera);
      opciones.pecera.appendChild(pecera);
      botonesReducir.push(ctrlPecera.children[0]); botonesOcultar.push(ctrlPecera.children[1]);
    }

    // Asistente flotante
    var flotante = el("aside", "airi-m-flotante airi-m-raiz", { "aria-label": "Asistente AIRI" });
    var globoFlotante = crearGlobo();
    globoFlotante.id = "airi-m-globo-flotante";
    var ctrlFlotante = crearControles(ctl);
    globoFlotante.appendChild(ctrlFlotante);
    botonesReducir.push(ctrlFlotante.children[0]); botonesOcultar.push(ctrlFlotante.children[1]);
    var avatar = el("button", "airi-m-avatar", { type: "button", "aria-expanded": "true",
      "aria-controls": "airi-m-globo-flotante", "aria-label": "Mostrar u ocultar el mensaje de AIRI" });
    var pezFlotante = crearPez();
    pezFlotante.removeAttribute("role"); pezFlotante.removeAttribute("aria-label");
    avatar.appendChild(pezFlotante);
    // v0.4 (E5): botón visible para cerrar el mensaje; AIRI (el avatar) lo vuelve a abrir.
    var cerrarGlobo = el("button", "airi-m-cerrar-globo", { type: "button", title: "Cerrar mensaje",
      "aria-label": "Cerrar el mensaje de AIRI. Toca a AIRI para volver a abrirlo" });
    cerrarGlobo.textContent = "×";
    cerrarGlobo.addEventListener("click", function () {
      abrirGlobo(false);
      avatar.focus();
      emitir("airi:mascota-globo-cerrado", { modo: "flotante" });
    });
    globoFlotante.insertBefore(cerrarGlobo, globoFlotante.firstChild);
    flotante.appendChild(globoFlotante); flotante.appendChild(avatar);
    document.body.appendChild(flotante);
    var mostrarBtn = el("button", "airi-m-boton airi-m-mostrar", { type: "button" });
    mostrarBtn.textContent = "Mostrar AIRI";
    mostrarBtn.addEventListener("click", function () { ctl.mostrar(); });
    document.body.appendChild(mostrarBtn);

    var temporizadorGlobo = null;
    function abrirGlobo(abrir) {
      globoFlotante.hidden = !abrir;
      avatar.setAttribute("aria-expanded", String(abrir));
      clearTimeout(temporizadorGlobo);
      if (abrir) temporizadorGlobo = setTimeout(function cerrarSiProcede() {
        // data-fijo: el menú está abierto o AIRI está hablando (v0.2)
        if (globoFlotante.getAttribute("data-fijo") === "1" || flotante.contains(document.activeElement)) {
          temporizadorGlobo = setTimeout(cerrarSiProcede, 2000);
        } else { abrirGlobo(false); }
      }, opciones.duracionGlobo || (raiz.innerWidth && raiz.innerWidth <= 600 ? 6000 : 8000));
    }
    avatar.addEventListener("click", function () {
      abrirGlobo(globoFlotante.hidden);
      emitir("airi:mascota-pulsada", { modo: "flotante", abierto: !globoFlotante.hidden });
    });
    // Para no tapar la interfaz: el globo se contrae en cuanto la persona usa un
    // campo o un botón de la página, o desplaza la vista. El avatar lo vuelve a abrir.
    document.addEventListener("focusin", function (e) {
      if (!flotante.contains(e.target) && e.target !== mostrarBtn && !globoFlotante.hidden) abrirGlobo(false);
    });
    var desplazamientoInicial = null;
    raiz.addEventListener("scroll", function () {
      if (globoFlotante.hidden) { desplazamientoInicial = null; return; }
      if (desplazamientoInicial === null) desplazamientoInicial = raiz.scrollY;
      if (Math.abs(raiz.scrollY - desplazamientoInicial) > 60) { abrirGlobo(false); desplazamientoInicial = null; }
    }, { passive: true });

    // ── Render ──────────────────────────────────────────────────────────────
    function aplicarEstadoVisual() {
      [pezPecera, pezFlotante].forEach(function (p) {
        if (!p) return;
        ESTADOS.forEach(function (e) { p.classList.remove("airi-m-estado-" + e); });
        void p.offsetWidth;                                      // reinicia animaciones de un solo uso
        p.classList.add("airi-m-estado-" + ctl.estado);
        var senal = p.querySelector(".airi-m-senal");
        senal.textContent = ctl.estado === "error" || ctl.estado === "alerta" ? "!" :
                            ctl.estado === "insuficiente" ? "?" : "";
      });
    }
    function aplicarVisibilidad() {
      var enPecera = ctl.modo === "pecera" && !!pecera;
      if (pecera) pecera.classList.toggle("airi-m-oculta", ctl.oculta);
      flotante.hidden = enPecera || ctl.oculta;
      mostrarBtn.hidden = !(ctl.oculta && !enPecera);
      document.body.classList.toggle("airi-m-con-flotante", !flotante.hidden);
      botonesOcultar.forEach(function (b) { b.textContent = ctl.oculta ? "Mostrar AIRI" : "Ocultar mascota"; });
      [pecera, flotante].forEach(function (r) { if (r) r.classList.toggle("airi-m-reducido", ctl.reducida); });
      botonesReducir.forEach(function (b) { b.setAttribute("aria-pressed", String(ctl.reducida)); });
      if (enPecera && !ctl.oculta && !ctl.reducida) arrancarNado(); else detenerNado();
      if (ctl.reducida && pecera && !ctl.oculta) colocarQuieto();
    }
    function aplicarMensaje() {
      var m = ctl.mensaje;
      if (!m) return;
      [globoPecera, globoFlotante].forEach(function (g) {
        if (!g) return;
        g.querySelector(".airi-m-texto").textContent = m.texto;
        var et = g.querySelector(".airi-m-etiqueta");
        et.textContent = ETIQUETAS[m.tipo] || ETIQUETAS.informativo;
        et.setAttribute("data-tipo", m.tipo);
      });
      if (!ctl.oculta) vivo.textContent = m.texto;
    }

    // ── Nado en la pecera ───────────────────────────────────────────────────
    var nado = { x: 20, dir: 1, giro: 0, t: 0 }, rafId = null, ultimo = 0;
    function medidas() {
      var a = agua.getBoundingClientRect(), p = pezPecera.getBoundingClientRect();
      return { W: a.width, H: a.height, w: p.width || 200, h: p.height || 123 };
    }
    function colocar(x, y, inclinacion) {
      pezPecera.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" +
        (inclinacion || 0).toFixed(2) + "deg)";
      pezPecera.firstChild.classList.toggle("airi-m-izquierda", nado.dir < 0);
    }
    function colocarQuieto() {
      if (!agua) return;
      var m = medidas();
      nado.dir = 1;
      colocar(Math.max(8, m.W * 0.62 - m.w / 2), Math.max(8, m.H * 0.5 - m.h / 2), 0);
    }
    function cuadro(ahora) {
      var dt = ultimo ? Math.min(0.05, (ahora - ultimo) / 1000) : 0;
      ultimo = ahora;
      var m = medidas();
      var max = Math.max(10, m.W - m.w - 10);
      nado = pasoNado(nado, dt, { min: 10, max: max, estado: ctl.estado, amplitud: Math.max(4, m.H * 0.05),
                                  azar: Math.random });
      var base = Math.min(m.H * 0.84 - m.h, Math.max(m.H * 0.3, m.H * 0.56 - m.h / 2));
      colocar(nado.x, base + nado.y, nado.inclinacion);
      rafId = raiz.requestAnimationFrame(cuadro);
    }
    function arrancarNado() {
      if (rafId == null && agua && raiz.requestAnimationFrame) { ultimo = 0; rafId = raiz.requestAnimationFrame(cuadro); }
    }
    function detenerNado() {
      if (rafId != null) { raiz.cancelAnimationFrame(rafId); rafId = null; }
    }

    function emitir(nombre, detalle) {
      if (typeof CustomEvent === "function") document.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));
    }

    // ── API pública ─────────────────────────────────────────────────────────
    /** Elementos visuales, para módulos que se acoplan a la mascota (v0.2: voz y menú). */
    ctl.elementos = { pecera: pecera, pezPecera: pezPecera, globoPecera: globoPecera,
      flotante: flotante, pezFlotante: pezFlotante, globoFlotante: globoFlotante, avatar: avatar,
      controles: [pecera && pecera.querySelector(".airi-m-controles"), ctrlFlotante].filter(Boolean),
      abrirGlobo: abrirGlobo };
    /** Animación de «hablando» (movimiento suave y antena encendida). */
    ctl.indicarHabla = function (hablando) {
      [pezPecera, pezFlotante].forEach(function (p) { if (p) p.classList.toggle("airi-m-hablando", !!hablando); });
      return ctl;
    };
    var temporizadorEstado = null;
    ctl.cambiarEstado = function (estado, mensaje, opcionesEstado) {
      if (ESTADOS.indexOf(estado) < 0) throw new Error("Estado desconocido: " + estado);
      clearTimeout(temporizadorEstado);
      ctl.estado = estado;
      if (mensaje) { ctl.mensaje = mensaje; aplicarMensaje(); if (ctl.modo === "flotante") abrirGlobo(true); }
      aplicarEstadoVisual();
      var despues = opcionesEstado && opcionesEstado.volverAEsperaEn;
      if (despues) temporizadorEstado = setTimeout(function () { ctl.estado = "espera"; aplicarEstadoVisual(); }, despues);
      if (typeof CustomEvent === "function") {
        document.dispatchEvent(new CustomEvent("airi:mascota", { detail: { estado: estado, mensaje: mensaje || null } }));
      }
      return ctl;
    };
    ctl.decir = function (mensaje) {
      return ctl.cambiarEstado(mensaje.estado || ctl.estado, mensaje,
        mensaje.estado === "bienvenida" ? { volverAEsperaEn: 3500 } : null);
    };
    ctl.cambiarModo = function (modo) {
      ctl.modo = modo === "pecera" ? "pecera" : "flotante";
      aplicarVisibilidad();
      if (ctl.modo === "flotante") abrirGlobo(true);
      return ctl;
    };
    ctl.ocultar = function () { ctl.oculta = true; prefs.fijarOculta(true); aplicarVisibilidad();
      emitir("airi:mascota-visibilidad", { oculta: true });
      if (ctl.modo === "flotante") mostrarBtn.focus(); return ctl; };
    ctl.mostrar = function () { ctl.oculta = false; prefs.fijarOculta(false); aplicarVisibilidad(); aplicarMensaje();
      if (ctl.modo === "flotante") { abrirGlobo(true); avatar.focus(); } return ctl; };
    ctl.reducirMovimiento = function (v) { ctl.reducida = !!v; prefs.fijarReducida(ctl.reducida);
      aplicarVisibilidad(); return ctl; };
    ctl.destruir = function () {
      detenerNado(); clearTimeout(temporizadorGlobo); clearTimeout(temporizadorEstado);
      [pecera, flotante, mostrarBtn, vivo].forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
      document.body.classList.remove("airi-m-con-flotante");
    };
    // Si cambia la preferencia del sistema y la persona no eligió, se respeta
    if (sistema && sistema.addEventListener) sistema.addEventListener("change", function () {
      ctl.reducida = prefs.reducida(); aplicarVisibilidad();
    });
    if (raiz.addEventListener) raiz.addEventListener("resize", function () { if (ctl.reducida) colocarQuieto(); });

    aplicarVisibilidad();
    if (ctl.modo === "pecera" && !ctl.reducida) colocar(nado.x, 40, 0);
    ctl.decir(opciones.mensajeInicial || MENSAJES_PESTANA[ctl.modo === "pecera" ? "inicio" : "agua"]);
    return ctl;
  }

  return {
    version: VERSION, ESTADOS: ESTADOS, ETIQUETAS: ETIQUETAS,
    MENSAJES_PESTANA: MENSAJES_PESTANA, MENSAJE_ANALISIS: MENSAJE_ANALISIS, MENSAJE_LIMPIO: MENSAJE_LIMPIO,
    listaHumana: listaHumana, interpretarValidacion: interpretarValidacion, mensajeBusqueda: mensajeBusqueda,
    crearPreferencias: crearPreferencias, pasoNado: pasoNado, iniciar: iniciar
  };
});
