// AIRI v0.7 E2 — Llamada a Gemini desde el Worker. La clave llega SOLO como secreto (env.GEMINI_API_KEY) y nunca
// aparece en respuestas ni registros. Las instrucciones y la configuración replican chat/servidor.py (v0.5–v0.6);
// la prueba «paridad con servidor.py» comprueba que el texto del sistema sea idéntico.

export const SISTEMA = "Eres AIRI, asistente educativo sobre acuarios marinos de un proyecto académico. Responde siempre en español.\nEstilo:\n- Responde directamente a lo que se pregunta, con una extensión proporcional: una o dos frases para preguntas simples; listas breves o secciones cortas solo cuando la pregunta lo requiera.\n- No saludes ni te presentes en cada respuesta; la conversación ya está en curso.\n- Puedes usar Markdown sencillo (negritas, listas, tablas pequeñas) cuando ayude a leer; no uses HTML.\n- No repitas advertencias generales en cada mensaje. Menciona un límite solo cuando sea pertinente a la pregunta.\nPrudencia científica:\n- Distingue lo bien establecido de lo incierto o variable entre especies y acuarios; si no lo sabes, dilo.\n- Si das valores o rangos orientativos, preséntalos como aproximados y variables, no como límites de AIRI. No inventes estudios, referencias ni enlaces. No tienes acceso a internet ni a fuentes actualizadas: si la pregunta lo requiere, dilo en una frase y sugiere consultar fuentes especializadas.\n- No diagnostiques enfermedades ni garantices que el agua o un organismo estén bien; ante síntomas, mortalidad o tratamientos, recomienda consultar a un veterinario o a una persona experta en acuarios marinos.\n- No ordenes ni ejecutes acciones físicas sobre el acuario.\n- Las evaluaciones de los parámetros del agua corresponden exclusivamente al motor de reglas de AIRI v0.4 (pestaña «Parámetros del agua»): no afirmes haberlas calculado ni propongas otros umbrales como si fueran de AIRI.";
export const MODELO_PREDETERMINADO = "gemini-3.1-flash-lite";
export const MODELO_VALIDO = /^[a-z0-9][a-z0-9.\-]{1,62}$/;
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const MAX_SALIDA_TOKENS = 2048, MAX_MODELO = 12000, TIEMPO_MS = 45000;

const err = (estado, error, extra = {}) => ({ estado, datos: { error }, ...extra });

/** Consulta Gemini. Devuelve {estado, datos, limiteGoogle?}. `hacerFetch` permite simularlo en pruebas. */
export async function consultarGemini(contenidos, env, hacerFetch = fetch) {
  const modelo = env.AIRI_MODELO || MODELO_PREDETERMINADO;
  let r;
  try {
    r = await hacerFetch(`${BASE}/models/${modelo}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SISTEMA }] },
        contents: contenidos,
        generationConfig: { maxOutputTokens: MAX_SALIDA_TOKENS, temperature: 0.35 }
      }),
      signal: AbortSignal.timeout(TIEMPO_MS)
    });
  } catch {
    return err(504, "No se pudo conectar con Gemini. Inténtalo más tarde.");
  }
  if (!r.ok) {
    if (r.status === 429) return err(429, "AIRI alcanzó el límite de consultas gratuitas de Gemini. El chat se pausó un rato; inténtalo más tarde.", { limiteGoogle: true });
    if (r.status >= 500) return err(502, "Gemini no está disponible en este momento. Inténtalo más tarde.");
    return err(502, "Gemini no pudo procesar la consulta.");   // 4xx: el detalle (clave, modelo) solo lo ve quien administra
  }
  let resultado;
  try { resultado = await r.json(); } catch { return err(502, "Gemini devolvió una respuesta que no se pudo leer."); }
  if (resultado?.promptFeedback?.blockReason) return err(422, "Gemini bloqueó la pregunta con sus filtros de seguridad. Reformúlala.");
  const c = (resultado?.candidates || [])[0];
  if (!c) return err(502, "Gemini no devolvió ninguna respuesta.");
  const partes = c.content?.parts || [];
  const texto = partes.filter((p) => p && typeof p === "object" && !p.thought).map((p) => (typeof p.text === "string" ? p.text : "")).join("");
  const motivo = c.finishReason || "";
  if (!texto.trim()) {
    if (["SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII", "RECITATION"].includes(motivo))
      return err(422, "Gemini no generó la respuesta por sus filtros de seguridad o de contenido.");
    if (motivo === "MAX_TOKENS") return err(502, "Gemini agotó el límite de longitud antes de responder. Haz una pregunta más concreta.");
    return err(502, "Gemini no devolvió texto.");
  }
  return { estado: 200, datos: { answer: texto.slice(0, MAX_MODELO), truncada: motivo === "MAX_TOKENS" || texto.length > MAX_MODELO, modelo } };
}
