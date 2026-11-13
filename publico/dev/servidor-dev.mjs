// AIRI v0.7 E3 — Vista previa LOCAL del piloto con Cloudflare, Turnstile y Gemini SIMULADOS.
//   node publico/preparar-estaticos.mjs
//   node publico/dev/servidor-dev.mjs            → http://127.0.0.1:8787/
// No usa cuentas, claves ni red de Cloudflare o Google: todo lo externo está simulado y los secretos son ficticios.
// Simula lo que hace Cloudflare en la entrada: termina TLS (la petición se trata como https://airi-piloto.example),
// fija CF-Connecting-IP con la IP real del socket (descarta la del cliente), añade request.cf.country y aplica _headers.
// Códigos ficticios de prueba: PRUEB-AFICT-ICIA0-00001 (p01) y PRUEB-AFICT-ICIA0-00002 (p02).
// Variables opcionales: DEV_DIST (carpeta de estáticos), DEV_PUERTO, DEV_PAIS (MX), DEV_APAGADO=1, DEV_LIMITE_MINUTO, DEV_GEMINI=429|error|lento
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, normalize, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { manejar } from "../worker.js";
import { entorno, espacioCuotas, ORIGEN } from "../pruebas/apoyo.mjs";

const DIST = process.env.DEV_DIST ? resolve(process.env.DEV_DIST) : join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
if (!existsSync(join(DIST, "_headers"))) { console.error("Primero ejecuta: node publico/preparar-estaticos.mjs"); process.exit(1); }
const PUERTO = Number(process.env.DEV_PUERTO || 8787);
const LOCAL = `http://127.0.0.1:${PUERTO}`;

// _headers (formato simple generado por preparar-estaticos.mjs: una regla «/*»)
const cabecerasEstaticas = Object.fromEntries(readFileSync(join(DIST, "_headers"), "utf-8").split("\n")
  .filter((l) => /^\s+\S+:/.test(l)).map((l) => { const i = l.indexOf(":"); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpeg": "image/jpeg", ".jpg": "image/jpeg", ".json": "application/json" };

const env = await entorno({ AIRI_ORIGEN: ORIGEN, AIRI_CHAT_APAGADO: process.env.DEV_APAGADO === "1" ? "1" : "0",
  AIRI_LIMITE_MINUTO: process.env.DEV_LIMITE_MINUTO || "5", CUOTAS: espacioCuotas() });

// Red simulada: Turnstile acepta el token de prueba («token-valido») y el token ficticio de las claves de prueba
// oficiales de Cloudflare (sitekey 1x00000000000000000000AA); Gemini responde con texto de ejemplo.
async function redSimulada(url, init = {}) {
  const u = String(url);
  if (u.startsWith("https://challenges.cloudflare.com/")) {
    const { response } = JSON.parse(init.body);
    const ok = response === "token-valido" || /DUMMY/.test(response);
    return Response.json({ success: ok, hostname: new URL(ORIGEN).hostname, action: "airi-chat" });
  }
  if (u.startsWith("https://generativelanguage.googleapis.com/")) {
    const modo = process.env.DEV_GEMINI || "";
    if (modo === "429") return Response.json({ error: { status: "RESOURCE_EXHAUSTED" } }, { status: 429 });
    if (modo === "error") return Response.json({}, { status: 500 });
    if (modo === "lento") await new Promise((r) => setTimeout(r, 1500));
    const pregunta = JSON.parse(init.body).contents.at(-1).parts[0].text;
    return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text:
      `**Respuesta simulada** (Gemini no se consultó).\n\n- Tu pregunta: «${pregunta.slice(0, 80)}»\n- Modo: vista previa local del piloto` }] } }] });
  }
  throw new Error("Red bloqueada en la vista previa: " + u);
}

createServer(async (req, res) => {
  try {
    const ruta = new URL(req.url, LOCAL).pathname;
    if (ruta.startsWith("/api/")) {
      const cabeceras = new Headers();
      for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") cabeceras.set(k, v);
      cabeceras.set("cf-connecting-ip", req.socket.remoteAddress || "127.0.0.1");   // como Cloudflare: se ignora la del cliente
      if (cabeceras.get("origin") === LOCAL) cabeceras.set("origin", ORIGEN);       // TLS simulado: mismo origen
      const cuerpo = req.method === "POST" ? await new Promise((ok) => { const p = []; req.on("data", (c) => p.push(c)); req.on("end", () => ok(Buffer.concat(p))); }) : undefined;
      const peticion = new Request(ORIGEN + req.url, { method: req.method, headers: cabeceras, body: cuerpo });
      Object.defineProperty(peticion, "cf", { value: { country: process.env.DEV_PAIS || "MX" } });
      const r = await manejar(peticion, env, {}, { fetch: redSimulada });
      res.writeHead(r.status, Object.fromEntries(r.headers));
      return res.end(Buffer.from(await r.arrayBuffer()));
    }
    let archivo = normalize(join(DIST, decodeURIComponent(ruta)));
    if (!archivo.startsWith(DIST)) { res.writeHead(404); return res.end(); }
    if (existsSync(archivo) && statSync(archivo).isDirectory()) archivo = join(archivo, "index.html");
    if (!existsSync(archivo) || archivo.endsWith("_headers")) { res.writeHead(404, cabecerasEstaticas); return res.end("No encontrado"); }
    res.writeHead(200, { ...cabecerasEstaticas, "content-type": TIPOS[extname(archivo).toLowerCase()] || "application/octet-stream" });
    res.end(readFileSync(archivo));
  } catch (e) {
    res.writeHead(500); res.end("Error de la vista previa");
  }
}).listen(PUERTO, "127.0.0.1", () => console.log(`Vista previa SIMULADA del piloto: ${LOCAL}/  (Ctrl+C para detener)`));
