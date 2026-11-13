// AIRI v0.7 — Worker del piloto cerrado (E2–E3). NO ESTÁ DESPLEGADO.
//
// Cierre por defecto (fail closed): el chat solo responde si TODA la configuración esencial existe y es válida
// y además AIRI_CHAT_APAGADO === "0". Cualquier falta → 503 sin llamar a Gemini.
//
// Orden de controles en POST /api/chat:
//  1. ruta y método · 2. configuración completa · 3. interruptor · 4. origen exacto · 5. tipo y tamaño
//  6. país según Cloudflare (request.cf.country; no se lee ninguna cabecera del cliente) · 7. JSON y conversación
//  8. huella de IP bloqueada por intentos fallidos (Durable Object) · 9. Turnstile verificado EN EL SERVIDOR
//  10. código de acceso individual (solo se guardan huellas SHA-256) · 11. cuotas atómicas (Durable Object)
//  12. Gemini con la clave como secreto · 13. pausa automática si Gemini devuelve 429
//
// Secretos (wrangler secret put, nunca en el repositorio): GEMINI_API_KEY, TURNSTILE_SECRET, AIRI_CODIGOS, AIRI_SAL.
// Variables (wrangler.jsonc): AIRI_CHAT_APAGADO, AIRI_ORIGEN, AIRI_TURNSTILE_SITEKEY, AIRI_PAISES_PERMITIDOS,
// AIRI_MODELO y límites (ver cuotas.js). Binding de Durable Object: CUOTAS.

import { leerLimites, ControlCuotasAIRI } from "./cuotas.js";
import { consultarGemini, MODELO_VALIDO } from "./gemini.js";

export { ControlCuotasAIRI };

const MAX_BODY = 64 * 1024, MAX_MESSAGES = 12, MAX_USER = 2500, MAX_MODEL = 12000, MAX_TOTAL = 40000;
const MAX_TOKEN_TURNSTILE = 2048, ACCION_TURNSTILE = "airi-chat";
const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Espacio Económico Europeo, Suiza y Reino Unido: las condiciones de Gemini exigen servicios de pago para usuarios
// de esas regiones. Se rechazan SIEMPRE, aunque se añadan por error a AIRI_PAISES_PERMITIDOS.
export const REGIONES_SOLO_PAGO = new Set(["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "CH", "GB"]);

const CABECERAS = {
  "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff",
  "x-frame-options": "DENY", "referrer-policy": "no-referrer", "content-security-policy": "default-src 'none'; frame-ancestors 'none'"
};
const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...CABECERAS, ...extra } });
const registrar = (resultado, estado) => console.log(JSON.stringify({ airi: "chat", resultado, estado }));   // sin IP, código ni contenido

export function validarMensajes(datos) {
  if (!datos || !Array.isArray(datos.messages) || datos.messages.length < 1 || datos.messages.length > MAX_MESSAGES) return null;
  let total = 0; const out = [];
  for (const m of datos.messages) {
    if (!m || !["user", "model"].includes(m.role) || typeof m.text !== "string") return null;
    if (m.role !== (out.length % 2 === 0 ? "user" : "model")) return null;
    if (m.text.length < 1 || m.text.length > (m.role === "user" ? MAX_USER : MAX_MODEL)) return null;
    total += m.text.length; out.push({ role: m.role, parts: [{ text: m.text }] });
  }
  if (total > MAX_TOTAL || out[0].role !== "user" || out.at(-1).role !== "user") return null;
  return out;
}

/** Códigos del piloto: "id:sha256hex,id2:sha256hex". Devuelve Map(hash → id) o null si el formato es inválido. */
export function leerCodigos(texto) {
  if (typeof texto !== "string" || !texto.trim()) return null;
  const mapa = new Map();
  for (const parte of texto.split(",")) {
    const m = /^\s*([a-z0-9-]{1,32}):([0-9a-f]{64})\s*$/.exec(parte);
    if (!m || mapa.has(m[2]) || [...mapa.values()].includes(m[1])) return null;
    mapa.set(m[2], m[1]);
  }
  return mapa;
}

