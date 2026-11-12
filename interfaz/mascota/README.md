# AIRI · Mascota interactiva v0.2

Módulo de la mascota de **AIRI — Agente Inteligente para la Supervisión y Gestión de un Acuario Marino**.

- En la pestaña **Inicio**, AIRI nada dentro de una **pecera animada**.
- En **Parámetros del agua**, **Fichas de especies** y **Próximas versiones**, aparece como **asistente flotante**
  con mensajes contextuales.

Está hecho con HTML, CSS y JavaScript, sin dependencias, sin servidor y sin compilación.

> **Qué es real y qué es demostrativo.** La mascota **no analiza el agua**: AIRI todavía no tiene motor de
> análisis. Sus reacciones repiten lo que el prototipo ya calcula: datos faltantes, valores con formato
> inválido y cuántas fichas encontró el buscador. La breve pausa de "análisis" es una **animación
> demostrativa** y se etiqueta así en pantalla. La pecera es decorativa y no representa un acuario real.

## Cómo verla

Abre `interfaz/prototipo/index.html` en un navegador, con doble clic o desde GitHub Pages si está activado.
No hace falta instalar nada.

## Funcionamiento

### Pecera (Inicio)
- Agua con el gradiente de la paleta V2, rayos de luz, superficie en movimiento, burbujas y arena.
- AIRI **nada horizontalmente**, **flota** con un vaivén suave e **inclina** el cuerpo al subir y bajar.
- **Cambia de dirección** al llegar a los bordes, y a veces a mitad de camino, con un giro de 0.45 s.
- Al cargar, **saluda** con un pequeño salto, la antena rápida y un mensaje de bienvenida.

### Asistente flotante (demás pestañas)
- Avatar en la esquina inferior derecha que flota suavemente, con un globo de mensaje.
- Para no tapar la interfaz, el globo **se contrae solo**: al usar un campo o un botón de la página, al
  desplazar la vista, o a los 8 s (6 s en celular). Pulsar el avatar lo vuelve a abrir.
- La página recibe espacio extra al final para que ningún botón, campo ni ficha quede bajo el avatar.

### Animación del personaje por partes
El personaje oficial se separó en capas **sin redibujarlo** (ver [`assets/README.md`](assets/README.md)):

| Parte | Movimiento |
|---|---|
| Cola | Aleteo (±7°); más rápido durante el análisis |
| Aleta dorsal | Vaivén (±3°) |
| Antena | Balanceo (±4°) y luz que late en la esfera |
| Cuerpo completo | Nado, flotación, giro, saludo y sacudida de error |

### Estados

| Estado | Señal visual | Cuándo se activa | Origen |
|---|---|---|---|
| `bienvenida` | Saludo y antena rápida | Al abrir Inicio | Interfaz |
| `espera` | Nado tranquilo | En reposo; también cuando todos los datos tienen formato válido (sin declarar normalidad) | Interfaz y formulario |
| `analisis` | Antena intermitente, anillo de escaneo, halo cian | 0.9 s tras «Validar entradas» | **Animación demostrativa** |
| `insuficiente` | Halo arena y señal «?» | El formulario marcó campos sin dato | Resultado real del formulario. **Advertencia informativa, no una alerta del acuario** |
| `error` | Halo naranja, sacudida y señal «!» | El formulario marcó valores inválidos | Resultado real del formulario |
| `alerta` | Halo naranja intenso | **No se activa en v0.1.** Reservado para alertas basadas en referencias con fuente | Futuro |

Los ojos y la sonrisa no se animan, porque hacerlo requeriría redibujar el personaje.

### Voz e interacción (v0.2)

**Voz.** AIRI lee sus mensajes en español con la síntesis de voz del propio navegador
(`speechSynthesis`):
- Elige una voz en español si hay alguna instalada (prioridad: es-MX, es-US, es-419, es-ES). Si no hay
  ninguna, pide español a la voz predeterminada del sistema y lo indica en la descripción del botón.
- **Nunca habla al abrir la página**, ni siquiera si la voz quedó activada en una visita anterior: solo
  habla después de una acción de la persona.
- Cada mensaje nuevo **cancela el anterior**, así que la cola nunca acumula mensajes. Los textos largos se
  dividen en fragmentos, porque algunos navegadores cortan las locuciones largas.
- **No usa el micrófono ni servicios externos**: el texto no sale del navegador.
- Si el navegador no tiene síntesis de voz, el botón muestra «Voz no disponible» y todo sigue funcionando
  por escrito.
- Los mensajes **siempre se muestran por escrito**, con la voz activada o no.
- Los resultados del buscador y la pausa demostrativa de «análisis» solo se muestran por escrito, para no
  interrumpir mientras se escribe.

**Controles de voz** (junto a los controles existentes):
- **Activar voz / Voz activada**: alterna la voz (`aria-pressed`). Al activarla, AIRI lee el aviso y el
  mensaje que está en pantalla.
- **Detener voz**: aparece solo mientras AIRI habla.

