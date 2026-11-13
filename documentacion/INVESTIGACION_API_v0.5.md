# AIRI v0.5 — Investigación de proveedores y arquitectura segura

**Fecha de consulta:** 2026-11-12. **Estado:** investigación y recomendación, sin claves, pagos, despliegue ni conexión API. Rama: `feature/chat-inteligente-airi-v0.5`.

## 1. Comparación de APIs (USD por millón de tokens, modalidad estándar)

| Modelo | Entrada | Salida | Fuente |
|---|---:|---:|---|
| OpenAI gpt-6-luna | 0.10 | 0.50 | https://developers.openai.com/api/docs/pricing |
| OpenAI gpt-6.1-terra | 1.00 | 5.00 | https://developers.openai.com/api/docs/pricing |
| Anthropic Claude Haiku 5.5 (hasta 100k tokens de prompt) | 0.10 | 0.50 | https://platform.claude.com/docs/en/about-claude/pricing |
| Anthropic Claude Sonnet 5.5 | 2.00 | 10.00 | https://platform.claude.com/docs/en/about-claude/pricing |
| Google Gemini 2.5 Flash-Lite | 0.10 | 0.40 | https://ai.google.dev/gemini-api/docs/pricing |

**Nota:** la tabla de precios general de OpenAI muestra modelos GPT-6 vigentes; gpt-4.1-mini aparece en una sección de fine-tuning, por lo que no debe tomarse esa fila como tarifa estándar de chat. Las tarifas y disponibilidad deben verificarse antes de pagar. Las suscripciones personales a chat y la facturación de API son distintas.

**Ejemplo matemático, no cotización:** 500 consultas mensuales × (1500 tokens entrada + 500 salida) cuestan aproximadamente US$0.20 con gpt-6-luna, US$0.20 con Claude Haiku 5.5 o US$0.175 con Gemini 2.5 Flash-Lite, solo por tokens y sin considerar contexto acumulado, herramientas, hosting, impuestos o cargos adicionales.

**Investigación web:** OpenAI publica web search a US$10/1000 llamadas más tokens de contenido (según modalidad). Google ofrece grounding con Search, con cuotas y tarifas específicas por familia de modelo. No atribuir capacidad de investigación en tiempo real al modelo si no se conecta realmente una herramienta de búsqueda.

## 2. Arquitectura recomendada

```text
Navegador (GitHub Pages)
  ├─ Interfaz de chat, historial efímero y consentimiento
  ├─ Mascota y voz ya existentes
  └─ Motor v0.4 (independiente, no alterado)
            |
            | HTTPS, POST /api/chat
            v
Backend (Node.js 22, servicio independiente)
  ├─ Validación de mensajes, límites de tamaño y tasa
  ├─ Autenticación / control de acceso para evitar abuso público
  ├─ Instrucciones de seguridad y separación de contexto no confiable
  ├─ Adaptador de proveedor de IA (seleccionable por configuración)
  ├─ Adaptador de búsqueda con citas verificables (optativo)
  ├─ Tiempo de espera, control de gasto, registros sin texto sensible
  └─ Secretos solo en variables de entorno / gestor de secretos
            |
            v
API del proveedor (OpenAI / Anthropic / Google)
```

GitHub Pages es alojamiento estático y **no** protege claves. No colocar API keys en HTML, JS, repositorio, `localStorage`, query strings, capturas o pruebas. Un `.env.example` solo puede contener nombres y valores ficticios; el `.env` real debe estar ignorado por Git.

## 3. Controles mínimos de seguridad

1. Clave de proyecto con permisos mínimos, vencimiento/rotación y alertas/límites de gasto; nunca compartir claves.
2. Autenticación de usuarios o acceso restringido al prototipo; CORS no sustituye autenticación.
3. Rate limiting, límites de longitud y presupuesto por usuario y por día, timeout y cancelación.
4. Sanitizar y renderizar texto como texto, no HTML sin control; protegerse de inyección de prompts, URLs maliciosas y respuestas manipuladas.
5. No enviar automáticamente mediciones, fotos ni datos personales; mostrar aviso y requerir autorización antes de enviar datos a proveedores externos.
6. Historial temporal en la sesión, borrado visible; no registrar mensajes completos ni claves en logs.
7. Búsqueda: distinguir fuentes realmente recuperadas de afirmaciones del modelo; no fabricar referencias ni presentar resultados como diagnóstico.
8. Mantener motor v0.4 como fuente de clasificación de mediciones; IA solo explica el resultado, sin alterar umbrales ni R1–R4.
9. Respuestas seguras y límites claros: no diagnóstico veterinario, no control automático del acuario.
10. Pruebas de errores 401/403/429/5xx, cortes de red, presupuesto agotado, entradas hostiles y compatibilidad móvil.

Fuentes de seguridad:
- https://developers.openai.com/api/reference/overview
- https://developers.openai.com/api/docs/guides/production-best-practices
- https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
- https://support.claude.com/en/articles/9767949-api-key-best-practices-keep-your-keys-safe-and-secure

## 4. Decisión propuesta y próximos pasos

**Recomendación provisional:** Node.js 22 + backend independiente + adaptador OpenAI con modelo económico configurable, y proveedor alternativo intercambiable. Antes de elegir definitivamente comparar disponibilidad efectiva, acceso de cuenta, retención de datos y resultados en un pequeño conjunto de preguntas reales sobre acuarios. La búsqueda científica se incorpora en una etapa separada.

**E1 (esta investigación):** documentada. **E2:** implementar interfaz de chat con respuestas simuladas claramente etiquetadas y pruebas, sin proveedor real ni claves. **E3:** integrar API solo después de resolver el acceso seguro y los límites de gasto. **E4:** búsqueda real con fuentes. **E5:** mascota y voz. **E6:** pruebas, documentación y PR. No fusionar ni publicar sin autorización.
