# AIRI · Mascota interactiva v0.1

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
| `integracion-prototipo.js` | Conecta la mascota con las pestañas, la validación y el buscador del prototipo, sin modificar su lógica |
| `assets/` | Capas del personaje derivadas del PNG oficial |
| `herramientas/extraer_pez.py` | Regenera las capas (Pillow, NumPy y SciPy, solo en desarrollo) |
| `pruebas/mascota.test.js` | Pruebas unitarias con el ejecutor integrado de Node |
| `pruebas/e2e_mascota.py` | Pruebas de extremo a extremo en Chrome con Playwright |

En `interfaz/prototipo/index.html` solo se añadieron tres líneas (una hoja de estilos y dos scripts). Si la
mascota falla o se quitan esas líneas, el prototipo funciona exactamente igual que antes.

## Interfaz para futuras versiones

```js
const m = AIRIMascota.iniciar({ pecera: elemento, modo: "pecera" });
m.decir({ estado: "espera", tipo: "informativo", texto: "…" }); // muestra un mensaje
m.cambiarEstado("analisis");                                     // cambia la animación
m.cambiarModo("flotante");  m.ocultar();  m.mostrar();  m.reducirMovimiento(true);
document.addEventListener("airi:mascota", e => console.log(e.detail.estado));
```

Un futuro módulo de voz o de chat solo necesitará llamar a `m.decir(...)`, sin tocar el núcleo.

## Pruebas

Desde la raíz del repositorio:

```bash
node --test interfaz/mascota/pruebas/mascota.test.js          # 12 pruebas unitarias
python interfaz/mascota/pruebas/e2e_mascota.py                # 76 comprobaciones en Chrome
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

## Limitaciones de v0.1
- El personaje es una imagen rasterizada en capas, no un vector.
- Solo la cola, la aleta dorsal y la antena se mueven por separado. Con giros mayores aparecerían costuras.
- El estado `alerta` existe pero no se usa, porque no hay referencias biológicas verificadas.
- En celular, el globo flotante cubre parte del contenido mientras está abierto; se contrae al interactuar,
  al desplazar la vista o a los 6 s.

## Ideas para v0.2
- Isotipo o personaje vectorial por partes, aprobado por el equipo, para animar ojos y aletas pectorales.
- Mensajes de ayuda por campo del formulario y recorrido guiado de la interfaz.
- Usar `especies/datos/catalogo_inicial.json` como fuente única de las fichas.
- Preparar la conexión con el futuro motor de reglas para activar `alerta` solo con referencias con fuente.
- Voz y chat (versiones posteriores), mediante `decir()` y el evento `airi:mascota`.