**Menú de acciones.** Se abre al pulsar la mascota: el avatar flotante o el pez de la pecera, que también
se puede activar con el teclado (Tab y Enter). Tiene seis opciones: ¿Qué puedes hacer? · Ayúdame con los
parámetros del agua · Explícame las fichas de especies · ¿Qué funciones llegarán después? · Repetir
mensaje · Silenciar AIRI.
- La opción de la pantalla actual aparece primero, marcada como «esta pantalla».
- Escape o un clic fuera cierran el menú, y el foco vuelve a la mascota.
- Mientras el menú está abierto, el mensaje se oculta y las opciones se muestran en dos columnas, para
  ocupar poco espacio.

**Ayuda contextual.** Todas las respuestas son **textos predefinidos** en [`ayuda.js`](ayuda.js),
verificados contra lo que hace el prototipo. No se generan con IA.

| Pantalla | Qué explica |
|---|---|
| Inicio | Qué es AIRI, qué hace esta versión y qué todavía no hace |
| Parámetros del agua | Los seis valores y sus unidades (°C, pH, ppt y mg/L), cómo validar y los límites de la validación |
| Fichas de especies | Cómo buscar por nombre común o científico; que las fichas no determinan compatibilidad |
| Próximas versiones | Qué ya funciona y qué está planeado pero no disponible |

**Animación al hablar.** Mientras AIRI habla, se balancea suavemente, la cola se mueve un poco más rápido y
la antena queda encendida. Al terminar vuelve a su estado normal. Con movimiento reducido no hay
movimiento: solo la antena encendida. Las animaciones originales no se modifican; se agrega la clase
`airi-m-hablando` mientras dura la voz.

### Controles y accesibilidad
- **Ocultar mascota / Mostrar AIRI**: oculta la pecera y el asistente; la preferencia se recuerda en el navegador.
  Si el navegador no permite guardarla, todo sigue funcionando.
- **Reducir animaciones**: detiene el nado, las burbujas y todas las animaciones. Las señales de estado
  (colores y «?» o «!») se mantienen.
- Respeta la preferencia del sistema **"reducir movimiento"** (`prefers-reduced-motion`). La persona puede
  cambiarla con el botón.
- Los botones son reales y se pueden usar con teclado, con foco visible y `aria-pressed`. Los mensajes se
  anuncian a lectores de pantalla mediante una región `aria-live="polite"`.

## Archivos

| Archivo | Función |
|---|---|
| `mascota.js` | Núcleo sin dependencias (`window.AIRIMascota`): estados, mensajes, pecera, flotante, controles y preferencias |
| `mascota.css` | Estilos aislados con el prefijo `.airi-m-`; paleta V2 |
| `voz.js` | Síntesis de voz (`window.AIRIVoz`), separada de la parte visual (v0.2) |
| `ayuda.js` | Respuestas predefinidas y verificadas, y opciones del menú (`window.AIRIAyuda`) (v0.2) |
| `interaccion.js` | Menú de acciones, controles de voz y sincronización de la voz con la animación (`window.AIRIInteraccion`) (v0.2) |
| `integracion-prototipo.js` | Conecta la mascota con las pestañas, la validación y el buscador del prototipo, sin modificar su lógica |
| `assets/` | Capas del personaje derivadas del PNG oficial |
| `herramientas/extraer_pez.py` | Regenera las capas (Pillow, NumPy y SciPy, solo en desarrollo) |
| `pruebas/mascota.test.js` | Pruebas unitarias con el ejecutor integrado de Node |
| `pruebas/e2e_mascota.py` | Pruebas de extremo a extremo en Chrome con Playwright |
| `pruebas/voz.test.js` | Pruebas unitarias de voz y ayuda con síntesis simulada (v0.2) |
| `pruebas/e2e_voz.py`, `pruebas/simulador_voz.js` | Pruebas de voz y menú en Chrome, con síntesis simulada y real (v0.2) |

En `interfaz/prototipo/index.html` solo se añadieron líneas de inclusión: en v0.1, una hoja de estilos y dos
scripts; en v0.2, tres scripts más (`voz.js`, `ayuda.js` e `interaccion.js`). Si la
mascota falla o se quitan esas líneas, el prototipo funciona exactamente igual que antes.

## Interfaz para futuras versiones

```js
const m = AIRIMascota.iniciar({ pecera: elemento, modo: "pecera" });
m.decir({ estado: "espera", tipo: "informativo", texto: "…" }); // muestra un mensaje
m.cambiarEstado("analisis");                                     // cambia la animación
m.cambiarModo("flotante");  m.ocultar();  m.mostrar();  m.reducirMovimiento(true);
document.addEventListener("airi:mascota", e => console.log(e.detail.estado));
```

v0.2 añadió `m.elementos`, `m.indicarHabla(bool)` y los eventos `airi:mascota-pulsada` y
`airi:mascota-visibilidad`.

**Cómo encajarán las versiones futuras** (ninguna está implementada):

