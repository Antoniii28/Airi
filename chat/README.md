# AIRI v0.5 — Chat inteligente (prototipo local)

Este módulo añade un chat con Gemini a la interfaz de AIRI, sin exponer la clave en el navegador. **No está desplegado en GitHub Pages**: Pages solo sirve archivos estáticos y no puede proteger secretos de un backend. La v0.4 continúa funcionando sin la API.

## Configuración local

1. Verifica los límites y la disponibilidad del nivel gratuito en [Google AI Studio](https://aistudio.google.com/) antes de crear una clave. No habilites facturación si deseas mantenerte sin cargos.
2. Guarda la clave **solo** como variable de entorno `GEMINI_API_KEY`, nunca en Git, HTML, capturas ni mensajes. En PowerShell, puedes establecerla en tu sesión con `$env:GEMINI_API_KEY = Read-Host "Clave de Gemini"`.
3. Desde la raíz del repositorio ejecuta `python chat/servidor.py`.
4. Abre `interfaz/prototipo/index.html` en el navegador y entra en «Chat con AIRI».

El navegador envía las preguntas a `http://127.0.0.1:8765/api/chat`, y el servidor local las reenvía a Gemini. El servidor solo escucha en `127.0.0.1`, no en toda la red. No está disponible desde otros dispositivos ni desde el sitio público. No guardamos historial en disco; los mensajes permanecen en memoria de la pestaña hasta cerrarla. Se envían a Google los últimos 12 mensajes para dar contexto. No envíes datos personales o sensibles.

## Alcance y límites

- Conversación de texto en español. No usa micrófono ni imágenes.
- **Sin búsqueda web habilitada:** el modelo puede equivocarse o no conocer información reciente. No afirmar que investiga en tiempo real hasta implementar búsqueda y citas verificadas.
- La IA no modifica el motor v0.4, sus fuentes, umbrales, ni clasificaciones.
- El nivel gratuito está sujeto a disponibilidad, cuotas y condiciones de Google; no se garantizan consultas gratuitas ilimitadas.
- El backend devuelve errores genéricos para no revelar secretos. No habilitar CORS general ni desplegar este servidor de desarrollo directamente en internet.
- Próxima fase: tests de integración, despliegue seguro y revisión de privacidad antes de publicar.

## Prueba básica

Sin configurar la clave, enviar una pregunta debe mostrar «Falta configurar GEMINI_API_KEY». Con una clave válida y cupo disponible, debería responder. Con el servidor apagado, la interfaz debe mostrar un error de conexión sin afectar las otras pestañas.
