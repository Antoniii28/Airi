/* ═══ AIRI · Evaluador orientativo de compatibilidad entre especies v0.1 ═══════
   Responsable: Yair (rama equipo/yair-compatibilidad). Contrato: compatibilidad/CONTRATO.md

   Compara las fichas del catálogo (especies/datos/catalogo_inicial.json, de Brayan)
   con criterios EXPLÍCITOS y devuelve un resultado explicable: estado orientativo,
   motivos con fuentes, contradicciones y datos faltantes.

   Principios (documentacion/02_normativa_basica.md F-05, F-06; guía de Yair):
   - La ausencia de información NUNCA equivale a compatibilidad: sin evidencia → «sin_datos».
   - Compartir rangos de agua o el mismo ambiente NO prueba compatibilidad.
   - «compatible» exige evidencia positiva con fuente (relación declarada en la ficha) y
     ningún hallazgo en contra; ante evidencia contradictoria prevalece lo más restrictivo.
   - No modifica el catálogo ni el informe del motor; no recalcula las reglas del agua.
   Sin dependencias; funciona con file://, en el navegador (window.AIRICompatibilidad) y en Node. */
(function (raiz, fabrica) {
  var api = fabrica();
  if (typeof module === "object" && module.exports) module.exports = api;
  else raiz.AIRICompatibilidad = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var VERSION = "0.1.0";

  // Nombres de estado PROPUESTOS (pendientes de aprobación del equipo). Si el equipo los cambia,
  // solo se edita esta tabla: el resto del módulo usa las claves internas.
  var ESTADOS = { COMPATIBLE: "compatible", PRECAUCION: "precaucion", INCOMPATIBLE: "incompatible", SIN_DATOS: "sin_datos" };
  var ETIQUETAS = {
    compatible: "Compatible (orientativo)",
    precaucion: "Precaución",
    incompatible: "Incompatible",
    sin_datos: "Información insuficiente"
  };
  // Mayor número = más restrictivo. Sirve para combinar resultados.
  var GRAVEDAD = { compatible: 0, sin_datos: 1, precaucion: 2, incompatible: 3 };

  var CRITERIOS = {
    especie: "Especie en el catálogo",
    temperatura: "Rangos de temperatura",
    ph: "Rangos de pH",
    temperamento: "Temperamento",
    territorialidad: "Territorialidad",
    misma_especie: "Varios ejemplares de la misma especie",
    relacion: "Convivencia declarada en la ficha",
    volumen: "Volumen del acuario",
    arrecife: "Acuario de arrecife",
    agua_temperatura: "Temperatura medida",
    agua_ph: "pH medido",
    agua_salinidad: "Salinidad medida"
  };

  var AVISO = "Evaluación orientativa basada en las fichas y fuentes del catálogo. No garantiza la convivencia ni el " +
    "bienestar de los organismos; la falta de datos nunca equivale a compatibilidad. Las decisiones sobre introducir " +
    "animales las toma una persona.";

  // ── Utilidades ───────────────────────────────────────────────────────────────
  function esObjeto(x) { return x !== null && typeof x === "object" && !Array.isArray(x); }
  function esNumero(x) { return typeof x === "number" && isFinite(x); }
  function lista(x) { return Array.isArray(x) ? x.slice() : []; }
  function fmt(n) { return esNumero(n) ? String(Math.round(n * 100) / 100) : "?"; }
  function peor(a, b) { return GRAVEDAD[a] >= GRAVEDAD[b] ? a : b; }
  function obtener(obj, ruta) {
    var x = obj;
    for (var i = 0; i < ruta.length; i++) { if (!esObjeto(x)) return undefined; x = x[ruta[i]]; }
    return x;
  }

  // ── Adaptador de ficha ───────────────────────────────────────────────────────
  // Único punto que conoce el esquema de Brayan (catálogo v0.5, bloque «ficha_airi» y campos
  // completos). Si el esquema cambia, solo se ajusta esta función. Campo ausente o vacío → null.
  function rango(r, claveMin, claveMax, fuentes, confianza) {
    if (!esObjeto(r) || !esNumero(r[claveMin]) || !esNumero(r[claveMax]) || r[claveMin] > r[claveMax]) return null;
    return { min: r[claveMin], max: r[claveMax], fuentes: lista(fuentes || r.fuentes), confianza: confianza || r.confianza || null };
  }
  function dato(campo, clave) {
    if (!esObjeto(campo) || campo[clave] === null || campo[clave] === undefined || campo[clave] === "") return null;
    return { valor: campo[clave], fuentes: lista(campo.fuentes), confianza: campo.confianza || null };
  }

  function normalizarFicha(e) {
    var fa = esObjeto(e.ficha_airi) ? e.ficha_airi : {};
    var cient = e.nombre_cientifico || fa.nombre_cientifico || null;
    var ph = esObjeto(e.ph) ? e.ph : null;
    var etiquetas = esObjeto(fa.comportamiento) && Array.isArray(fa.comportamiento.etiquetas) && fa.comportamiento.etiquetas.length
      ? { valor: fa.comportamiento.etiquetas.slice(), fuentes: lista(fa.comportamiento.fuentes), confianza: fa.comportamiento.confianza || null }
      : null;
    var conv = esObjeto(e.convivencia) ? e.convivencia : {};
    return {
      id: e.id,
      nombre_comun: e.nombre_comun || fa.nombre_comun || null,
      nombre_cientifico: cient,
      genero: typeof cient === "string" ? cient.trim().split(/\s+/)[0] : null,
      familia: obtener(e, ["taxonomia", "familia"]) || null,
      grupo: e.grupo || fa.grupo || null,
      temperatura: rango(fa.temperatura_c, "min", "max"),
      ph: ph ? rango(ph.acuario, "min", "max", obtener(ph, ["acuario", "fuentes"]), ph.confianza) : null,
      temperamento: dato(fa.temperamento, "valor"),
      etiquetas: etiquetas,
      arrecife: dato(fa.adecuado_arrecife, "valor"),
      volumen_min_l: dato(fa.litraje_recomendado_l, "min"),
      tamano_max_cm: dato(fa.tamano_adulto_cm, "max"),
      // Propuesta de ampliación para Brayan (ver CONTRATO.md §5): relaciones estructuradas.
      relaciones: Array.isArray(conv.relaciones) ? conv.relaciones.filter(esObjeto) : [],
      convivencia_texto: { condiciones: lista(conv.condiciones), riesgos: lista(conv.riesgos), fuentes: lista(conv.fuentes) }
    };
  }

  // ── Hallazgos ────────────────────────────────────────────────────────────────
  function hallazgo(criterio, efecto, texto, fuentes, confianza) {
    return { criterio: criterio, nombre: CRITERIOS[criterio], efecto: efecto, texto: texto,
      fuentes: lista(fuentes), confianza: confianza || null };
  }
  function nombre(f) { return f.nombre_comun || f.nombre_cientifico || f.id; }
  function unir() {
    var vistos = {}, out = [];
    for (var i = 0; i < arguments.length; i++) {
      lista(arguments[i]).forEach(function (x) { if (!vistos[x]) { vistos[x] = true; out.push(x); } });
    }
    return out;
  }
  function confianzaMin(a, b) {
    var orden = { baja: 0, media: 1, alta: 2 };
    if (!a) return b || null; if (!b) return a;
    return orden[a] <= orden[b] ? a : b;
  }

  // Solapamiento de rangos documentados. Sin solapamiento → incompatible (necesidades ambientales
  // documentadas que no pueden cumplirse a la vez). Con solapamiento → solo «sin conflicto».
  function compararRangos(criterio, a, b, ra, rb, unidad, faltantes) {
    if (!ra || !rb) {
      if (!ra) faltantes.push({ especie: a.id, campo: criterio });
      if (!rb) faltantes.push({ especie: b.id, campo: criterio });
      return null;
    }
    var lo = Math.max(ra.min, rb.min), hi = Math.min(ra.max, rb.max);
    var fuentes = unir(ra.fuentes, rb.fuentes), conf = confianzaMin(ra.confianza, rb.confianza);
    var detalle = nombre(a) + ": " + fmt(ra.min) + "–" + fmt(ra.max) + " " + unidad + "; " +
      nombre(b) + ": " + fmt(rb.min) + "–" + fmt(rb.max) + " " + unidad + ".";
    if (lo > hi) {
      return hallazgo(criterio, ESTADOS.INCOMPATIBLE, "Los rangos documentados no se solapan. " + detalle, fuentes, conf);
    }
    return hallazgo(criterio, "sin_conflicto", "Los rangos documentados coinciden entre " + fmt(lo) + " y " + fmt(hi) + " " +
      unidad + ". " + detalle + " Compartir rango no demuestra que puedan convivir.", fuentes, conf);
  }

  // ¿La relación declarada en la ficha de «origen» aplica a la especie «otra»?
  function seleccionar(sel, otra, mismaEspecie) {
    if (!esObjeto(sel)) return false;
    if (sel.misma_especie === true) return mismaEspecie;
    if (mismaEspecie && sel.id === undefined) return false;
    var claves = ["id", "genero", "familia", "grupo", "temperamento"], alguna = false;
    for (var i = 0; i < claves.length; i++) {
      var k = claves[i];
      if (sel[k] === undefined) continue;
      alguna = true;
      var valor = k === "temperamento" ? (otra.temperamento && otra.temperamento.valor) : otra[k];
      var permitidos = Array.isArray(sel[k]) ? sel[k] : [sel[k]];
      if (valor === null || valor === undefined || permitidos.indexOf(valor) < 0) return false;
    }
    return alguna;
  }
  var EFECTOS_RELACION = ["compatible", "precaucion", "incompatible"];
  function relaciones(origen, otra, mismaEspecie) {
    var out = [];
    origen.relaciones.forEach(function (r) {
      if (EFECTOS_RELACION.indexOf(r.efecto) < 0 || !seleccionar(r.con, otra, mismaEspecie)) return;
      if (!Array.isArray(r.fuentes) || !r.fuentes.length) return; // sin fuente no cuenta como evidencia
      var efecto = ESTADOS[{ compatible: "COMPATIBLE", precaucion: "PRECAUCION", incompatible: "INCOMPATIBLE" }[r.efecto]];
      out.push(hallazgo("relacion", efecto, "Ficha de " + nombre(origen) + ": " + (r.motivo || "relación declarada sin motivo.") +
        (mismaEspecie ? "" : " (aplica a " + nombre(otra) + ")"), r.fuentes, r.confianza));
    });
    return out;
  }

  function NO_PACIFICO(f) { return f.temperamento && f.temperamento.valor !== "pacifico"; }
  function tieneEtiqueta(f, et) { return !!(f.etiquetas && f.etiquetas.valor.indexOf(et) >= 0); }

  // Combina hallazgos en un estado. «compatible» solo con evidencia positiva, datos esenciales y nada en contra.
  function decidir(hallazgos, esenciales) {
    var negativos = hallazgos.filter(function (h) { return h.efecto === ESTADOS.INCOMPATIBLE || h.efecto === ESTADOS.PRECAUCION; });
    var positivos = hallazgos.filter(function (h) { return h.efecto === ESTADOS.COMPATIBLE; });
    var contradiccion = positivos.length > 0 && negativos.length > 0;
    var estado;
    if (negativos.length) estado = negativos.reduce(function (e, h) { return peor(e, h.efecto); }, ESTADOS.PRECAUCION);
    else if (positivos.length && esenciales) estado = ESTADOS.COMPATIBLE;
    else estado = ESTADOS.SIN_DATOS;
    return { estado: estado, contradiccion: contradiccion };
  }

  function resumen(estado, contradiccion, hallazgos, faltantes) {
    var neg = hallazgos.filter(function (h) { return h.efecto === estado; }).map(function (h) { return h.nombre.toLowerCase(); });
    var base;
    if (estado === ESTADOS.INCOMPATIBLE) base = "Incompatible según: " + unir(neg).join(", ") + ".";
    else if (estado === ESTADOS.PRECAUCION) base = "Requiere precaución por: " + unir(neg).join(", ") + ".";
    else if (estado === ESTADOS.COMPATIBLE) base = "Compatible de forma orientativa: hay convivencia declarada con fuente y no se detectaron conflictos.";
    else base = faltantes.length
      ? "Información insuficiente: faltan datos para evaluar."
      : "Información insuficiente: no se detectaron conflictos, pero ninguna fuente confirma que puedan convivir.";
    if (contradiccion) base += " Hay evidencia contradictoria: se aplica el resultado más restrictivo y conviene revisarlo.";
    return base;
  }

  // ── Par de especies (o varios ejemplares de una misma especie) ──────────────
  function evaluarPar(a, b, cantidadA) {
    var misma = a.id === b.id, h = [], falt = [];
    if (!misma) {
      var t = compararRangos("temperatura", a, b, a.temperatura, b.temperatura, "°C", falt); if (t) h.push(t);
      var p = compararRangos("ph", a, b, a.ph, b.ph, "pH", falt); if (p) h.push(p);

      if (!a.temperamento) falt.push({ especie: a.id, campo: "temperamento" });
      if (!b.temperamento) falt.push({ especie: b.id, campo: "temperamento" });
      if (a.temperamento && b.temperamento) {
        var agresivo = NO_PACIFICO(a) ? a : (NO_PACIFICO(b) ? b : null);
        var pacifico = agresivo === a ? b : a;
        if (agresivo && !NO_PACIFICO(pacifico)) {
          h.push(hallazgo("temperamento", ESTADOS.PRECAUCION, nombre(agresivo) + " figura como «" + agresivo.temperamento.valor +
            "» y " + nombre(pacifico) + " como «pacifico»" + tamanos(agresivo, pacifico) + ". Puede haber hostigamiento.",
            unir(a.temperamento.fuentes, b.temperamento.fuentes), confianzaMin(a.temperamento.confianza, b.temperamento.confianza)));
        } else {
          h.push(hallazgo("temperamento", "sin_conflicto", "Temperamentos documentados: " + nombre(a) + " «" + a.temperamento.valor +
            "», " + nombre(b) + " «" + b.temperamento.valor + "».", unir(a.temperamento.fuentes, b.temperamento.fuentes),
            confianzaMin(a.temperamento.confianza, b.temperamento.confianza)));
        }
        if (tieneEtiqueta(a, "territorial") && tieneEtiqueta(b, "territorial") && (NO_PACIFICO(a) || NO_PACIFICO(b))) {
          h.push(hallazgo("territorialidad", ESTADOS.PRECAUCION, "Ambas especies figuran como territoriales y al menos una no es " +
            "pacífica: pueden disputarse refugios.", unir(a.etiquetas.fuentes, b.etiquetas.fuentes),
            confianzaMin(a.etiquetas.confianza, b.etiquetas.confianza)));
        }
      }
      h = h.concat(relaciones(a, b, false), relaciones(b, a, false));
    } else {
      // Varios ejemplares de la misma especie: solo cuenta lo que dice su ficha.
      if (!a.etiquetas) falt.push({ especie: a.id, campo: "comportamiento" });
      if (tieneEtiqueta(a, "solitario") || tieneEtiqueta(a, "territorial")) {
        var ets = ["solitario", "territorial"].filter(function (x) { return tieneEtiqueta(a, x); });
        h.push(hallazgo("misma_especie", ESTADOS.PRECAUCION, "Se piden " + cantidadA + " ejemplares de " + nombre(a) +
          ", que figura como " + ets.join(" y ") + ".", a.etiquetas.fuentes, a.etiquetas.confianza));
      }
      h = h.concat(relaciones(a, a, true));
    }
    var esenciales = misma ? !!a.etiquetas
      : !!(a.temperatura && b.temperatura && a.temperamento && b.temperamento);
    var d = decidir(h, esenciales);
    return { especies: [a.id, b.id], estado: d.estado, etiqueta: ETIQUETAS[d.estado], contradiccion: d.contradiccion,
      resumen: resumen(d.estado, d.contradiccion, h, falt), motivos: h, datos_faltantes: falt };
  }

  function tamanos(x, y) {
    if (!x.tamano_max_cm || !y.tamano_max_cm) return "";
    return " (tamaño adulto máx.: " + fmt(x.tamano_max_cm.valor) + " cm y " + fmt(y.tamano_max_cm.valor) + " cm)";
  }

  function noEncontrada(ids) {
    var h = [hallazgo("especie", ESTADOS.SIN_DATOS, "No se encontró en el catálogo: " + ids.join(", ") + ".", [], null)];
    return { especies: ids.length === 1 ? [ids[0], ids[0]] : ids, estado: ESTADOS.SIN_DATOS, etiqueta: ETIQUETAS.sin_datos,
      contradiccion: false, resumen: "Información insuficiente: especie no encontrada en el catálogo.", motivos: h,
      datos_faltantes: ids.map(function (id) { return { especie: id, campo: "ficha" }; }) };
  }

  // ── Especie frente al acuario ────────────────────────────────────────────────
  function compararMedida(criterio, f, r, cond, unidad, h, falt) {
    if (!cond || !cond.disponible) { falt.push({ especie: null, campo: "acuario.condiciones." + criterio.replace("agua_", "") }); return; }
    if (!r) { falt.push({ especie: f.id, campo: criterio.replace("agua_", "") }); return; }
    var valores = Array.isArray(cond.valor) ? cond.valor : [cond.valor];
    if (!valores.every(esNumero)) { falt.push({ especie: null, campo: "acuario.condiciones." + criterio.replace("agua_", "") }); return; }
    var fuera = valores.some(function (v) { return v < r.min || v > r.max; });
    var nota = cond.estado === "EP3" ? " El motor de agua no evalúa este parámetro; la comparación usa la fuente de la ficha." : "";
    var medido = valores.length === 2 ? fmt(valores[0]) + "–" + fmt(valores[1]) : fmt(valores[0]);
    h.push(hallazgo(criterio, fuera ? ESTADOS.PRECAUCION : "sin_conflicto", "Medido: " + medido + " " + unidad +
      "; rango de la ficha de " + nombre(f) + ": " + fmt(r.min) + "–" + fmt(r.max) + " " + unidad + "." +
      (fuera ? " Está fuera del rango documentado." : "") + nota, r.fuentes, r.confianza));
  }

  function evaluarEnAcuario(f, acuario) {
    var h = [], falt = [];
    // Volumen
    if (!esNumero(acuario.volumen_l) || acuario.volumen_l <= 0) falt.push({ especie: null, campo: "acuario.volumen_l" });
    else if (!f.volumen_min_l || !esNumero(f.volumen_min_l.valor)) falt.push({ especie: f.id, campo: "volumen_minimo" });
    else {
      var bajo = acuario.volumen_l < f.volumen_min_l.valor;
      h.push(hallazgo("volumen", bajo ? ESTADOS.PRECAUCION : "sin_conflicto", "Acuario: " + fmt(acuario.volumen_l) + " L; mínimo orientativo de " +
        nombre(f) + ": " + fmt(f.volumen_min_l.valor) + " L." + (bajo ? " Está por debajo del mínimo documentado." : ""),
        f.volumen_min_l.fuentes, f.volumen_min_l.confianza));
    }
    // Arrecife
    if (acuario.tipo === "arrecife") {
      if (!f.arrecife) falt.push({ especie: f.id, campo: "adecuado_arrecife" });
      else {
        var v = f.arrecife.valor;
        var ef = v === "no" ? ESTADOS.INCOMPATIBLE : (v === "con_precaucion" ? ESTADOS.PRECAUCION : (v === "si" ? "sin_conflicto" : null));
        if (ef === null) falt.push({ especie: f.id, campo: "adecuado_arrecife" });
        else h.push(hallazgo("arrecife", ef, "La ficha indica adecuado para arrecife: «" + v + "».", f.arrecife.fuentes, f.arrecife.confianza));
      }
    } else if (acuario.tipo !== "solo_peces") falt.push({ especie: null, campo: "acuario.tipo" });
    // Condiciones medidas (salida §8 del motor de agua)
    var c = esObjeto(acuario.condiciones) && esObjeto(acuario.condiciones.condiciones) ? acuario.condiciones.condiciones : null;
    compararMedida("agua_temperatura", f, f.temperatura, c && c.temperatura, "°C", h, falt);
    compararMedida("agua_ph", f, f.ph, c && c.ph, "pH", h, falt);
    // Salinidad: las fichas usan gravedad específica y el motor ppt; no hay conversión acordada (contrato del motor §8, regla 4).
    if (c && c.salinidad && c.salinidad.disponible) {
      h.push(hallazgo("agua_salinidad", ESTADOS.SIN_DATOS, "No se compara: la ficha expresa la salinidad en gravedad específica y el " +
        "motor en ppt; su conversión depende de la temperatura y aún no hay una conversión acordada con fuente.", [], null));
    } else falt.push({ especie: null, campo: "acuario.condiciones.salinidad" });
    falt.push({ especie: f.id, campo: "salinidad_ppt" });
    // Sin comparar la salinidad la evaluación nunca está completa: sin hallazgos en contra, el resultado
    // es «sin_datos» (nunca «compatible»). Además, ninguna regla frente al acuario aporta evidencia positiva.
    var d = decidir(h, false);
    return { especie: f.id, estado: d.estado, etiqueta: ETIQUETAS[d.estado], contradiccion: d.contradiccion,
      resumen: resumen(d.estado, d.contradiccion, h, falt), motivos: h, datos_faltantes: falt };
  }

  // ── Entrada ──────────────────────────────────────────────────────────────────
  function leerEntrada(entrada) {
    if (!esObjeto(entrada)) throw new TypeError("evaluar espera un objeto { especies: [...], acuario?: {...} }.");
    if (!Array.isArray(entrada.especies) || entrada.especies.length === 0) throw new TypeError("«especies» debe ser una lista no vacía.");
    var orden = [], cantidades = {};
    entrada.especies.forEach(function (x) {
      var id = typeof x === "string" ? x : (esObjeto(x) ? x.id : null);
      var n = esObjeto(x) && x.cantidad !== undefined ? x.cantidad : 1;
      if (typeof id !== "string" || !id.trim()) throw new TypeError("Cada especie debe ser un id de ficha o { id, cantidad }.");
      if (!(Number.isInteger(n) && n >= 1)) throw new TypeError("«cantidad» debe ser un entero mayor o igual que 1 (" + id + ").");
      id = id.trim();
      if (!(id in cantidades)) { orden.push(id); cantidades[id] = 0; }
      cantidades[id] += n;
    });
    var acuario = entrada.acuario;
    if (acuario !== undefined && acuario !== null && !esObjeto(acuario)) throw new TypeError("«acuario» debe ser un objeto o null.");
    if (esObjeto(acuario) && acuario.tipo !== undefined && acuario.tipo !== null && ["arrecife", "solo_peces"].indexOf(acuario.tipo) < 0) {
      throw new TypeError("«acuario.tipo» debe ser \"arrecife\", \"solo_peces\" o null.");
    }
    return { orden: orden, cantidades: cantidades, acuario: esObjeto(acuario) ? acuario : null };
  }

  function indexar(catalogo) {
    if (!esObjeto(catalogo) || !Array.isArray(catalogo.especies)) throw new TypeError("El catálogo debe tener la forma { especies: [...] }.");
    var porId = {};
    catalogo.especies.forEach(function (e) { if (esObjeto(e) && typeof e.id === "string" && e.id) porId[e.id] = e; });
    return porId;
  }

  function interseccion(fichas, clave) {
    var r = null;
    for (var i = 0; i < fichas.length; i++) {
      var x = fichas[i][clave];
      if (!x) return null;
      r = r ? { min: Math.max(r.min, x.min), max: Math.min(r.max, x.max) } : { min: x.min, max: x.max };
    }
    if (!r || r.min > r.max) return null;
    return r;
  }

  // ── API principal ────────────────────────────────────────────────────────────
  function evaluar(entrada, catalogo) {
    var e = leerEntrada(entrada), porId = indexar(catalogo);
    var fichas = {}, faltan = [];
    e.orden.forEach(function (id) { if (porId[id]) fichas[id] = normalizarFicha(porId[id]); else faltan.push(id); });

    var pares = [];
    e.orden.forEach(function (id) {
      if (e.cantidades[id] > 1) pares.push(fichas[id] ? evaluarPar(fichas[id], fichas[id], e.cantidades[id]) : noEncontrada([id]));
    });
    for (var i = 0; i < e.orden.length; i++) {
      for (var j = i + 1; j < e.orden.length; j++) {
        var a = e.orden[i], b = e.orden[j];
        if (fichas[a] && fichas[b]) pares.push(evaluarPar(fichas[a], fichas[b], 1));
        else {
          var r = noEncontrada([a, b].filter(function (x) { return !fichas[x]; }));
          r.especies = [a, b];
          pares.push(r);
        }
      }
    }

    var enAcuario = [];
    if (e.acuario) e.orden.forEach(function (id) { if (fichas[id]) enAcuario.push(evaluarEnAcuario(fichas[id], e.acuario)); });

    var todos = pares.concat(enAcuario);
    var global;
    if (!todos.length) global = ESTADOS.SIN_DATOS;
    else {
      var negativos = todos.filter(function (r) { return r.estado === ESTADOS.INCOMPATIBLE || r.estado === ESTADOS.PRECAUCION; });
      if (negativos.length) global = negativos.reduce(function (s, r) { return peor(s, r.estado); }, ESTADOS.PRECAUCION);
      else if (!faltan.length && todos.every(function (r) { return r.estado === ESTADOS.COMPATIBLE; })) global = ESTADOS.COMPATIBLE;
      else global = ESTADOS.SIN_DATOS;
    }

    // Fuentes citadas, resueltas con el registro del catálogo.
    var registro = esObjeto(catalogo.fuentes) ? catalogo.fuentes : {};
    var fuentes = {};
    todos.forEach(function (r) {
      r.motivos.forEach(function (m) {
        m.fuentes.forEach(function (id) {
          if (fuentes[id]) return;
          var f = registro[id];
          fuentes[id] = esObjeto(f)
            ? { titulo: f.titulo || null, url: f.url || null, tipo: f.tipo || null }
            : { titulo: null, url: null, tipo: null, no_registrada: true };
        });
      });
    });

    var faltantes = [], vistos = {};
    todos.forEach(function (r) {
      r.datos_faltantes.forEach(function (x) {
        var k = x.especie + "|" + x.campo;
        if (!vistos[k]) { vistos[k] = true; faltantes.push(x); }
      });
    });
    faltan.forEach(function (id) { var k = id + "|ficha"; if (!vistos[k]) { vistos[k] = true; faltantes.push({ especie: id, campo: "ficha" }); } });

    var listaFichas = e.orden.map(function (id) { return fichas[id]; }).filter(Boolean);
    return {
      version: VERSION,
      catalogo_version: catalogo.version || null,
      estado_global: global,
      etiqueta_global: ETIQUETAS[global],
      especies: e.orden.map(function (id) {
        var f = fichas[id];
        return { id: id, cantidad: e.cantidades[id], encontrada: !!f,
          nombre_comun: f ? f.nombre_comun : null, nombre_cientifico: f ? f.nombre_cientifico : null };
      }),
      pares: pares,
      acuario: enAcuario,
      intervalo_comun: {
        temperatura_c: interseccion(listaFichas, "temperatura"),
        ph: interseccion(listaFichas, "ph"),
        nota: "Intersección de los rangos documentados. Que exista no demuestra que las especies puedan convivir."
      },
      datos_faltantes: faltantes,
      fuentes: fuentes,
      aviso: AVISO
    };
  }

  return { VERSION: VERSION, ESTADOS: ESTADOS, ETIQUETAS: ETIQUETAS, CRITERIOS: CRITERIOS, AVISO: AVISO,
    evaluar: evaluar, normalizarFicha: normalizarFicha };
});