| Función futura | Punto de conexión |
|---|---|
| Motor de reglas para analizar el agua | Devolverá resultados con fuente; la integración llamará a `m.decir({estado: "alerta", …})`. El estado ya existe |
| Chatbot con IA | Otra fuente de respuestas detrás del mismo menú, en lugar de `AIRIAyuda.respuesta()`, marcando sus respuestas como generadas |
| Reconocimiento de voz | Módulo aparte que pediría permiso del micrófono de forma explícita y llamaría a `interaccion.ejecutar(id)` |
| Fotografías | Módulo aparte con confirmación humana; mostraría su resultado con `m.decir(...)` |
| Aplicación móvil | Reutilizaría `ayuda.js` (textos) y la lógica de `voz.js`; la parte visual es web |

## Pruebas

Desde la raíz del repositorio:

```bash
node --test interfaz/mascota/pruebas/mascota.test.js          # 12 pruebas unitarias (mascota)
node --test interfaz/mascota/pruebas/voz.test.js              # 16 pruebas unitarias (voz y ayuda)
python interfaz/mascota/pruebas/e2e_mascota.py                # 76 comprobaciones en Chrome (v0.1)
python interfaz/mascota/pruebas/e2e_voz.py                    # 50 comprobaciones en Chrome (v0.2)
```

La prueba de extremo a extremo genera una copia temporal del prototipo **sin** la mascota y comprueba que las
cuatro pestañas, la validación (vacío, inválido y válido), «Limpiar» y el buscador den exactamente el mismo
resultado con y sin la mascota. También verifica:
- las animaciones;
- que AIRI no salga de la pecera;
- los estados y mensajes;
- que no tape controles ni fichas en escritorio ni en celular;
- ocultar y mostrar, con mouse, con teclado y tras recargar;
- el movimiento reducido;
- que no haya errores de JavaScript.

`e2e_voz.py` sustituye la síntesis por un simulador que registra cada locución, cada cancelación y
cualquier intento de usar el micrófono. Así comprueba:
- que no habla al abrir la página;
- la elección de voz en español;
- activar, detener, repetir y silenciar;
- que la cola no acumula mensajes;
- la animación y la antena al hablar;
- el menú con mouse, teclado y toque;
- la ayuda correcta en cada pantalla;
- los casos sin voz en español, sin voces y sin síntesis;
- el movimiento reducido y la vista de celular;
- que no haya peticiones de red externas ni errores de JavaScript.

Al final repite una parte con la síntesis real de Chrome.

### Cómo probar la voz a mano
1. Abre `interfaz/prototipo/index.html` en Chrome, Edge o Safari, con el volumen activado.
2. Pulsa **Activar voz** (debajo de la pecera). AIRI dirá «Voz activada» y leerá su mensaje.
3. Pulsa el pez o el avatar flotante y elige una opción del menú. Prueba **Detener voz** mientras habla y
   **Repetir mensaje** en el menú.
4. En Parámetros del agua, pulsa «Validar entradas» con campos vacíos: AIRI leerá qué datos faltan.
5. **Silenciar AIRI** desactiva la voz; los mensajes siguen por escrito.

Las voces disponibles dependen del sistema operativo. En Windows y macOS suele haber voces en español. En
algunas distribuciones de Linux hay que instalarlas aparte.

## Limitaciones de v0.2
- La calidad y el acento de la voz dependen de las voces instaladas en cada equipo.
- Algunos navegadores no emiten el evento de fin de la locución; por eso hay un tiempo máximo de respaldo
  que termina la animación de habla.
- Con un lector de pantalla y la voz de AIRI activos a la vez, el mismo mensaje puede oírse dos veces; quien
  use lector de pantalla puede dejar la voz desactivada.
- En celular, el menú y las respuestas largas ocupan buena parte de la pantalla mientras están abiertos. Se
  contraen al tocar un campo, al desplazar la vista o al cerrar el menú.
- Desde v0.2, pulsar el avatar con el globo abierto muestra el menú en lugar de cerrar el globo.

## Limitaciones de v0.1
- El personaje es una imagen rasterizada en capas, no un vector.
- Solo la cola, la aleta dorsal y la antena se mueven por separado. Con giros mayores aparecerían costuras.
- El estado `alerta` existe pero no se usa, porque no hay referencias biológicas verificadas.
- En celular, el globo flotante cubre parte del contenido mientras está abierto; se contrae al interactuar,
  al desplazar la vista o a los 6 s.

## Ideas para v0.3
- Respuestas más breves para la voz en celular, con la opción de «leer más».
- Control de velocidad de la voz.
- Ayuda por campo del formulario (por ejemplo, al enfocar el pH).
- Conectar la mascota al futuro motor de reglas en cuanto haya referencias con fuente.
- Evaluar el reconocimiento de voz con permiso explícito, como módulo opcional.

## Ideas originales para v0.2
- Isotipo o personaje vectorial por partes, aprobado por el equipo, para animar ojos y aletas pectorales.
- Mensajes de ayuda por campo del formulario y recorrido guiado de la interfaz.
- Usar `especies/datos/catalogo_inicial.json` como fuente única de las fichas.
- Preparar la conexión con el futuro motor de reglas para activar `alerta` solo con referencias con fuente.
- Voz y chat (versiones posteriores), mediante `decir()` y el evento `airi:mascota`.
