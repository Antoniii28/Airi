# AIRI v0.6 · E1 — Diagnóstico de voz y micrófono

**Fecha:** 12-11-2026 · **Rama:** `feature/voz-conversacion-airi-v0.6` · **Plan:** [`PLAN_VOZ_v0.6.md`](PLAN_VOZ_v0.6.md)

E1 solo **mide**: no implementa la lectura de respuestas, el dictado ni las animaciones (etapas E2–E7).

## Herramienta: `interfaz/diagnostico-voz/index.html`

Página **autocontenida**: un único archivo, sin recursos externos.

**Qué hace al abrirse:**
- Muestra el entorno: navegador, dispositivo, idiomas, contexto seguro y si se pide reducir el movimiento.
- Lista las voces de `speechSynthesis` en español e indica si son **locales** (`localService: true`) o de un
  **servicio remoto**.
- Comprueba si existe `SpeechRecognition` (con o sin prefijo) y consulta `SpeechRecognition.available()` para
  es-MX, es-ES y es-US, tanto **en el dispositivo** como en **cualquier modo**.
- Genera un informe en JSON para copiar.

**Qué no hace:** no activa el micrófono, **no descarga** paquetes de idioma (`install()` no se llama) y **no envía
datos**.

**Pruebas opcionales, solo a petición:**
- **Escuchar ejemplo:** reproduce una frase con la voz elegida.
- **Probar dictado:** exige marcar una casilla de consentimiento y pulsar el botón. Es una sola escucha, se puede
  exigir el procesamiento en el dispositivo y el texto reconocido no sale de la página. El aviso explica que, si el
  procesamiento no es local, el audio va al servicio del navegador.

## Resultados

### 1. Pruebas automáticas (API simuladas): 17/17

`python interfaz/diagnostico-voz/pruebas/e2e_diagnostico.py`

- **Privacidad al cargar:** no se activa el micrófono, no se descargan paquetes y no hay peticiones de red.
- **Lectura de datos:** cuenta las voces locales y remotas e interpreta `available()` en cada modo.
- **Escenarios sin soporte:** sin reconocimiento (tipo Firefox), con prefijo `webkit` y sin `available()` (tipo
  Safari), sin síntesis y sin voces.
- **Micrófono:**
  - Sin consentimiento, el botón no lo activa.
  - Con consentimiento y clic, se produce una sola escucha, con el idioma y el modo elegidos.
- Celular sin desplazamiento horizontal y sin errores de JavaScript.

### 2. Referencia: Chrome 153 sin interfaz (Linux, entorno de pruebas)

- **Síntesis:** la API existe, pero no hay voces instaladas (normal en un servidor).
- **Dictado:** `SpeechRecognition` sin prefijo y con `available()`.
  - **En el dispositivo:** es-MX, es-ES y es-US aparecen como **`downloadable`**. Chrome ofrece dictado privado en
    español tras descargar el paquete.
  - **En cualquier modo:** `available`.

### 3. Navegador integrado de la app de Claude, en el equipo del usuario (Windows)

Medido con el mismo código de solo lectura sobre una página neutra (`example.com`), sin micrófono.

| Dato | Resultado |
|---|---|
| Navegador | Chromium 156 (Electron, app de Claude 5.11492), Windows |
| Idiomas preferidos | es, es-MX, es-ES |
| Voces en total | 6 (3 en español, 3 en otros idiomas) |
| Voces en español | Microsoft **Helena** (es-ES, predeterminada), **Laura** (es-ES) y **Pablo** (es-ES); **todas locales** |
| Voces es-MX o «Online (Natural)» | **Ninguna** |
| `SpeechRecognition` | Presente, sin prefijo, con `available()` |
| Dictado en el dispositivo (es-MX, es-ES, es-US) | **`unavailable`** |
| Dictado en cualquier modo | `available` (informado por la API; **no verificado** con el micrófono) |

**Interpretación:**
- **Lectura en voz alta:** viable ya, con voces locales (el texto no sale del equipo). Solo hay acento de España.
- **Dictado privado:** no disponible en este navegador.
- **Dictado con servicio remoto:** dudoso. Los Chromium que no incluyen el servicio de Google (por ejemplo, Opera)
  no lo ofrecen, y que la API diga `available` no garantiza que funcione. Requiere una prueba manual con
  consentimiento.

## Pruebas manuales pendientes (requieren el equipo o el celular de la persona responsable)

| # | Prueba | Por qué no puede automatizarse | Cómo hacerla |
|---|---|---|---|
| M1 | **Chrome** en Windows: voces y `available()` | No hay acceso a ese navegador desde la sesión | Abrir la página (ver abajo) y copiar el informe |
| M2 | **Edge** en Windows: voces «Online (Natural)», por ejemplo es-MX | Ídem; además esas voces dependen de la cuenta y de la red | Ídem. Probar «Escuchar ejemplo» con una voz local y con una remota |
| M3 | **Celular** (Android o iOS): voces y dictado | No hay acceso al dispositivo | Ver «Celular» abajo |
| M4 | **Calidad de la voz** («¿suena agradable?») | Es una valoración subjetiva | «Escuchar ejemplo» con cada voz en español; anotar la preferida |
| M5 | **Dictado real** (opcional) | Requiere micrófono y permiso | Solo si se decide: marcar el consentimiento, «Probar dictado» y una frase corta. Primero con «Exigir procesamiento en el dispositivo» (el audio no sale del equipo) |

### Cómo abrir la página

**En la computadora:**
1. Actualizar la copia local:
   ```powershell
   cd $HOME\Proyectos\Airi-oficial
   git fetch origin
   git switch feature/voz-conversacion-airi-v0.6
   ```
2. Abrir `interfaz\diagnostico-voz\index.html` con doble clic en Chrome y en Edge.
   - También funciona con el servidor de AIRI: `python chat\servidor.py` (se puede pulsar Enter sin clave) y abrir
     `http://127.0.0.1:8765/interfaz/diagnostico-voz/index.html`.
3. Pulsar «Copiar informe» y pegarlo en el chat.

**En el celular:** el servidor local no es accesible desde otros dispositivos (escucha solo en `127.0.0.1`).
Opciones, pendientes de decisión:
- **Copiar el archivo:** pasar `index.html` al teléfono y abrirlo en su navegador. Algunos navegadores móviles
  limitan los archivos locales.
- **Artefacto privado de Claude:** publicar la página como artefacto privado y abrirlo en el celular.
  - Sirve para las voces y la prueba de sonido.
  - El dictado podría quedar bloqueado dentro del marco del artefacto, así que esos datos no serían fiables.
- **GitHub Pages:** **requiere autorización**.

## Conclusiones para E2–E4 (prioridad: lectura de respuestas y mascota)

1. **Lectura de respuestas:** se puede implementar ya con `speechSynthesis` y voces locales.
   - En el equipo actual, la mejor voz disponible es Helena, Laura o Pablo (es-ES). La elección final depende de M4.
   - Si Edge ofrece voces naturales es-MX (M2), se presentarán como **opción remota explícita**.
2. **Animaciones de habla y pensamiento:** no dependen del navegador. Se basan en los eventos de inicio y fin de cada
   locución que ya gestiona `voz.js`.
3. **Dictado (E5):** no tiene prioridad. En el navegador integrado no hay modo privado. En Chrome probablemente sea
   posible tras descargar el paquete, pendiente de confirmar en M1. El micrófono no se usará sin consentimiento.
