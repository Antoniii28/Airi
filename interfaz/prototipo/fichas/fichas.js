/* AIRI · Apartado «Fichas de especies» del prototipo.
   Dibuja una tarjeta por especie con los nueve campos estandarizados (bloque `ficha_airi`)
   de window.AIRIFichasDatos, generado desde especies/datos/catalogo_inicial.json.
   Responsable: Brayan (fichas de especies). No determina compatibilidad entre especies. */
(function () {
  "use strict";

  var datos = window.AIRIFichasDatos;
  var buscador = document.getElementById("buscar");
  var contenedor = document.getElementById("catalogo");
  if (!buscador || !contenedor) return;

  var ETIQUETAS = {
    pacifico: "Pacífico", semiagresivo: "Semiagresivo", agresivo: "Agresivo",
    territorial: "Territorial", solitario: "Solitario", sociable: "Sociable",
    si: "Sí", no: "No", con_precaucion: "Con precaución",
    herbivoro: "Herbívoro", carnivoro: "Carnívoro", omnivoro: "Omnívoro", fotosintetico: "Fotosintético", filtrador: "Filtrador"
  };
  var NO_VERIFICADO = '<span class="ficha-nulo">Dato no verificado</span>';

  function safe(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }
  function etiqueta(v) { return v == null ? null : (ETIQUETAS[v] || v); }
  function chip(v, clase) { return '<span class="ficha-chip ' + (clase || "") + '">' + safe(etiqueta(v)) + "</span>"; }

  if (!datos || !datos.especies) {
    contenedor.innerHTML = '<p class="status warn">No se pudieron cargar las fichas de especies.</p>';
    return;
  }

  function normalizar(s) {  // minúsculas y sin tildes: «idolo» encuentra «Ídolo»
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function textoBusqueda(e) {
    return normalizar([e.nombre_comun, e.nombre_cientifico].concat(e.otros_nombres || []).join(" "));
  }

  // enBoton: dentro de un <button> solo caben elementos en línea, así que se usan <span>.
  function imagenHtml(e, enBoton) {
    var img = e.imagen;
    var fig = enBoton ? "span" : "figure", pie = enBoton ? "span" : "figcaption";
    if (!img || !img.ruta_web) {
      return "<" + fig + ' class="ficha-figura"><span class="ficha-sin-imagen" role="img" aria-label="Imagen pendiente">Imagen pendiente</span></' + fig + ">";
    }
    var credito = img.origen === "ia" ? "Imagen ilustrativa generada con IA" : "Foto: " + img.autor + " · " + img.licencia;
    if (img.especie_confirmada === false) credito += " · especie de la imagen no confirmada";
    return "<" + fig + ' class="ficha-figura"><img src="' + safe(img.ruta_web) + '" alt="' + (enBoton ? "" : safe(e.nombre_comun) +
      " (" + safe(e.nombre_cientifico) + ")") + '" loading="' + (enBoton ? "lazy" : "eager") + '" width="800" height="800">' +
      "<" + pie + ' class="ficha-credito">' + safe(credito) + "</" + pie + "></" + fig + ">";
  }

  // Un dato corto del mosaico: etiqueta pequeña arriba y valor debajo.
  function dato(titulo, valorHtml) {
    return '<div class="ficha-dato"><dt>' + safe(titulo) + "</dt><dd>" + (valorHtml || NO_VERIFICADO) + "</dd></div>";
  }

  // Seis datos cortos en una cuadrícula de dos columnas.
  function mosaico(f) {
    var tem = f.temperamento, arr = f.adecuado_arrecife, ali = f.alimentacion;
    var t = f.temperatura_c, l = f.litraje_recomendado_l, z = f.tamano_adulto_cm;
    return '<dl class="ficha-mosaico">' +
      dato("Temperamento", tem && tem.valor ? chip(tem.valor, "ficha-chip-" + tem.valor) : null) +
      dato("Arrecife", arr && arr.valor ? chip(arr.valor, "ficha-chip-arrecife-" + arr.valor) : null) +
      dato("Alimentación", ali && ali.tipo ? chip(ali.tipo) : null) +
      dato("Temperatura", t && t.min != null ? "<strong>" + t.min + "–" + t.max + " °C</strong>" : null) +
      dato("Litraje mín.", l && l.min != null ? "<strong>" + l.min + " L</strong>" : null) +
      dato("Tamaño adulto", z && z.max != null ? "<strong>" + z.max + " cm</strong>" : null) +
      "</dl>";
  }

  // Comportamiento y alimentos: texto corrido a todo el ancho.
  function descripcion(f) {
    var com = f.comportamiento, ali = f.alimentacion, html = "";
    if (com && com.etiquetas) {
      html += '<p class="ficha-linea">' + com.etiquetas.map(function (x) { return chip(x, "ficha-chip-sm"); }).join("") +
        " " + safe(com.descripcion) + "</p>";
    }
    if (ali && ali.alimentos && ali.alimentos.length) {
      html += '<p class="ficha-linea"><strong>Come:</strong> ' + safe(ali.alimentos.join(", ")) + ".</p>";
    }
    return html;
  }

  // Notas, explicaciones y diferencias entre fuentes: en un desplegable cerrado.
  function notas(f) {
    var tem = f.temperamento, arr = f.adecuado_arrecife, ali = f.alimentacion;
    var t = f.temperatura_c, l = f.litraje_recomendado_l, z = f.tamano_adulto_cm;
    var venta = z && z.tamano_venta_cm, items = [];
    function agregar(titulo, texto) { if (texto) items.push("<li><strong>" + safe(titulo) + ":</strong> " + safe(texto) + "</li>"); }
    agregar("Temperamento", tem && tem.nota);
    agregar("Arrecife", arr && arr.explicacion);
    agregar("Alimentación", ali && ali.nota);
    agregar("Temperatura", t && t.nota);
    if (l) agregar("Litraje", (l.min != null ? l.min + " L (" + l.galones_us + " gal EE. UU.). " : "") + (l.justificacion || "") + " " + (l.nota || ""));
    if (z) {
      var extra = [];
      if (venta) extra.push("Al comprarlo (juvenil o subadulto): " + (venta.min != null ? venta.min + "–" + venta.max : "hasta " + venta.max) + " cm.");
      if (z.talla_madurez_cm) extra.push("Madura desde " + z.talla_madurez_cm + " cm.");
      if (z.medida) extra.push("Medida: " + z.medida + ".");
      if (z.nota) extra.push(z.nota);
      agregar("Tamaño", extra.join(" "));
    }
    if (!items.length) return "";
    return '<details class="ficha-notas"><summary>Notas y fuentes</summary><ul>' + items.join("") + "</ul></details>";
  }

  var GRUPOS = { "pez": "Pez", "estrella de mar": "Estrella de mar", "crustáceo": "Crustáceo", "coral": "Coral", "anémona": "Anémona", "caracol": "Caracol", "erizo de mar": "Erizo de mar", "gusano": "Gusano", "pepino de mar": "Pepino de mar" };

  // Tarjeta de la cuadrícula: solo imagen, nombre y nombre científico. Toda la tarjeta abre la ficha.
  function tarjeta(e) {
    var f = e.ficha_airi || {};
    var nombre = f.nombre_comun || e.nombre_comun;
    return '<article class="card ficha">' +
      '<button type="button" class="ficha-abrir" data-id="' + safe(e.id) + '" aria-haspopup="dialog" aria-label="Ver ficha de ' + safe(nombre) + '">' +
      imagenHtml(e, true) +
      '<span class="ficha-cuerpo"><span class="ficha-titulo">' + safe(nombre) + "</span>" +
      '<span class="ficha-cientifico"><em>' + safe(f.nombre_cientifico || e.nombre_cientifico) + "</em></span>" +
      '<span class="ficha-ver">' + safe(GRUPOS[e.grupo] || "") + '<span aria-hidden="true">Ver ficha ›</span></span>' +
      "</span></button></article>";
  }

  // Ventana (diálogo) con la ficha completa. Se crea una sola vez.
  var dialogo = document.createElement("dialog");
  dialogo.className = "ficha-dialogo";
  dialogo.setAttribute("aria-labelledby", "ficha-dialogo-titulo");
  document.body.appendChild(dialogo);
  var abridor = null;

  function abrirFicha(id) {
    var e = datos.especies.filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    var f = e.ficha_airi || {};
    dialogo.innerHTML =
      '<button type="button" class="ficha-cerrar" aria-label="Cerrar ficha">×</button>' +
      imagenHtml(e) +
      '<div class="ficha-cuerpo">' +
      '<h3 id="ficha-dialogo-titulo">' + safe(f.nombre_comun || e.nombre_comun) + "</h3>" +
      '<p class="ficha-cientifico"><em>' + safe(f.nombre_cientifico || e.nombre_cientifico) + "</em> " + safe(e.autoridad || "") +
      (GRUPOS[e.grupo] ? ' · ' + safe(GRUPOS[e.grupo]) : "") + "</p>" +
      mosaico(f) + descripcion(f) + notas(f) + "</div>";
    dialogo.querySelector(".ficha-cerrar").addEventListener("click", function () { dialogo.close(); });
    if (typeof dialogo.showModal === "function") dialogo.showModal(); else dialogo.setAttribute("open", "");
    dialogo.scrollTop = 0;
  }

  // Cerrar al pulsar fuera de la ficha (sobre el fondo oscuro).
  dialogo.addEventListener("click", function (ev) {
    if (ev.target === dialogo) dialogo.close();
  });
  // Al cerrar, devolver el foco a la tarjeta que se abrió (accesibilidad con teclado).
  dialogo.addEventListener("close", function () {
    if (abridor && document.body.contains(abridor)) abridor.focus();
  });

  contenedor.addEventListener("click", function (ev) {
    var boton = ev.target.closest && ev.target.closest(".ficha-abrir");
    if (!boton) return;
    abridor = boton;
    abrirFicha(boton.getAttribute("data-id"));
  });

  function pintar() {
    var q = normalizar(buscador.value.trim());
    var html = datos.especies.filter(function (e) { return textoBusqueda(e).indexOf(q) !== -1; }).map(tarjeta).join("");
    contenedor.innerHTML = html || "<p>No hay coincidencias.</p>";
  }

  buscador.addEventListener("input", pintar);
  pintar();
})();
