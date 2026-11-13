// Regresión (13-11-2026): con archivos CRLF (Git en Windows) la huella CSP del script en línea no coincidía con la
// que calcula el navegador → Chrome bloqueaba el script y las pestañas dejaban de funcionar.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, cpSync, readFileSync, writeFileSync, readdirSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizarSaltos, huellasScriptsEnLinea, preparar } from "./preparar-estaticos.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const huellaCSP = (dist) => readFileSync(join(dist, "_headers"), "utf-8").match(/'sha256-[^']+'/g);

test("normaliza saltos de línea como el navegador (CRLF y CR → LF)", () => {
  assert.equal(normalizarSaltos("a\r\nb\rc\nd"), "a\nb\nc\nd");
});
test("la huella del script en línea no depende de CRLF o LF", () => {
  const lf = "<html><script>\nvar a = 1;\nvar b = 2;\n</script></html>";
  const crlf = lf.replace(/\n/g, "\r\n");
  assert.deepEqual(huellasScriptsEnLinea(crlf), huellasScriptsEnLinea(lf));
  assert.equal(huellasScriptsEnLinea(lf).length, 1);
});
test("preparar(): una copia del proyecto con CRLF produce la misma CSP que con LF", () => {
  const base = mkdtempSync(join(tmpdir(), "airi-crlf-"));
  try {
    for (const d of ["interfaz", "identidad-visual"]) cpSync(join(RAIZ, d), join(base, d), { recursive: true });
    const convertir = (d) => readdirSync(d).forEach((f) => {
      const p = join(d, f);
      if (statSync(p).isDirectory()) return convertir(p);
      if (/\.(html|js|css)$/.test(f)) writeFileSync(p, normalizarSaltos(readFileSync(p, "utf-8")).replace(/\n/g, "\r\n"));
    });
    convertir(join(base, "interfaz"));
    assert.match(readFileSync(join(base, "interfaz/prototipo/index.html"), "utf-8"), /\r\n/);
    const distLF = join(base, "dist-lf"), distCRLF = join(base, "dist-crlf");
    preparar(RAIZ, distLF);
    preparar(base, distCRLF);
    assert.deepEqual(huellaCSP(distCRLF), huellaCSP(distLF));
    assert.ok(!readFileSync(join(distCRLF, "interfaz/prototipo/index.html"), "utf-8").includes("\r"));
    assert.match(readFileSync(join(distCRLF, "interfaz/prototipo/index.html"), "utf-8"), /rel="icon"/);
  } finally { rmSync(base, { recursive: true, force: true }); }
});
