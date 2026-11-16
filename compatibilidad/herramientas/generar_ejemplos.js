// Genera compatibilidad/ejemplos/*.json a partir de los DATOS DE PRUEBA (ficticios).
// Uso: node compatibilidad/herramientas/generar_ejemplos.js [--comprobar]
// Con --comprobar no escribe: termina con código 1 si algún ejemplo no está al día.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const Compat = require("../airi-compatibilidad.js");
const Motor = require("../../interfaz/motor/airi-motor.js");
const catalogo = require("../datos_prueba/catalogo_prueba.json");

const condiciones = Motor.condicionesMedidas(Motor.evaluar({
  temperatura: { valor: "29", unidad: "°C" },
  ph: { valor: "8.2", unidad: "pH" },
  salinidad: { valor: "35", unidad: "ppt" }
}));

const CASOS = {
  "01_compatible_sustentado": { especies: ["prueba_pacifico_a", "prueba_pacifico_b"] },
  "02_incompatible_rangos": { especies: ["prueba_pacifico_b", "prueba_frio"] },
  "03_contradiccion": { especies: ["prueba_pacifico_a", "prueba_contradictoria"] },
  "04_sin_datos": { especies: ["prueba_pacifico_a", "prueba_sin_datos", "especie_inexistente"] },
  "05_precaucion_misma_especie": { especies: [{ id: "prueba_agresivo", cantidad: 2 }] },
  "06_acuario_con_motor": {
    especies: ["prueba_pacifico_a", "prueba_pacifico_b", "prueba_agresivo_2"],
    acuario: { volumen_l: 200, tipo: "arrecife", condiciones: condiciones }
  }
};

const dir = path.join(__dirname, "..", "ejemplos");
const comprobar = process.argv.includes("--comprobar");
let desfasados = 0;
for (const [nombre, entrada] of Object.entries(CASOS)) {
  const salida = Compat.evaluar(entrada, catalogo);
  const texto = JSON.stringify({ _nota: "EJEMPLO CON DATOS DE PRUEBA FICTICIOS (compatibilidad/datos_prueba). No es información biológica real.",
    entrada: entrada, salida: salida }, null, 1) + "\n";
  const archivo = path.join(dir, nombre + ".json");
  if (comprobar) {
    if (!fs.existsSync(archivo) || fs.readFileSync(archivo, "utf8") !== texto) { desfasados++; console.error("Desactualizado: " + archivo); }
  } else {
    fs.writeFileSync(archivo, texto);
    console.log("Escrito: " + path.relative(process.cwd(), archivo) + " → " + salida.estado_global);
  }
}
if (comprobar) process.exit(desfasados ? 1 : 0);
