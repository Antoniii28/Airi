# AIRI v0.7 — Piloto cerrado con Cloudflare Workers (E2–E5)

**Rama:** `feature/preparacion-publicacion-airi-v0.7`. **Fecha:** 13-11-2026.
**Estado general:** técnicamente preparado y **probado solo con simulaciones**. **No desplegado**: no se creó ninguna
cuenta, clave, dominio ni servicio, y no se distribuyeron códigos. El Worker queda **cerrado por defecto**.

## Leyenda de estados

| Estado | Significado |
|---|---|
| **IMPLEMENTADO** | El código o el documento existe en la rama |
| **PROBADO CON SIMULACIONES** | Pruebas automáticas con Durable Object, Turnstile, Gemini, voz y micrófono simulados (sin red) |
| **PROBADO REALMENTE** | Verificado con Cloudflare, Gemini o dispositivos reales. **En v0.7 nada está en este estado** |
| **PENDIENTE** | Requiere credenciales, infraestructura, autorización o validación externa |

## 1. Arquitectura final propuesta

```text
Navegador (HTTPS)
  interfaz estática de v0.6 + acceso-publico.js (código personal + widget de Turnstile)
  │  POST /api/chat   cabecera X-AIRI-Acceso: <código>   cuerpo: {messages, turnstile}
  ▼
Cloudflare Worker «airi-piloto» (publico/worker.js)
  1. ruta/método → 2. configuración completa (si falta algo: 503) → 3. interruptor AIRI_CHAT_APAGADO="0"
  4. origen exacto → 5. JSON ≤ 64 KB → 6. país de request.cf.country (lista permitida; EEE, Suiza y RU siempre fuera)
  7. conversación válida → 8. huella HMAC de la IP de CF-Connecting-IP: ¿bloqueada por intentos fallidos?
  9. Turnstile siteverify (secreto, IP, dominio y acción) → 10. código personal (huella SHA-256, comparación sin atajos)
  11. cuotas atómicas en el Durable Object → 12. Gemini (clave como secreto) → 13. si Gemini da 429: pausa automática
  │                                   │
  ▼                                   ▼
Durable Object «ControlCuotasAIRI»    Gemini API (nivel gratuito, sin facturación)
(SQLite, plan gratuito; 1 instancia)
```

Los archivos estáticos (`publico/dist`, generado) se sirven sin pasar por el Worker y llevan `_headers` con:
- una **CSP estricta**: el único script en línea se permite por su huella, y Turnstile es el único origen externo;
- `Permissions-Policy: microphone=(self)`;
- HSTS, `X-Frame-Options` y `nosniff`.

**Por qué estos mecanismos** (documentación oficial de Cloudflare, consultada el 13-11-2026):

| Requisito | Mecanismo | Base |
|---|---|---|
| Cuotas compartidas entre instancias y atómicas | **Durable Object** con SQLite | Disponible en Workers Free: 100 000 peticiones al día, 13 000 GB-s al día, 100 000 filas escritas al día y 5 GB; solo con backend SQLite. Es de un solo hilo: el código síncrono no se intercala con otras peticiones y las respuestas esperan a que se guarden las escrituras |
| No usar KV como contador | — | No es atómico (indicado ya en E2) |
| Anti-bots | **Turnstile** con verificación **en el servidor** | Plan gratuito: hasta 20 widgets y desafíos ilimitados. El token dura 300 s, es de un solo uso y mide como máximo 2048 caracteres; la validación en el cliente no basta |
| País y conexión no falsificables | `request.cf.country` (lo pone la red de Cloudflare, de solo lectura) y `CF-Connecting-IP` (lo fija Cloudflare en la entrada) | Las cabeceras como `CF-IPCountry` o `X-Forwarded-For` enviadas por el cliente se ignoran |
| Coste | Workers Free | Al superar un límite responde con error, **no cobra**. El tiempo de espera de red (Gemini) no cuenta como CPU (límite de 10 ms) |

## 2. Funcionalidades y estado

