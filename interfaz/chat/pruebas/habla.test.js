// Pruebas de E2 (texto para hablar) y de la preferencia de voz de v0.6. node --test
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const H = require("../habla-markdown.js");
const V = require("../../mascota/voz.js");

const SIMBOLOS = /[*#|`>_~]/;

test("párrafos con negrita y cursiva sin símbolos", () => {
  const t = H.paraVoz("El **pez payaso** necesita *agua estable*");
  assert.equal(t, "El pez payaso necesita agua estable.");
});

test("listas: una frase por elemento; numeradas con ordinales", () => {
  assert.equal(H.paraVoz("- Pellets\n- Artemia\n  - congelada"), "Pellets. Artemia. congelada.");
  assert.equal(H.paraVoz("1. Acondiciona el agua\n2. Observa el pez"), "Primero, acondiciona el agua. Segundo, observa el pez.");
});

test("tablas: cabecera con cada valor, sin barras; tablas largas se resumen", () => {
  const t = H.paraVoz("| Alimento | Frecuencia |\n|---|---|\n| Pellets | 2–3 veces al día |\n| **Artemia** | 1 vez |");
  assert.equal(t, "Tabla con 2 filas. Fila 1: Alimento, Pellets; Frecuencia, 2 a 3 veces al día. Fila 2: Alimento, Artemia; Frecuencia, 1 vez.");
  const larga = "| A | B |\n|---|---|\n" + Array.from({ length: 11 }, (_, i) => "| x" + i + " | y |").join("\n");
  const r = H.paraVoz(larga);
  assert.match(r, /^Tabla con 11 filas\./);
  assert.match(r, /Y 3 filas más; puedes verlas en pantalla\.$/);
  assert.equal((r.match(/Fila \d+/g) || []).length, H.MAX_FILAS);
});

test("enlaces, direcciones y código no se leen literalmente", () => {
  assert.equal(H.paraVoz("Consulta [FishBase](https://www.fishbase.se/x)."), "Consulta FishBase.");
  assert.equal(H.paraVoz("Mira https://ejemplo.org/pagina"), "Mira un enlace.");
  assert.equal(H.paraVoz("```\nprint('x')\n```"), "Hay un fragmento de código que puedes ver en pantalla.");
  assert.equal(H.paraVoz("Usa `pH` medido"), "Usa pH medido.");
});

test("títulos, citas, separadores y fechas", () => {
  assert.equal(H.paraVoz("## Cuidados\n\nTexto"), "Cuidados. Texto.");
  assert.equal(H.paraVoz("> Consulta a un veterinario"), "Cita: Consulta a un veterinario.");
  assert.equal(H.paraVoz("Uno\n\n---\n\nDos"), "Uno. Dos.");
  assert.equal(H.paraVoz("Fecha 2026-11-12"), "Fecha 2026-11-12.");
  assert.equal(H.paraVoz("Entre 24-26 grados"), "Entre 24 a 26 grados.");
});

test("ninguna salida contiene símbolos de Markdown", () => {
  const casos = ["**a** _b_ `c`", "| x | y |\n|---|---|\n| **1** | *2* |", "# T\n\n> c\n\n- **l**", "5 * 3 = 15", "a_b_c"];
  for (const c of casos) assert.doesNotMatch(H.paraVoz(c), SIMBOLOS, c);
});

test("voz: Microsoft Sabina (es-MX) es la preferida; si no está, la mejor voz local en español", () => {
  const voces = [
    { name: "Microsoft Raul - Spanish (Mexico)", lang: "es-MX", localService: true, voiceURI: "raul" },
    { name: "Microsoft Helena - Spanish (Spain)", lang: "es-ES", localService: true, voiceURI: "helena", default: true },
    { name: "Microsoft Sabina - Spanish (Mexico)", lang: "es-MX", localService: true, voiceURI: "sabina" },
    { name: "Microsoft Dalia Online (Natural) - Spanish (Mexico)", lang: "es-MX", localService: false, voiceURI: "dalia" }
  ];
  assert.equal(V.elegirVoz(voces).voiceURI, "sabina");
  assert.equal(V.elegirVoz(voces.filter((v) => v.voiceURI !== "sabina")).voiceURI, "raul");          // otra local es-MX
  assert.equal(V.elegirVoz(voces.filter((v) => /helena|dalia/.test(v.voiceURI))).voiceURI, "helena"); // local antes que en línea
  assert.equal(V.elegirVoz([voces[3]]), null);                                                          // en línea solo con permiso
});

test("matiz «conversación»: más pausado, dentro de los límites", () => {
  const base = V.prosodia(null, "espera"), conv = V.prosodia(null, "conversacion");
  assert.ok(conv.velocidad < base.velocidad && conv.tono < base.tono);
  assert.ok(conv.velocidad >= V.LIMITES.velocidad[0] && conv.tono >= V.LIMITES.tono[0]);
});