/** Comprueba toda la configuración esencial. Devuelve {ok, motivo?, cfg?}. Nunca incluye valores secretos. */
export function revisarConfiguracion(env = {}) {
  const falta = (m) => ({ ok: false, motivo: m });
  if (!env.GEMINI_API_KEY || typeof env.GEMINI_API_KEY !== "string") return falta("GEMINI_API_KEY");
  if (!env.TURNSTILE_SECRET) return falta("TURNSTILE_SECRET");
  if (!env.AIRI_TURNSTILE_SITEKEY) return falta("AIRI_TURNSTILE_SITEKEY");
  if (!env.AIRI_SAL || String(env.AIRI_SAL).length < 32) return falta("AIRI_SAL");
  const codigos = leerCodigos(env.AIRI_CODIGOS);
  if (!codigos) return falta("AIRI_CODIGOS");
  let origen;
  try { origen = new URL(env.AIRI_ORIGEN); } catch { return falta("AIRI_ORIGEN"); }
  if (origen.protocol !== "https:" || origen.origin !== env.AIRI_ORIGEN) return falta("AIRI_ORIGEN");
  const paises = String(env.AIRI_PAISES_PERMITIDOS || "").split(",").map((p) => p.trim()).filter(Boolean);
  if (!paises.length || paises.some((p) => !/^[A-Z]{2}$/.test(p))) return falta("AIRI_PAISES_PERMITIDOS");
  if (env.AIRI_MODELO && !MODELO_VALIDO.test(env.AIRI_MODELO)) return falta("AIRI_MODELO");
  const limites = leerLimites(env);
  if (!limites) return falta("limites");
  if (!env.CUOTAS || typeof env.CUOTAS.idFromName !== "function") return falta("CUOTAS");
  return { ok: true, cfg: { codigos, origen: origen.origin, host: origen.hostname, paises: new Set(paises), limites } };
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
export const sha256 = async (texto) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto)));
async function huellaIp(ip, sal) {
  const clave = await crypto.subtle.importKey("raw", new TextEncoder().encode(sal), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", clave, new TextEncoder().encode(ip))).slice(0, 32);
}
function igualTiempoConstante(a, b) {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
async function participante(codigo, codigos) {
  if (typeof codigo !== "string" || codigo.length < 8 || codigo.length > 64) return null;
  const h = await sha256(codigo.trim().toUpperCase());
  let id = null;
  for (const [hash, nombre] of codigos) if (igualTiempoConstante(hash, h)) id = nombre;   // recorre todos (sin salida temprana)
  return id;
}

async function cuotas(env, op) {
  const stub = env.CUOTAS.get(env.CUOTAS.idFromName("global"));
  const r = await stub.fetch("https://cuotas.airi/", { method: "POST", body: JSON.stringify(op) });
  if (!r.ok) throw new Error("cuotas");
  return r.json();
}

export async function verificarTurnstile(token, ip, env, cfg, hacerFetch = fetch) {
  if (typeof token !== "string" || !token || token.length > MAX_TOKEN_TURNSTILE) return false;
  let r;
  try {
    r = await hacerFetch(SITEVERIFY, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip, idempotency_key: crypto.randomUUID() }),
      signal: AbortSignal.timeout(10000)
    });
    const d = await r.json();
    return d?.success === true && d.hostname === cfg.host && d.action === ACCION_TURNSTILE;
  } catch { return false; }
}

const MENSAJES_CUOTA = {
  minuto: "Has hecho muchas preguntas seguidas. Espera un minuto y vuelve a intentarlo.",
  dia: "Alcanzaste tu límite de preguntas de hoy en el piloto. Podrás seguir mañana.",
  global: "El piloto alcanzó su límite de preguntas de hoy. Vuelve a intentarlo mañana.",
  pausa: "El chat está en pausa preventiva por el límite de Gemini. Inténtalo más tarde.",
  bloqueado: "Demasiados intentos fallidos desde esta conexión. Espera una hora antes de reintentar."
};

