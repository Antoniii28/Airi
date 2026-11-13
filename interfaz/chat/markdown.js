/* ═══ AIRI v0.5 · Markdown seguro para las respuestas del chat ═══════════════
   Dos fases:
   1. analizar(texto)  → estructura de bloques y elementos en línea (datos puros,
      probada en Node).
   2. construir(bloques, documento) → DocumentFragment creado SOLO con
      createElement + textContent. Nunca se usa innerHTML: el HTML que escriba
      Gemini se muestra como texto y no puede ejecutar nada (sin XSS).
   Admite: párrafos, saltos de línea, títulos, **negrita**, *cursiva*, `código`,
   bloques de código, listas (con niveles), citas, tablas simples y separadores.
   Los enlaces [texto](url) se muestran como «texto (url)» SIN ser clicables:
   el chat no busca en internet, así que no están verificados. */
(function (raiz, fabrica) {
  var api = fabrica();
  if (typeof module === "object" && module.exports) module.exports = api;
  else raiz.AIRIMarkdown = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var ESCAPABLES = "\\`*_[]()#+-.!>|~";
  var esAlfanum = function (c) { return !!c && /[0-9A-Za-zÀ-ÿ]/.test(c); };

  // ── Elementos en línea ────────────────────────────────────────────────────
  function enLinea(s) {
    var salida = [], buf = "", i = 0;
    function volcar() { if (buf) { salida.push({ tipo: "texto", texto: buf }); buf = ""; } }
    while (i < s.length) {
      var c = s[i];
      if (c === "\\" && i + 1 < s.length && ESCAPABLES.indexOf(s[i + 1]) >= 0) { buf += s[i + 1]; i += 2; continue; }
      if (c === "`") {
        var fin = s.indexOf("`", i + 1);
        if (fin > i + 1) { volcar(); salida.push({ tipo: "codigo", texto: s.slice(i + 1, fin) }); i = fin + 1; continue; }
      }
      if ((c === "*" || c === "_") && s[i + 1] === c) {
        var cierre = s.indexOf(c + c, i + 2);
        if (cierre > i + 2 && s[i + 2] !== " " && (c === "*" || !esAlfanum(s[i - 1]))) {
          volcar(); salida.push({ tipo: "negrita", hijos: enLinea(s.slice(i + 2, cierre)) }); i = cierre + 2; continue;
        }
      }
      if ((c === "*" || c === "_") && s[i + 1] !== c && s[i + 1] !== " " && s[i + 1] !== undefined &&
          (c === "*" || !esAlfanum(s[i - 1]))) {
        var j = i + 1;
        while (j < s.length) {
          if (s[j] === c && s[j - 1] !== " " && s[j + 1] !== c && (c === "*" || !esAlfanum(s[j + 1]))) break;
          j++;
        }
        if (j < s.length && j > i + 1) {
          volcar(); salida.push({ tipo: "cursiva", hijos: enLinea(s.slice(i + 1, j)) }); i = j + 1; continue;
        }
      }
      if (c === "[") {
        var medio = s.indexOf("](", i + 1), cierreUrl = medio > 0 ? s.indexOf(")", medio + 2) : -1;
        if (medio > i + 1 && cierreUrl > medio + 2 && s.slice(i, cierreUrl).indexOf("\n") < 0) {
          volcar();
          salida.push({ tipo: "enlace", hijos: enLinea(s.slice(i + 1, medio)), url: s.slice(medio + 2, cierreUrl).trim() });
          i = cierreUrl + 1; continue;
        }
      }
      buf += c; i++;
    }
    volcar();
    return salida;
  }

  // ── Bloques ───────────────────────────────────────────────────────────────
  var RE = {
    valla: /^\s*```/,
    titulo: /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/,
    separador: /^\s{0,3}([-*_])(\s*\1){2,}\s*$/,
    lista: /^(\s*)([-*+•]|\d{1,3}[.)])\s+(.*)$/,
    cita: /^\s{0,3}>\s?(.*)$/,
    filaSeparadora: /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/
  };
  function celdas(linea) {
    var t = linea.trim();
    if (t[0] === "|") t = t.slice(1);
    if (t[t.length - 1] === "|") t = t.slice(0, -1);
    return t.split("|").map(function (c) { return enLinea(c.trim()); });
  }
  function iniciaBloque(lineas, k) {
    var l = lineas[k];
    return RE.valla.test(l) || RE.titulo.test(l) || RE.separador.test(l) || RE.lista.test(l) || RE.cita.test(l) ||
      (l.indexOf("|") >= 0 && k + 1 < lineas.length && RE.filaSeparadora.test(lineas[k + 1]));
  }

  function analizar(texto) {
    var lineas = String(texto == null ? "" : texto).replace(/\r\n?/g, "\n").split("\n");
    var bloques = [], k = 0, m;
    while (k < lineas.length) {
      var l = lineas[k];
      if (!l.trim()) { k++; continue; }
      if (RE.valla.test(l)) {
        var codigo = []; k++;
        while (k < lineas.length && !RE.valla.test(lineas[k])) codigo.push(lineas[k++]);
        k++;
        bloques.push({ tipo: "codigo", texto: codigo.join("\n") });
        continue;
      }
      if ((m = RE.titulo.exec(l))) { bloques.push({ tipo: "titulo", nivel: m[1].length, en: enLinea(m[2]) }); k++; continue; }
      if (RE.separador.test(l)) {
        bloques.push({ tipo: "separador" }); k++; continue;
      }
      if (l.indexOf("|") >= 0 && k + 1 < lineas.length && RE.filaSeparadora.test(lineas[k + 1])) {
        var tabla = { tipo: "tabla", cabecera: celdas(l), filas: [] };
        k += 2;
        while (k < lineas.length && lineas[k].indexOf("|") >= 0 && lineas[k].trim()) tabla.filas.push(celdas(lineas[k++]));
        bloques.push(tabla);
        continue;
      }
      if ((m = RE.lista.exec(l))) {
        var lista = { tipo: "lista", ordenada: /\d/.test(m[2]), inicio: parseInt(m[2], 10) || 1, items: [] };
        while (k < lineas.length) {
          var li = RE.lista.exec(lineas[k]);
          if (li) {
            lista.items.push({ nivel: Math.min(3, Math.floor(li[1].replace(/\t/g, "  ").length / 2)), texto: li[3] });
            k++;
          } else if (lineas[k].trim() && /^\s+/.test(lineas[k]) && lista.items.length) {
            lista.items[lista.items.length - 1].texto += " " + lineas[k].trim(); k++;   // continuación
          } else break;
        }
        lista.items = lista.items.map(function (it) { return { nivel: it.nivel, en: enLinea(it.texto) }; });
        bloques.push(lista);
        continue;
      }
      if (RE.cita.test(l)) {
        var cita = [];
        while (k < lineas.length && (m = RE.cita.exec(lineas[k]))) { cita.push(m[1]); k++; }
        bloques.push({ tipo: "cita", en: enLinea(cita.join("\n")) });
        continue;
      }
      var parrafo = [l.trim()]; k++;
      while (k < lineas.length && lineas[k].trim() && !iniciaBloque(lineas, k)) parrafo.push(lineas[k++].trim());
      bloques.push({ tipo: "parrafo", en: enLinea(parrafo.join("\n")) });
    }
    return bloques;
  }

  /** Texto plano sin marcas (útil para lectores, voz o pruebas). */
  function textoPlano(bloques) {
    function linea(e) {
      return e.map(function (x) {
        if (x.tipo === "texto" || x.tipo === "codigo") return x.texto;
        if (x.tipo === "enlace") return linea(x.hijos) + " (" + x.url + ")";
        return linea(x.hijos);
      }).join("");
    }
    return bloques.map(function (b) {
      if (b.tipo === "codigo") return b.texto;
      if (b.tipo === "separador") return "";
      if (b.tipo === "lista") return b.items.map(function (i) { return linea(i.en); }).join("\n");
      if (b.tipo === "tabla") return [b.cabecera].concat(b.filas).map(function (f) { return f.map(linea).join(" | "); }).join("\n");
      return linea(b.en);
    }).join("\n\n");
  }

  // ── Construcción del DOM (solo createElement + textContent) ───────────────
  function construir(bloques, doc) {
    doc = doc || document;
    var frag = doc.createDocumentFragment();
    function el(nombre, clase) { var e = doc.createElement(nombre); if (clase) e.className = clase; return e; }
    function texto(padre, t) {
      var partes = t.split("\n");
      partes.forEach(function (p, i) { if (i) padre.appendChild(el("br")); if (p) padre.appendChild(doc.createTextNode(p)); });
    }
    function linea(padre, elementos) {
      elementos.forEach(function (x) {
        var e;
        if (x.tipo === "texto") return texto(padre, x.texto);
        if (x.tipo === "codigo") { e = el("code"); e.textContent = x.texto; }
        else if (x.tipo === "negrita") { e = el("strong"); linea(e, x.hijos); }
        else if (x.tipo === "cursiva") { e = el("em"); linea(e, x.hijos); }
        else if (x.tipo === "enlace") {
          e = el("span", "airi-md-enlace");
          linea(e, x.hijos);
          var url = el("span", "airi-md-url"); url.textContent = " (" + x.url + ")"; e.appendChild(url);
        }
        padre.appendChild(e);
      });
    }
    bloques.forEach(function (b) {
      var e;
      if (b.tipo === "parrafo") { e = el("p"); linea(e, b.en); }
      else if (b.tipo === "titulo") { e = el(b.nivel <= 2 ? "h4" : "h5", "airi-md-titulo"); linea(e, b.en); }
      else if (b.tipo === "codigo") { e = el("pre"); var c = el("code"); c.textContent = b.texto; e.appendChild(c); }
      else if (b.tipo === "separador") e = el("hr");
      else if (b.tipo === "cita") { e = el("blockquote"); linea(e, b.en); }
      else if (b.tipo === "lista") {
        e = el(b.ordenada ? "ol" : "ul");
        if (b.ordenada && b.inicio !== 1) e.setAttribute("start", String(b.inicio));
        b.items.forEach(function (it) {
          var li = el("li", it.nivel ? "airi-md-nivel-" + it.nivel : "");
          linea(li, it.en); e.appendChild(li);
        });
      } else if (b.tipo === "tabla") {
        e = el("div", "airi-md-tabla");
        var t = el("table"), cab = el("thead"), tr = el("tr");
        b.cabecera.forEach(function (c) { var th = el("th"); th.setAttribute("scope", "col"); linea(th, c); tr.appendChild(th); });
        cab.appendChild(tr); t.appendChild(cab);
        var cuerpo = el("tbody");
        b.filas.forEach(function (f) {
          var fila = el("tr");
          f.forEach(function (c) { var td = el("td"); linea(td, c); fila.appendChild(td); });
          cuerpo.appendChild(fila);
        });
        t.appendChild(cuerpo); e.appendChild(t);
      }
      if (e) frag.appendChild(e);
    });
    return frag;
  }

  function renderizar(textoMarkdown, doc) { return construir(analizar(textoMarkdown), doc); }

  return { analizar: analizar, enLinea: enLinea, construir: construir, renderizar: renderizar, textoPlano: textoPlano };
});
