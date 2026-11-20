// Genera los ejemplos JSON de compatibilidad para la interfaz.
//   ejemplos/*.json                → con DATOS DE PRUEBA ficticios (compatibilidad/datos_prueba)
//   ejemplos/catalogo_real/*.json  → con las fichas reales de Brayan (especies/datos/catalogo_inicial.json)
// Uso: node compatibilidad/herramientas/generar_ejemplos.js [--comprobar] [--catalogo RUTA]
//   --comprobar  no escribe; termina con código 1 si algún ejemplo no está al día.
//   --catalogo   catálogo real a usar (por defecto, el del repositorio).
// Los ejemplos reales solo se comprueban si la versión del catálogo coincide con la que tienen registrada.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const Compat = require("../airi-compatibilidad.js");
const Motor = require("../../interfaz/motor/airi-motor.js");

const args = process.argv.slice(2);
const comprobar = args.includes("--comprobar");
const iCat = args.indexOf("--catalogo");
const rutaReal = iCat >= 0 ? path.resolve(args[iCat + 1]) : path.join(__dirname, "..", "..", "especies", "datos", "catalogo_inicial.json");
const prueba = require("../datos_prueba/catalogo_prueba.json");
const real = JSON.parse(fs.readFileSync(rutaReal, "utf8"));

const condiciones = (temperatura) => Motor.condicionesMedidas(Motor.evaluar({
  temperatura: { valor: temperatura, unidad: "°C" },
  ph: { valor: "8.2", unidad: "pH" },
  salinidad: { valor: "35", unidad: "ppt" }
}));

const PRUEBA = {
  "01_compatible_sustentado": { especies: ["prueba_pacifico_a", "prueba_pacifico_b"] },
  "02_incompatible_rangos": { especies: ["prueba_pacifico_b", "prueba_frio"] },
  "03_contradiccion": { especies: ["prueba_pacifico_a", "prueba_contradictoria"] },
  "04_sin_datos": { especies: ["prueba_pacifico_a", "prueba_sin_datos", "especie_inexistente"] },
  "05_precaucion_misma_especie": { especies: [{ id: "prueba_agresivo", cantidad: 2 }] },
  "06_acuario_con_motor": {
    especies: ["prueba_pacifico_a", "prueba_pacifico_b", "prueba_agresivo_2"],
    acuario: { volumen_l: 200, tipo: "arrecife", condiciones: condiciones("29") }
  }
};

// Fichas reales (catálogo de Brayan). Mientras ninguna tenga «convivencia.relaciones»,
// ningún resultado real puede ser «compatible».
const REALES = {
  "r01_sin_conflictos_sin_evidencia": { especies: ["amphiprion_ocellaris", "lysmata_amboinensis"] },
  "r02_precaucion_temperamento": { especies: ["amphiprion_ocellaris", "zebrasoma_flavescens"] },
  "r03_precaucion_misma_especie": { especies: [{ id: "zebrasoma_flavescens", cantidad: 2 }] },
  "r04_sin_ph_documentado": { especies: ["zanclus_cornutus", "forcipiger_flavissimus"] },
  "r05_acuario_arrecife": {
    especies: ["amphiprion_ocellaris", "zanclus_cornutus", "lysmata_amboinensis"],
    acuario: { volumen_l: 300, tipo: "arrecife", condiciones: condiciones("25") }
  }
};

let desfasados = 0, omitidos = 0;
function procesar(casos, catalogo, carpeta, nota) {
  const dir = path.join(__dirname, "..", "ejemplos", carpeta);
  if (!comprobar) fs.mkdirSync(dir, { recursive: true });
  for (const [nombre, entrada] of Object.entries(casos)) {
    const salida = Compat.evaluar(entrada, catalogo);
    const texto = JSON.stringify({ _nota: nota, entrada: entrada, salida: salida }, null, 1) + "\n";
    const archivo = path.join(dir, nombre + ".json");
    if (comprobar) {
      if (!fs.existsSync(archivo)) { desfasados++; console.error("Falta: " + archivo); continue; }
      const guardado = fs.readFileSync(archivo, "utf8");
      if (carpeta && JSON.parse(guardado).salida.catalogo_version !== catalogo.version) { omitidos++; continue; }
      if (guardado !== texto) { desfasados++; console.error("Desactualizado: " + archivo); }
    } else {
      fs.writeFileSync(archivo, texto);
      console.log("Escrito: " + path.relative(process.cwd(), archivo) + " → " + salida.estado_global);
    }
  }
}

procesar(PRUEBA, prueba, "", "EJEMPLO CON DATOS DE PRUEBA FICTICIOS (compatibilidad/datos_prueba). No es información biológica real.");
const conFichas = Array.isArray(real.especies) && real.especies.some((e) => e && e.ficha_airi);
if (conFichas) {
  procesar(REALES, real, "catalogo_real", "EJEMPLO CON LAS FICHAS REALES del catálogo " + real.version +
    " (especies/datos/catalogo_inicial.json). Resultado orientativo; no es un dictamen.");
} else if (!comprobar) {
  console.log("Catálogo sin fichas (versión " + real.version + "): no se generan ejemplos reales. Usa --catalogo RUTA.");
}
if (comprobar && omitidos) console.log("Ejemplos reales no comprobados (" + omitidos + "): el catálogo del repositorio es la versión " +
  real.version + ", distinta de la de los ejemplos.");
if (comprobar) process.exit(desfasados ? 1 : 0);
