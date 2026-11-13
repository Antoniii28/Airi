// AIRI v0.7 E3 — Prepara publico/dist con la interfaz que servirá el Worker (recursos estáticos).
//   node publico/preparar-estaticos.mjs
// Copia SOLO lo que necesita la página (sin pruebas, documentación, motor Python ni servidor local) y genera
// `_headers` con una CSP estricta: el único script en línea de la página se permite por su huella SHA-256.
// No despliega nada.
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..");
const DIST = join(AQUI, "dist");

const COPIAR = ["interfaz/prototipo", "interfaz/chat", "interfaz/mascota", "interfaz/motor"];
const EXCLUIR = (ruta) => /(^|\/)(pruebas|__pycache__)(\/|$)|\.md$|\.py$/.test(ruta);

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
for (const d of COPIAR)
  cpSync(join(RAIZ, d), join(DIST, d), { recursive: true, filter: (src) => !EXCLUIR(relative(RAIZ, src).replaceAll("\\", "/")) });
mkdirSync(join(DIST, "identidad-visual"), { recursive: true });
for (const f of readdirSync(join(RAIZ, "identidad-visual")))
  if (/\.(png|jpe?g|svg)$/i.test(f)) cpSync(join(RAIZ, "identidad-visual", f), join(DIST, "identidad-visual", f));

// Página raíz: redirección sin scripts (compatible con la CSP)
writeFileSync(join(DIST, "index.html"), `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=/interfaz/prototipo/index.html"><title>AIRI · Piloto</title></head>
<body><p><a href="/interfaz/prototipo/index.html">Abrir AIRI</a></p></body></html>\n`);

// Huellas de los scripts en línea de la página principal
const html = readFileSync(join(DIST, "interfaz/prototipo/index.html"), "utf-8");
const huellas = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => `'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);

const TS = "https://challenges.cloudflare.com";
const CSP = [
  "default-src 'self'", `script-src 'self' ${huellas.join(" ")} ${TS}`, "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:", "font-src 'self'", "connect-src 'self'", `frame-src ${TS}`, "object-src 'none'",
  "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'"
].join("; ");
writeFileSync(join(DIST, "_headers"), `/*
  Content-Security-Policy: ${CSP}
  Permissions-Policy: microphone=(self), camera=(), geolocation=(), payment=(), usb=()
  Referrer-Policy: no-referrer
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Strict-Transport-Security: max-age=31536000
  Cross-Origin-Opener-Policy: same-origin
`);

let n = 0, bytes = 0;
(function contar(d) { for (const f of readdirSync(d)) { const p = join(d, f); const s = statSync(p); if (s.isDirectory()) contar(p); else { n++; bytes += s.size; } } })(DIST);
console.log(`publico/dist preparado: ${n} archivos, ${(bytes / 1024).toFixed(0)} KB, ${huellas.length} script(s) en línea con huella.`);
