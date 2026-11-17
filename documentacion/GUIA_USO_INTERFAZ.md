# AIRI — Guía de uso de la interfaz

**Versión de la interfaz:** prototipo v0.6 · **Motor de análisis del agua:** v0.4 · **Chat:** v0.6 experimental.

Esta guía explica cómo recorrer las secciones disponibles en el prototipo web de AIRI y cuáles son sus límites. La interfaz es una herramienta académica de consulta y demostración; no sustituye la revisión de una persona con experiencia en acuarios marinos.

## 1. Abrir la interfaz

Abre el archivo `interfaz/prototipo/index.html` con un navegador actualizado. La mayoría de las secciones pueden explorarse directamente, sin instalar el proyecto.

El chat es una excepción: necesita iniciar el servidor local de AIRI y tener conexión a internet. Sus instrucciones de configuración están en el [README del chat](../chat/README.md).

En la parte superior encontrarás seis secciones:

- **Inicio**
- **Parámetros del agua**
- **Fichas de especies**
- **Compatibilidad**
- **Próximas versiones**
- **Chat con AIRI**

Pulsa el botón **Menú** (icono de tres líneas) para desplegar la navegación y selecciona una sección para cambiar de pantalla. El menú se cierra al elegir una opción o pulsar Escape. El logotipo de AIRI también permite volver a Inicio.

En el encabezado encontrarás el control **Modo oscuro / Modo claro**. Puedes alternar la apariencia de toda la interfaz; la selección se conserva en el navegador para próximas visitas.

## 2. Inicio

Es la pantalla de bienvenida. Presenta el propósito general del prototipo y resume tres aspectos: consulta de parámetros del agua, fichas iniciales de especies y supervisión humana.

La pecera animada de AIRI es un elemento visual. No representa un acuario real ni recibe información de sensores.

## 3. Parámetros del agua

Esta sección permite capturar seis mediciones:

| Parámetro | Unidad |
|---|---|
| Temperatura | °C |
| pH | pH |
| Salinidad | ppt |
| Amoníaco total | mg/L |
| Nitritos | mg/L |
| Nitratos | mg/L |

### Cómo realizar una evaluación

1. En **Origen de datos**, selecciona MANUAL o SIMULADO, según el tipo de ejemplo que quieras registrar.
2. Escribe los valores en los campos correspondientes. Puedes dejar campos vacíos si no cuentas con una medición.
3. Pulsa **Validar entradas**.
4. Revisa el resultado de validación y el análisis que aparece en la misma sección.
5. Para comenzar de nuevo, pulsa **Limpiar**.

El proceso distingue dos pasos:

- **Validación de formato:** comprueba que los datos capturados tengan un formato válido. Un dato con formato válido no significa que sea adecuado para el acuario.
- **Evaluación con referencias:** el motor compara únicamente los parámetros que cuentan con referencias documentadas. En esta versión se evalúan pH, amoníaco total y nitritos. Temperatura, salinidad y nitratos todavía no se evalúan con referencias.

El resultado puede incluir valores que conviene revisar, explicaciones, fuentes y datos faltantes. Lee también las notas que acompañan al informe: AIRI no diagnostica enfermedades, no garantiza que el agua sea segura y no controla equipos del acuario.

## 4. Fichas de especies

Esta sección contiene seis fichas preliminares. Puedes buscar por nombre común o científico; por ejemplo, escribe «payaso» o «Amphiprion ocellaris».

Selecciona una ficha para ampliarla. Cuando está abierta puedes:

- Cambiar las fotografías con las flechas.
- Consultar el enlace de la fuente de la fotografía.
- Cerrar la ficha con el botón **×**, haciendo clic fuera de ella o pulsando Escape.

Las fotografías pueden cambiar automáticamente mientras la ficha está ampliada. El movimiento se detiene al cerrarla.

**Importante:** las fichas son preliminares y no contienen una evaluación biológica verificada. No determinan compatibilidad ni recomiendan introducir una especie al acuario.

## 5. Compatibilidad

Esta pestaña permite comparar especies del catálogo y consultar seis escenarios de demostración.

### Comparar especies del catálogo

1. En **Especies disponibles**, marca al menos dos especies de las fichas.
2. Pulsa **Comparar selección**.
3. Revisa el resultado general, la evaluación de cada par, los motivos, la confianza, las fuentes y los datos faltantes.
4. Para probar otra combinación, cambia las casillas y vuelve a pulsar el botón.

