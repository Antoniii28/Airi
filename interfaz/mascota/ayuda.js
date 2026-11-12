/* ═══ AIRI · Ayuda contextual v0.2 ══════════════════════════════════════════
   Textos PREDEFINIDOS y verificados contra lo que el prototipo hace realmente.
   No se generan con IA. Expone window.AIRIAyuda (o module.exports en Node).

   Fuentes de verificación:
   - interfaz/prototipo/index.html: seis parámetros con sus unidades, validación
     de dato faltante / formato numérico / negativos / pH > 14, buscador de seis
     fichas preliminares y pestaña de funciones previstas.
   - documentacion/01_descripcion_agente.md y docs de planificación: funciones
     futuras (compatibilidad, fotografías, aplicación móvil, motor de reglas).
*/
(function (raiz, fabrica) {
  var api = fabrica();
  if (typeof module === "object" && module.exports) { module.exports = api; }
  else { raiz.AIRIAyuda = api; }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var RESPUESTAS = {
    proyecto: {
      estado: "espera", tipo: "informativo",
      texto: "Soy AIRI, el Agente Inteligente para la Supervisión y Gestión de un Acuario Marino. En esta " +
        "versión de prueba te guío por la interfaz: reviso que las mediciones del formulario estén completas y " +
        "tengan formato numérico, te muestro las fichas preliminares de especies y te cuento qué funciones " +
        "están planeadas. Todavía no analizo el agua, no evalúo compatibilidad entre especies y no identifico " +
        "peces por fotografía. Las decisiones sobre el acuario siempre las toma una persona."
    },
    agua: {
      estado: "espera", tipo: "informativo",
      texto: "En Parámetros del agua escribe seis valores: temperatura en °C, pH, salinidad en ppt, amoníaco " +
        "total en mg/L, nitritos en mg/L y nitratos en mg/L. Indica si los datos son manuales o simulados y " +
        "pulsa «Validar entradas». Reviso si falta algún dato y si cada valor es un número válido; los valores " +
        "negativos y un pH mayor que 14 se marcan como inválidos. Como todavía no hay rangos biológicos " +
        "verificados con fuentes, no indico si un valor es adecuado o peligroso."
    },
    especies: {
      estado: "espera", tipo: "informativo",
      texto: "En Fichas de especies hay seis fichas preliminares. Escribe en el buscador un nombre común, como " +
        "«payaso», o un nombre científico, como «Amphiprion», y la lista se filtra mientras escribes. Las fichas " +
        "todavía no tienen datos biológicos verificados: no determinan compatibilidad entre especies ni " +
        "recomiendan introducir peces."
    },
    futuro: {
      estado: "espera", tipo: "informativo",
      texto: "Ya funcionan la navegación, la validación del formato de las mediciones, el buscador de fichas, " +
        "esta mascota y su voz. Están planeadas, pero todavía no disponibles: un motor de reglas que evalúe el " +
        "agua con referencias con fuente, la evaluación de compatibilidad entre especies, la identificación " +
        "probable de peces por fotografía con tu permiso y confirmación humana, y una posible aplicación móvil."
    }
  };

  // Menú de acciones. «pestana» marca la opción recomendada en cada pantalla.
  var ACCIONES = [
    { id: "proyecto", texto: "¿Qué puedes hacer?", pestana: "inicio" },
    { id: "agua", texto: "Ayúdame con los parámetros del agua", pestana: "agua" },
    { id: "especies", texto: "Explícame las fichas de especies", pestana: "especies" },
    { id: "futuro", texto: "¿Qué funciones llegarán después?", pestana: "futuro" },
    { id: "repetir", texto: "Repetir mensaje" },
    { id: "silenciar", texto: "Silenciar AIRI" },
    { id: "ajustes", texto: "Ajustes de voz" }          // v0.3
  ];

  var MENSAJES_VOZ = {
    activada: { estado: "espera", tipo: "informativo", texto: "Voz activada. Leeré en voz alta mis mensajes." },
    silenciada: { estado: "espera", tipo: "informativo",
      texto: "Voz desactivada. Seguiré mostrando mis mensajes por escrito." },
    noDisponible: { estado: "espera", tipo: "informativo",
      texto: "Este navegador no permite la síntesis de voz. Seguiré mostrando mis mensajes por escrito." },
    guardada: { estado: "bienvenida", tipo: "informativo",
      texto: "¡Listo! Guardé mi nueva voz. Así sonaré a partir de ahora." },
    guardadaSilenciada: { estado: "espera", tipo: "informativo",
      texto: "Guardé los ajustes de voz. Pulsa «Activar voz» cuando quieras escucharme." }
  };

  /** Acciones ordenadas: primero la que corresponde a la pestaña actual. */
  function accionesPara(pestana) {
    var recomendada = ACCIONES.filter(function (a) { return a.pestana === pestana; });
    var resto = ACCIONES.filter(function (a) { return a.pestana !== pestana; });
    return recomendada.concat(resto).map(function (a) {
      return { id: a.id, texto: a.texto, recomendada: a.pestana === pestana };
    });
  }

  function respuesta(id) { return RESPUESTAS[id] || null; }

  return { RESPUESTAS: RESPUESTAS, ACCIONES: ACCIONES, MENSAJES_VOZ: MENSAJES_VOZ,
           accionesPara: accionesPara, respuesta: respuesta };
});
