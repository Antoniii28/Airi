# AIRI v0.6 · E2–E3 — Lectura en voz alta de las respuestas del chat

**Fecha:** 12-11-2026 · **Rama:** `feature/voz-conversacion-airi-v0.6` · **Plan:** [`PLAN_VOZ_v0.6.md`](PLAN_VOZ_v0.6.md)
**Alcance:** lectura de respuestas con la animación de habla que ya tenía la mascota.

**Fuera de alcance, por decisión del proyecto:** dictado por micrófono (E5) y nuevas animaciones de pensamiento (E4).
El motor científico v0.4, sus umbrales y el grafo **no cambian**.

## Qué hace

| Requisito | Implementación |
|---|---|
| Voz predeterminada **Microsoft Sabina (es-MX)** | `voz.js` prefiere de forma explícita una voz «Sabina» **local**. Si no existe: otra voz local de México (por ejemplo, Raúl); si tampoco, la mejor voz local en español (por ejemplo, Helena, es-ES). Las voces **en línea** solo se usan si se autorizan en «Ajustes de voz» |
| Respuestas reales de Gemini con entonación agradable | Matiz nuevo `conversacion` (tono −0,03 y velocidad −0,04 sobre el perfil «AIRI juvenil» de v0.3), algo más pausado para respuestas largas. Se ajusta con los «Ajustes de voz» existentes |
| Mascota hablando y en reposo al terminar | Se reutiliza la animación de habla de v0.2: `interaccion.js` llama a `indicarHabla()` al empezar y al terminar. Con movimiento reducido, solo se enciende la luz, sin movimiento |
| Markdown sin símbolos | `interfaz/chat/habla-markdown.js` (E2) |
| Activar, desactivar y detener | En el chat: «Leer respuestas: activado/desactivado» (es **el mismo interruptor** que «Activar voz» de la mascota), «Detener voz» mientras habla y «Escuchar» en cada respuesta |
| Nunca dos respuestas a la vez | Cada lectura cancela la anterior. Una pregunta nueva o «Nueva conversación» detienen la voz |
| Desactivada al principio | Igual que desde v0.2: la voz empieza apagada y se recuerda la decisión de la persona en ese navegador |
| Privacidad | Las voces locales generan el audio en el equipo. No se usa el micrófono ni se crea ningún reconocimiento de voz. La clave de Gemini sigue solo en el servidor |
| Accesibilidad | Botones con `aria-pressed` y `aria-label`, foco visible y áreas táctiles de 44 px en celular. La lectura está apagada por defecto para no interferir con los lectores de pantalla |

### Cómo se pronuncia el Markdown (`habla-markdown.js`)

| Respuesta escrita | Se lee como |
|---|---|
| `**pez payaso**`, `*agua estable*` | «pez payaso», «agua estable» |
| `- Pellets` / `- Artemia` | «Pellets. Artemia.» (una frase por elemento) |
| `1. Acondiciona…` / `2. Observa…` | «Primero, acondiciona… Segundo, observa…» |
| Tabla «Alimento \| Frecuencia» | «Tabla con 2 filas. Fila 1: Alimento, Pellets; Frecuencia, 2 a 3 veces al día…». Si tiene más de 8 filas: «Y N filas más; puedes verlas en pantalla» |
| `[FishBase](https://…)` | «FishBase» (la dirección no se lee) |
| Dirección suelta, bloque de código | «un enlace» · «Hay un fragmento de código que puedes ver en pantalla» |
| `2–3`, `24-26` | «2 a 3», «24 a 26» (las fechas como `2026-11-12` no cambian) |

Después, `voz.js` aplica sus reemplazos de v0.2, como `pH` → «pe hache» y `mg/L` → «miligramos por litro».

## Archivos

| Archivo | Cambio |
|---|---|
| `interfaz/chat/habla-markdown.js` | **Nuevo** (E2). Funciones puras |
| `interfaz/chat/voz-chat.js` | **Nuevo** (E3). Controles en el chat y lectura de respuestas |
| `interfaz/chat/chat.js` | Emite `airi:chat-pregunta`, `airi:chat-respuesta` y `airi:chat-reiniciar` |
| `interfaz/chat/chat.css` | Estilos de los controles de voz |
| `interfaz/mascota/voz.js` | Preferencia por Sabina (`VOCES_PREFERIDAS`) y matiz `conversacion`. No cambia el comportamiento con otras voces |
| `interfaz/prototipo/index.html` | Carga `habla-markdown.js` y `voz-chat.js`. Este último va después de `integracion-prototipo.js`, que crea la voz |
| `chat/servidor.py` | `/favicon.ico` responde 204 (evitaba un 404 en la consola) |

