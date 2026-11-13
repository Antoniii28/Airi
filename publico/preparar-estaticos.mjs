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
  const lista = archivos(dist);
  const bytes = lista.reduce((s, p) => s + statSync(p).size, 0);
  return { archivos: lista.length, kb: Math.round(bytes / 1024), huellas: huellas.size };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const r = preparar(process.env.AIRI_ESTATICOS_ORIGEN ? resolve(process.env.AIRI_ESTATICOS_ORIGEN) : undefined,
                     process.env.AIRI_ESTATICOS_DESTINO ? resolve(process.env.AIRI_ESTATICOS_DESTINO) : undefined);
  console.log(`publico/dist preparado: ${r.archivos} archivos, ${r.kb} KB, ${r.huellas} script(s) en línea con huella.`);
}