La evaluación se solicita al módulo de compatibilidad con los identificadores de las fichas y el catálogo disponible. La interfaz presenta la respuesta; no contiene reglas biológicas ni realiza cálculos propios. El resultado es orientativo y no garantiza la convivencia ni el bienestar de los organismos. La ausencia de información nunca significa que dos especies sean compatibles.

### Consultar escenarios de demostración

En **Consultar un escenario de demostración**, selecciona uno de los seis casos para observar distintos tipos de salida: compatible, precaución, incompatible, información insuficiente, evidencia contradictoria y datos del acuario.

**Estos escenarios son ficticios y utilizan especies y fuentes de prueba.** No son resultados biológicos reales ni recomendaciones para combinar organismos.

Si una comparación o un ejemplo no carga, comprueba la conexión a internet y que las ramas que contienen el módulo, el catálogo y los ejemplos sigan disponibles.

## 6. Próximas versiones

Esta sección muestra funciones que se contemplan para etapas posteriores, pero que todavía no están disponibles en el prototipo:

- **Fotografías:** identificación probable de especies a partir de imágenes, con autorización y confirmación humana.
- **Aplicación móvil:** posible adaptación futura de la interfaz.

Que una función aparezca aquí no significa que ya pueda utilizarse.

## 7. Chat con AIRI

El chat ofrece una conversación orientativa sobre acuarios marinos mediante Gemini (Google). Es una función experimental y necesita:

- El servidor local de AIRI en ejecución.
- Una clave de Gemini configurada en el servidor, no en el navegador.
- Conexión a internet.
- Aceptar la casilla de consentimiento antes de enviar preguntas.

Escribe una pregunta y pulsa **Enviar**. Usa **Nueva conversación** para borrar el historial de la pestaña. La conversación se conserva únicamente en la memoria de esa pestaña y desaparece al cerrarla.

El chat no analiza las mediciones del acuario, no diagnostica, no consulta información en internet y puede equivocarse. No escribas información personal, confidencial ni datos sensibles: las preguntas se envían a Google y, en el nivel gratuito, pueden ser revisadas por personas y utilizadas para mejorar sus productos. Consulta el [README del chat](../chat/README.md) antes de utilizarlo.

### Voz y micrófono

La lectura en voz alta es opcional y empieza desactivada. Los controles de voz permiten activar o detener la lectura y escuchar una respuesta. El dictado por micrófono también es opcional: solo comienza después de pulsar el botón correspondiente; la transcripción se muestra para revisarla antes de enviarla. La disponibilidad depende del navegador y de sus funciones de reconocimiento de voz.

Para conocer los permisos, las alternativas de reconocimiento y sus límites, consulta la [documentación del micrófono v0.6](MICROFONO_v0.6.md) y la [documentación de voz del chat v0.6](VOZ_CHAT_v0.6.md).

## 8. Asistente flotante AIRI

En las secciones donde aparece el pez flotante, puedes pulsarlo para abrir su menú de ayuda y acciones. Al desplazarte hacia abajo también aparece una flecha situada encima del pez; púlsala para regresar al inicio de la página. Esta flecha no aparece en **Próximas versiones**. Según la pantalla, ofrece explicaciones y accesos a opciones de la mascota.

El mensaje del asistente puede contraerse para dejar espacio a los controles. Pulsa de nuevo el pez para volver a mostrarlo. También puedes ajustar la voz, reducir las animaciones u ocultar la mascota desde sus controles.

La mascota presenta mensajes y estados de la interfaz; no realiza por sí misma el análisis del agua ni toma decisiones sobre el acuario.

## 9. Límites generales

- AIRI no está conectado a sensores físicos ni monitorea el acuario continuamente.
- No enciende ni controla bombas, calentadores, dosificadores u otros equipos.
- La validación del formato no demuestra que una medición sea segura.
- El motor solo evalúa los parámetros que tienen referencias documentadas en esta versión.
- Las fichas de especies son preliminares y no determinan compatibilidad.
- Los seis escenarios de compatibilidad son ejemplos ficticios de demostración.
- El chat es experimental, requiere un servicio externo y puede proporcionar información incorrecta.
- Las funciones de identificación por fotografías y aplicación móvil todavía no están implementadas.

Los resultados de AIRI son informativos. Verifica las mediciones y consulta fuentes especializadas o personal con experiencia antes de tomar decisiones sobre los organismos y las condiciones del acuario.

## Documentación relacionada

- [README principal del proyecto](../README.md)
- [Descripción y alcance de AIRI](01_descripcion_agente.md)
- [Normativa básica o funcional](02_normativa_basica.md)
- [README del motor de análisis del agua](../interfaz/motor/README.md)
- [README de la mascota](../interfaz/mascota/README.md)
- [README del chat](../chat/README.md)