## Pruebas automáticas

| Suite | Resultado |
|---|---|
| `interfaz/chat/pruebas/habla.test.js`: texto para hablar, preferencia de Sabina y matiz | 8/8 |
| `interfaz/chat/pruebas/e2e_voz_chat.py`: Chrome, servidor real, Gemini y voz simulados | 24/24 |
| Regresión (12-11-2026): servidor 29/29 · Markdown 8/8 · motor Python 52/52 y JS 5/5 (34 casos al día) · mascota 12/12 · voz 16/16 · personalidad 11/11 | todo en verde |
| Regresión en navegador: chat 35/35 · diagnóstico 17/17 · mascota 76/76 · voz 50/50 · ajustes de voz 43/43 · análisis 57/57 | todo en verde |

`e2e_voz_chat.py` comprueba:
- **Estado inicial:** la lectura empieza desactivada y la voz elegida es Sabina aunque también esté Raúl.
- **Lectura:** «Escuchar» lee con Sabina, sin símbolos y con el matiz de conversación. Con la lectura activada, cada
  respuesta nueva se lee sola.
- **Mascota:** anima el habla mientras suena y vuelve a reposo al terminar o con «Detener voz».
- **Interruptor único:** «Leer respuestas» es el mismo interruptor que «Activar voz» de la mascota.
- **Sin solapamientos:** una pregunta nueva corta la lectura anterior y «Nueva conversación» detiene la voz.
- **Alternativas de voz:** Raúl, luego Helena; una voz en línea no se usa sin autorización.
- **Sin síntesis:** si el navegador no tiene voz, lo indica.
- **Movimiento reducido** y **celular** (controles de 44 px, sin desplazamiento horizontal).
- **Privacidad:** no se pide el micrófono, no hay peticiones externas, la clave no aparece en el registro y no hay
  errores de JavaScript.

**Límite de estas pruebas:** usan un simulador de voz, así que comprueban qué texto se envía, con qué voz, tono y
velocidad, y en qué orden, pero **no cómo suena**. La calidad audible se valida en el equipo real.

## Prueba manual en el equipo (conversación real con Gemini y Sabina)

Se necesita Chrome o Edge en Windows con la voz **Microsoft Sabina** instalada. La prueba de E1 la encontró en el
equipo del proyecto.

1. Actualizar la copia local:
   ```powershell
   cd $HOME\Proyectos\Airi-oficial
   git fetch origin
   git switch feature/voz-conversacion-airi-v0.6
   git pull
   ```
2. Iniciar el servidor:
   ```powershell
   python chat\servidor.py
   ```
   Pegar la clave de Gemini en la entrada oculta y pulsar Enter.
3. Abrir **http://127.0.0.1:8765/** en Chrome o Edge.
4. En **Chat con AIRI**:
   - El estado debe decir «Voz: Sabina (es-MX, en este equipo)».
   - Marcar el consentimiento y pulsar **«Leer respuestas: desactivado»** para activarlo.
5. Preguntar, por ejemplo: «Dame una tabla con tres alimentos para un pez payaso juvenil».
   - Comprobar que Sabina lee la tabla como frases y no dice «asterisco» ni «barra».
   - Comprobar que la mascota (abajo a la derecha) anima el habla y se detiene al terminar.
6. Hacer otra pregunta mientras habla: la lectura anterior debe cortarse.
7. Probar **«Detener voz»**, **«Escuchar»** en una respuesta anterior y **«Nueva conversación»**.
8. Opcional: ajustar el tono y la velocidad en el menú de AIRI → «Ajustes de voz».
9. En la terminal solo deben aparecer líneas `[AIRI] "GET …"` y `"POST /api/chat …"`, sin la clave.

## Limitaciones

- La calidad de la voz depende de las voces de cada equipo. Sabina es una voz local de Windows, no neuronal.
- El navegador integrado de la app de Claude solo mostró voces es-ES en E1. Allí se usaría Helena.
- Las respuestas muy largas se leen por fragmentos (comportamiento de `voz.js` desde v0.2).
- Al cambiar de pestaña con la voz activada, la mascota lee su mensaje de pestaña, lo que interrumpe la lectura del
  chat (comportamiento de v0.2).
- Pendiente según el plan: E4 (animación de pensamiento), E5 (dictado) y E6 (ajustes y revisión de accesibilidad).
