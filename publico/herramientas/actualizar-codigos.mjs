// AIRI v0.7.4 — Da de ALTA o REVOCA participantes del piloto SIN invalidar los códigos que ya funcionan.
//
//   node publico/herramientas/actualizar-codigos.mjs --actual RUTA --salida RUTA [--entregas RUTA]
//        [--agregar id1 id2 …] [--revocar id3 …]
//
//   --actual    archivo con la línea de AIRI_CODIGOS que está cargada hoy («id:huella,…»). Cloudflare no permite
//               leer un secreto: hace falta la copia que guardaste al cargarlo.
//   --salida    archivo NUEVO donde se escribe la línea completa para AIRI_CODIGOS (existentes + altas − bajas).
//   --entregas  archivo NUEVO con «id  código» de cada alta, para entregarlos EN PRIVADO. Obligatorio con --agregar.
//
// Garantías (comprobadas en actualizar-codigos.test.mjs):
//   · las huellas que se conservan se copian SIN cambios: los códigos ya entregados siguen funcionando;
//   · la línea resultante se valida con leerCodigos() del Worker antes de escribirla: un error de formato dejaría el
//     chat cerrado para TODOS (el Worker falla cerrado), así que la herramienta se niega a producirla;
//   · no se puede dar de alta un id que ya existe ni revocar uno que no existe, ni dejar la lista vacía;
//   · no imprime códigos, huellas ni la línea: solo ids y recuentos. Los archivos no pueden estar dentro del
//     repositorio y nunca se sobrescriben. No usa la red ni cambia ningún secreto.
//
// Después (solo la persona autorizada): cargar --salida con «npx wrangler secret put AIRI_CODIGOS -c
// wrangler.produccion.jsonc» y GUARDAR ese archivo como nueva copia de la línea vigente. Ver documentacion/PILOTO_v0.7.md.
import { readFileSync, writeFileSync, existsSync, realpathSync } from "node:fs";
import { resolve, relative, isAbsolute, dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { generarCodigo, huellaCodigo, normalizarCodigo } from "../codigos.mjs";
import { leerCodigos } from "../worker.js";

export const ID_VALIDO = /^[a-z0-9-]{1,32}$/;
const RAIZ_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export class ErrorUso extends Error {}

/** Calcula la nueva línea. `actual`: texto de AIRI_CODIGOS. Devuelve {linea, entregas:[[id, codigo]], resumen}. */
export async function actualizar(actual, { agregar = [], revocar = [] } = {}) {
  const mapa = leerCodigos(String(actual ?? "").trim());
  if (!mapa) throw new ErrorUso("La línea actual de AIRI_CODIGOS falta o no tiene el formato «id:huella64hex,…» (sin comillas).");
  const porId = new Map([...mapa].map(([h, id]) => [id, h]));
  for (const id of [...agregar, ...revocar])
    if (!ID_VALIDO.test(id)) throw new ErrorUso(`Id no válido: «${id}» (minúsculas, números o guiones; hasta 32).`);
  if (new Set([...agregar, ...revocar]).size !== agregar.length + revocar.length)
    throw new ErrorUso("Un id aparece repetido o a la vez en --agregar y --revocar.");
  for (const id of agregar) if (porId.has(id)) throw new ErrorUso(`«${id}» ya tiene código. Para cambiarlo: revócalo y da de alta un id nuevo.`);
  for (const id of revocar) if (!porId.has(id)) throw new ErrorUso(`«${id}» no está en la línea actual: no se puede revocar.`);
  if (!agregar.length && !revocar.length) throw new ErrorUso("Indica al menos un id con --agregar o --revocar.");

  const conservados = [...porId].filter(([id]) => !revocar.includes(id));
  const entregas = [];
  const nuevos = [];
  for (const id of agregar) {
    const codigo = generarCodigo();
    if (normalizarCodigo(codigo) !== codigo) throw new Error("código no canónico");   // salvaguarda
    entregas.push([id, codigo]);
    nuevos.push([id, await huellaCodigo(codigo)]);
  }
  const pares = [...conservados, ...nuevos];
  if (!pares.length) throw new ErrorUso("La lista quedaría vacía y el chat se cerraría para todos. Usa AIRI_CHAT_APAGADO para detenerlo.");
  const linea = pares.map(([id, h]) => `${id}:${h}`).join(",");

  // Comprobaciones finales con el mismo lector del Worker: formato, huellas conservadas intactas y altas aceptadas.
  const final = leerCodigos(linea);
  if (!final || final.size !== pares.length) throw new Error("la línea resultante no es válida para el Worker");
  for (const [id, h] of conservados) if (final.get(h) !== id) throw new Error("se alteró una huella existente");
  for (const [id, codigo] of entregas) if (final.get(await huellaCodigo(codigo)) !== id) throw new Error("un código nuevo no coincide");

  return { linea, entregas, resumen: { conservados: conservados.map(([id]) => id), agregados: [...agregar], revocados: [...revocar] } };
}

/** Ruta de salida segura: fuera del repositorio y sin sobrescribir. */
export function rutaSegura(ruta, raiz = RAIZ_REPO) {
  if (!ruta) throw new ErrorUso("Falta una ruta de archivo.");
  const abs = resolve(ruta);
  let base = raiz;
  try { base = realpathSync(raiz); } catch { /* raíz inexistente: se usa tal cual */ }
  let dir;
  try { dir = realpathSync(dirname(abs)); } catch { throw new ErrorUso(`La carpeta de «${ruta}» no existe.`); }
  const rel = relative(base.toLowerCase(), join(dir, basename(abs)).toLowerCase());   // Windows: sin distinguir mayúsculas
  if (!rel.startsWith("..") && !isAbsolute(rel)) throw new ErrorUso(`«${ruta}» está dentro del repositorio: guarda los códigos fuera de él.`);
  if (existsSync(abs)) throw new ErrorUso(`«${ruta}» ya existe: no se sobrescribe. Elige otro nombre.`);
  return abs;
}

function leerArgumentos(argv) {
  const op = { agregar: [], revocar: [] };
  let lista = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--agregar" || a === "--revocar") { lista = op[a.slice(2)]; continue; }
    if (a === "--actual" || a === "--salida" || a === "--entregas") { op[a.slice(2)] = argv[++i]; lista = null; continue; }
    if (a.startsWith("--") || !lista) throw new ErrorUso(`Argumento no reconocido: «${a}».`);
    lista.push(a);
  }
  if (!op.actual) throw new ErrorUso("Falta --actual (archivo con la línea vigente de AIRI_CODIGOS).");
  if (!op.salida) throw new ErrorUso("Falta --salida (archivo nuevo para la línea resultante).");
  if (op.agregar.length && !op.entregas) throw new ErrorUso("Con --agregar hace falta --entregas (archivo nuevo para los códigos).");
  return op;
}

