// AIRI v0.7 E3 — Prepara publico/dist con la interfaz que servirá el Worker (recursos estáticos).
//   node publico/preparar-estaticos.mjs
// Copia SOLO lo que necesita la página (sin pruebas, documentación, motor Python ni servidor local) y genera
// `_headers` con una CSP estricta: los scripts en línea se permiten por su huella SHA-256. No despliega nada.
//
// IMPORTANTE (corrección del 13-11-2026): en Windows, Git suele entregar los archivos con saltos de línea CRLF.
// El analizador HTML del navegador convierte CRLF y CR sueltos en LF ANTES de calcular la huella de un script en
// línea para la CSP. Si la huella se calcula sobre el texto con CRLF, no coincide, el navegador bloquea el script
// y la navegación por pestañas deja de funcionar. Por eso los HTML de dist se normalizan a LF y la huella se calcula
// sobre ese texto normalizado (el mismo que ve el navegador).
//
// Variables opcionales (pruebas): AIRI_ESTATICOS_ORIGEN (raíz del proyecto) y AIRI_ESTATICOS_DESTINO (carpeta dist).
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { VERSION } from "./version.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const TS = "https://challenges.cloudflare.com";
const ICONO = '<link rel="icon" href="/identidad-visual/logo%20Airi.jpeg">';

/** Normaliza los saltos de línea como el preprocesado de la entrada HTML (CRLF y CR → LF). */
export const normalizarSaltos = (texto) => texto.replace(/\r\n?/g, "\n");

