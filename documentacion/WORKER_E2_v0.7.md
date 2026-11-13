# AIRI v0.7 — E2: prototipo de backend público (sin despliegue)

**Estado: BLOQUEADO PARA PUBLICACIÓN.** Se añadió un Worker de prueba en `publico/worker.js`, separado del servidor Python. El servidor local, la mascota, el motor y la interfaz no se modifican.

## Qué existe
- Validación de ruta, método, origen, tipo y tamaño de petición y estructura de conversación.
- Rechazo de regiones no autorizadas o desconocidas; no se confía en una cabecera de país enviada por el cliente.
- Código de acceso comprobado en servidor **solo como barrera provisional**. Un código embebido en la interfaz pública sería visible y no sustituye autenticación real.
- **Fail closed:** incluso con origen, región y código correctos, el Worker devuelve 503 y nunca llama a Gemini.
- Pruebas de Node para los controles iniciales. No se ha ejecutado ninguna prueba ni desplegado el Worker desde esta sesión.

## Bloqueos antes de activar el chat
1. Integrar y probar Turnstile verificando el token en el servidor, con expiración y uso único.
2. Crear contadores compartidos **atómicos** (p. ej., Durable Object) para límite global y por cliente. No usar KV como contador de cuota atómica.
3. Establecer identidad del cliente desde metadatos confiables del proveedor, sin confiar en X-Forwarded-For suministrado por usuarios.
4. Proteger el acceso con un mecanismo adecuado para el piloto; el código de acceso no puede publicarse en HTML ni JS.
5. Portar de forma verificable el mensaje de sistema, la llamada a Gemini y su manejo de errores, con la clave exclusivamente como secreto del Worker.
6. Añadir pruebas de seguridad, de concurrencia, regresión completa y revisar las condiciones vigentes de Gemini.
7. Crear cuenta/proyecto de prueba únicamente con autorización expresa del responsable. No habilitar facturación.

## Verificación local
Desde la raíz:
```powershell
cd publico
node --test worker.test.mjs
```

**Nota:** el test de región sin metadatos de Cloudflare comprueba el rechazo seguro. Las pruebas positivas del país requieren un simulador controlado. **No cambiar `AIRI_CHAT_APAGADO` para publicar este prototipo.**

## Continuación: validación defensiva (13-11-2026)

- Se exige alternancia `user/model/user` para evitar historiales malformados.
- Se rechazan códigos de país inválidos y longitudes declaradas no enteras o excesivas.
- Se devuelve error controlado si falla la lectura del cuerpo.
- Se amplían los casos de prueba de validación, regiones simuladas, código de acceso y cierre seguro.
- **Importante:** estas modificaciones se guardaron en GitHub, pero todavía no se ejecutaron las pruebas nuevas en el Windows del responsable. No se afirma que estén verificadas hasta ejecutar `node --test worker.test.mjs`.
- **Sigue bloqueado para publicación:** Turnstile real, cuotas atómicas compartidas, autorización del piloto, Gemini, pruebas con Wrangler y despliegue.
