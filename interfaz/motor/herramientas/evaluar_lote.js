// Evalúa un lote con el motor JavaScript: lee [{mediciones, perfil?}] por la entrada estándar y
// escribe [informe] en la salida estándar. Lo usa motor/pruebas/test_paridad_js.py.
// Con --condiciones escribe [{informe, condiciones}] (condiciones = Motor.condicionesMedidas(informe)).
"use strict";
const Motor = require("../airi-motor.js");
let entrada = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => { entrada += c; });
process.stdin.on("end", () => {
  const lote = JSON.parse(entrada);
  const conCondiciones = process.argv.includes("--condiciones");
  process.stdout.write(JSON.stringify(lote.map((c) => {
    const informe = Motor.evaluar(c.mediciones, c.perfil || null);
    return conCondiciones ? { informe, condiciones: Motor.condicionesMedidas(informe) } : informe;
  })));
});
