# AIRI v0.6 · E5–E6: dictado por micrófono, ajustes, privacidad y accesibilidad

**Rama:** `feature/voz-conversacion-airi-v0.6`. **Fecha:** 13-11-2026. **Estado:** implementado y probado con un
reconocimiento de voz **simulado**. Falta la comprobación con el micrófono real en el equipo de la persona responsable.

## Qué hace

En la pestaña «Chat con AIRI», debajo del campo de pregunta:

| Control | Función |
|---|---|
| **🎤 Hablar** | Empieza a escuchar **una sola frase** en español de México (`es-MX`). Mientras escucha cambia a **«■ Terminar de hablar»** |
| **Cancelar dictado** (o tecla Escape) | Detiene la escucha y deja el campo como estaba |
| **Indicador «AIRI: …»** | Muestra el turno: *Escuchando… habla ahora* · *Pensando…* · *Hablando* · *En reposo* |
| **Revisión** | Al terminar, el texto reconocido queda en el campo de pregunta para corregirlo. Después: **Enviar transcripción** o **Descartar** (también se puede pulsar Enter o «Enviar») |

La conversación completa por voz funciona así:
1. pulsas «Hablar» (si Sabina estaba leyendo, se calla primero);
2. dictas la pregunta;
3. la revisas y la envías;
4. la mascota piensa (E4);
5. Sabina lee la respuesta si «Leer respuestas» está activado (E3);
6. AIRI vuelve a reposo.

### Tres niveles de reconocimiento

1. **En el equipo (preferido).** Si `SpeechRecognition.available({langs:["es-MX"], processLocally:true})` responde
   `available`, se escucha con `processLocally = true`. Según la documentación de MDN, ni el audio ni el texto salen
   del equipo.
2. **Paquete descargable.** Si responde `downloadable`, aparece el botón «Descargar el paquete de español…» con el
   tamaño aproximado (unos 60 MB en Chrome). **No se descarga nada sin pulsarlo.** Si la descarga falla, se explica y
   el micrófono sigue desactivado.
3. **Solo en línea.** Si el navegador solo reconoce en sus servidores, aparece una autorización **desmarcada** que
   nombra al proveedor: Google en Chrome, Microsoft en Edge y Apple en Safari. Explica que el audio se envía para
   convertirlo en texto y que AIRI no lo graba. Sin marcarla, el micrófono no se puede usar. La autorización solo
   vale para esa página y no se guarda.

Si el navegador no ofrece reconocimiento de voz (Firefox, Opera…), el botón queda desactivado con una explicación y
el chat escrito funciona igual.

## Reglas de seguridad y privacidad (E6)

- **Nada automático:** el micrófono nunca se activa solo. No hay escucha continua ni palabra de activación
  (`continuous = false`) y cada escucha tiene un tope de 15 s.
- **Se detiene** al cancelar, al pulsar Escape, al ocultar o cambiar de pestaña, al pulsar «Nueva conversación» y
  cuando AIRI empieza a hablar (así no se escucha a sí misma). El botón está desactivado mientras Gemini piensa.
- **Sabina se calla** antes de abrir el micrófono.
- **Sin grabaciones:** AIRI no usa `getUserMedia`, `MediaRecorder` ni almacenamiento, y no guarda audio. **A Gemini
  solo llega el texto**, y la prueba lo comprueba.
- **Revisión obligatoria:** la transcripción nunca se envía sola. El envío pasa por `chat.js`, así que sigue haciendo
  falta el **consentimiento de Gemini** de v0.5.
- **La clave sigue sin llegar al navegador.** El servidor no cambió.
- **Los ajustes existentes se respetan:**
  - Sabina sigue siendo la voz preferida;
  - «Leer respuestas» activa y desactiva la lectura automática, y «Detener voz» y «Escuchar» funcionan como en E3;
  - el indicador de escucha deja de parpadear con `prefers-reduced-motion` o con «Reducir animaciones» de la mascota.
- **Accesibilidad:**
  - todos los controles son botones y casillas nativos, se manejan con teclado y tienen contorno de foco;
  - «Hablar» usa `aria-pressed`;
  - el indicador de turno es una región `status` y los avisos se anuncian con `aria-live`, sin repeticiones;
  - en celular los botones miden al menos 44 px.

## Decisiones

