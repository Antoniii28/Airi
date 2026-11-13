// Evalúa un lote con el motor JavaScript: lee [{mediciones, perfil?}] por la entrada estándar y
// escribe [informe] en la salida estándar. Lo usa motor/pruebas/test_paridad_js.py.
"use strict";
const Motor = require("../airi-motor.js");
let entrada = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => { entrada += c; });
process.stdin.on("end", () => {
  const lote = JSON.parse(entrada);
  process.stdout.write(JSON.stringify(lote.map((c) => Motor.evaluar(c.mediciones, c.perfil || null))));
});