| Función | Estado |
|---|---|
| Validación estricta de petición y conversación (ruta, método, origen, tipo, tamaño, JSON, roles alternos, longitudes) | IMPLEMENTADO · PROBADO CON SIMULACIONES |
| Cierre por defecto si falta o es inválida **cualquier** configuración esencial, o si el interruptor no es `"0"` | IMPLEMENTADO · PROBADO CON SIMULACIONES |
| Turnstile verificado solo en el servidor (secreto, IP, dominio, acción, token ≤ 2048, sin red → rechazo) | IMPLEMENTADO · PROBADO CON SIMULACIONES |
| Códigos personales revocables (solo huellas SHA-256 en el secreto `AIRI_CODIGOS`) | IMPLEMENTADO · PROBADO CON SIMULACIONES |
| Bloqueo por fuerza bruta: 10 fallos por hora y conexión (huella HMAC de la IP, sin guardar la IP) | IMPLEMENTADO · PROBADO CON SIMULACIONES |
| Cuotas por participante (5 por minuto y 30 al día) y global (100 al día), atómicas y persistentes | IMPLEMENTADO · PROBADO CON SIMULACIONES (concurrencia de 25 peticiones, dos instancias, reinicio del objeto) |
| Apagado preventivo manual (`AIRI_CHAT_APAGADO`) y automático (pausa de 15 min si Gemini responde 429) | IMPLEMENTADO · PROBADO CON SIMULACIONES |
| Restricción geográfica: lista permitida (`MX`) y exclusión fija del Espacio Económico Europeo, Suiza y Reino Unido | IMPLEMENTADO · PROBADO CON SIMULACIONES |
| Gemini desde el servidor con las mismas instrucciones que `chat/servidor.py` (prueba de paridad) | IMPLEMENTADO · PROBADO CON SIMULACIONES. **Gemini real: PENDIENTE** |
| Errores HTTP sin detalles internos; registros sin IP, código ni texto | IMPLEMENTADO · PROBADO CON SIMULACIONES |
| Interfaz del piloto: código, Turnstile y aviso de privacidad; textos sin «servidor local» | IMPLEMENTADO · PROBADO CON SIMULACIONES (Chrome de escritorio y celular emulado) |
| Voz (Sabina simulada), mascota, dictado (reconocimiento simulado) y motor v0.4 bajo la CSP | PROBADO CON SIMULACIONES |
| Modo local v0.5–v0.6 (`python chat/servidor.py`) sin cambios de comportamiento | PROBADO CON SIMULACIONES (regresión completa) |
| `wrangler.jsonc`, `preparar-estaticos.mjs`, `generar-codigos.mjs` y vista previa local simulada | IMPLEMENTADO. **Validación con Wrangler: PENDIENTE** (no está instalado aquí y la instalación de paquetes está bloqueada) |
| Despliegue, Cloudflare real, Turnstile real, celulares físicos | **PENDIENTE** (requiere tu autorización) |

## 3. Medidas de seguridad

- **Secretos:**
  - solo como secretos de Cloudflare (`GEMINI_API_KEY`, `TURNSTILE_SECRET`, `AIRI_CODIGOS`, `AIRI_SAL`), nunca en
    `wrangler.jsonc`, `dist` ni el repositorio;
  - una prueba revisa que `dist` no contenga patrones de clave;
  - la clave de Gemini va en la cabecera `x-goog-api-key`, nunca en la URL.
- **Nada falsificable por el cliente:** el país y la IP salen de Cloudflare. El participante sale del código
  verificado en el servidor, no de un identificador que envíe el navegador.
- **Códigos de acceso:**
  - 20 símbolos aleatorios (100 bits);
  - el Worker solo conoce su huella y los compara sin salida temprana;
  - nunca están escritos en la página y no se guardan en el navegador (comprobado);
  - revocar uno = quitar su línea del secreto.
- **Cuotas:** la sección crítica del Durable Object es síncrona. Una prueba de mutación (meter una espera asíncrona
  dentro de ella) hace que la prueba de concurrencia falle (llegan 25 consultas en lugar de 5), lo que demuestra que
  esa prueba detecta las carreras.
- **Si falla el Durable Object** (por ejemplo, por agotar el límite diario del plan gratuito): 503 y **no** se llama a
  Gemini.
- **Privacidad:**
  - no se guarda el texto de las preguntas;
  - la IP solo se guarda como huella HMAC con sal secreta, durante una hora y solo si hubo intentos fallidos;
  - los registros solo anotan el resultado y el código HTTP.
- **Navegador:**
  - CSP sin `unsafe-inline` para scripts, sin `eval` y sin dominios externos salvo Turnstile;
  - micrófono solo para el propio origen;
  - sin CORS.

## 4. Resultados reales de las pruebas (13-11-2026, en este entorno)

Todas se ejecutaron. Gemini, Turnstile, el Durable Object, la voz y el reconocimiento de voz están **simulados**.

