/* ═══ AIRI · Motor de análisis de parámetros del agua v0.4 (JavaScript) ═══════
   Traducción fiel de la implementación de REFERENCIA en Python (motor/airi_motor).
   Usa los mismos datos (airi-motor-datos.js, generado desde los JSON) y debe
   reproducir motor/casos_conformidad.json; además, una prueba compara el informe
   completo (textos incluidos) con el de Python.

   AIRI compara mediciones con referencias documentadas. No diagnostica
   enfermedades, no garantiza condiciones seguras y no ejecuta acciones.
   Sin dependencias; funciona con file://, en el navegador y en Node. */
(function (raiz, fabrica) {
  var datos = (typeof module === "object" && module.exports) ? require("./airi-motor-datos.js") : raiz.AIRIMotorDatos;
  var api = fabrica(datos);
  if (typeof module === "object" && module.exports) module.exports = api;
  else raiz.AIRIMotor = api;
})(typeof window !== "undefined" ? window : globalThis, function (DATOS) {
  "use strict";
  if (!DATOS || !DATOS.referencias) throw new Error("AIRI: faltan los datos del motor (airi-motor-datos.js)");

  var VERSION = "0.4.0";
  var ORDEN = ["temperatura", "ph", "salinidad", "amoniaco", "nitritos", "nitratos"];
  var AVISO = "AIRI compara las mediciones con referencias documentadas. No diagnostica enfermedades, no garantiza " +
    "condiciones seguras y no ejecuta acciones: las decisiones sobre el acuario las toma una persona.";

  // ── Unidades (unidades.py) ────────────────────────────────────────────────
  var MASA = { N: 14.007, H: 1.008, O: 15.999 };
  MASA.NH3 = MASA.N + 3 * MASA.H;
  MASA.NH4 = MASA.N + 4 * MASA.H;
  MASA.NO2 = MASA.N + 2 * MASA.O;
  MASA.NO3 = MASA.N + 3 * MASA.O;
  var A_N = { N: 1.0, NH3: MASA.N / MASA.NH3, NH4: MASA.N / MASA.NH4, NO2: MASA.N / MASA.NO2, NO3: MASA.N / MASA.NO3 };

  var UNIDADES = {
    temperatura: { "°c": ["°C", "c"], "c": ["°C", "c"], "gradoscelsius": ["°C", "c"], "°f": ["°F", "f"], "f": ["°F", "f"] },
    ph: { "ph": ["pH", "ph"], "unidadesdeph": ["pH", "ph"], "": ["pH", "ph"] },
    salinidad: { "ppt": ["ppt", "ppt"], "‰": ["ppt", "ppt"], "g/kg": ["ppt", "ppt"] },
    amoniaco: {
      "mg/ltan-n": ["mg/L TAN-N (como N)", "N"], "mg/ltancomon": ["mg/L TAN-N (como N)", "N"],
      "mg/lnh3-n": ["mg/L TAN-N (como N)", "N"], "mg/ln-nh3/nh4+": ["mg/L TAN-N (como N)", "N"],
      "mg/lnh3/nh4+totalcomonh3": ["mg/L de amoníaco total expresado como NH3", "NH3"],
      "mg/lcomonh3": ["mg/L de amoníaco total expresado como NH3", "NH3"],
      "mg/lnh3/nh4+totalcomonh4+": ["mg/L de amoníaco total expresado como NH4+", "NH4"],
      "mg/lcomonh4+": ["mg/L de amoníaco total expresado como NH4+", "NH4"],
      "mg/l(nh3/nh4+total)": ["mg/L de amoníaco total, base no indicada", null],
      "mg/lnh3/nh4+total": ["mg/L de amoníaco total, base no indicada", null]
    },
    nitritos: { "mg/lno2-": ["mg/L NO2−", "NO2"], "mg/l(no2-)": ["mg/L NO2−", "NO2"], "mg/lno2-n": ["mg/L NO2-N", "N"] },
    nitratos: { "mg/lno3-": ["mg/L NO3−", "NO3"], "mg/l(no3-)": ["mg/L NO3−", "NO3"], "mg/lno3-n": ["mg/L NO3-N", "N"] }
  };
  var SUSTITUCIONES = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "⁺": "+", "⁻": "-", "−": "-", "–": "-", "⁰": "0" };

  function normalizarUnidad(texto) {
    var t = String(texto == null ? "" : texto).normalize("NFC").replace(/[₀₁₂₃₄⁺⁻−–⁰]/g, function (c) { return SUSTITUCIONES[c]; });
    t = t.toLowerCase().replace(/\s+/g, "");
    var usoPpm = t.indexOf("ppm") >= 0;
    return [t.split("ppm").join("mg/l"), usoPpm];
  }

  function leerNumero(valor) {
    if (typeof valor === "boolean" || valor == null) return null;
    var n;
    if (typeof valor === "number") n = valor;
    else {
      var texto = String(valor).trim().replace(/,/g, ".");
      if (!/^[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?$/.test(texto)) return null;
      n = Number(texto);
    }
    return isFinite(n) ? n : null;
  }

  function reconocerUnidad(parametro, unidad) {
    var nu = normalizarUnidad(unidad), tabla = UNIDADES[parametro] || {};
    if (!Object.prototype.hasOwnProperty.call(tabla, nu[0])) return null;
    return { descripcion: tabla[nu[0]][0], base: tabla[nu[0]][1], uso_ppm: nu[1] };
  }

  function aCanonica(parametro, valor, u) {
    if (parametro === "temperatura") { var c = u.base === "f" ? (valor - 32) * 5 / 9 : valor; return [c, c]; }
    if (parametro === "ph" || parametro === "salinidad") return [valor, valor];
    if (u.base === null) {
      var posibles = ["N", "NH3", "NH4"].map(function (b) { return valor * A_N[b]; });
      return [Math.min.apply(null, posibles), Math.max.apply(null, posibles)];
    }
    var n = valor * A_N[u.base];
    return [n, n];
  }

  // ── Formato numérico idéntico a Python ────────────────────────────────────
  /** Expansión decimal EXACTA de |n| como [dígitos, posición del punto]. */
  function decimalExacto(n) {
    var a = Math.abs(n);
    var s = a >= 1e21 ? BigInt(a).toString() : a.toFixed(100);
    var punto = s.indexOf(".");
    if (punto < 0) return [s, s.length];
    return [s.slice(0, punto) + s.slice(punto + 1), punto];
  }
  /** Equivale a format(n, ".4g") de Python (redondeo al par en empates exactos). */
  function fmtG(n, prec) {
    prec = prec || 4;
    if (n === 0) return Object.is(n, -0) ? "-0" : "0";
    var de = decimalExacto(n), d = de[0], punto = de[1];
    var i = 0; while (d[i] === "0") i++;
    var exp = punto - i - 1;
    var cifras = d.slice(i, i + prec).split("").map(Number);
    while (cifras.length < prec) cifras.push(0);
    var resto = d.slice(i + prec);
    var mayor = resto[0] > "5" || (resto[0] === "5" && /[1-9]/.test(resto.slice(1)));
    var empate = resto[0] === "5" && !/[1-9]/.test(resto.slice(1));
    if (mayor || (empate && cifras[prec - 1] % 2 === 1)) {
      var k = prec - 1;
      while (k >= 0) { cifras[k] += 1; if (cifras[k] < 10) break; cifras[k] = 0; k--; }
      if (k < 0) { cifras.unshift(1); cifras.pop(); exp += 1; }
    }
    var signo = n < 0 ? "-" : "";
    var quitarCeros = function (t) { return t.indexOf(".") >= 0 ? t.replace(/0+$/, "").replace(/\.$/, "") : t; };
    if (exp < -4 || exp >= prec) {
      var m = quitarCeros(cifras[0] + "." + cifras.slice(1).join(""));
      var e = Math.abs(exp);
      return signo + m + "e" + (exp < 0 ? "-" : "+") + (e < 10 ? "0" + e : String(e));
    }
    var texto;
    if (exp >= 0) texto = cifras.slice(0, exp + 1).join("") + "." + cifras.slice(exp + 1).join("");
    else texto = "0." + new Array(-exp).join("0") + cifras.join("");
    return signo + quitarCeros(texto);
  }
  /** Como str() de Python para los números de los JSON (enteros sin «.0»). */
  function pyStr(n) { return String(n); }
  function rangoTexto(a, b) { return a === b ? fmtG(a) : fmtG(a) + "–" + fmtG(b); }
  function redondear6(x) { return Number(x.toFixed(6)); }

  // ── Reglas por parámetro (reglas.py) ──────────────────────────────────────
  var ESTADOS = { EP1: "FALTANTE", EP2: "INVÁLIDO", EP3: "SIN REFERENCIA", EP4: "EN RANGO", EP5: "ANOMALÍA" };
  var SEVERIDADES = {
    alerta_alta: { prioridad: 4, nombre: "Alerta de mayor severidad" },
    fuera_de_referencia: { prioridad: 3, nombre: "Fuera de la referencia" },
    revision_recomendada: { prioridad: 2, nombre: "Revisión recomendada" },
    presencia_detectable: { prioridad: 1, nombre: "Presencia detectable" }
  };

  function perfil(nombre) {
    var ref = DATOS.referencias;
    nombre = nombre || ref.perfil_predeterminado;
    if (!Object.prototype.hasOwnProperty.call(ref.perfiles, nombre)) throw new Error("Perfil desconocido: " + nombre);
    var p = { id: nombre };
    for (var k in ref.perfiles[nombre]) p[k] = ref.perfiles[nombre][k];
    return p;
  }

  function evaluarParametro(parametro, medicion, p) {
    var meta = DATOS.referencias.parametros[parametro];
    medicion = medicion || {};
    var texto = medicion.valor === undefined ? null : medicion.valor;
    var unidad = medicion.unidad === undefined ? null : medicion.unidad;
    var metodo = String(medicion.metodo || "").trim().toLowerCase();
    var unidadTexto = unidad === null ? "" : String(unidad).trim();
    var r = { parametro: parametro, nombre: meta.nombre, valor_original: texto, unidad_original: unidad,
      valor_canonico: null, unidad_canonica: meta.unidad_canonica, estado: null, severidad: null,
      motivo: "", fuentes: [], contexto: [], notas: [], decisiones: [] };
    function decidir(nodo, cond) { r.decisiones.push([nodo, cond ? "V" : "F"]); return cond; }
    function terminar(estado, motivo, severidad) { r.estado = estado; r.motivo = motivo; r.severidad = severidad || null; return r; }

    if (!decidir("Q1", texto !== null && String(texto).trim() !== "")) return terminar("EP1", "No se recibió el dato.");
    var valor = leerNumero(texto);
    if (!decidir("Q2", valor !== null)) return terminar("EP2", "«" + texto + "» no es un número válido.");
    var u = reconocerUnidad(parametro, unidad);
    if (!decidir("Q3", u !== null)) {
      var problema = unidadTexto ? "La unidad «" + unidadTexto + "» no se admite" : "No se indicó la unidad";
      return terminar("EP2", problema + " para " + meta.nombre.toLowerCase() + ". Unidad canónica: " + meta.unidad_canonica + ".");
    }
    if (u.uso_ppm) r.notas.push("«ppm» se interpreta como mg/L; en agua de mar difieren ligeramente por la densidad del agua.");
    var lim = meta.limites_captura, mm = aCanonica(parametro, valor, u), minimo = mm[0], maximo = mm[1];
    var plausible = (lim.minimo === null || minimo >= lim.minimo) && (lim.maximo === null || maximo <= lim.maximo);
    if (!decidir("Q4", plausible)) {
      return terminar("EP2", fmtG(valor) + (unidadTexto ? " " + unidadTexto : "") + " está fuera de los límites de captura (" +
        lim.justificacion + ")");
    }
    r.valor_canonico = minimo === maximo ? redondear6(minimo) : [redondear6(minimo), redondear6(maximo)];
    if (["c", "ph", "ppt", "N", "f"].indexOf(u.base) < 0 && minimo === maximo) {
      r.notas.push("Convertido de " + u.descripcion + " a " + meta.unidad_canonica + " por masas molares.");
    }
    if (u.base === "f") r.notas.push("Convertido de °F a °C.");

    var ref = p.referencias[parametro];
    r.contexto = ref.contexto || [];
    if (!decidir("Q5", ref.estado === "verificada")) {
      var estadoRef = ref.estado === "pendiente" ? "pendiente de verificar" : "sin referencia para evaluación biológica";
      r.fuentes = ref.fuentes || [];
      return terminar("EP3", "No se evalúa (" + estadoRef + "): " + ref.motivo);
    }
    r.fuentes = ref.fuentes;

    var tipo = ref.tipo;
    if (tipo === "rango_con_tolerancia_documental") {
      var dentro = ref.minimo <= minimo && maximo <= ref.maximo;
      if (decidir("Q6", dentro)) {
        return terminar("EP4", fmtG(minimo) + " está dentro de la referencia " + pyStr(ref.minimo) + "–" + pyStr(ref.maximo) + ".");
      }
      if (ref.minimo <= minimo && maximo <= ref.maximo_tolerancia) {
        return terminar("EP5", fmtG(minimo) + " está por encima de la tabla de referencia (" + pyStr(ref.minimo) + "–" +
          pyStr(ref.maximo) + "), pero dentro de lo que el mismo capítulo considera habitual en tanques marinos (hasta " +
          pyStr(ref.maximo_tolerancia) + "). Las fuentes discrepan: conviene revisar.", "revision_recomendada");
      }
      var lado = minimo < ref.minimo ? "por debajo" : "por encima";
      return terminar("EP5", fmtG(minimo) + " está " + lado + " de la referencia " + pyStr(ref.minimo) + "–" + pyStr(ref.maximo) + ".",
        "fuera_de_referencia");
    }
    if (tipo === "cero") {
      if (decidir("Q6", maximo === 0)) return terminar("EP4", "No detectable (0 mg/L), igual al valor de referencia.");
      return terminar("EP5", "Presencia detectable (" + fmtG(valor) + " " + u.descripcion + "); la referencia es 0 mg/L. " +
        "No hay un umbral de severidad documentado para agua salada.", "presencia_detectable");
    }
    if (tipo === "cero_con_umbral") {
      var umbral = ref.umbral_severidad;
      if (decidir("Q6", maximo === 0)) return terminar("EP4", "No detectable (0 mg/L), igual al valor de referencia.");
      if (metodo === "nessler") {
        return terminar("EP5", "Amoníaco detectable, pero medido con el método de Nessler, que da reacciones falsas en " +
          "agua de mar. No se compara con el umbral; conviene repetir con el método de salicilato.", "revision_recomendada");
      }
      if (minimo >= umbral) {
        return terminar("EP5", "TAN ≥ " + pyStr(umbral) + " mg/L como N (" + rangoTexto(minimo, maximo) + "): por encima de la " +
          "concentración que, según el MSD, los peces de agua salada suelen tolerar.", "alerta_alta");
      }
      if (maximo < umbral) {
        return terminar("EP5", "Amoníaco detectable (" + rangoTexto(minimo, maximo) + " mg/L TAN-N): por encima de la referencia " +
          "de 0 mg/L, pero por debajo de " + pyStr(umbral) + " mg/L, la concentración que según el MSD los peces de agua " +
          "salada suelen tolerar.", "presencia_detectable");
      }
      return terminar("EP5", "Amoníaco detectable. Como la unidad no indica si es «como N», «como NH3» o «como NH4+», el " +
        "valor equivale a " + rangoTexto(minimo, maximo) + " mg/L TAN-N y no se puede saber si alcanza " + pyStr(umbral) +
        " mg/L. Indica la base química del kit.", "revision_recomendada");
    }
    throw new Error("Tipo de referencia desconocido: " + tipo);
  }

  // ── Motor completo (motor.py) ─────────────────────────────────────────────
  var TEXTO_RESULTADO = {
    R1: "Los parámetros evaluados están dentro de las referencias documentadas para este perfil. " +
        "Esto no garantiza la salud del acuario ni de sus organismos.",
    R2: "Hay mediciones fuera de las referencias documentadas. Revisa las observaciones.",
    R3: "Información insuficiente: no se pudieron evaluar todos los parámetros. No se declara que el acuario " +
        "esté dentro de las referencias.",
    R4: "Hay mediciones fuera de las referencias documentadas y, además, parámetros que no se pudieron evaluar. " +
        "Se muestran ambas cosas."
  };
  var SALIDAS = { R1: ["FIN"], R2: ["O1"], R3: ["O2"], R4: ["O1", "O2"] };
  var ETIQUETA_SALIDA = { "R2>O1": "explicar", "R4>O1": "explicar", "R4>O2": "pedir datos", "R3>O2": "pedir datos",
    "R1>FIN": "entregar", "O1>FIN": "entregar", "O2>FIN": "entregar" };
  var RECOMENDACION = {
    "ph|fuera_de_referencia": "Repite la medición y verifica la calibración del instrumento. Si se confirma, " +
      "consulta con una persona con experiencia en acuarios marinos: según el MSD, los " +
      "peces marinos toleran mucho peor las fluctuaciones de pH.",
    "ph|revision_recomendada": "Repite la medición y verifica la calibración. Las fuentes consultadas discrepan " +
      "en este intervalo, así que conviene observar la tendencia.",
    "amoniaco|presencia_detectable": "Repite la medición. Según el MSD, cuando el amoníaco es detectable conviene " +
      "aumentar la frecuencia de monitoreo a diaria.",
    "amoniaco|revision_recomendada": "Repite la medición indicando la base química del kit (como N, NH3 o NH4+) y, " +
      "en agua de mar, preferiblemente con el método de salicilato.",
    "amoniaco|alerta_alta": "Repite la medición cuanto antes y consulta pronto con una persona con experiencia o " +
      "con un veterinario de peces. Mientras sea detectable, el MSD recomienda monitoreo diario.",
    "nitritos|presencia_detectable": "Repite la medición. Según el MSD, cuando el nitrito es detectable conviene " +
      "aumentar la frecuencia de monitoreo a diaria."
  };
  var RECOMENDACION_GENERAL = "Repite la medición y consulta con una persona con experiencia antes de decidir cualquier intervención.";

  function evaluar(mediciones, perfilElegido, origen) {
    var p = perfilElegido && typeof perfilElegido === "object" ? perfilElegido : perfil(perfilElegido);
    var traza = [];
    function paso(a, b, etiqueta, parametro) { traza.push({ de: a, a: b, etiqueta: etiqueta, parametro: parametro || null }); }
    var resultados = ORDEN.map(function (parametro) {
      var r = evaluarParametro(parametro, (mediciones || {})[parametro], p);
      paso("E0", "Q1", "para cada parámetro", parametro);
      r.decisiones.forEach(function (d, i) {
        var siguiente = i + 1 < r.decisiones.length ? r.decisiones[i + 1][0] : r.estado;
        if (d[1] === "F") siguiente = r.estado;
        paso(d[0], siguiente, d[1], parametro);
      });
      paso(r.estado, "C1", "registrar", parametro);
      r.nombre_estado = ESTADOS[r.estado];
      return r;
    });
    var A = resultados.some(function (r) { return r.estado === "EP5"; });
    var I = resultados.some(function (r) { return ["EP1", "EP2", "EP3"].indexOf(r.estado) >= 0; });
    var vf = function (x) { return x ? "V" : "F"; };
    paso("C1", "Q7", "A, I");
    var clasificacion = A ? (I ? "R4" : "R2") : (I ? "R3" : "R1");
    paso("Q7", clasificacion, "A = " + vf(A) + ", I = " + vf(I));
    SALIDAS[clasificacion].forEach(function (s) {
      paso(clasificacion, s, ETIQUETA_SALIDA[clasificacion + ">" + s]);
      if (s !== "FIN") paso(s, "FIN", "entregar");
    });

    // Orden estable por prioridad (como sorted() de Python)
    var alertas = resultados.filter(function (r) { return r.estado === "EP5"; })
      .map(function (r, i) { return [r, i]; })
      .sort(function (x, y) { return (SEVERIDADES[y[0].severidad].prioridad - SEVERIDADES[x[0].severidad].prioridad) || (x[1] - y[1]); })
      .map(function (x) {
        var r = x[0];
        return { parametro: r.parametro, nombre: r.nombre, severidad: r.severidad,
          severidad_nombre: SEVERIDADES[r.severidad].nombre, motivo: r.motivo, fuentes: r.fuentes };
      });
    var recomendaciones = alertas.map(function (a) {
      return { parametro: a.parametro, texto: RECOMENDACION[a.parametro + "|" + a.severidad] || RECOMENDACION_GENERAL };
    });
    var solicitudes = [];
    resultados.forEach(function (r) {
      if (r.estado === "EP1") solicitudes.push({ parametro: r.parametro, tipo: "faltante", texto: "Proporciona la medición de " + r.nombre.toLowerCase() + "." });
      else if (r.estado === "EP2") solicitudes.push({ parametro: r.parametro, tipo: "invalido", texto: "Corrige " + r.nombre.toLowerCase() + ": " + r.motivo });
      else if (r.estado === "EP3") solicitudes.push({ parametro: r.parametro, tipo: "sin_referencia",
        texto: r.nombre + " no se evalúa: falta una referencia verificada para este perfil." });
    });
    resultados.forEach(function (r) { delete r.decisiones; });
    return { version: VERSION, perfil: { id: p.id, nombre: p.nombre, aplica_a: p.aplica_a }, origen: origen == null ? null : origen,
      resultados: resultados, A: A, I: I, clasificacion: clasificacion, resumen: TEXTO_RESULTADO[clasificacion],
      alertas: alertas, recomendaciones: recomendaciones, solicitudes: solicitudes, aviso: AVISO, traza: traza };
  }

  return { VERSION: VERSION, ORDEN: ORDEN, AVISO: AVISO, ESTADOS: ESTADOS, SEVERIDADES: SEVERIDADES,
    evaluar: evaluar, evaluarParametro: evaluarParametro, perfil: perfil, datos: DATOS,
    leerNumero: leerNumero, reconocerUnidad: reconocerUnidad, aCanonica: aCanonica, fmtG: fmtG };
});
