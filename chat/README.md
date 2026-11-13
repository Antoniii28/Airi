# AIRI v0.5 — Chat con AIRI (experimental, local)

Pestaña «Chat con AIRI» del prototipo: conversación orientativa sobre acuarios marinos con **Gemini** (Google), a
través de un **servidor local** que guarda la clave. El navegador nunca recibe la clave.

> El chat **no** analiza mediciones (eso lo hace el motor de reglas v0.4 en «Parámetros del agua»), **no**
> diagnostica, **no** busca información en internet y puede equivocarse. No modifica el motor, sus fuentes, sus
> umbrales ni el grafo de decisiones.

## Cómo funciona

```text
Navegador: http://127.0.0.1:8765/ (la interfaz la sirve el propio servidor)
   │ POST /api/chat (mismo origen; sin CORS)
   ▼
chat/servidor.py (solo escucha en 127.0.0.1; clave en memoria)
   │ HTTPS con la cabecera x-goog-api-key
   ▼
API de Gemini · generateContent (modelo predeterminado: gemini-3.1-flash-lite)
```

- **Solo en este equipo:** el servidor escucha en `127.0.0.1`, así que no es accesible desde otros equipos ni desde
  GitHub Pages.
- **Página abierta sin el servidor:** si abres la página con doble clic (`file://`) o desde el sitio público, el chat
  explica cómo iniciarlo y no intenta conectarse.
- **Consentimiento:** antes de la primera pregunta hay que marcar una casilla, porque las preguntas se envían a Google.
- **Historial:** se guarda solo en la memoria de la pestaña. Se envían los últimos 12 mensajes, hasta 30 000
  caracteres, para dar contexto.

## Presentación de las respuestas

- **Burbujas:** la persona aparece a la derecha, en azul, y AIRI a la izquierda, en blanco con borde. En celular las
  burbujas ocupan como máximo el 92 % del ancho.
- **Markdown seguro** ([`interfaz/chat/markdown.js`](../interfaz/chat/markdown.js)): negritas, cursivas, títulos,
  listas con niveles, tablas, citas y código se muestran sin asteriscos ni símbolos. El texto se analiza primero y
  luego se crean los elementos **solo con `createElement` y `textContent`**: el HTML que escriba Gemini se muestra
  como texto y no puede ejecutarse (sin XSS).
- **Enlaces sin clic:** se muestran como «texto (dirección)» y no se pueden pulsar, porque sin búsqueda web no están
  verificados.
- **Mientras Gemini responde:**
  - en la conversación aparece «Pensando…» con tres puntos animados (estáticos si se pide reducir el movimiento) y
    el botón «Enviar» se desactiva;
  - la mascota pasa a su estado `analisis`, sin mensaje nuevo, sin abrir el globo y sin voz, y vuelve a `espera` al
    terminar.
  - Las animaciones de habla y de pensamiento quedan para v0.6.

## Instrucciones del modelo

Están en `SISTEMA`, dentro de `chat/servidor.py`, y piden:

- **Proporción:** respuestas proporcionales a la pregunta, sin saludar en cada mensaje.
- **Formato:** Markdown sencillo y nunca HTML.
- **Advertencias:** solo las pertinentes a la pregunta.
- **Prudencia:**
  - distinguir lo establecido de lo incierto y presentar los rangos como aproximados;
  - no inventar estudios, referencias ni enlaces, y reconocer que no hay acceso a internet;
  - no diagnosticar y recomendar a un veterinario ante síntomas;
  - no dar órdenes de acciones físicas;
  - dejar la evaluación de parámetros al motor v0.4.

## Configurar Gemini con el nivel gratuito (paso a paso)

Lo hace la persona responsable del proyecto, en su propio equipo. **Nunca** pegues la clave en un chat (tampoco en
este), en GitHub, en capturas ni en archivos del repositorio.

