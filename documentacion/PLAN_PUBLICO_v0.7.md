# AIRI v0.7 — Acceso público por enlace (propuesta técnica)

**Estado:** propuesta aprobada para trabajar por etapas. E1 está fusionada (PR #9). E2–E5 están preparadas y probadas con simulaciones en `feature/preparacion-publicacion-airi-v0.7`; ver [`PILOTO_v0.7.md`](PILOTO_v0.7.md). **No hay despliegue ni servicios activados.** **Fecha:** 13-11-2026.
**Base:** v0.6 (chat con Gemini, lectura con voz, mascota y dictado), con el servidor local `chat/servidor.py`.

## 1. Objetivo y restricciones

- **Objetivo:** que cualquier persona abra AIRI desde un enlace, sin instalar Python, sin usar PowerShell y sin
  configurar una clave.
- **Restricciones:**
  - sin facturación ni servicios de pago;
  - la clave de Gemini solo en el servidor;
  - protección contra abusos y contra el agotamiento de la cuota;
  - consentimiento y privacidad;
  - el motor v0.4 no cambia.

## 2. Lo que condiciona el diseño

### 2.1 Condiciones de Gemini (nivel gratuito)

Revisión de las Condiciones adicionales de la API de Gemini (ai.google.dev/terms) y de la página de límites, hecha el
13-11-2026:

| Condición | Consecuencia para AIRI |
|---|---|
| Uso «para fines profesionales o empresariales, no para uso de consumidores» | Un chat abierto a cualquier persona es una zona gris. Un **piloto académico con acceso controlado** se ajusta mejor |
| Las apps no pueden estar dirigidas a menores de 18 años ni ser «probablemente usadas» por ellos | Aviso de mayoría de edad, y **no** difundirlo entre menores ni en escuelas de nivel básico o medio |
| Para usuarios del Espacio Económico Europeo, Suiza o Reino Unido solo se permiten servicios de pago | **Bloquear esas regiones** (el servidor sabe el país de cada petición) o no ofrecer el chat allí |
| Nivel gratuito: Google usa el contenido para mejorar productos; personas revisoras pueden leerlo; no enviar datos personales | Se mantiene el consentimiento de v0.5, ampliado para público general |
| No se permite dar consejo médico ni uso clínico | No aplica a la salud humana; se mantienen los avisos de que AIRI no diagnostica |
| Los límites se aplican **por proyecto**, no por clave; los diarios se reinician a medianoche (hora del Pacífico); las cifras del nivel gratuito solo se ven en AI Studio | **La cuota es compartida por todas las personas usuarias.** Hacen falta límites propios por debajo de la cuota, porque Google no publica cifras fijas |

> **Interpretación, no asesoría legal.** Conviene que la asesoría o coordinación del proyecto valide el uso
> antes de difundir el enlace.

### 2.2 Navegador: micrófono y voces

- **HTTPS obligatorio:** el reconocimiento de voz necesita el micrófono, y el micrófono solo funciona en páginas
  seguras (HTTPS o `localhost`). Todas las opciones de alojamiento de abajo dan HTTPS.
- **Sabina no estará en otros equipos.** Es una voz de Windows instalada en tu PC. Cada persona oirá las voces de su
  dispositivo:
  - otras voces locales de Windows o macOS;
  - las voces de Google en Chrome para Android;
  - las voces del sistema en iOS.

  `voz.js` ya elige la mejor voz **local** en español y deja las voces en línea como opción explícita. Hay que
  documentarlo y probarlo en celulares, no darlo por hecho.
- **Dictado:**
  - Chrome (escritorio y Android) lo ofrece; en Safari para iOS depende de Siri; Firefox no lo tiene.
  - En equipos sin paquete local, el audio irá a Google o Apple. El consentimiento de v0.6 ya lo cubre.
  - Si no hay dictado, el chat escrito funciona igual.
- **Animaciones y mascota:** son archivos estáticos y funcionan en cualquier alojamiento.

## 3. Alternativas de alojamiento comparadas

Datos de la documentación oficial de cada proveedor, consultada el 13-11-2026. Los planes gratuitos cambian, así que
hay que verificarlos antes de desplegar.

| Opción | Plan gratuito | A favor | En contra | Veredicto |
|---|---|---|---|---|
| **Cloudflare Workers + recursos estáticos** | 100 000 peticiones al día, 10 ms de CPU por invocación y ráfagas de 1 000 por minuto; los estáticos son gratis e ilimitados; al superar el límite responde con error 1027, **sin cobrar** | Sin arranque en frío; HTTPS; clave guardada como secreto; **limitador por IP** incluido; **Turnstile** (verificación anti-bots) gratuito; país de cada petición para el bloqueo regional | Hay que **reescribir el servidor** (unas 200 líneas) en JavaScript; Python en Workers existe, pero no se ha evaluado | **Recomendada** |
| **Render** (servicio web gratuito) | 750 horas al mes; se **apaga tras 15 min** sin tráfico y tarda **cerca de 1 min** en despertar; disco efímero | Ejecuta `servidor.py` **casi sin cambios**; HTTPS | La primera visita espera un minuto; los límites hay que programarlos; hay quejas de suspensiones de cuentas gratuitas, sin confirmar | **Alternativa** si se prefiere conservar Python |
| **Vercel Hobby** | Gratuito; **solo para uso personal, no comercial** | Funciones en Python o JavaScript; HTTPS | Un piloto universitario abierto podría no encajar en «personal»; habría que confirmarlo con el proveedor | Posible, con dudas de licencia |
| **Hugging Face Spaces** | La documentación actual indica que los Spaces con cómputo (Docker o Gradio) **requieren plan de pago**; solo los estáticos son gratis | — | Necesita pago para el servidor | Descartada |
| **Google Cloud Run** | Cuota mensual gratuita, pero **requiere una cuenta de facturación** | — | Va contra la regla de no activar facturación | Descartada |
| **GitHub Pages** (solo) | Gratuito y estático | Ya existe | No puede guardar una clave: el chat no funcionaría | Solo para la parte estática |

## 4. Arquitectura recomendada (prototipo universitario)

```text
Navegador (HTTPS) ── interfaz estática (prototipo, chat, mascota, voz, dictado) ── sin claves
      │  POST /api/chat  { mensajes, token Turnstile, código de acceso opcional }
      ▼
Cloudflare Worker «airi-chat»
  1. Origen y método correctos; cuerpo ≤ 30 KB; mensajes con el mismo formato que en v0.5
  2. Región: rechaza el Espacio Económico Europeo, Suiza y Reino Unido con un mensaje claro
  3. Turnstile válido (protección contra bots)
  4. Límite por IP: p. ej. 5 preguntas por minuto y 30 al día
  5. Tope global diario: p. ej. el 70 % de la cuota que muestre AI Studio
  6. Interruptor de emergencia (variable) para apagar el chat sin redeplegar
  7. Llama a Gemini con el secreto GEMINI_API_KEY (proyecto de Google exclusivo para el piloto)
  8. Respuesta sin cabeceras ni registros que contengan la clave o el texto de las preguntas
      ▼
Gemini API (nivel gratuito, sin facturación)
```

- **Se reutiliza tal cual:**
  - toda la interfaz;
  - el Markdown seguro;
  - las instrucciones del modelo;
  - las validaciones de v0.5, que se trasladan al Worker;
  - el limitador y el manejo de 429, ya probados con el servidor local.
- **El servidor local sigue igual** para desarrollo y pruebas sin internet.
- **Contadores:** el límite por IP usa el limitador de Workers. El tope global diario usa un contador sencillo en el
  almacén gratuito de Cloudflare: unas pocas escrituras por pregunta, dentro del plan gratuito para el volumen
  previsto. Hay que confirmar las cifras al diseñarlo.

## 5. Seguridad y privacidad

- **Clave:**
  - solo como secreto del Worker, nunca en el repositorio, en el navegador, en las respuestas ni en los registros;
  - una clave propia del piloto, en un proyecto de Google separado, para poder revocarla sin afectar al desarrollo
    local;
  - pruebas automáticas que busquen el patrón de clave en respuestas y registros, como en v0.5.
- **Coste controlado:**
  - **no activar facturación** ni en Google ni en Cloudflare;
  - al agotarse un límite, el servicio deja de responder, pero nunca cobra;
  - la interfaz muestra «AIRI alcanzó su límite de hoy».
- **Abusos:** Turnstile, límite por IP, tope global, tamaño máximo de pregunta y de historial, un código de acceso para
  el grupo del piloto, y el interruptor de apagado.
- **Privacidad:**
  - el consentimiento de Gemini (v0.5) ampliado, que nombre a Google como proveedor del modelo y a Cloudflare como
    alojamiento;
  - un aviso de mayoría de edad y de no escribir datos personales;
  - sin cuentas, sin cookies de seguimiento y sin guardar conversaciones (siguen solo en la pestaña);
  - el dictado y la voz conservan sus consentimientos de v0.6.
- **Cabeceras de seguridad:** una política de contenido (CSP) estricta y `Permissions-Policy` que solo permita el
  micrófono en el propio sitio.

## 6. Costos y riesgos

| Concepto | Costo previsto |
|---|---|
| Alojamiento (Cloudflare Workers Free y subdominio `*.workers.dev`) | $0 |
| Gemini (nivel gratuito) | $0, con límites que fija Google y que pueden cambiar |
| Turnstile | $0 |
| Dominio propio (opcional, no necesario) | Unos US$10 al año, **solo si se decide** |

| Riesgo | Mitigación |
|---|---|
| Se agota la cuota gratuita de Gemini (compartida) | Tope diario propio por debajo de la cuota, límite por IP y mensaje claro |
| Uso por menores o desde regiones no permitidas | Difusión controlada, aviso de 18 años o más, bloqueo regional |
| Bots o automatización | Turnstile, límite por IP y código de acceso |
| Cambios en planes o condiciones | Revisión antes de cada etapa; el interruptor permite apagar el chat al instante |
| Las voces o el dictado no funcionan igual en todos los dispositivos | Pruebas en celulares reales; el chat escrito siempre está disponible |
| Exposición de la clave | Secreto del proveedor, pruebas de filtración y rotación de la clave |

## 7. Etapas propuestas (cada una se aprueba antes de empezar)

| Etapa | Contenido | Verificación |
|---|---|---|
| **E1** Servidor preparado para publicarse | Límites por IP y globales, interruptor y origen configurable en `servidor.py` (sin desplegar) | Pruebas automáticas con Gemini simulado |
| **E2** Worker | Portar `/api/chat` a un Worker con Turnstile, bloqueo regional y contadores; los mismos casos de prueba de v0.5 | Pruebas locales con el emulador de Wrangler y Gemini simulado |
| **E3** Vista previa privada | **Acción tuya:** crear la cuenta gratuita de Cloudflare, el proyecto y la clave de Google del piloto, y cargar el secreto. Despliegue en un subdominio sin difundir | Pruebas en escritorio y en celulares reales (Android e iOS) |
| **E4** Piloto cerrado | Enlace y código de acceso solo para el grupo del proyecto; seguimiento del uso | Revisión de los límites y de las respuestas |
| **E5** Decisión sobre la apertura | Solo si E4 sale bien y lo valida la coordinación del proyecto | Documento de cierre |

## 8. Decisiones pendientes de la persona responsable

1. **Público:** piloto con código de acceso (recomendado) o enlace abierto.
2. **Proveedor:** Cloudflare (recomendado; reescritura del servidor en JavaScript) o Render (Python casi igual;
   espera de un minuto en la primera visita).
3. **Límites iniciales:** por ejemplo, 5 preguntas por minuto y 30 al día por persona, y un tope global ajustado a la
   cuota que muestre AI Studio.
4. **Validación:** confirmar con la asesoría del proyecto el encaje en las condiciones de Gemini (uso académico,
   mayores de 18 años y regiones).

## Fuentes

- Condiciones adicionales de la API de Gemini: https://ai.google.dev/terms
- Límites de la API de Gemini: https://ai.google.dev/gemini-api/docs/rate-limits
- Límites de Cloudflare Workers: https://developers.cloudflare.com/workers/platform/limits/
- Precios de Cloudflare Workers: https://developers.cloudflare.com/workers/platform/pricing/
- Limitador de Workers: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- Plan gratuito de Render: https://render.com/docs/free
- Vercel Hobby y uso justo: https://vercel.com/docs/plans/hobby y https://vercel.com/docs/limits/fair-use-guidelines
- Hugging Face Spaces: https://huggingface.co/docs/hub/en/spaces-overview
- Precios de Cloud Run: https://cloud.google.com/run/pricing
- Reconocimiento de voz solo en orígenes seguros (Chromium): https://groups.google.com/a/chromium.org/d/msg/blink-dev/PdGY39MAaeM/LTaCl_f4AQAJ
