/* ═══ AIRI · Integración del motor de análisis v0.4 con «Parámetros del agua» ═══
   - No sustituye la validación de formato del prototipo: se ejecuta DESPUÉS de ella
     y añade, debajo, el análisis con referencias documentadas (motor airi-motor.js).
   - Prepara el mensaje que la mascota mostrará y leerá (estado «alerta» con tono
     serio si hay anomalías; R4 conserva anomalías y datos insuficientes).
   - Si el motor no carga o falla, el prototipo y la mascota siguen como en v0.3.
   AIRI no diagnostica, no garantiza condiciones seguras y no ejecuta acciones. */
(function () {
  "use strict";
  var Motor = window.AIRIMotor;
  if (!Motor || !document.body) return;

  var M = window.AIRIMascota, Ayuda = window.AIRIAyuda;
  var FUENTES = (Motor.datos.fuentes && Motor.datos.fuentes.fuentes) || {};
  var PROTOTIPO = [   // mismo orden y unidades que los campos #p0…#p5 del prototipo
    ["temperatura", "Temperatura", "°C"], ["ph", "pH", "pH"], ["salinidad", "Salinidad", "ppt"],
    ["amoniaco", "Amoníaco total", "mg/L (NH₃/NH₄⁺ total)"], ["nitritos", "Nitritos", "mg/L (NO₂⁻)"],
    ["nitratos", "Nitratos", "mg/L (NO₃⁻)"]
  ];
  var SEV_CORTA = {
    alerta_alta: "por encima del valor de referencia",
    fuera_de_referencia: "fuera de la referencia",
    revision_recomendada: "conviene revisarlo",
    presencia_detectable: "detectable"
  };
  var ETIQUETA_ESTADO = { EP1: "Falta el dato", EP2: "Valor inválido", EP3: "Sin referencia para evaluar",
                          EP4: "Dentro de la referencia", EP5: "Fuera de la referencia" };
  var TITULO_RESULTADO = { R1: "Dentro de las referencias evaluadas", R2: "Hay valores que conviene revisar",
                           R3: "Información insuficiente", R4: "Hay valores que conviene revisar y datos insuficientes" };

  var safe = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  function lista(e) {
    var l = (e || []).filter(Boolean);
    if (l.length <= 1) return l.join("");
    return l.slice(0, -1).join(", ") + " y " + l[l.length - 1];
  }
  function plural(n, uno, varios) { return n === 1 ? uno : varios; }

  // ── Lectura del formulario del prototipo ──────────────────────────────────
  function leerFormulario() {
    var mediciones = {};
    PROTOTIPO.forEach(function (p, i) {
      var campo = document.getElementById("p" + i);
      mediciones[p[0]] = { valor: campo ? campo.value : "", unidad: p[2] };
    });
    return mediciones;
  }

  // ── Mensaje de la mascota a partir del informe REAL del motor ─────────────
  function mensajeMascota(inf) {
    var por = { EP1: [], EP2: [], EP3: [], EP4: [], EP5: [] };
    inf.resultados.forEach(function (r) { por[r.estado].push(r.nombre); });
    var partes = [], estado, tipo;
    if (inf.A) {
      estado = "alerta"; tipo = "advertencia";
      var n = inf.alertas.length;
      partes.push("Comparé las mediciones con las referencias documentadas y " +
        plural(n, "hay un valor que conviene revisar: ", "hay " + n + " valores que conviene revisar: ") +
        lista(inf.alertas.map(function (a) { return a.nombre + " (" + SEV_CORTA[a.severidad] + ")"; })) + ".");
      partes.push("Te sugiero repetir " + plural(n, "esa medición", "esas mediciones") +
        " antes de decidir nada; debajo del formulario explico cada caso con sus fuentes.");
      if (por.EP2.length) partes.push("También " + plural(por.EP2.length, "hay un valor inválido en ", "hay valores inválidos en ") + lista(por.EP2) + ".");
      if (por.EP1.length) partes.push("Además " + plural(por.EP1.length, "falta el dato de ", "faltan los datos de ") + lista(por.EP1) + ".");
    } else if (por.EP2.length) {
      estado = "error"; tipo = "error";
      partes.push(plural(por.EP2.length, "Hay un valor inválido en ", "Hay valores inválidos en ") + lista(por.EP2) +
        ". Revisa " + plural(por.EP2.length, "ese campo", "esos campos") + ".");
      if (por.EP1.length) partes.push("También " + plural(por.EP1.length, "falta ", "faltan ") + lista(por.EP1) + ".");
    } else if (por.EP1.length) {
      estado = "insuficiente"; tipo = "advertencia";
      partes.push("Información insuficiente: " + plural(por.EP1.length, "falta el dato de ", "faltan los datos de ") +
        lista(por.EP1) + ". Esto no es una alerta del acuario; solo indica que la validación está incompleta.");
    } else {
      estado = "insuficiente"; tipo = "advertencia";
      partes.push("Los datos tienen un formato válido y los comparé con las referencias documentadas.");
    }
    if (!inf.A && por.EP4.length) {
      partes.push(lista(por.EP4) + plural(por.EP4.length, " está", " están") + " dentro de la referencia.");
    }
    if (por.EP3.length) {
      partes.push("No evalúo " + lista(por.EP3) + " porque " + plural(por.EP3.length, "no tiene", "no tienen") +
        " una referencia verificada.");
    }
    partes.push(inf.A ? "No es un diagnóstico." : "Esto no garantiza que el agua sea adecuada.");
    return { estado: estado, tipo: tipo, texto: partes.join(" "), clasificacion: inf.clasificacion };
  }

  // ── Panel del análisis ────────────────────────────────────────────────────
  function enlacesFuentes(ids) {
    if (!ids || !ids.length) return "";
    return '<span class="airi-a-fuentes">Fuentes: ' + ids.map(function (id) {
      var f = FUENTES[id];
      if (!f) return safe(id);
      return '<a href="' + safe(f.url) + '" target="_blank" rel="noopener noreferrer">' + safe(f.titulo) + "</a>" +
        ' <span class="airi-a-nivel">(nivel ' + safe(f.nivel) + ")</span>";
    }).join("; ") + "</span>";
  }
  /** Valor tal como se capturó y, si cambia al convertir, su equivalencia en la unidad canónica. */
  function valorTexto(r) {
    if (r.valor_original === null || String(r.valor_original).trim() === "") return { capturado: "—", canonico: "" };
    var capturado = String(r.valor_original).trim() + (r.unidad_original ? " " + r.unidad_original : "");
    var v = r.valor_canonico;
    if (v === null) return { capturado: capturado, canonico: "" };
    var fmt = function (x) { return Motor.fmtG(x); };
    var canonico = (Array.isArray(v) ? fmt(v[0]) + "–" + fmt(v[1]) : fmt(v)) + " " + r.unidad_canonica;
    var mismo = !Array.isArray(v) && Motor.leerNumero(r.valor_original) === v && r.unidad_original === r.unidad_canonica;
    return { capturado: capturado, canonico: mismo ? "" : canonico };
  }
  function chip(r) {
    var clase = r.severidad ? "airi-a-sev-" + r.severidad : "airi-a-" + r.estado;
    var texto = r.severidad ? Motor.SEVERIDADES[r.severidad].nombre : ETIQUETA_ESTADO[r.estado];
    return '<span class="airi-a-chip ' + clase + '">' + safe(texto) + "</span>";
  }
  function rutaGrafo(inf, parametro) {
    var pasos = inf.traza.filter(function (t) { return t.parametro === parametro && t.de !== "E0"; });
    return pasos.map(function (t) { return t.de + (t.etiqueta === "V" || t.etiqueta === "F" ? " " + t.etiqueta : ""); })
      .join(" → ") + (pasos.length ? " → C1" : "");
  }

  function renderizar(inf) {
    var h = [];
    h.push('<section class="airi-a" aria-labelledby="airi-a-titulo" data-clasificacion="' + inf.clasificacion + '">');
    h.push('<h3 id="airi-a-titulo">Análisis con referencias documentadas</h3>');
    h.push('<p class="airi-a-perfil"><strong>Perfil:</strong> ' + safe(inf.perfil.nombre) + ". " + safe(inf.perfil.aplica_a) + "</p>");
    h.push('<div class="airi-a-resumen airi-a-' + inf.clasificacion + '"><strong>' + safe(TITULO_RESULTADO[inf.clasificacion]) +
      ' <span class="airi-a-codigo">(' + inf.clasificacion + ")</span></strong><br>" + safe(inf.resumen) + "</div>");
    if (inf.alertas.length) {
      h.push("<h4>Valores que conviene revisar</h4><ul class=\"airi-a-lista\">");
      inf.alertas.forEach(function (a, i) {
        var r = inf.resultados.filter(function (x) { return x.parametro === a.parametro; })[0];
        h.push('<li class="airi-a-alerta" data-parametro="' + a.parametro + '">' + chip(r) + " <strong>" + safe(a.nombre) +
          "</strong>: " + safe(a.motivo) + '<br><span class="airi-a-sugerencia"><strong>Sugerencia (informativa):</strong> ' +
          safe(inf.recomendaciones[i].texto) + "</span><br>" + enlacesFuentes(a.fuentes) + "</li>");
      });
      h.push("</ul>");
    }
    if (inf.solicitudes.length) {
      h.push("<h4>Datos que faltan o no se pueden evaluar</h4><ul class=\"airi-a-lista\">");
      inf.solicitudes.forEach(function (s) {
        h.push('<li class="airi-a-solicitud airi-a-sol-' + s.tipo + '" data-parametro="' + s.parametro + '">' + safe(s.texto) + "</li>");
      });
      h.push("</ul>");
    }
    h.push('<h4>Detalle por parámetro</h4><div class="airi-a-parametros">');
    inf.resultados.forEach(function (r) {
      h.push('<article class="airi-a-param" data-parametro="' + r.parametro + '" data-estado="' + r.estado + '">');
      h.push('<div class="airi-a-param-cabecera"><strong>' + safe(r.nombre) + "</strong> " + chip(r) + "</div>");
      var vt = valorTexto(r);
      h.push('<p class="airi-a-valor">' + safe(vt.capturado) + "</p>");
      if (vt.canonico) h.push('<p class="airi-a-equivalencia">Equivale a <strong>' + safe(vt.canonico) + "</strong></p>");
      h.push('<p class="airi-a-motivo">' + safe(r.motivo) + "</p>");
      r.notas.forEach(function (n) { h.push('<p class="airi-a-nota">' + safe(n) + "</p>"); });
      if (r.estado === "EP4" || r.estado === "EP5") h.push("<p>" + enlacesFuentes(r.fuentes) + "</p>");
      if (r.contexto && r.contexto.length) {
        h.push('<details class="airi-a-contexto"><summary>Contexto científico (no se usa para evaluar)</summary><ul>');
        r.contexto.forEach(function (c) {
          var ids = Array.isArray(c.fuente) ? c.fuente : [c.fuente];
          h.push("<li>" + safe(c.texto) + " " + enlacesFuentes(ids) + "</li>");
        });
        h.push("</ul></details>");
      }
      h.push('<p class="airi-a-ruta" title="Recorrido por el grafo de decisiones">Grafo: ' + safe(rutaGrafo(inf, r.parametro)) + "</p>");
      h.push("</article>");
    });
    h.push("</div>");
    var q7 = inf.traza.filter(function (t) { return t.de === "Q7"; })[0];
    var salidas = inf.traza.filter(function (t) { return t.de === inf.clasificacion; })
      .map(function (t) { return t.a === "FIN" ? "FIN" : t.a + " «" + t.etiqueta + "»"; });
    h.push('<p class="airi-a-ruta">Decisión global: C1 → Q7 (' + safe(q7 ? q7.etiqueta : "") + ") → " + inf.clasificacion +
      " → " + safe(salidas.join(" y ")) + (salidas[0] === "FIN" ? "" : " → FIN") + "</p>");
    h.push('<p class="airi-a-aviso">' + safe(inf.aviso) + "</p>");
    h.push("</section>");
    return h.join("");
  }

  // ── Conexión con el formulario ────────────────────────────────────────────
  var api = { ultimo: null, mensajeMascota: mensajeMascota, renderizar: renderizar, leerFormulario: leerFormulario };
  window.airiAnalisis = api;

  var boton = document.getElementById("evaluar");
  var limpiar = document.getElementById("limpiar");
  var resultado = document.getElementById("resultado");
  if (boton && resultado) {
    boton.addEventListener("click", function () {   // se registra después del del prototipo: corre a continuación
      api.ultimo = null;
      try {
        var origen = document.getElementById("origen");
        var inf = Motor.evaluar(leerFormulario(), null, origen ? origen.value : null);
        api.ultimo = { informe: inf, mensaje: mensajeMascota(inf) };
        var contenedor = document.createElement("div");
        contenedor.className = "airi-a-contenedor";
        contenedor.innerHTML = renderizar(inf);
        resultado.appendChild(contenedor);
        document.dispatchEvent(new CustomEvent("airi:analisis", { detail: inf }));
      } catch (error) {
        if (window.console) console.warn("AIRI: el análisis con referencias no pudo completarse; la validación de formato sigue disponible.", error);
        var aviso = document.createElement("p");
        aviso.className = "airi-a-fallo";
        aviso.textContent = "No se pudo completar el análisis con referencias. La validación de formato anterior sigue siendo válida.";
        resultado.appendChild(aviso);
      }
    });
  }
  if (limpiar) limpiar.addEventListener("click", function () { api.ultimo = null; });

  // ── Textos de la mascota y la ayuda que v0.4 vuelve inexactos ─────────────
  // Solo se actualizan si el motor está cargado; sin motor siguen los de v0.3.
  if (M && M.MENSAJES_PESTANA) {
    M.MENSAJES_PESTANA.inicio.texto = "¡Hola! Soy AIRI, el agente de este acuario marino. En esta versión de prueba comparo " +
      "tus mediciones con referencias documentadas y te explico lo que encuentro; no observo un acuario real ni hago diagnósticos.";
    M.MENSAJES_PESTANA.agua.texto = "Escribe las mediciones y pulsa «Validar entradas». Reviso el formato y comparo el pH, " +
      "el amoníaco total y los nitritos con referencias documentadas; temperatura, salinidad y nitratos aún no tienen una " +
      "referencia verificada.";
    if (M.MENSAJE_ANALISIS) M.MENSAJE_ANALISIS.texto = "Revisando el formato y las referencias documentadas…";
  }
  if (Ayuda && Ayuda.RESPUESTAS) {
    var R = Ayuda.RESPUESTAS;
    if (R.proyecto) R.proyecto.texto = "Soy AIRI, el Agente Inteligente para la Supervisión y Gestión de un Acuario Marino. " +
      "En esta versión de prueba te guío por la interfaz, reviso que las mediciones estén completas y tengan formato válido, " +
      "y comparo el pH, el amoníaco total y los nitritos con referencias veterinarias documentadas. Temperatura, salinidad y " +
      "nitratos todavía no tienen una referencia verificada, así que no los evalúo. No diagnostico enfermedades, no garantizo " +
      "que el agua sea segura, no evalúo compatibilidad entre especies y no identifico peces por fotografía. Las decisiones " +
      "sobre el acuario siempre las toma una persona.";
    if (R.agua) R.agua.texto = "En Parámetros del agua escribe seis valores: temperatura en °C, pH, salinidad en ppt, " +
      "amoníaco total en mg/L, nitritos en mg/L y nitratos en mg/L. Indica si los datos son manuales o simulados y pulsa " +
      "«Validar entradas». Primero reviso si falta algún dato o si hay valores inválidos; después comparo el pH, el amoníaco " +
      "total y los nitritos con las referencias del Manual Veterinario MSD y te muestro el resultado con sus fuentes. " +
      "Temperatura, salinidad y nitratos aparecen «sin referencia»: no los evalúo hasta que haya una referencia verificada. " +
      "Que un valor esté dentro de la referencia no garantiza que el agua sea adecuada.";
    if (R.futuro) R.futuro.texto = "Ya funcionan la navegación, la validación de las mediciones, la comparación del pH, el " +
      "amoníaco total y los nitritos con referencias documentadas, el buscador de fichas, esta mascota y su voz. Están " +
      "planeadas, pero todavía no disponibles: referencias verificadas para temperatura, salinidad y nitratos, la evaluación " +
      "de compatibilidad entre especies, la identificación probable de peces por fotografía con tu permiso y confirmación " +
      "humana, y una posible aplicación móvil.";
  }
})();
