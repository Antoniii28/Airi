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
    herbivoro: "Herbívoro", carnivoro: "Carnívoro", omnivoro: "Omnívoro"
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

  function imagenHtml(e) {
    var img = e.imagen;
    if (!img || !img.ruta_web) {
      return '<figure class="ficha-figura"><div class="ficha-sin-imagen" role="img" aria-label="Imagen pendiente">Imagen pendiente</div></figure>';
    }
    var credito = img.origen === "ia" ? "Imagen ilustrativa generada con IA" : "Foto: " + img.autor + " · " + img.licencia;
    if (img.especie_confirmada === false) credito += " · especie de la imagen no confirmada";
    return '<figure class="ficha-figura"><img src="' + safe(img.ruta_web) + '" alt="' + safe(e.nombre_comun) +
      " (" + safe(e.nombre_cientifico) + ')" loading="lazy" width="800" height="800">' +
      "<figcaption>" + safe(credito) + "</figcaption></figure>";
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

  function tarjeta(e) {
    var f = e.ficha_airi || {};
    return '<article class="card ficha">' + imagenHtml(e) +
      '<div class="ficha-cuerpo"><h3>' + safe(f.nombre_comun || e.nombre_comun) + "</h3>" +
      '<p class="ficha-cientifico"><em>' + safe(f.nombre_cientifico || e.nombre_cientifico) + "</em></p>" +
      mosaico(f) + descripcion(f) + notas(f) + "</div></article>";
  }

  function pintar() {
    var q = normalizar(buscador.value.trim());
    var html = datos.especies.filter(function (e) { return textoBusqueda(e).indexOf(q) !== -1; }).map(tarjeta).join("");
    contenedor.innerHTML = html || "<p>No hay coincidencias.</p>";
  }

  buscador.addEventListener("input", pintar);
  pintar();
})();
