// v0.6 E4 · Estado «pensando» de la mascota (lógica pura). node --test
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const M = require("../mascota.js");

test("existe el estado «pensando» y se conservan los de v0.1", () => {
  for (const e of ["bienvenida", "espera", "analisis", "insuficiente", "error", "alerta", "pensando"]) assert.ok(M.ESTADOS.includes(e), e);
});

test("mientras piensa, AIRI nada mucho más despacio que en espera (discreto)", () => {
  const p = { min: 0, max: 400, azar: () => 0.5 };
  let a = { x: 100, dir: 1 }, b = { x: 100, dir: 1 };
  for (let i = 0; i < 20; i++) { a = M.pasoNado(a, 0.1, { ...p, estado: "pensando" }); b = M.pasoNado(b, 0.1, { ...p, estado: "espera" }); }
  assert.ok(a.x - 100 > 0 && a.x - 100 < (b.x - 100) / 3, `${a.x} vs ${b.x}`);
});

test("las animaciones de «pensando» son lentas (≥ 1,4 s) y reutilizan airi-m-brillo", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "mascota.css"), "utf8");
  const bloque = css.slice(css.indexOf("v0.6 E4"));
  const duraciones = [...bloque.matchAll(/(\d+(?:\.\d+)?)s\b/g)].map((m) => parseFloat(m[1])).filter((d) => d >= 0.3);
  assert.ok(duraciones.length >= 4 && duraciones.every((d) => d >= 1.4), duraciones.join(", "));
  assert.match(bloque, /animation: airi-m-brillo 1\.6s/);
  assert.match(bloque, /\.airi-m-reducido \.airi-m-punto/);
});
