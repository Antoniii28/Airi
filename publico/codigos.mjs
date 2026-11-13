// AIRI v0.7 — Forma canónica de los códigos de acceso personales. Módulo ÚNICO usado por el Worker, por
// herramientas/generar-codigos.mjs y por herramientas/comprobar-codigo.mjs, para que la huella SHA-256 de un mismo
// código sea siempre idéntica.
//
// Corrección (13-11-2026): el Worker solo aplicaba trim() y mayúsculas. Un código válido escrito sin guiones, con
// espacios o pegado con un espacio no separable (U+00A0, habitual al copiar de páginas web o WhatsApp Web) producía
// otra huella y se respondía «Código de acceso no válido o revocado».
//
// Forma canónica: NFKC → mayúsculas → se quitan espacios (incluidos los no separables), guiones de cualquier tipo
// y caracteres invisibles → si quedan exactamente 20 letras o números, se agrupan de 5 en 5 con «-».
// Es la misma forma que imprime el generador, por lo que las huellas ya cargadas en AIRI_CODIGOS siguen siendo
// válidas. La normalización solo elimina separadores: no cambia letras ni números, así que no amplía qué códigos
// se aceptan (100 bits de entropía).

export const LONGITUD_CODIGO = 20;
const SEPARADORES = /[\s ­᠎​-‍⁠﻿\p{Dash_Punctuation}−⁃﹣－]/gu;

/** Devuelve la forma canónica o null si el texto no puede ser un código (tras quitar separadores). */
export function normalizarCodigo(texto) {
  if (typeof texto !== "string" || texto.length > 200) return null;
  const limpio = texto.normalize("NFKC").toUpperCase().replace(SEPARADORES, "");
  if (!/^[A-Z0-9]{8,64}$/.test(limpio)) return null;
  return limpio.length === LONGITUD_CODIGO ? limpio.match(/.{5}/g).join("-") : limpio;
}

async function sha256hex(texto) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Huella SHA-256 (hex) de la forma canónica. Usa Web Crypto (Workers y Node 18+). */
export async function huellaCodigo(texto) {
  const canonico = normalizarCodigo(texto);
  return canonico ? sha256hex(canonico) : null;
}

/**
 * Formas aceptadas de un código, en orden (corrección del 13-11-2026, códigos MANUALES):
 *   canonica  → la del generador (normalizarCodigo)
 *   anterior  → trim() + mayúsculas: lo que hacía el Worker antes del PR #11. Sin ella, un código manual como
 *               «Airi-Piloto-2026» o «Acuario_Marino.26» que funcionaba dejó de funcionar.
 *   exacta    → trim() tal cual: para huellas calculadas a mano sobre el texto original (mayúsculas y minúsculas).
 * Cada forma tiene que coincidir con una huella ya cargada en AIRI_CODIGOS: no se acepta ningún código nuevo.
 */
// Caracteres de control C0 (incluidos tabulador y saltos de línea), DEL y C1: un código nunca los lleva.
const CONTROL = /[\u0000-\u001F\u007F-\u009F]/;

export function formasCodigo(texto) {
  if (typeof texto !== "string" || texto.length > 200) return [];
  if (CONTROL.test(texto.trim())) return [];   // revisión 13-11-2026: sin caracteres de control en ninguna forma
  const formas = [];
  const canonica = normalizarCodigo(texto);
  if (canonica) formas.push(["canonica", canonica]);
  const crudo = texto.trim();
  if (crudo.length >= 8 && crudo.length <= 64) {
    formas.push(["anterior", crudo.toUpperCase()]);
    formas.push(["exacta", crudo]);
  }
  const vistas = new Set();
  return formas.filter(([, f]) => !vistas.has(f) && vistas.add(f));
}

/** Huellas de todas las formas aceptadas: [[nombre, huellaHex], …]. */
export async function huellasCodigo(texto) {
  return Promise.all(formasCodigo(texto).map(async ([nombre, f]) => [nombre, await sha256hex(f)]));
}

/** ¿Tiene el formato de los códigos que genera generar-codigos.mjs? (solo para registros de diagnóstico). */
export const formatoGenerado = (canonico) => typeof canonico === "string" && /^[A-Z0-9]{5}(-[A-Z0-9]{5}){3}$/.test(canonico);
