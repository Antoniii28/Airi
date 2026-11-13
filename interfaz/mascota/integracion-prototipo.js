/* ═══ AIRI · Integración de la mascota con interfaz/prototipo/index.html ═══
   Conecta la mascota con los eventos REALES del prototipo sin modificar su
   lógica: pestañas, resultado del botón «Validar entradas», «Limpiar» y el
   buscador de fichas. La mascota solo repite lo que el prototipo ya calculó
   y, desde v0.4, el informe del motor de análisis (interfaz/motor).
   Si la mascota falla, el prototipo sigue funcionando igual. */
(function () {
  "use strict";
  var M = window.AIRIMascota;
  if (!M || !document.body) return;

  try {
    var inicio = document.getElementById("inicio");
    var contenedor = null;
    if (inicio) {
      contenedor = document.createElement("div");
      contenedor.className = "airi-m-contenedor-pecera";
      var parrafo = inicio.querySelector("p");
      inicio.insertBefore(contenedor, parrafo ? parrafo.nextSibling : null);
    }
    var pestanaActiva = function () {
      var b = document.querySelector('[data-tab][aria-selected="true"]');
      return b ? b.getAttribute("data-tab") : "inicio";
    };
    var actual = pestanaActiva();
    var mascota = M.iniciar({
      pecera: contenedor,
      modo: actual === "inicio" ? "pecera" : "flotante",
      mensajeInicial: M.MENSAJES_PESTANA[actual] || M.MENSAJES_PESTANA.inicio
    });
    window.airiMascota = mascota;   // acceso para depuración y futuras versiones

    // v0.2: voz y menú de acciones (módulos independientes; si faltan, la mascota sigue igual)
    var interaccion = null;
    if (window.AIRIInteraccion && window.AIRIVoz && window.AIRIAyuda) {
      try {
        interaccion = window.AIRIInteraccion.iniciar(mascota, { pestana: actual });
        window.airiInteraccion = interaccion;
      } catch (errorVoz) {
        if (window.console) console.warn("AIRI: la voz y el menú no pudieron iniciarse; la mascota sigue disponible.", errorVoz);
      }
    }
    // Mensajes que solo se muestran por escrito (no se leen en voz alta)
    var soloTexto = function (m) {
      var copia = {};
      for (var k in m) copia[k] = m[k];
      copia.hablar = false;
      return copia;
    };

    // Pestañas: pecera en Inicio, asistente flotante en las demás
    document.querySelectorAll("[data-tab]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var pestana = boton.getAttribute("data-tab");
        if (interaccion) interaccion.cambiarPestana(pestana);
        mascota.cambiarModo(pestana === "inicio" ? "pecera" : "flotante");
        mascota.decir(M.MENSAJES_PESTANA[pestana] || M.MENSAJES_PESTANA.inicio);
      });
    });

    // Validación: se lee el resultado que el prototipo escribe en #resultado
    var resultado = document.getElementById("resultado");
    var espera = null;
    function leerResultado() {
      var r = { validos: [], insuficientes: [], invalidos: [] };
      resultado.querySelectorAll(".status").forEach(function (s) {
        var nombre = s.textContent.split(":")[0].trim();
        if (s.classList.contains("unknown")) r.insuficientes.push(nombre);
        else if (s.classList.contains("warn")) r.invalidos.push(nombre);
        else if (s.classList.contains("ok")) r.validos.push(nombre);
      });
      return r;
    }
    if (resultado && window.MutationObserver) {
      new MutationObserver(function () {
        clearTimeout(espera);
        var r = leerResultado();
        if (!r.validos.length && !r.insuficientes.length && !r.invalidos.length) {
          mascota.decir(M.MENSAJE_LIMPIO);
          return;
        }
        // La pausa de «análisis» es solo una animación demostrativa: el resultado
        // ya está calculado por el prototipo. Con animaciones reducidas no hay pausa.
        mascota.decir(soloTexto(M.MENSAJE_ANALISIS));
        // v0.4: si el motor de análisis está cargado, AIRI comunica su informe real
        // (anomalías con estado «alerta» y datos insuficientes, a la vez si es R4).
        espera = setTimeout(function () {
          var analisis = window.airiAnalisis && window.airiAnalisis.ultimo;
          mascota.decir(analisis ? analisis.mensaje : M.interpretarValidacion(r));
        },
                            mascota.reducida ? 0 : 900);
      }).observe(resultado, { childList: true, subtree: true });
    }

    // Buscador de fichas: refleja cuántas fichas mostró realmente el catálogo
    var buscar = document.getElementById("buscar");
    var catalogo = document.getElementById("catalogo");
    var esperaBusqueda = null;
    if (buscar && catalogo) {
      buscar.addEventListener("input", function () {
        clearTimeout(esperaBusqueda);
        esperaBusqueda = setTimeout(function () {
          var cantidad = catalogo.querySelectorAll("article.card").length;
          mascota.decir(soloTexto(M.mensajeBusqueda(buscar.value, cantidad)));
        }, 700);
      });
    }
  } catch (error) {
    if (window.console) console.warn("AIRI: la mascota no pudo iniciarse; la interfaz sigue disponible.", error);
  }
})();