| Suite | Resultado |
|---|---|
| Worker y cuotas (`cd publico && node --test`) | **32/32** |
| Navegador del piloto (`python publico/pruebas/e2e_piloto.py`), escritorio y celular | **26/26** |
| E1, cuotas del servidor local (`python -m unittest discover -s tests`) | 8/8 |
| Servidor local (`chat/pruebas`) | 29/29 |
| Motor v0.4 (Python) | 52/52 |
| Pruebas de la interfaz con `node --test` (Markdown, habla, mascota, voz, personalidad, pensando, motor JS) | 63/63 |
| Chat · voz del chat · pensando · dictado | 35/35 · 24/24 · 17/17 · 41/41 |
| Mascota · voz · ajustes de voz · análisis · diagnóstico | 76/76 · 50/50 · 43/43 · 57/57 · 17/17 |

**Estado inicial antes de modificar:**
- Worker 20/20 y E1 8/8.
- En la regresión aparecieron **fallos que ya existían en la rama, y en `main` por el PR #9**:
  - servidor 28/29;
  - `e2e_chat` 33/35;
  - `e2e_pensando` 15/17;
  - `e2e_voz_chat` se interrumpía.
- **Causa:** los límites locales de E1 (5 por minuto) cortaban esas pruebas, que envían muchas preguntas seguidas al
  Gemini simulado.
- **Corrección:** esas pruebas amplían los límites solo en su propio proceso. El servidor y sus valores
  predeterminados de E1 no se tocaron.

## 5. Limitaciones conocidas

1. **Nada se probó contra Cloudflare, Turnstile ni Gemini reales**, ni con Wrangler o Miniflare. El emulador de
   Durable Objects de las pruebas reproduce su modelo de ejecución, pero no es el entorno real.
2. **Comportamiento del plan gratuito:**
   - si se agota el límite diario de Workers o de Durable Objects, el chat deja de responder hasta las 00:00 UTC;
   - la cuota diaria de Gemini se reinicia a medianoche del Pacífico;
   - el tope global (100) es una estimación conservadora: no está sincronizado con la cuota real que muestra AI Studio.
3. **Un único Durable Object** para todo el piloto: suficiente para unas decenas de personas, no para tráfico masivo.
4. **Fuerza bruta:** se limita por conexión. Un atacante con muchas IP tendría que superar Turnstile en cada intento,
   y los códigos tienen 100 bits, pero el límite por IP no es absoluto.
5. **Un código compartido** por una persona permite el acceso a quien lo reciba, aunque con la cuota de esa persona.
   Para más garantía: Cloudflare Access (ver §7).
6. **Turnstile** carga un script de Cloudflare: es un tercero más en el aviso de privacidad.
7. **Voces y dictado** dependen de cada dispositivo: Sabina solo existe en tu Windows.

## 6. Requisitos pendientes de configuración (todos requieren tu autorización)

1. Una cuenta de Cloudflare en plan gratuito, **sin método de pago ni planes de pago**.
2. Un widget de Turnstile en el panel de Cloudflare, con el dominio del piloto → sitekey (pública) y secreto.
3. Un proyecto de Google AI Studio **exclusivo del piloto**, sin facturación → `GEMINI_API_KEY`.
4. Generar los códigos y la sal con `node publico/herramientas/generar-codigos.mjs p01 p02 …` y cargar los secretos.
5. Instalar Wrangler en tu equipo (`npm install -D wrangler` dentro de `publico/`) y validar la configuración con
   `npx wrangler deploy --dry-run`. **Validar especialmente** `assets.run_worker_first` con lista de rutas y la
   migración `new_sqlite_classes`, porque no se pudieron ejecutar aquí.

## 7. Instrucciones para una futura publicación controlada

**Vista previa privada (E3), solo con autorización:**
```powershell
cd C:\Users\josea\Proyectos\Airi-oficial\publico
npm install -D wrangler                     # una sola vez
node preparar-estaticos.mjs
npx wrangler login                          # inicia sesión en TU cuenta gratuita
npx wrangler secret put GEMINI_API_KEY      # se escribe de forma oculta; nunca en archivos
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put AIRI_CODIGOS
npx wrangler secret put AIRI_SAL
# editar wrangler.jsonc: AIRI_ORIGEN="https://airi-piloto.<tu-subdominio>.workers.dev" y AIRI_TURNSTILE_SITEKEY
npx wrangler deploy                         # sale CERRADO: AIRI_CHAT_APAGADO="1"
```

Comprobar con el chat cerrado: que la página cargue y que el chat diga «desactivado». Después, abrirlo solo para ti
(`AIRI_CHAT_APAGADO="0"` en `wrangler.jsonc` y `npx wrangler deploy`), probar con tu código y volver a cerrarlo.

**Capa adicional recomendada:** Cloudflare Access sobre el Worker (opción «Protect one Worker», con inicio de sesión
por correo; gratuito hasta 50 usuarios según fuentes de terceros). Antes de usarlo, **confirma que no pide método de
pago**: una fuente de terceros indica que el alta de Zero Trust lo solicita.