export async function manejar(request, env = {}, ctx = {}, deps = {}) {
  const hacerFetch = deps.fetch || fetch;
  const url = new URL(request.url);

  if (url.pathname === "/api/estado") {
    if (request.method !== "GET") return json({ error: "Método no permitido" }, 405, { allow: "GET" });
    const rev = revisarConfiguracion(env);
    const activo = rev.ok && env.AIRI_CHAT_APAGADO === "0";
    return json({ modo: "publico", activo, turnstile_sitekey: activo ? env.AIRI_TURNSTILE_SITEKEY : null,
      mensaje: activo ? "Piloto cerrado: necesitas un código de acceso." : "El chat del piloto está desactivado por ahora." });
  }
  if (url.pathname !== "/api/chat") return json({ error: "Ruta inexistente" }, 404);
  if (request.method !== "POST") return json({ error: "Método no permitido" }, 405, { allow: "POST" });

  const rev = revisarConfiguracion(env);
  if (!rev.ok) { registrar("sin_configurar", 503); return json({ error: "El chat del piloto no está configurado." }, 503); }
  if (env.AIRI_CHAT_APAGADO !== "0") { registrar("apagado", 503); return json({ error: "El chat del piloto está desactivado por ahora." }, 503); }
  const { cfg } = rev;

  if (request.headers.get("origin") !== cfg.origen || url.origin !== cfg.origen) return json({ error: "Origen no permitido" }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json({ error: "Se esperaba JSON" }, 415);
  const len = Number(request.headers.get("content-length"));
  if (request.headers.has("content-length") && (!Number.isSafeInteger(len) || len < 0 || len > MAX_BODY)) return json({ error: "Solicitud demasiado grande" }, 413);

  const pais = request.cf?.country;   // lo pone Cloudflare; el cliente no puede escribirlo
  if (typeof pais !== "string" || !/^[A-Z]{2}$/.test(pais) || REGIONES_SOLO_PAGO.has(pais) || !cfg.paises.has(pais)) {
    registrar("region", 403); return json({ error: "El piloto de AIRI no está disponible en esta región." }, 403);
  }
  const ip = request.headers.get("cf-connecting-ip");   // la fija Cloudflare en la entrada
  if (!ip || ip.length > 64) return json({ error: "No se pudo identificar la conexión." }, 403);

  let raw;
  try { raw = await request.text(); } catch { return json({ error: "No se pudo leer la solicitud" }, 400); }
  if (new TextEncoder().encode(raw).length > MAX_BODY) return json({ error: "Solicitud demasiado grande" }, 413);
  let data;
  try { data = JSON.parse(raw); } catch { return json({ error: "JSON inválido" }, 400); }
  const contents = validarMensajes(data);
  if (!contents) return json({ error: "Conversación inválida" }, 400);

  try {
    const huella = await huellaIp(ip, env.AIRI_SAL);
    const previo = await cuotas(env, { op: "consultar", ip: huella });
    if (!previo.ok) { registrar("bloqueado", 429); return json({ error: MENSAJES_CUOTA.bloqueado }, 429, { "retry-after": String(previo.reintentar || 3600) }); }

    if (!(await verificarTurnstile(data.turnstile, ip, env, cfg, hacerFetch))) {
      await cuotas(env, { op: "fallo", ip: huella });
      registrar("turnstile", 403);
      return json({ error: "No se pudo verificar que eres una persona. Completa la verificación y vuelve a intentarlo." }, 403);
    }
    const id = await participante(request.headers.get("x-airi-acceso"), cfg.codigos);
    if (!id) {
      await cuotas(env, { op: "fallo", ip: huella });
      registrar("codigo", 403);
      return json({ error: "Código de acceso no válido o revocado." }, 403);
    }
    const reserva = await cuotas(env, { op: "reservar", usuario: id });
    if (!reserva.ok) {
      const estado = reserva.motivo === "pausa" ? 503 : 429;
      registrar("cuota_" + reserva.motivo, estado);
      return json({ error: MENSAJES_CUOTA[reserva.motivo] || "Límite alcanzado." }, estado,
        reserva.reintentar ? { "retry-after": String(reserva.reintentar) } : {});
    }

    const g = await consultarGemini(contents, env, hacerFetch);
    if (g.limiteGoogle) await cuotas(env, { op: "pausar" });
    registrar(g.estado === 200 ? "ok" : "gemini", g.estado);
    return json(g.datos, g.estado);
  } catch {
    // Fallo de Durable Object (p. ej., límite diario del plan gratuito) o error inesperado: cerrado, sin detalles.
    registrar("error_interno", 503);
    return json({ error: "El servicio no está disponible en este momento." }, 503);
  }
}

export default { fetch: (request, env, ctx) => manejar(request, env, ctx) };
