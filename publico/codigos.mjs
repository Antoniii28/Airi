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

/** Huella SHA-256 (hex) de la forma canónica. Usa Web Crypto (Workers y Node 18+). */
export async function huellaCodigo(texto) {
  const canonico = normalizarCodigo(texto);
  if (!canonico) return null;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonico));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** ¿Tiene el formato de los códigos que genera generar-codigos.mjs? (solo para registros de diagnóstico). */
export const formatoGenerado = (canonico) => typeof canonico === "string" && /^[A-Z0-9]{5}(-[A-Z0-9]{5}){3}$/.test(canonico);