1. **Crear la clave.**
   1. Entra en [Google AI Studio → API keys](https://aistudio.google.com/apikey) con tu cuenta de Google y acepta los
      términos si te los pide.
   2. Pulsa *Create API key* y elige **un proyecto nuevo** (así el chat de AIRI no comparte cuota ni permisos con
      otros proyectos).
   3. Copia la clave.
2. **No actives la facturación.**
   - No pulses *Set up billing* ni *Upgrade*.
   - Según la documentación de Google, para pasar del nivel gratuito a uno de pago primero hay que configurar la
     facturación en AI Studio; sin ella, el proyecto queda en el nivel gratuito.
   - Los límites de uso se aplican **por proyecto, no por clave**, y se consultan en AI Studio. Google no publica
     cifras fijas en la página de límites, así que AIRI no las da.
3. **Iniciar el servidor.** Desde la raíz del repositorio:
   ```powershell
   python chat/servidor.py
   ```
   - Si no existe la variable `GEMINI_API_KEY`, el servidor pide la clave **sin mostrarla** y la guarda **solo en
     memoria**; al cerrarlo, se olvida.
   - Pulsa Enter sin escribir nada para arrancar sin clave: el chat avisará de que falta.
   - Evita `setx GEMINI_API_KEY ...`, porque deja la clave guardada de forma permanente en la configuración de Windows.
   - Evita también `Read-Host` sin enmascarar, porque la muestra en pantalla.
4. **Comprobar el modelo.**
   ```powershell
   python chat/servidor.py --listar-modelos
   ```
   - Muestra los modelos que tu clave puede usar. Para usar otro: `--modelo NOMBRE`.
   - Que un modelo aparezca en la lista no garantiza que tenga nivel gratuito: verifícalo en AI Studio o en la
     [página de precios](https://ai.google.dev/gemini-api/docs/pricing).
5. **Abrir AIRI.** Ve a **http://127.0.0.1:8765/**, abre la pestaña «Chat con AIRI», marca la casilla de
   consentimiento y pregunta.
6. **Si la clave se expone:** bórrala en AI Studio y crea otra.

### Por qué `gemini-3.1-flash-lite`

Consulta del 12-11-2026:

- **Estable y gratuito:** la [página de modelos](https://ai.google.dev/gemini-api/docs/models) lo marca como
  «Stable», y la [de precios](https://ai.google.dev/gemini-api/docs/pricing) le asigna «Free of charge» en el nivel
  gratuito.
- **Por qué no `gemini-2.5-flash`:** era el modelo de la primera versión, pero Google limita el acceso a los modelos
  2.5 a quienes ya los usaban y recomienda modelos 3.x para proyectos nuevos.
- **Otros modelos recomendados:** la página de modelos sugiere 3.5 Flash-Lite y 3.8 Flash. No encontré su fila de
  nivel gratuito en la página de precios, así que AIRI no los usa por defecto. Puedes probarlos con `--modelo`
  después de verificarlo.

### Privacidad y términos

- En los servicios gratuitos, Google puede usar las preguntas y respuestas para mejorar sus productos, y **personas
  revisoras pueden leerlas**. Los [términos](https://ai.google.dev/gemini-api/terms) piden no enviar información
  sensible, confidencial ni personal. Por eso el chat pide consentimiento y no envía mediciones ni datos de forma
  automática.
- Los términos vigentes indican que AI Studio y la API de Gemini son para desarrolladores con fines profesionales o
  de negocio. Revísalos antes de usar el chat con otras personas.

## Seguridad aplicada

| Riesgo | Medida |
|---|---|
| Clave en el navegador, en GitHub o en registros | Solo en la memoria del servidor; se envía a Google únicamente en la cabecera `x-goog-api-key`. Las respuestas y los registros nunca la incluyen (lo comprueban las pruebas). `.gitignore` en la raíz y en `chat/` excluye `.env`. Una prueba busca claves de Google en todos los archivos versionados |
| Otra web abierta en el equipo usando el servidor y la cuota | Sin CORS. Se rechazan el origen `null` (iframes aislados de cualquier sitio) y los orígenes ajenos |
| DNS rebinding | Solo se aceptan las cabeceras `Host: 127.0.0.1:PUERTO` y `localhost:PUERTO` |
| Lectura de archivos del equipo | Solo se sirven `/interfaz/` e `/identidad-visual/`; se bloquean las rutas con `..` y los archivos ocultos |
| Inyección de HTML en las respuestas | Todo se muestra con `textContent` |
| Abuso o bucles | Una consulta a la vez y como máximo 10 por minuto. Es una **protección local de AIRI**, no un límite de Google |
| Peticiones lentas o enormes | Cuerpo de 64 KiB como máximo, *timeout* de socket de 20 s y de Gemini de 45 s |
| Errores con datos internos | Se traducen a mensajes en español sin detalles ni la clave |

## Pruebas

```bash
python -m unittest discover -s chat/pruebas -v    # 28 pruebas del servidor (Gemini simulado, sin internet)
node --test interfaz/chat/pruebas/markdown.test.js # 8 pruebas del Markdown seguro (incluye intentos de XSS)
python interfaz/chat/pruebas/e2e_chat.py          # 32 comprobaciones en Chrome (escritorio y celular)
```

Las pruebas usan un **Gemini simulado** en `127.0.0.1` y una clave ficticia; no consumen cuota ni necesitan internet.

## Limitaciones pendientes

- **Gemini real:**
  - La persona responsable lo probó con su clave (12-11-2026): respondió correctamente a tres preguntas (cuidados del
    pez payaso, seguimiento sobre juveniles y limitaciones de búsqueda web).
  - Las **instrucciones nuevas del modelo** (proporción, sin saludos repetidos) y el Markdown solo se han probado con
    el Gemini simulado: falta repetir la prueba real.
  - Las respuestas reales pueden variar.
- **Sin búsqueda web ni citas:** el modelo no consulta fuentes en tiempo real.
- **Sin voz:** la mascota tiene un mensaje para esta pestaña, pero no lee las respuestas del chat.
- **Solo local:** no hay despliegue público. Un servidor en internet necesitaría autenticación, HTTPS y control de
  gasto.

### Prueba con tu clave (manual)

1. Inicia el servidor con tu clave y abre http://127.0.0.1:8765/.
2. En «Chat con AIRI», marca la casilla y pregunta, por ejemplo, «¿Qué necesita un pez payaso en un acuario?».
3. Haz una pregunta de seguimiento («¿Y si es juvenil?») para comprobar que mantiene el contexto.
4. Comprueba que la terminal solo muestra líneas `[AIRI] "POST /api/chat …" 200`, sin la clave.
5. Si aparece un error de modelo, ejecuta `--listar-modelos`. Si aparece uno de límite (429), espera; no actives la
   facturación.
