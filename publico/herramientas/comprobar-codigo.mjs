// AIRI v0.7 — Comprueba EN TU EQUIPO si un código de acceso (generado o escrito a mano) corresponde a alguna huella
// de AIRI_CODIGOS. Sirve para diagnosticar «Código de acceso no válido o revocado» sin desplegar ni mostrar secretos.
//
//   PowerShell:  $env:AIRI_CODIGOS = "p01:…,p02:…"   (la línea que cargaste con wrangler secret put)
//                node publico/herramientas/comprobar-codigo.mjs
//                Remove-Item Env:AIRI_CODIGOS
//   o bien:      node publico/herramientas/comprobar-codigo.mjs --archivo ruta\a\codigos.txt
//   Opcional:    --mostrar-linea-corregida  (solo si la huella se calculó de una forma que el Worker no acepta)
//
// El código se pide por la entrada estándar (no queda en el historial). No imprime el código ni la línea de
// AIRI_CODIGOS. No usa la red. Cloudflare no permite leer un secreto ya cargado: hace falta la línea que guardaste.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createInterface } from "node:readline";
import { huellasCodigo, normalizarCodigo, formatoGenerado } from "../codigos.mjs";
import { leerCodigos } from "../worker.js";

const NOMBRES = { canonica: "forma canónica (generador)", anterior: "MAYÚSCULAS (forma anterior al PR #11)", exacta: "texto exacto" };
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
  const crudo = codigo.replace(/\r?\n$/, "");
  const canonico = normalizarCodigo(crudo);
  console.log(canonico && formatoGenerado(canonico) ? "Tipo: código con el formato del generador (20 símbolos)."
    : "Tipo: código escrito a mano (no tiene el formato del generador).");
  for (const [nombre, h] of await huellasCodigo(crudo)) {
    if (mapa.has(h)) {
      console.log(`COINCIDE con el participante «${mapa.get(h)}» usando la ${NOMBRES[nombre]}. El Worker 0.7.3 lo acepta.`);
      process.exit(0);
    }
  }
  // Formas que el Worker NO acepta (errores típicos al calcular la huella a mano): solo diagnóstico.
  const sha = (s) => createHash("sha256").update(s).digest("hex");
  const t = crudo.trim();
  const extra = [["con salto de línea final (\\n)", t + "\n"], ["con salto de línea final (\\r\\n)", t + "\r\n"],
    ["en minúsculas", t.toLowerCase()], ["con espacios alrededor", crudo], ["con marca BOM", "﻿" + t]];
  for (const [como, forma] of extra) {
    const id = mapa.get(sha(forma));
    if (id) {
      console.log(`La huella de «${id}» se calculó ${como}: el Worker NO la acepta.`);
      console.log("Solución sin cambiar el código: sustituir esa huella en AIRI_CODIGOS por la correcta y volver a cargar el secreto.");
      if (process.argv.includes("--mostrar-linea-corregida")) {
        const corregida = [...mapa].map(([h, n]) => `${n}:${n === id ? (canonico ? sha(canonico) : sha(t.toUpperCase())) : h}`).join(",");
        console.log("Línea corregida para AIRI_CODIGOS:\n" + corregida);
      } else console.log("Vuelve a ejecutar con --mostrar-linea-corregida para obtener la línea corregida.");
      process.exit(1);
    }
  }
  console.log(`NO coincide con ninguna de las ${mapa.size} huellas, en ninguna forma conocida. Posibles causas: el código y la ` +
    "línea de AIRI_CODIGOS son de ejecuciones distintas de generar-codigos.mjs, el participante fue revocado, o el código " +
    "no es el que se usó para calcular la huella.");
  process.exit(1);
});
