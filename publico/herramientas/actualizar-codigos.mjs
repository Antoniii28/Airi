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
// Garantías (comprobadas en publico/accesos.test.mjs):
//   · las huellas que se conservan se copian SIN cambios: los códigos ya entregados siguen funcionando;
//   · la línea resultante se valida con leerCodigos() del Worker antes de escribirla: un error de formato dejaría el
//     chat cerrado para TODOS (el Worker falla cerrado), así que la herramienta se niega a producirla;
//   · no se puede dar de alta un id que ya existe ni revocar uno que no existe, ni dejar la lista vacía;
//   · no imprime códigos, huellas ni la línea: solo ids y recuentos. Los archivos no pueden estar dentro del
//     repositorio y nunca se sobrescriben. No usa la red ni cambia ningún secreto;
//   · escritura TODO O NADA: ambos archivos se escriben primero como temporales en su carpeta y después se publican
//     sin sobrescribir (enlace duro; copia exclusiva si el sistema de archivos no lo admite), la línea en ÚLTIMO
//     lugar. Ante cualquier fallo se borran los temporales y lo ya publicado: no quedan códigos sueltos ni una línea
//     sin sus códigos.
//
// Después (solo la persona autorizada): cargar --salida con «npx wrangler secret put AIRI_CODIGOS -c
// wrangler.produccion.jsonc» y GUARDAR ese archivo como nueva copia de la línea vigente. Ver documentacion/PILOTO_v0.7.md.
import * as fs from "node:fs";
import { readFileSync, existsSync, realpathSync } from "node:fs";
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

const SIN_ENLACES = new Set(["EPERM", "ENOTSUP", "EOPNOTSUPP", "ENOSYS", "EXDEV"]);

export const PREFIJO_TEMPORAL = ".airi-tmp-";

/**
 * Escribe [[ruta, contenido], …] todo o nada. `fsx` permite simular fallos en las pruebas.
 * Fase 1: temporales «.airi-tmp-*» en la misma carpeta (flag wx) y volcados a disco (fsync). Fase 2: publicación sin
 * sobrescribir, en orden (el último archivo es la señal de éxito). Fase 3: borrar temporales.
 * Si algo falla en las fases 1–2, se deshace todo lo creado (ErrorUso). Devuelve las rutas de temporales que NO se
 * pudieron borrar en la fase 3 (el resultado es correcto, pero esos archivos contienen datos sensibles).
 *
 * LÍMITES (no los cubre ningún código en espacio de usuario):
 *  · Cierre abrupto del proceso (kill, cierre de la terminal, fallo de Node) entre fases: no hay deshacer. Pueden
 *    quedar temporales «.airi-tmp-*» y, si ocurre entre las dos publicaciones, el archivo de códigos SIN la línea.
 *    Regla: si no existe el archivo de la línea, la ejecución NO terminó; borra el de códigos (esos códigos no están
 *    en ninguna línea y no sirven). La siguiente ejecución avisa de los temporales que encuentre (avisarRestos).
 *  · Apagón: fsync vuelca el CONTENIDO de cada temporal antes de publicarlo, así que un archivo publicado no queda
 *    vacío ni truncado. La entrada del directorio (el enlace) no se puede volcar desde Node en Windows: tras un apagón
 *    un archivo publicado podría no existir; se aplica la regla anterior.
 *  · Borrado imposible (antivirus, archivo abierto, permisos): se informa de las rutas exactas, nunca del contenido.
 *  · Los archivos borrados pueden ser recuperables del disco o de copias de seguridad/sincronización (OneDrive…):
 *    usa una carpeta local no sincronizada.
 */
export function escribirTodoONada(archivos, fsx = fs) {
  const temporales = [], publicados = [];
  try {
    for (const [ruta, contenido] of archivos) {
      const tmp = join(dirname(ruta), `${PREFIJO_TEMPORAL}${crypto.randomUUID()}-${basename(ruta)}`);
      temporales.push(tmp);
      fsx.writeFileSync(tmp, contenido, { encoding: "utf-8", flag: "wx", mode: 0o600 });
      const fd = fsx.openSync(tmp, "r+");   // r+: en Windows fsync necesita acceso de escritura
      try { fsx.fsyncSync(fd); } finally { fsx.closeSync(fd); }
    }
    archivos.forEach(([ruta], i) => {
      try { fsx.linkSync(temporales[i], ruta); }   // atómico y sin sobrescribir (EEXIST)
      catch (e) {
        if (!SIN_ENLACES.has(e?.code)) throw e;
        // Sistema de archivos sin enlaces duros (p. ej. FAT): copia exclusiva; una copia parcial también se borra.
        try { fsx.copyFileSync(temporales[i], ruta, fs.constants.COPYFILE_EXCL); }
        catch (e2) { if (e2?.code !== "EEXIST") publicados.push(ruta); throw e2; }
      }
      publicados.push(ruta);
    });
  } catch (e) {
    const restos = [];
    for (const f of [...publicados, ...temporales]) {
      try { fsx.unlinkSync(f); } catch (e3) { if (e3?.code !== "ENOENT") restos.push(f); }
    }
    throw new ErrorUso((e?.code === "EEXIST" ? "Un archivo de destino ya existe: no se sobrescribe." : "No se pudieron escribir los archivos.") +
      (restos.length ? ` BORRA A MANO estos archivos sensibles: ${restos.join(", ")}` : " No se dejó ningún archivo nuevo."));
  }
  const sinBorrar = [];
  for (const tmp of temporales) { try { fsx.unlinkSync(tmp); } catch (e) { if (e?.code !== "ENOENT") sinBorrar.push(tmp); } }
  return sinBorrar;
}

