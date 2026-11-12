/* ═══ AIRI · Interacción y voz v0.2 ═════════════════════════════════════════
   Une tres piezas independientes sin mezclar sus responsabilidades:
     AIRIMascota (visual) · AIRIVoz (síntesis de voz) · AIRIAyuda (textos verificados)
   - Menú de acciones al pulsar la mascota (avatar flotante o el pez de la pecera).
   - Controles de voz: activar/desactivar y detener. «Repetir» y «Silenciar» están en el menú.
   - Habla solo después de una acción de la persona; nunca al abrir la página.
   - Mientras habla, la mascota se mueve suavemente y la antena se enciende.
   Expone window.AIRIInteraccion. */
(function () {
  "use strict";
  if (typeof window === "undefined") return;

  function iniciar(mascota, opciones) {
    opciones = opciones || {};
    var Ayuda = window.AIRIAyuda, VozApi = window.AIRIVoz;
    var almacen = null;
    try { almacen = window.localStorage; } catch (e) { almacen = null; }
    var voz = VozApi.crearVoz({ almacen: almacen });
    var el = mascota.elementos;
    var estado = { pestana: opciones.pestana || "inicio", listo: false, origenMenu: null };
    // v0.3: ajustes de voz (si el módulo no está, el menú funciona igual sin esa opción)
    var ajustes = window.AIRIAjustesVoz ? window.AIRIAjustesVoz.crear(voz, {
      alGuardar: function () {
        pintarControles();
        mascota.decir(voz.activada ? Ayuda.MENSAJES_VOZ.guardada : Ayuda.MENSAJES_VOZ.guardadaSilenciada);
      }
    }) : null;

    // ── Menús (uno en cada globo) ───────────────────────────────────────────
    var menus = [];
    function crearMenu(globo, sufijo) {
      var menu = document.createElement("div");
      menu.className = "airi-m-menu";
      menu.id = "airi-m-menu-" + sufijo;
      menu.hidden = true;
      menu.setAttribute("role", "group");
      menu.setAttribute("aria-label", "Acciones de AIRI");
      var titulo = document.createElement("p");
      titulo.className = "airi-m-menu-titulo";
      titulo.textContent = "¿En qué te ayudo?";
      menu.appendChild(titulo);
      var lista = document.createElement("div");
      lista.className = "airi-m-menu-lista";
      menu.appendChild(lista);
      var controles = globo.querySelector(".airi-m-controles");
      globo.insertBefore(menu, controles || null);
      if (!controles) globo.appendChild(menu);
      menu.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { e.preventDefault(); cerrarMenus(true); }
      });
      var registro = { menu: menu, lista: lista, globo: globo };
      menus.push(registro);
      return registro;
    }
    function pintarMenu(registro) {
      registro.lista.textContent = "";
      Ayuda.accionesPara(estado.pestana).forEach(function (accion) {
        if (accion.id === "ajustes" && !ajustes) return;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "airi-m-opcion" + (accion.recomendada ? " airi-m-recomendada" : "");
        b.setAttribute("data-accion", accion.id);
        b.textContent = accion.texto;
        if (accion.recomendada) {
          var marca = document.createElement("span");
          marca.className = "airi-m-marca";
          marca.textContent = " · esta pantalla";
          b.appendChild(marca);
        }
        b.addEventListener("click", function () { ejecutar(accion.id); });
        registro.lista.appendChild(b);
      });
    }
    if (el.globoPecera) crearMenu(el.globoPecera, "pecera");
    crearMenu(el.globoFlotante, "flotante");

    function menuDe(origen) { return menus.filter(function (m) { return m.globo === (origen === "pecera" ? el.globoPecera : el.globoFlotante); })[0]; }
    function disparadorDe(origen) { return origen === "pecera" ? el.pezPecera : el.avatar; }
    function fijarGlobo() {
      var fijo = menus.some(function (m) { return !m.menu.hidden; }) || voz.hablando;
      el.globoFlotante.setAttribute("data-fijo", fijo ? "1" : "0");
    }
    function abrirMenu(origen) {
      cerrarMenus(false);
      var r = menuDe(origen);
      if (!r) return;
      pintarMenu(r);
      r.menu.hidden = false;
      estado.origenMenu = origen;
      if (origen === "flotante") el.abrirGlobo(true);
      disparadorDe(origen).setAttribute("aria-expanded", "true");
      r.globo.classList.add("airi-m-con-menu");   // compacto: oculta el mensaje mientras se elige
      fijarGlobo();
      var primero = r.lista.querySelector("button:not([disabled])");
      if (primero) primero.focus();
    }
    function cerrarMenus(devolverFoco) {
      var origen = estado.origenMenu;
      menus.forEach(function (m) { m.menu.hidden = true; m.globo.classList.remove("airi-m-con-menu"); });
      if (el.pezPecera) el.pezPecera.setAttribute("aria-expanded", "false");
      estado.origenMenu = null;
      fijarGlobo();
      if (devolverFoco && origen) disparadorDe(origen).focus();
    }

    // El avatar flotante abre el globo con el menú; volver a pulsarlo lo cierra
    document.addEventListener("airi:mascota-pulsada", function (e) {
      // Cerrado → abre con menú · abierto sin menú → muestra el menú · con menú → cierra
      if ((e.detail && e.detail.abierto) || estado.origenMenu !== "flotante") abrirMenu("flotante");
      else { cerrarMenus(false); el.abrirGlobo(false); }
    });
    el.avatar.setAttribute("aria-label", "Abrir el menú de AIRI");

    // El pez de la pecera también se puede pulsar (ratón, toque o teclado)
    if (el.pezPecera) {
      var pez = el.pezPecera;
      pez.classList.add("airi-m-pulsable");
      pez.setAttribute("role", "button");
      pez.setAttribute("tabindex", "0");
      pez.setAttribute("aria-label", "AIRI. Abrir el menú de acciones");
      pez.setAttribute("aria-expanded", "false");
      pez.setAttribute("aria-controls", "airi-m-menu-pecera");
      var alternar = function () {
        if (estado.origenMenu === "pecera") cerrarMenus(true); else abrirMenu("pecera");
      };
      pez.addEventListener("click", alternar);
      pez.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternar(); }
      });
    }
    // Clic fuera del menú: se cierra
    document.addEventListener("click", function (e) {
      if (!estado.origenMenu) return;
      var r = menuDe(estado.origenMenu);
      var disparador = disparadorDe(estado.origenMenu);
      if (r && !r.menu.contains(e.target) && !disparador.contains(e.target)) cerrarMenus(false);
    });

    // ── Controles de voz (en cada fila de controles existente) ──────────────
    var botonesVoz = [], botonesDetener = [];
    el.controles.forEach(function (caja) {
      var bVoz = document.createElement("button");
      bVoz.type = "button";
      bVoz.className = "airi-m-boton airi-m-btn-voz";
      bVoz.addEventListener("click", function () { alternarVoz(); });
      var bDetener = document.createElement("button");
      bDetener.type = "button";
      bDetener.className = "airi-m-boton airi-m-btn-detener";
      bDetener.textContent = "Detener voz";
      bDetener.hidden = true;
      bDetener.addEventListener("click", function () { voz.detener(); });
      caja.insertBefore(bDetener, caja.firstChild);
      caja.insertBefore(bVoz, caja.firstChild);
      botonesVoz.push(bVoz); botonesDetener.push(bDetener);
    });
    function pintarControles() {
      botonesVoz.forEach(function (b) {
        if (!voz.soportada) {
          b.disabled = true;
          b.textContent = "Voz no disponible";
          b.title = "Este navegador no permite la síntesis de voz; los mensajes siguen por escrito.";
          b.removeAttribute("aria-pressed");
        } else {
          b.textContent = voz.activada ? "Voz activada" : "Activar voz";
          b.setAttribute("aria-pressed", String(voz.activada));
          b.title = voz.voz ? "Voz: " + voz.voz.name + " (" + voz.voz.lang + ")"
                            : "No hay una voz en español instalada; se usará la voz predeterminada del sistema.";
        }
      });
      botonesDetener.forEach(function (b) { b.hidden = !voz.hablando; });
    }
    function alternarVoz() {
      if (!voz.soportada) { mascota.decir(Ayuda.MENSAJES_VOZ.noDisponible); return; }
      if (voz.activada) {
        voz.activar(false);
        mascota.decir(Ayuda.MENSAJES_VOZ.silenciada);
      } else {
        voz.activar(true);
        // Acción explícita: lee el aviso y, a continuación, el mensaje que estaba en pantalla
        var actual = mascota.mensaje && mascota.mensaje.texto;
        mascota.decir(Ayuda.MENSAJES_VOZ.activada);
        voz.hablar(actual && actual !== Ayuda.MENSAJES_VOZ.activada.texto
          ? Ayuda.MENSAJES_VOZ.activada.texto + " " + actual : Ayuda.MENSAJES_VOZ.activada.texto);
      }
      pintarControles();
    }

    voz.alCambiar(function (e) {
      mascota.indicarHabla(e.hablando);
      pintarControles();
      fijarGlobo();
    });

    // ── Acciones del menú ───────────────────────────────────────────────────
    function ejecutar(id) {
      var origen = estado.origenMenu;
      cerrarMenus(true);
      if (id === "repetir") {
        // Vuelve a mostrar el último mensaje y, si la voz está activa, lo lee otra vez
        if (mascota.mensaje) mascota.decir(mascota.mensaje);
        if (origen === "flotante") el.abrirGlobo(true);
        return;
      }
      if (id === "ajustes") {
        if (ajustes) ajustes.abrir(disparadorDe(origen || "flotante"));
        return;
      }
      if (id === "silenciar") {
        voz.activar(false);
        mascota.decir(voz.soportada ? Ayuda.MENSAJES_VOZ.silenciada : Ayuda.MENSAJES_VOZ.noDisponible);
        pintarControles();
        return;
      }
      var r = Ayuda.respuesta(id);
      if (r) { mascota.decir(r); if (origen === "flotante") el.abrirGlobo(true); }
    }

    // ── Leer en voz alta los mensajes que la mascota muestra ────────────────
    document.addEventListener("airi:mascota", function (e) {
      var m = e.detail && e.detail.mensaje;
      if (!estado.listo || !m || m.hablar === false || !voz.activada) return;
      if (m === Ayuda.MENSAJES_VOZ.activada) return;     // ya se leyó junto con el mensaje anterior
      voz.hablar(m.texto, { estado: m.estado || e.detail.estado });   // v0.3: matiz según el estado
    });
    document.addEventListener("airi:mascota-visibilidad", function (e) {
      if (e.detail && e.detail.oculta) { voz.detener(); cerrarMenus(false); }
    });

    pintarControles();
    estado.listo = true;   // a partir de aquí, solo acciones de la persona disparan la voz

    return {
      voz: voz,
      cambiarPestana: function (p) { estado.pestana = p; cerrarMenus(false); },
      ajustes: ajustes,
      abrirMenu: abrirMenu, cerrarMenus: cerrarMenus, ejecutar: ejecutar
    };
  }

  window.AIRIInteraccion = { iniciar: iniciar };
})();
