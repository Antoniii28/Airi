// AIRI v0.7 E2 — Cuotas compartidas y atómicas en un Durable Object (backend SQLite, disponible en Workers Free).
//
// Por qué un Durable Object: cada instancia es única y de un solo hilo; mientras se ejecuta código síncrono no entra
// otra petición (input gate), y la respuesta no sale hasta que la escritura queda guardada (output gate). Por eso
// toda la lógica de «comprobar y reservar» de `aplicar()` es SÍNCRONA: dos peticiones simultáneas no pueden superar
// el límite. No se usa KV para contar (no es atómico).
//
// Qué guarda (sin contenido de preguntas, sin IP en claro):
//   dia (UTC), global (consultas admitidas hoy), usuarios[id] = {dia, n, minuto:[marcas de tiempo]},
//   fallos[huella_ip] = {desde, n}  (intentos con código de acceso o Turnstile inválidos), pausaHasta (ms).

export const LIMITES_PREDETERMINADOS = Object.freeze({
  minuto: 5,        // consultas por participante y minuto
  dia: 30,          // consultas por participante y día (UTC)
  globalDia: 100,   // consultas de todo el piloto por día (UTC); ejemplo conservador, NO es la cuota real de Google
  fallosMax: 10,    // intentos fallidos por huella de IP y hora antes de bloquear
  pausaMin: 15      // minutos de pausa automática si Gemini devuelve 429
});
const RANGOS = { minuto: [1, 60], dia: [1, 1000], globalDia: [1, 100000], fallosMax: [1, 1000], pausaMin: [1, 1440] };
const VARIABLES = { minuto: "AIRI_LIMITE_MINUTO", dia: "AIRI_LIMITE_DIA", globalDia: "AIRI_LIMITE_GLOBAL_DIA",
                    fallosMax: "AIRI_FALLOS_MAX_HORA", pausaMin: "AIRI_PAUSA_429_MIN" };
const HORA = 3600_000, MINUTO = 60_000, MAX_FALLOS_GUARDADOS = 2000, MAX_USUARIOS = 500;

/** Lee los límites de las variables. Un valor presente pero inválido devuelve null (el Worker queda cerrado). */
export function leerLimites(env = {}) {
  const lim = { ...LIMITES_PREDETERMINADOS };
  for (const [k, nombre] of Object.entries(VARIABLES)) {
    const v = env[nombre];
    if (v === undefined || v === "") continue;
    if (!/^\d{1,6}$/.test(String(v))) return null;
    const n = Number(v);
    if (n < RANGOS[k][0] || n > RANGOS[k][1]) return null;
    lim[k] = n;
  }
  return lim;
}

export const diaUTC = (ms) => new Date(ms).toISOString().slice(0, 10);
export const estadoInicial = () => ({ v: 1, dia: "", global: 0, usuarios: {}, fallos: {}, pausaHasta: 0 });

function limpiar(e, ahora) {
  const hoy = diaUTC(ahora);
  if (e.dia !== hoy) { e.dia = hoy; e.global = 0; }
  for (const [id, u] of Object.entries(e.usuarios)) {
    if (u.dia !== hoy) delete e.usuarios[id];
    else u.minuto = u.minuto.filter((t) => ahora - t < MINUTO);
  }
  for (const [h, f] of Object.entries(e.fallos)) if (ahora - f.desde >= HORA) delete e.fallos[h];
}

/** Aplica una operación de forma SÍNCRONA. Devuelve {respuesta, cambio}. */
export function aplicar(e, op, ahora, lim) {
  if (!op || typeof op.op !== "string") return { respuesta: { ok: false, motivo: "operacion" }, cambio: false };
  limpiar(e, ahora);
  const clave = (s) => typeof s === "string" && /^[a-z0-9-]{1,64}$/.test(s);

  switch (op.op) {
    case "consultar": {                       // ¿esta huella de IP está bloqueada por intentos fallidos?
      if (!clave(op.ip)) return { respuesta: { ok: false, motivo: "operacion" }, cambio: true };
      const f = e.fallos[op.ip];
      if (f && f.n >= lim.fallosMax) return { respuesta: { ok: false, motivo: "bloqueado", reintentar: Math.ceil((f.desde + HORA - ahora) / 1000) }, cambio: true };
      return { respuesta: { ok: true }, cambio: true };
    }
    case "fallo": {
      if (!clave(op.ip)) return { respuesta: { ok: false, motivo: "operacion" }, cambio: true };
      if (!e.fallos[op.ip]) {
        if (Object.keys(e.fallos).length >= MAX_FALLOS_GUARDADOS) return { respuesta: { ok: true, bloqueado: true }, cambio: true };
        e.fallos[op.ip] = { desde: ahora, n: 0 };
      }
      e.fallos[op.ip].n++;
      return { respuesta: { ok: true, bloqueado: e.fallos[op.ip].n >= lim.fallosMax }, cambio: true };
    }
    case "reservar": {
      if (!clave(op.usuario)) return { respuesta: { ok: false, motivo: "operacion" }, cambio: true };
      if (e.pausaHasta > ahora) return { respuesta: { ok: false, motivo: "pausa", reintentar: Math.ceil((e.pausaHasta - ahora) / 1000) }, cambio: true };
      if (e.global >= lim.globalDia) return { respuesta: { ok: false, motivo: "global" }, cambio: true };
      let u = e.usuarios[op.usuario];
      if (!u) {
        if (Object.keys(e.usuarios).length >= MAX_USUARIOS) return { respuesta: { ok: false, motivo: "global" }, cambio: true };
        u = e.usuarios[op.usuario] = { dia: e.dia, n: 0, minuto: [] };
      }
      if (u.n >= lim.dia) return { respuesta: { ok: false, motivo: "dia" }, cambio: true };
      if (u.minuto.length >= lim.minuto) return { respuesta: { ok: false, motivo: "minuto", reintentar: Math.ceil((u.minuto[0] + MINUTO - ahora) / 1000) }, cambio: true };
      u.n++; u.minuto.push(ahora); e.global++;
      return { respuesta: { ok: true, restantesDia: lim.dia - u.n }, cambio: true };
    }
    case "pausar": {                          // apagado preventivo automático (p. ej., Gemini devolvió 429)
      e.pausaHasta = Math.max(e.pausaHasta, ahora + lim.pausaMin * MINUTO);
      return { respuesta: { ok: true, pausaHasta: e.pausaHasta }, cambio: true };
    }
    default:
      return { respuesta: { ok: false, motivo: "operacion" }, cambio: false };
  }
}

/** Durable Object: una única instancia («global») guarda todas las cuotas del piloto. */
export class ControlCuotasAIRI {
  constructor(ctx, env) {
    this.ctx = ctx; this.env = env; this.estado = null;
    this.listo = ctx.blockConcurrencyWhile(async () => {
      this.estado = (await ctx.storage.get("estado")) || estadoInicial();
    });
  }
  async fetch(request) {
    let op;
    try { op = await request.json(); } catch { return Response.json({ ok: false, motivo: "operacion" }, { status: 400 }); }
    await this.listo;
    const lim = leerLimites(this.env);
    if (!lim) return Response.json({ ok: false, motivo: "configuracion" }, { status: 503 });
    // ── Sección crítica: SÍNCRONA (sin await) desde aquí hasta la respuesta ──
    const { respuesta, cambio } = aplicar(this.estado, op, Date.now(), lim);
    if (cambio) this.ctx.storage.put("estado", this.estado);   // sin await: la output gate retiene la respuesta hasta guardar
    return Response.json(respuesta);
  }
}