/** Temporales «.airi-tmp-*» que dejó una ejecución anterior interrumpida en esas carpetas (solo rutas). */
export function avisarRestos(carpetas, fsx = fs) {
  const restos = [];
  for (const c of new Set(carpetas)) {
    try { for (const f of fsx.readdirSync(c)) if (f.startsWith(PREFIJO_TEMPORAL)) restos.push(join(c, f)); } catch { /* sin acceso: nada que avisar */ }
  }
  return restos;
}

export async function principal(argv, salida = console.log, fsx = fs) {
  const op = leerArgumentos(argv);
  const destino = rutaSegura(op.salida);
  const destinoEntregas = op.agregar.length ? rutaSegura(op.entregas) : null;
  if (destinoEntregas && destinoEntregas.toLowerCase() === destino.toLowerCase()) throw new ErrorUso("--salida y --entregas deben ser archivos distintos.");
  let actual;
  try { actual = readFileSync(resolve(op.actual), "utf-8").replace(/^﻿/, ""); } catch { throw new ErrorUso(`No se pudo leer «${op.actual}».`); }
  const r = await actualizar(actual, op);
  const archivos = [];
  if (destinoEntregas) {
    archivos.push([destinoEntregas,"AIRI · códigos personales. Entrega cada uno EN PRIVADO a su participante y borra este archivo después.\n" +
      r.entregas.map(([id, c]) => `${id}  ${c}`).join("\n") + "\n"]);
  }
  archivos.push([destino, r.linea]);   // la línea, en último lugar: su existencia indica que todo se escribió
  const previos = avisarRestos(archivos.map(([ruta]) => dirname(ruta)), fsx);
  const sinBorrar = escribirTodoONada(archivos, fsx);
  if (previos.length)
    salida(`⚠ Hay temporales de una ejecución anterior interrumpida (contienen datos sensibles; bórralos a mano): ${previos.join(", ")}`);
  if (sinBorrar.length)
    salida(`⚠ Resultado correcto, pero no se pudieron borrar estos temporales con datos sensibles; bórralos a mano: ${sinBorrar.join(", ")}`);
  const lista = (xs) => (xs.length ? xs.join(", ") : "ninguno");
  salida(`Conservados (sus códigos siguen funcionando): ${lista(r.resumen.conservados)}`);
  salida(`Dados de alta: ${lista(r.resumen.agregados)}`);
  salida(`Revocados: ${lista(r.resumen.revocados)}`);
  salida(`Total en la nueva línea: ${r.resumen.conservados.length + r.resumen.agregados.length} participantes.`);
  salida(`Línea nueva escrita en: ${destino}` + (destinoEntregas ? `\nCódigos nuevos escritos en: ${destinoEntregas}` : ""));
  salida("ANTES DE CARGARLA: --actual debe ser exactamente la línea cargada hoy en producción. Cloudflare no permite " +
    "leerla; si no lo es, cargar la nueva revocaría a quien falte en ella. Comprueba al menos un código vigente con " +
    "herramientas/comprobar-codigo.mjs contra --actual (ver documentacion/PILOTO_v0.7.md).");
  salida("No se ha cambiado ningún secreto. Para activarla (solo la persona autorizada), desde publico/:\n" +
    "  npx wrangler secret put AIRI_CODIGOS -c wrangler.produccion.jsonc   (pega el contenido de la línea nueva)\n" +
    "Guarda la línea nueva como copia vigente: la necesitarás para la próxima alta o revocación.");
  return r;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  principal(process.argv.slice(2)).catch((e) => {
    console.error(e instanceof ErrorUso ? e.message : "Error inesperado antes de escribir; no se creó ningún archivo.");
    process.exit(e instanceof ErrorUso ? 1 : 2);
  });
}
