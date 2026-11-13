// Pruebas del Markdown seguro del chat (node --test). Sin dependencias.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const MD = require("../markdown.js");

const plano = (t) => MD.textoPlano(MD.analizar(t));
const tipos = (t) => MD.analizar(t).map((b) => b.tipo);

test("negrita, cursiva y código en línea sin asteriscos visibles", () => {
  const e = MD.enLinea("El **pez payaso** necesita *agua estable* y `pH` medido.");
  assert.deepEqual(e.map((x) => x.tipo), ["texto", "negrita", "texto", "cursiva", "texto", "codigo", "texto"]);
  assert.equal(plano("El **pez payaso** necesita *agua estable* y `pH` medido."), "El pez payaso necesita agua estable y pH medido.");
  assert.equal(plano("__Importante__ y _énfasis_"), "Importante y énfasis");
  assert.equal(plano("**negrita con *cursiva* dentro**"), "negrita con cursiva dentro");
});

test("marcas sueltas o técnicas se conservan como texto", () => {
  assert.equal(plano("5 * 3 = 15"), "5 * 3 = 15");
  assert.equal(plano("nombre_de_variable y otro_nombre"), "nombre_de_variable y otro_nombre");
  assert.equal(plano("precio \\*sin\\* cursiva"), "precio *sin* cursiva");
  assert.equal(plano("**sin cierre"), "**sin cierre");
});

test("títulos, listas con niveles, listas numeradas y citas", () => {
  const b = MD.analizar("## Cuidados\n\n- Agua estable\n- Dieta:\n  - pellets\n  - artemia\n\n1. Acondiciona\n2. Observa\n\n> Consulta a un veterinario");
  assert.deepEqual(b.map((x) => x.tipo), ["titulo", "lista", "lista", "cita"]);
  assert.equal(b[0].nivel, 2);
  assert.deepEqual(b[1].items.map((i) => i.nivel), [0, 0, 1, 1]);
  assert.equal(b[2].ordenada, true);
  assert.equal(plano("* Uno\n* Dos"), "Uno\nDos");
  assert.deepEqual(tipos("1) Primero\n2) Segundo"), ["lista"]);
});

test("párrafos con saltos de línea, separador y bloque de código", () => {
  assert.deepEqual(tipos("Hola\nsegunda línea\n\n---\n\n```\ncodigo **literal**\n```"), ["parrafo", "separador", "codigo"]);
  assert.equal(MD.analizar("```\ncodigo **literal**\n```")[0].texto, "codigo **literal**");
});

test("tablas simples", () => {
  const b = MD.analizar("| Parámetro | Valor |\n|---|:---:|\n| pH | 8.1 |\n| **Temp** | 25 °C |");
  assert.equal(b[0].tipo, "tabla");
  assert.equal(b[0].filas.length, 2);
  assert.equal(plano("| A | B |\n|---|---|\n| **x** | y |"), "A | B\nx | y");
});

test("los enlaces se muestran como texto con su dirección (no verificados)", () => {
  const e = MD.enLinea("Ver [FishBase](https://fishbase.org/x) para más");
  assert.equal(e[1].tipo, "enlace");
  assert.equal(e[1].url, "https://fishbase.org/x");
  assert.equal(plano("[texto](javascript:alert(1))"), "texto (javascript:alert(1))");   // solo texto, nunca un enlace
});

test("el HTML del modelo nunca se convierte en nodos: solo texto", () => {
  const ataques = ['<img src=x onerror="alert(1)">', "<script>alert(1)</script>", "**<b>hola</b>**",
    "[x](javascript:alert(1))", "`<svg onload=alert(1)>`", "| <i>a</i> | b |\n|---|---|\n| c | d |"];
  for (const a of ataques) {
    const json = JSON.stringify(MD.analizar(a));
    assert.ok(!/"tipo":"(html|raw)"/.test(json), a);
    if (a.includes("<")) assert.ok(plano(a).includes("<"), "el texto del HTML se conserva literal: " + a);
  }
});

test("entrada vacía o no textual", () => {
  assert.deepEqual(MD.analizar(""), []);
  assert.deepEqual(MD.analizar(null), []);
  assert.equal(plano("  \n\n  "), "");
});