- **Reutilización:**
  - El dictado escribe en el **mismo campo** y envía con el **mismo formulario** (`requestSubmit`), así que no
    duplica la lógica de envío, el consentimiento ni la validación.
  - Para detener y vigilar la voz usa la de `voz.js` (`detener`, `alCambiar`).
  - El estado «Pensando» lo toma del `aria-busy` que ya pone el chat.
  - La mascota mantiene sus estados `pensando` y de habla, así que no hacía falta un estado nuevo.
- **No se añadió un estado «escuchando» a la mascota:** el indicador del chat ya lo muestra, y el requisito pedía no
  introducir comportamientos innecesarios.
- **Siempre `es-MX`:** no se cambia a otra variante del español. Si `es-MX` no está disponible en el equipo, se ofrece
  la descarga o el nivel en línea.
- **Se admiten las dos variantes de la interfaz** de reconocimiento en el dispositivo:
  - la actual, `available()` e `install()`;
  - la anterior, `availableOnDevice()` e `installOnDevice()`.
- **El título de la pestaña** pasó de «v0.5 experimental» a «v0.6 experimental».

## Archivos

| Archivo | Cambio |
|---|---|
| `interfaz/chat/microfono.js` | **Nuevo.** Dictado: detección, consentimientos, escucha, revisión e indicador de turno |
| `interfaz/chat/chat.css` | Bloque «v0.6 E5–E6» al final |
| `interfaz/prototipo/index.html` | Carga `microfono.js` después de `voz-chat.js`; título «v0.6 experimental» |
| `interfaz/chat/pruebas/simulador_reconocimiento.js` | **Nuevo.** `SpeechRecognition` simulado (sin micrófono real) |
| `interfaz/chat/pruebas/e2e_microfono.py` | **Nuevo.** 38 comprobaciones en Chrome |
| `interfaz/chat/pruebas/e2e_chat.py` | La comprobación de altura táctil ignora los botones ocultos del dictado |

Sin cambios: el servidor, `chat.js`, `voz.js`, `voz-chat.js`, la mascota, el motor v0.4, sus umbrales, el grafo y las
fichas de especies.

## Pruebas

```bash
python interfaz/chat/pruebas/e2e_microfono.py   # 38 comprobaciones (Gemini, voz y reconocimiento simulados)
```

Cubre:
- que el micrófono no se activa solo;
- los tres niveles: en el equipo, descarga autorizada o fallida, y en línea con consentimiento y su retirada;
- cancelar, Escape, «Terminar de hablar», «Descartar», el cambio de pestaña y «Nueva conversación»;
- el flujo completo: Sabina hablando, que se calla, dictado, corrección, envío, Pensando, Hablando y reposo;
- que la transcripción no se envía sola, que a Gemini solo llega texto y que sin el consentimiento de Gemini no se
  envía;
- que AIRI deja de escuchar si empieza a hablar;
- los errores `not-allowed`, `no-speech`, `audio-capture` y `network`;
- el navegador sin soporte;
- el teclado, el movimiento reducido (del sistema y de la mascota) y el celular;
- que no hay errores de JavaScript y que la clave no aparece en el registro.

## Prueba manual en Windows (Chrome y Sabina)

Ver la sección «Cómo probarlo» del informe de E7 o el README de `chat/`. Resumen:
1. `git pull` en la rama.
2. `python chat/servidor.py` (pide la clave con entrada oculta).
3. Abrir `http://127.0.0.1:8765/interfaz/prototipo/` **en Chrome**.
4. Pestaña Chat: marcar el consentimiento de Gemini, activar «Leer respuestas» y pulsar «Hablar».

## Limitaciones

- **No se ha comprobado con un micrófono real.** Todo lo anterior se probó con un reconocimiento simulado. La
  disponibilidad del español en el equipo, la calidad de la transcripción y el comportamiento del permiso dependen de
  Chrome y de Windows.
- El navegador integrado de la app de Claude (Electron) no tenía reconocimiento de español en el equipo según el
  diagnóstico de E1. Chrome puede usar el reconocimiento en línea de Google, solo con la autorización explícita.
- **Edge:** según caniuse, su reconocimiento puede no disparar eventos. Si falla, el chat escrito sigue disponible.
- **Datos:** el paquete local de español ocupa unos 60 MB según Chromium; la cifra exacta la decide el navegador.
- **Transcripción:** la puntuación y los términos técnicos (pH, KH, nombres científicos) pueden salir mal; por eso hay
  revisión antes de enviar.
- **Mascota:** no tiene una animación propia de «escuchando»; el turno se ve en el indicador del chat.