**Piloto cerrado (E4):**

| Tarea | Cómo |
|---|---|
| Dar acceso | `generar-codigos.mjs p03` → entregar el código **en persona o por un canal privado**; añadir su línea a `AIRI_CODIGOS` y volver a cargar el secreto |
| Revocar | Quitar `pXX:huella` de `AIRI_CODIGOS` y volver a cargar el secreto (efecto inmediato en el nuevo despliegue) |
| Detener | `AIRI_CHAT_APAGADO="1"` y `npx wrangler deploy` (la interfaz sigue funcionando; el chat muestra «desactivado»). Emergencia: borrar el secreto `GEMINI_API_KEY` deja el Worker cerrado |
| Supervisar | `npx wrangler tail` o los registros del panel (solo resultado y código HTTP). Uso de Gemini en AI Studio; uso de Workers y Durable Objects en el panel |
| Límites | Variables `AIRI_LIMITE_*` en `wrangler.jsonc`; empezar bajo (5/min, 30/día, 100 global) |
| Agotamiento | Mensajes ya implementados: «espera un minuto», «límite de hoy», «el piloto alcanzó su límite», «pausa preventiva» |

**Comprobaciones para participantes:**
1. Abrir el enlace en Chrome (escritorio o Android). En iPhone, Safari: el dictado depende de Siri.
2. Leer el aviso de privacidad y marcar el consentimiento de Gemini.
3. Escribir el código personal y completar la verificación de Cloudflare.
4. Preguntar algo sencillo y comprobar la respuesta.
5. Opcional: probar «Leer respuestas» (cada equipo tiene sus voces) y «Hablar» (pide permiso del micrófono).
6. No escribir datos personales. Reportar errores con captura y hora, sin compartir el código.

## 8. Condiciones de uso: confirmado frente a pendiente de validar

| Punto | Estado |
|---|---|
| Gemini: uso «profesional o empresarial, no de consumo»; prohibido dirigido o probablemente usado por menores de 18; solo pago para usuarios del EEE, Suiza o RU; nivel gratuito usado para mejorar productos y con revisión humana; no dar consejo médico (ai.google.dev/terms) | **CONFIRMADO** (leído el 13-11-2026) |
| Si un piloto académico cerrado encaja en «profesional, no de consumo» | **REQUIERE VALIDACIÓN** de la coordinación o asesoría del proyecto |
| Workers Free, Durable Objects (SQLite) y Turnstile gratuitos con los límites citados | **CONFIRMADO** (documentación oficial) |
| Que el alta de Cloudflare o de Zero Trust no exija método de pago | **NO CONFIRMADO** |
| Condiciones de servicio generales de Cloudflare para este uso | **NO REVISADAS** en detalle; pendiente |

## 9. Riesgos que deben resolverse antes de permitir acceso público

1. Validación de la coordinación sobre las condiciones de Gemini (mayores de edad, uso no de consumo, regiones).
2. Pruebas reales: despliegue con el chat cerrado, Turnstile real, Gemini real con la clave del piloto, y celulares
   Android y iOS reales.
3. Ajustar el tope global a la cuota real que muestre AI Studio para el proyecto del piloto.
4. Decidir si se añade Cloudflare Access (identidad real) en lugar de solo códigos.
5. Un aviso de privacidad formal y un responsable de atender incidencias.
6. **El acceso abierto sin código no está contemplado:** con el nivel gratuito de Gemini y la cuota compartida, se
   desaconseja.

## 10. Archivos de v0.7 (E2–E5)

| Archivo | Contenido |
|---|---|
| `publico/worker.js` | Worker: controles, Turnstile, códigos, cuotas, Gemini y estado |
| `publico/cuotas.js` | Lógica de cuotas y Durable Object `ControlCuotasAIRI` |
| `publico/gemini.js` | Llamada a Gemini e instrucciones (iguales a `servidor.py`) |
| `publico/wrangler.jsonc` | Configuración (cerrada por defecto; sin secretos) |
| `publico/preparar-estaticos.mjs` | Genera `publico/dist` y `_headers` con CSP |
| `publico/herramientas/generar-codigos.mjs` | Códigos personales, huellas y sal |
| `publico/dev/servidor-dev.mjs` | Vista previa local con todo lo externo simulado |
| `publico/worker.test.mjs`, `publico/cuotas.test.mjs`, `publico/pruebas/` | Pruebas |
| `interfaz/chat/acceso-publico.js`, `chat.js`, `chat.css`, `prototipo/index.html` | Modo piloto de la interfaz (el modo local no cambia) |