/** Huellas CSP ('sha256-…') de los scripts en línea, calculadas sobre el texto que verá el navegador. */
export function huellasScriptsEnLinea(html) {
  return [...normalizarSaltos(html).matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map((m) => `'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
}

/** Huella SHA-256 de un archivo; en los de texto se normalizan los saltos de línea (misma huella en Windows y Linux). */
export function huellaArchivo(bytes, nombre) {
  const datos = /\.(html|js|mjs|css|svg|json|txt)$/i.test(nombre) || nombre.endsWith("_headers")
    ? Buffer.from(normalizarSaltos(bytes.toString("utf-8")), "utf-8") : bytes;
  return createHash("sha256").update(datos).digest("hex");
}

export function construirCSP(huellas) {
  return [
    "default-src 'self'", `script-src 'self' ${huellas.join(" ")} ${TS}`.replace(/\s+/g, " "), "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:", "font-src 'self'", "connect-src 'self'", `frame-src ${TS}`, "object-src 'none'",
    "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'"
  ].join("; ");
}

function archivos(d) {
  return readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? archivos(p) : [p]; });
}

export function preparar(raiz = resolve(AQUI, ".."), dist = join(AQUI, "dist")) {
  const COPIAR = ["interfaz/prototipo", "interfaz/chat", "interfaz/mascota", "interfaz/motor"];
  const EXCLUIR = (ruta) => /(^|\/)(pruebas|__pycache__)(\/|$)|\.md$|\.py$/.test(ruta);
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  for (const d of COPIAR)
    cpSync(join(raiz, d), join(dist, d), { recursive: true, filter: (src) => !EXCLUIR(relative(raiz, src).replaceAll("\\", "/")) });
  mkdirSync(join(dist, "identidad-visual"), { recursive: true });
  for (const f of readdirSync(join(raiz, "identidad-visual")))
    if (/\.(png|jpe?g|svg)$/i.test(f)) cpSync(join(raiz, "identidad-visual", f), join(dist, "identidad-visual", f));

  // Página raíz: redirección sin scripts (compatible con la CSP)
  writeFileSync(join(dist, "index.html"), `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=/interfaz/prototipo/index.html"><title>AIRI · Piloto</title>${ICONO}</head>
<body><p><a href="/interfaz/prototipo/index.html">Abrir AIRI</a></p></body></html>\n`);

  // Todos los HTML: saltos de línea normalizados, icono de la página y huellas de sus scripts en línea
  const huellas = new Set();
  for (const f of archivos(dist).filter((p) => p.endsWith(".html"))) {
    let html = normalizarSaltos(readFileSync(f, "utf-8"));
    if (!html.includes('rel="icon"')) html = html.replace(/<head>/i, "<head>" + ICONO);
    writeFileSync(f, html);
    for (const h of huellasScriptsEnLinea(html)) huellas.add(h);
  }

  writeFileSync(join(dist, "_headers"), `/*
  Content-Security-Policy: ${construirCSP([...huellas])}
  Permissions-Policy: microphone=(self), camera=(), geolocation=(), payment=(), usb=()
  Referrer-Policy: no-referrer
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Strict-Transport-Security: max-age=31536000
  Cross-Origin-Opener-Policy: same-origin
`);
  // version.json: identifica qué se publicó (versión, commit y huella de todos los archivos). Sin datos sensibles.
  // herramientas/verificar-despliegue.mjs la compara con la copia desplegada.
  const contenido = archivos(dist).map((p) => relative(dist, p).replaceAll("\\", "/")).sort();
  const h = createHash("sha256");
  for (const r of contenido) if (r !== "version.json") h.update(r + "\0").update(huellaArchivo(readFileSync(join(dist, r)), r));
  let commit = "desconocido";
  try {
    commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: raiz, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const sucio = execFileSync("git", ["status", "--porcelain", "--", "interfaz", "identidad-visual", "publico"], { cwd: raiz, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (sucio) commit += "-con-cambios-locales";
  } catch { /* sin git: se deja «desconocido» */ }
  writeFileSync(join(dist, "version.json"), JSON.stringify({ version: VERSION, commit, huella: h.digest("hex"), generado: new Date().toISOString() }, null, 2) + "\n");

  const lista = archivos(dist);
  const bytes = lista.reduce((s, p) => s + statSync(p).size, 0);
  return { archivos: lista.length, kb: Math.round(bytes / 1024), huellas: huellas.size };
}

/** Revisa una configuración de Wrangler de producción. Devuelve la lista de problemas (vacía si es válida). */
export function revisarProduccion(texto) {
  const problemas = [];
  let cfg;
  try { cfg = JSON.parse(texto.replace(/^\s*\/\/.*$/gm, "")); } catch { return ["el archivo no es JSON válido"]; }
  const v = cfg.vars || {};
  if (cfg.name !== "airi") problemas.push(`name debe ser «airi» (el Worker existente), no «${cfg.name}»`);
  if (v.AIRI_CHAT_APAGADO !== "0") problemas.push("AIRI_CHAT_APAGADO debe ser \"0\" para publicar el chat abierto");
  if (!/^https:\/\/[a-z0-9.-]+$/.test(v.AIRI_ORIGEN || "")) problemas.push("AIRI_ORIGEN debe ser la URL https del Worker, sin ruta");
  if (!v.AIRI_TURNSTILE_SITEKEY || /PEGAR/.test(v.AIRI_TURNSTILE_SITEKEY) || /^[123]x0+[A-Z]{2}$/.test(v.AIRI_TURNSTILE_SITEKEY))
    problemas.push("AIRI_TURNSTILE_SITEKEY falta, es el texto de ejemplo o es una sitekey de PRUEBA de Cloudflare");
  if (!/^[A-Z]{2}(,[A-Z]{2})*$/.test(v.AIRI_PAISES_PERMITIDOS || "")) problemas.push("AIRI_PAISES_PERMITIDOS inválido");
  for (const s of ["GEMINI_API_KEY", "TURNSTILE_SECRET", "AIRI_CODIGOS", "AIRI_SAL"])
    if (s in v) problemas.push(`${s} es un SECRETO: no puede estar en «vars» (usa wrangler secret put)`);
  if (!cfg.durable_objects?.bindings?.some((b) => b.name === "CUOTAS" && b.class_name === "ControlCuotasAIRI")) problemas.push("falta el Durable Object CUOTAS");
  if (cfg.keep_vars) problemas.push("keep_vars no debe usarse: este archivo es la fuente de verdad de las variables");
  return problemas;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const despliegue = ["deploy", "versions upload"].includes(process.env.WRANGLER_COMMAND || "");
  if (process.argv.includes("--plantilla") && despliegue) {
    console.error("✖ wrangler.jsonc es solo una PLANTILLA y no se despliega (crearía otro Worker o cerraría el chat de producción).\n" +
      "  Usa: npx wrangler deploy -c wrangler.produccion.jsonc");
    process.exit(1);
  }
  const i = process.argv.indexOf("--produccion");
  if (i > 0) {
    const problemas = revisarProduccion(readFileSync(resolve(process.argv[i + 1]), "utf-8"));
    if (problemas.length) {
      console.error("✖ Despliegue cancelado. Revisa " + process.argv[i + 1] + ":\n  - " + problemas.join("\n  - "));
      process.exit(1);
    }
    console.log("✔ Configuración de producción revisada (Worker «airi»).");
  }
  const r = preparar(process.env.AIRI_ESTATICOS_ORIGEN ? resolve(process.env.AIRI_ESTATICOS_ORIGEN) : undefined,
                     process.env.AIRI_ESTATICOS_DESTINO ? resolve(process.env.AIRI_ESTATICOS_DESTINO) : undefined);
  console.log(`publico/dist preparado: ${r.archivos} archivos, ${r.kb} KB, ${r.huellas} script(s) en línea con huella.`);
}
