# AIRI v0.6 — Conversación por voz y mascota interactiva (propuesta técnica)

**Estado:** EN CURSO (E1–E4 implementadas; E5–E7 pendientes de aprobación). **Fecha:** 12-11-2026.

> **Avance:**
> - **E1** (diagnóstico): realizada; ver [`DIAGNOSTICO_VOZ_v0.6.md`](DIAGNOSTICO_VOZ_v0.6.md).
> - **E2–E3** (texto para hablar y lectura de respuestas con animación de habla): implementadas con la voz
>   Microsoft Sabina (es-MX) como preferida; ver [`VOZ_CHAT_v0.6.md`](VOZ_CHAT_v0.6.md).
> - **E4** (estado «pensando» de la mascota mientras Gemini responde): implementada; ver
>   [`PENSANDO_v0.6.md`](PENSANDO_v0.6.md).
> - **E5–E7:** sin implementar (el micrófono sigue sin usarse).
**Base:** v0.5 (PR #6, chat con Gemini mediante servidor local). **Rama prevista:** `feature/voz-conversacion-airi-v0.6`.

## 1. Objetivo

Conversar con AIRI de forma más natural sin perder su papel de asistente especializado y prudente:

1. leer en voz alta las respuestas del chat sin símbolos de Markdown;
2. dictar preguntas con el micrófono;
3. animación de **habla** mientras suena la respuesta y de **pensamiento** mientras Gemini procesa;
4. volver a **espera** al terminar;
5. detener la voz y activar o desactivar cada función de audio;
6. respetar el movimiento reducido;
7. micrófono solo con autorización explícita y únicamente a petición de la persona;
8. escritorio y celular.

**Sin cambios en:** el motor v0.4, sus umbrales, el grafo y el servidor de Gemini (salvo, opcionalmente, una
instrucción de «respuesta hablada», ver E5). **Sin servicios de pago.**

## 2. Lo que ya existe y se reutiliza

| Módulo (v0.2–v0.5) | Se reutiliza para |
|---|---|
| `interfaz/mascota/voz.js` | Síntesis con `speechSynthesis`: fragmentación, perfiles y matices de voz (v0.3), detener y estado `hablando` |
| `interfaz/mascota/ajustes-voz.js` | Diálogo de ajustes: se añaden las opciones nuevas |
| `interfaz/mascota/interaccion.js` | Botón de voz activada o desactivada (desactivada por defecto) |
| `interfaz/mascota/mascota.js` | `indicarHabla(bool)`, que ya existe y marca la clase `airi-m-hablando`, `cambiarEstado()` y movimiento reducido |
| `interfaz/chat/markdown.js` | `analizar()` da la estructura de la respuesta; de ahí se obtiene un texto **para hablar** |
| `interfaz/chat/chat.js` | Ciclo pregunta → espera → respuesta, donde se conectan voz y animaciones |

## 3. Investigación: Web Speech API (consulta 12-11-2026)

### 3.1 Síntesis de voz (`speechSynthesis`): la base de v0.6

- Está disponible en Chrome 33+, Edge 14+, Firefox 49+, Safari 7+, Opera 27+ y Samsung Internet 5+ (TestMu AI).
  `SpeechSynthesisVoice` es «Baseline, ampliamente disponible» desde 2018 (MDN).
- **Las voces dependen del sistema y del navegador.** Se cargan de forma asíncrona: hay que esperar `voiceschanged`
  en Chrome, mientras que otros navegadores devuelven la lista directamente (MDN).
- **Privacidad de las voces:**
  - `localService` indica si la voz es local (`true`) o de un servicio remoto (`false`) (MDN).
  - Las voces «Microsoft … Online (Natural)» de Edge son neuronales y se generan en los servicios en la nube de
    Microsoft, así que el texto sale del equipo (blog de Microsoft Edge).
  - Una política de empresa puede desactivarlas (Microsoft Learn), y ha habido fallos temporales en la lista de
    voces (foro de Microsoft, Edge 150).
- **En el equipo del proyecto** solo se detectaron voces es-ES (Helena, Laura, Pablo) en las pruebas de v0.3. La
  «voz natural» depende de lo que ofrezca cada dispositivo.

**Decisión propuesta:**
- Usar `speechSynthesis` con preferencia por voces **locales** en español.
- Ofrecer las voces remotas (por ejemplo, las «Online (Natural)» de Edge) solo como opción explícita, con aviso
  de que el texto sale del equipo.
- No usar servicios de voz de pago.

### 3.2 Reconocimiento de voz (`SpeechRecognition`): disponibilidad limitada

- **No es Baseline:** MDN lo marca como «disponibilidad limitada» porque no funciona en algunos de los navegadores
  más usados (MDN).
- **Soporte por navegador** (caniuse):
  - Chrome (escritorio y Android) y Samsung Internet: soporte parcial.
  - Safari 14.1+ (macOS) y Safari iOS 14.5+: soporte parcial con prefijo `webkit`.
  - Firefox: desactivado por defecto.
  - Edge: según caniuse, la interfaz existe pero sus eventos no se disparan.
  - Opera: no lo ofrece (los Chromium sin el servicio de Google no lo exponen).
- **Safari:** requiere Siri activado y no funciona en `SafariViewController` ni en webapps añadidas a la pantalla de
  inicio (caniuse).
- **Privacidad:** por defecto el reconocimiento es **en un servidor**. En Chrome el audio se envía a un servicio web
  y no funciona sin conexión (MDN).
- **Reconocimiento en el dispositivo:**
  - Con `processLocally = true` ni el audio ni la transcripción se envían a terceros (MDN). Chrome lo admite desde
    la versión 139 (caniuse y equipo de Chrome), y Edge lo prueba de forma experimental en Canary y Dev (blog de
    Microsoft Edge).
  - Requiere descargar una vez un paquete de idioma, de unos 60 MB por idioma en Chrome para escritorio (*Intent to
    Ship* de Chromium).
  - Se consulta y se instala con `SpeechRecognition.available()` e `install()`. Si el paquete no está instalado,
    `start()` falla con `language-not-supported` (MDN).
  - Los idiomas disponibles dependen del navegador. La propuesta de Chrome menciona `en-US` y `de-DE` como ejemplos,
    así que **la disponibilidad del español en el dispositivo debe comprobarse en tiempo real**, no suponerse.

**Decisión propuesta (dictado en tres niveles):**
1. **En el dispositivo, si `available({langs:["es-MX"/"es-ES"], processLocally:true})` lo permite:** es la
   opción preferida.
   - Si el resultado es `downloadable`, se ofrece descargar el paquete (unos 60 MB) con consentimiento explícito.
2. **En el servidor del navegador, si no hay opción local:** solo tras un **segundo consentimiento** que nombre el
   proveedor (en Chrome, el audio va a Google; en Safari, a Apple).
3. **No disponible (Firefox, Opera, webapps de iOS…):** el botón de micrófono no aparece y un texto explica por qué.
   El chat por texto sigue funcionando.

## 4. Arquitectura propuesta

```text
                  ┌──────────── chat.js (v0.5) ─────────────┐
 micrófono.js ──► │ pregunta → «Pensando…» → respuesta (MD) │ ──► markdown.js ──► habla-markdown.js
 (dictado)        └───────┬───────────────────────┬─────────┘                         │ texto para hablar
                          │ estado                │ respuesta                         ▼
                   mascota.js: «pensando»   voz-chat.js ─────────────────────► voz.js (speechSynthesis)
                   indicarHabla(true/false) ◄──── inicio / fin de la locución ◄───┘
```

| Módulo nuevo | Responsabilidad |
|---|---|
| `interfaz/chat/habla-markdown.js` | Convierte la estructura de `markdown.js` en texto natural para hablar: sin `*`, `#` ni `|`; las listas pasan a frases; las tablas, a «Alimento: pellets; frecuencia: dos o tres veces al día…»; los enlaces y el código se omiten con un aviso breve. Funciones puras, probadas en Node |
| `interfaz/chat/voz-chat.js` | Si «Leer respuestas» está activo, lee cada respuesta nueva con `voz.js`, activa y desactiva `indicarHabla` y pasa a `espera` al terminar. Botón «Detener» visible mientras habla |
| `interfaz/chat/microfono.js` | Envoltura de `SpeechRecognition`: detecta el soporte y la variante (local, servidor o ninguna), gestiona los consentimientos y el ciclo de escucha, muestra la transcripción en el campo de pregunta y **no envía sin confirmación** (envío automático opcional, desactivado por defecto) |
| Estados de la mascota | Se añaden `pensando` (mientras Gemini procesa) y una animación de habla sobre la clase `airi-m-hablando`. Con movimiento reducido, solo cambios estáticos (icono o color) |

**Reglas de interacción:**
- **Micrófono:**
  - Solo se activa con el botón «Hablar», nunca de forma automática ni continua.
  - Mientras escucha, un indicador lo muestra; se detiene tras la pregunta, al cambiar de pestaña o si la página
    pierde el foco.
  - **No se guarda audio.**
- **Turnos:**
  - Al pulsar «Hablar», AIRI deja de hablar, para que su voz no entre por el micrófono.
  - Al enviar una pregunta nueva, se cancela la locución anterior.
- **Valores por defecto:** voz y micrófono desactivados, igual que en v0.2–v0.5.
- **Ajustes de voz:** «Leer respuestas del chat», «Dictado por micrófono», «Solo reconocimiento en el dispositivo»,
  la voz y el perfil de v0.3, y «Detener».
- **Personalidad:** se mantiene el perfil de AIRI de v0.3. Opcionalmente, el servidor podría pedir respuestas
  «aptas para voz» (frases cortas, sin tablas largas) cuando la lectura está activa. Es un cambio menor en las
  instrucciones, no en el motor científico.

## 5. Matriz de compatibilidad esperada (a verificar en E1)

| Entorno | Lectura de respuestas | Dictado | Notas |
|---|---|---|---|
| Chrome escritorio (Windows) | Sí | Sí: en el dispositivo si hay paquete de español; si no, en el servidor de Google | Comprobar el español con `available()` |
| Edge escritorio | Sí; voces locales y «Online (Natural)» opcionales | Dudoso: caniuse indica que los eventos no se disparan; en el dispositivo, experimental | Probar antes de prometer |
| Chrome Android | Sí (voces del sistema) | Sí, en el servidor de Google | Pruebas en dispositivo real |
| Safari macOS / iOS | Sí | Parcial (`webkit`, requiere Siri) | No funciona en webapps de pantalla de inicio |
| Firefox | Sí | **No** (desactivado por defecto) | El botón de micrófono no aparece |
| Navegador integrado de la app de Claude (Electron) | Probable | **Desconocido** | No suponerlo; verificar |

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| El audio del dictado sale a Google o Apple | Preferir el procesamiento en el dispositivo. Si no lo hay, pedir un consentimiento específico que nombre al proveedor; nada automático |
| Disponibilidad desigual del reconocimiento | Detectar en tiempo real; ocultar con explicación; el chat por texto siempre funciona |
| Voces pobres o lista vacía | Esperar `voiceschanged`, elegir una voz local en español y avisar si no hay ninguna |
| La voz remota envía el texto fuera del equipo | Solo voces locales por defecto; las remotas, como opción explícita |
| Lectura de símbolos o tablas largas | `habla-markdown.js` probado; resumir tablas; poder detener en cualquier momento |
| Eco: la voz de AIRI entra por el micrófono | Cancelar la síntesis al iniciar la escucha; no escuchar mientras habla |
| Conflicto con lectores de pantalla | Lectura desactivada por defecto; la región `aria-live` sigue igual; probar con el lector de Windows |
| Batería y datos en móvil por el paquete de 60 MB | La descarga solo se hace con consentimiento y avisando del tamaño |
| Activación accidental o cambios de pestaña | El micrófono se detiene al ocultar la página o cambiar de pestaña |
| Movimiento | Las animaciones respetan `prefers-reduced-motion` y el ajuste de la mascota |
| Expectativas | No se promete voz «humana»: depende del dispositivo. Se documentan las voces probadas |

## 7. Etapas

| Etapa | Contenido | Criterio de aceptación |
|---|---|---|
| **E1 · Diagnóstico de dispositivos** | Página de diagnóstico local (sin enviar datos): voces disponibles (`localService`), soporte de reconocimiento, `available()` en el dispositivo para es-MX y es-ES. Ejecutarla en tu Windows (Chrome y Edge) y en tu celular | Matriz del §5 confirmada con datos reales |
| **E2 · Texto para hablar** | `habla-markdown.js` y sus pruebas Node (listas, tablas, enlaces, código, entradas hostiles) | No se leen símbolos; las pruebas pasan |
| **E3 · Lectura de respuestas + animación de habla** | `voz-chat.js`, opción en los ajustes, botón «Detener», `indicarHabla` → `espera` | E2E con simulador de voz: inicio y fin, detener, movimiento reducido, sin regresiones |
| **E4 · Estado «pensando»** | Nueva animación de la mascota mientras Gemini responde (sustituye el `analisis` provisional de v0.5), con versión estática para movimiento reducido | Pruebas visuales y de estado en escritorio y celular |
| **E5 · Dictado** | `microfono.js` con los tres niveles del §3.2, consentimientos, indicador de escucha y cancelación de la voz. Opcional: instrucción «apta para voz» | E2E con un simulador de `SpeechRecognition` (permiso denegado, sin soporte, `language-not-supported`, resultado); prueba manual en dispositivos reales |
| **E6 · Ajustes, accesibilidad y privacidad** | Nuevas opciones en los ajustes de voz, textos de privacidad y revisión con teclado y lector de pantalla | Revisión de accesibilidad; los textos de privacidad nombran a cada proveedor |
| **E7 · Pruebas y PR** | Batería completa, pruebas manuales con Gemini real, documentación y PR **sin fusionar** | Todas las suites en verde; v0.4 y v0.5 intactos |

Cada etapa se presenta para su aprobación antes de pasar a la siguiente, como en v0.4 y v0.5.

## 8. Fuera de alcance de v0.6

- Servicios de voz o reconocimiento de pago y despliegue público del servidor.
- Escucha continua o palabra de activación («Oye, AIRI»).
- Grabación o almacenamiento de audio.
- Motores de voz locales de terceros (no evaluados; podrían estudiarse más adelante).
- Búsqueda web con fuentes, que sigue pendiente desde v0.5.

## Fuentes consultadas

- MDN, *SpeechRecognition* (modificada el 06-11-2026): https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- MDN, *Using the Web Speech API* (31-08-2026): https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
- MDN, *SpeechSynthesisVoice* y *localService*: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice
- caniuse, *Speech Recognition API*: https://caniuse.com/speech-recognition · *available()*: https://caniuse.com/mdn-api_speechrecognition_available_static
- Chromium, *Intent to Ship: On-device Web Speech API*: https://groups.google.com/a/chromium.org/g/blink-dev/c/VNOok2dbmHM
- Microsoft Edge Blog, reconocimiento en el dispositivo (experimental) y voces en la nube: https://blogs.windows.com/msedgedev/2019/08/14/cloud-powered-voices-microsoft-edge-chromium/
- Microsoft Learn, política *ConfigureOnlineTextToSpeech*: https://learn.microsoft.com/en-ca/DeployEdge/microsoft-edge-policies/configureonlinetexttospeech
- TestMu AI, compatibilidad de Speech Synthesis y Speech Recognition (fuente secundaria): https://www.testmuai.com/learning-hub/speech-synthesis-api-browser-support/