export async function principal(argv, salida = console.log) {
  const op = leerArgumentos(argv);
  const destino = rutaSegura(op.salida);
  const destinoEntregas = op.agregar.length ? rutaSegura(op.entregas) : null;
  if (destinoEntregas && destinoEntregas.toLowerCase() === destino.toLowerCase()) throw new ErrorUso("--salida y --entregas deben ser archivos distintos.");
  let actual;
  try { actual = readFileSync(resolve(op.actual), "utf-8").replace(/^﻿/, ""); } catch { throw new ErrorUso(`No se pudo leer «${op.actual}».`); }
  const r = await actualizar(actual, op);
  if (destinoEntregas) {
    writeFileSync(destinoEntregas, "AIRI · códigos personales. Entrega cada uno EN PRIVADO a su participante y borra este archivo después.\n" +
      r.entregas.map(([id, c]) => `${id}  ${c}`).join("\n") + "\n", { encoding: "utf-8", flag: "wx", mode: 0o600 });
  }
  writeFileSync(destino, r.linea, { encoding: "utf-8", flag: "wx", mode: 0o600 });
  const lista = (xs) => (xs.length ? xs.join(", ") : "ninguno");
  salida(`Conservados (sus códigos siguen funcionando): ${lista(r.resumen.conservados)}`);
  salida(`Dados de alta: ${lista(r.resumen.agregados)}`);
  salida(`Revocados: ${lista(r.resumen.revocados)}`);
  salida(`Total en la nueva línea: ${r.resumen.conservados.length + r.resumen.agregados.length} participantes.`);
  salida(`Línea nueva escrita en: ${destino}` + (destinoEntregas ? `\nCódigos nuevos escritos en: ${destinoEntregas}` : ""));
  salida("No se ha cambiado ningún secreto. Para activarla (solo la persona autorizada), desde publico/:\n" +
    "  npx wrangler secret put AIRI_CODIGOS -c wrangler.produccion.jsonc   (pega el contenido de la línea nueva)\n" +
    "Guarda la línea nueva como copia vigente: la necesitarás para la próxima alta o revocación.");
  return r;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  principal(process.argv.slice(2)).catch((e) => {
    console.error(e instanceof ErrorUso ? e.message : "Error inesperado; no se escribió ningún archivo nuevo de línea.");
    process.exit(e instanceof ErrorUso ? 1 : 2);
  });
}
