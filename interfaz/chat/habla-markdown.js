/* ═══ AIRI v0.6 · Texto para hablar a partir del Markdown de Gemini (E2) ═══════
   Convierte la estructura de markdown.js en frases naturales para speechSynthesis:
   - sin símbolos (*, #, |, `, >, guiones de lista);
   - listas → una frase por elemento (numeradas: «Primero, …»);
   - tablas → «Tabla con N filas. Fila 1: Alimento, pellets; Frecuencia, …»;
   - enlaces → solo su texto; direcciones web y bloques de código se omiten con un aviso breve.
   Funciones puras (sin DOM): se prueban en Node. voz.js aplica después sus reemplazos
   (pH → «pe hache», mg/L → «miligramos por litro», etc.). */
(function (raiz, fabrica) {
  var MD = (typeof module === "object" && module.exports) ? require("./markdown.js") : raiz.AIRIMarkdown;
  var api = fabrica(MD);
  if (typeof module === "object" && module.exports) module.exports = api;
  else raiz.AIRIHablaMarkdown = api;
})(typeof window !== "undefined" ? window : globalThis, function (MD) {
  "use strict";
  var ORDINALES = ["Primero", "Segundo", "Tercero", "Cuarto", "Quinto", "Sexto", "Séptimo", "Octavo", "Noveno", "Décimo"];
  var MAX_FILAS = 8;

  function enLinea(elementos) {
    return elementos.map(function (x) {
      if (x.tipo === "texto") return x.texto;
      if (x.tipo === "codigo") return x.texto;
      if (x.tipo === "enlace") return enLinea(x.hijos);        // la dirección no se lee
      return enLinea(x.hijos);
    }).join("");
  }

  /** Limpia lo que no debe pronunciarse y cierra la frase con un punto para que la voz haga pausa. */
  function frase(t) {
    t = String(t || "")
      .replace(/https?:\/\/\S+/g, "un enlace")
      .replace(/(\d)\s*[–—]\s*(\d)/g, "$1 a $2")             // 2–3 → 2 a 3
      .replace(/(^|[^\d-])(\d{1,3})-(\d{1,3})(?![\d-])/g, "$1$2 a $3")   // 2-3 → 2 a 3 (no fechas 2026-11-12)
      .replace(/\s*[–—]\s*/g, ", ")                         // guion largo → pausa
      .replace(/[*_`#|>~]+/g, " ")                          // marcas sueltas que no son formato
      .replace(/\s*\n\s*/g, ". ")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (!t) return "";
    return /[.!?:;…]$/.test(t) ? t : t + ".";
  }

  function bloqueAVoz(b) {
    if (b.tipo === "parrafo" || b.tipo === "titulo") return frase(enLinea(b.en));
    if (b.tipo === "cita") return frase("Cita: " + enLinea(b.en));
    if (b.tipo === "codigo") return "Hay un fragmento de código que puedes ver en pantalla.";
    if (b.tipo === "separador") return "";
    if (b.tipo === "lista") {
      var n = 0;
      return b.items.map(function (it) {
        var t = enLinea(it.en);
        if (b.ordenada && it.nivel === 0) {
          var k = n++;
          var ord = k < ORDINALES.length ? ORDINALES[k] : "Punto " + (b.inicio + k);
          return frase(ord + ", " + t.charAt(0).toLowerCase() + t.slice(1));
        }
        return frase(t);
      }).join(" ");
    }
    if (b.tipo === "tabla") {
      var cab = b.cabecera.map(enLinea);
      var filas = b.filas.slice(0, MAX_FILAS).map(function (f, i) {
        var celdas = f.map(function (c, j) {
          var valor = enLinea(c).trim();
          return valor ? (cab[j] ? cab[j].trim() + ", " + valor : valor) : "";
        }).filter(Boolean);
        return frase("Fila " + (i + 1) + ": " + celdas.join("; "));
      });
      var resto = b.filas.length - MAX_FILAS;
      return [frase("Tabla con " + b.filas.length + (b.filas.length === 1 ? " fila" : " filas"))].concat(filas)
        .concat(resto > 0 ? [frase("Y " + resto + (resto === 1 ? " fila más" : " filas más") + "; puedes verlas en pantalla")] : [])
        .join(" ");
    }
    return "";
  }

  /** Texto listo para speechSynthesis a partir de la respuesta en Markdown. */
  function paraVoz(markdown) {
    return MD.analizar(markdown).map(bloqueAVoz).filter(Boolean).join(" ").replace(/\s{2,}/g, " ").trim();
  }

  return { paraVoz: paraVoz, frase: frase, MAX_FILAS: MAX_FILAS };
});
