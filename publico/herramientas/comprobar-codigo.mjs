// AIRI v0.7 — Comprueba EN TU EQUIPO si un código de acceso corresponde a alguna huella de AIRI_CODIGOS.
// Sirve para diagnosticar «Código de acceso no válido o revocado» sin desplegar ni mostrar secretos.
//
//   PowerShell:  $env:AIRI_CODIGOS = "p01:…,p02:…"   (la línea que cargaste con wrangler secret put)
//                node publico/herramientas/comprobar-codigo.mjs
//                Remove-Item Env:AIRI_CODIGOS
//   o bien:      node publico/herramientas/comprobar-codigo.mjs --archivo ruta\a\codigos.txt
//
// El código se pide por la entrada estándar (no queda en el historial de comandos). La herramienta no imprime el
// código, las huellas ni la línea de AIRI_CODIGOS. No usa la red.
// Cloudflare no permite leer el valor de un secreto ya cargado: compara con la línea que guardaste al generarlo.
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { normalizarCodigo, huellaCodigo, formatoGenerado } from "../codigos.mjs";
import { leerCodigos } from "../worker.js";

const i = process.argv.indexOf("--archivo");
const texto = (i > 0 ? readFileSync(process.argv[i + 1], "utf-8") : process.env.AIRI_CODIGOS || "").trim();
const mapa = leerCodigos(texto);
if (!mapa) {
  console.error("AIRI_CODIGOS falta o no tiene el formato «id:huella64hex,id2:huella64hex» (sin espacios internos ni comillas).");
  process.exit(2);
}
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
rl.question("Código de acceso a comprobar: ", async (codigo) => {
  rl.close();
  const canonico = normalizarCodigo(codigo);
  if (!canonico) { console.log("El texto no puede ser un código: solo admite letras y números (los separadores se ignoran)."); process.exit(1); }
  if (!formatoGenerado(canonico))
    console.log(`Aviso: tras quitar separadores tiene ${canonico.replaceAll("-", "").length} símbolos; los códigos del generador tienen 20.`);
  const id = mapa.get(await huellaCodigo(canonico));
  console.log(id ? `COINCIDE con el participante «${id}» (${mapa.size} huellas cargadas).`
    : `NO coincide con ninguna de las ${mapa.size} huellas. Posibles causas: el código y la línea de AIRI_CODIGOS son de ` +
      "ejecuciones distintas de generar-codigos.mjs, el participante fue revocado, o hay un error al copiar el código.");
  process.exit(id ? 0 : 1);
});
