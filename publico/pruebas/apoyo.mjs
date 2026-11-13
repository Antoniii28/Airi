// Apoyo de pruebas: simula el entorno de Cloudflare (Durable Object, Turnstile y Gemini) SIN red ni cuentas reales.
// Todos los secretos son ficticios.
import { ControlCuotasAIRI } from "../cuotas.js";
import { sha256 } from "../worker.js";

export const ORIGEN = "https://airi-piloto.example";
export const CODIGO = "PRUEB-AFICT-ICIA0-00001";          // código ficticio del participante «p01»
export const CODIGO2 = "PRUEB-AFICT-ICIA0-00002";         // «p02»
export const CLAVE_FICTICIA = "AIzaFICTICIA-worker-0123456789abcdef";

/** Durable Object simulado: misma clase real, almacenamiento en un Map compartido (persiste entre «reinicios»). */
export function espacioCuotas(almacen = new Map()) {
  const crear = () => new ControlCuotasAIRI({
    storage: { get: async (k) => structuredClone(almacen.get(k)), put: async (k, v) => { almacen.set(k, structuredClone(v)); } },
    blockConcurrencyWhile: (fn) => fn()
  }, envBase);
  let instancia = null;
  const espacio = {
    almacen, llamadas: 0,
    idFromName: (n) => n,
    get: () => ({ fetch: (url, init) => { espacio.llamadas++; instancia ??= crear(); return instancia.fetch(new Request(url, init)); } }),
    reiniciar: () => { instancia = null; }        // simula que Cloudflare desaloja el objeto
  };
  return espacio;
}

let envBase = {};
export async function entorno(extra = {}) {
  const codigos = `p01:${await sha256(CODIGO)},p02:${await sha256(CODIGO2)}`;
  const env = {
    GEMINI_API_KEY: CLAVE_FICTICIA, TURNSTILE_SECRET: "1x0000000000000000000000000000000AA",
    AIRI_TURNSTILE_SITEKEY: "1x00000000000000000000AA", AIRI_SAL: "sal-ficticia-de-pruebas-0123456789abcdef",
    AIRI_CODIGOS: codigos, AIRI_ORIGEN: ORIGEN, AIRI_PAISES_PERMITIDOS: "MX", AIRI_CHAT_APAGADO: "0",
    AIRI_LIMITE_MINUTO: "5", AIRI_LIMITE_DIA: "30", AIRI_LIMITE_GLOBAL_DIA: "100", ...extra
  };
  envBase = env;
  if (!("CUOTAS" in extra)) env.CUOTAS = espacioCuotas();
  return env;
}

/** fetch simulado de Turnstile y Gemini; registra cada llamada. */
export function redSimulada(opciones = {}) {
  const red = { turnstile: [], gemini: [], ...opciones };
  red.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u.startsWith("https://challenges.cloudflare.com/")) {
      const cuerpo = JSON.parse(init.body);
      red.turnstile.push(cuerpo);
      if (red.turnstileFalla) throw new Error("sin red");
      const v = red.turnstileRespuesta ?? { success: cuerpo.response === "token-valido", hostname: new URL(ORIGEN).hostname, action: "airi-chat" };
      return Response.json(v);
    }
    if (u.startsWith("https://generativelanguage.googleapis.com/")) {
      red.gemini.push({ url: u, cabeceras: new Headers(init.headers), cuerpo: JSON.parse(init.body) });
      if (red.geminiFalla) throw new Error("sin red");
      const [estado, datos] = red.geminiRespuesta ?? [200, { candidates: [{ content: { parts: [{ text: "Respuesta **simulada**." }] }, finishReason: "STOP" }] }];
      return Response.json(datos, { status: estado });
    }
    throw new Error("Petición inesperada a " + u);
  };
  return red;
}

export function peticion({ cuerpo, cabeceras = {}, pais = "MX", ip = "203.0.113.7", metodo = "POST", ruta = "/api/chat", sinCf = false } = {}) {
  const h = { origin: ORIGEN, "content-type": "application/json", "x-airi-acceso": CODIGO, "cf-connecting-ip": ip, ...cabeceras };
  for (const k of Object.keys(h)) if (h[k] === null) delete h[k];
  const init = { method: metodo, headers: h };
  if (metodo !== "GET" && metodo !== "HEAD") init.body = cuerpo ?? JSON.stringify({ messages: [{ role: "user", text: "Hola" }], turnstile: "token-valido" });
  const r = new Request(ORIGEN + ruta, init);
  if (!sinCf) Object.defineProperty(r, "cf", { value: { country: pais } });
  return r;
}
