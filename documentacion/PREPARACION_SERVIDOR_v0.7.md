# AIRI v0.7 — E1: controles preventivos del servidor local

**Estado:** implementación en rama, pendiente de ejecutar las pruebas en el entorno del proyecto. **No apto para publicación.**

## Qué se añadió
- `chat/control_uso.py`: contador en memoria, protegido por bloqueo, con cuotas por minuto, por día y global por día.
- `chat/servidor.py`: valida la conversación y la clave antes de reservar cuota; devuelve HTTP 429 al alcanzar límites y HTTP 503 si está apagado.
- `tests/test_control_uso_v07.py`: pruebas de límites, reinicio diario y apagado, sin llamadas a Gemini.
- `tests/test_servidor_limites_v07.py`: integración HTTP con Gemini simulado; verifica 429 y 503.

## Configuración local opcional
Variables de entorno antes de arrancar `python chat/servidor.py`:
- `AIRI_LIMITE_MINUTO` (predeterminado 5)
- `AIRI_LIMITE_DIA` (predeterminado 30)
- `AIRI_LIMITE_GLOBAL_DIA` (predeterminado 100; **ejemplo conservador**, no equivale a la cuota real de Google)
- `AIRI_CHAT_APAGADO=1` desactiva el chat al arrancar el servidor; reiniciar el proceso para cambiarlo.

Los límites diarios usan **fecha UTC** y se reinician también al reiniciar el proceso. Cada consulta admitida consume una reserva, aunque Gemini falle. No se registra el contenido de las preguntas.

## Limitaciones importantes
1. El servidor **continúa escuchando exclusivamente en 127.0.0.1**. Todas las visitas locales comparten la misma IP: la cuota por cliente no representa personas distintas.
2. **No publicar este servidor** ni cambiar el host a `0.0.0.0`. Los contadores en memoria no sirven para varias instancias, no sobreviven reinicios y no resisten abuso distribuido.
3. Un atacante puede eludir límites por IP usando varias direcciones. Para v0.7 E2 se necesitan límites compartidos y atómicos, protección antibots, controles de acceso y un contador global persistente.
4. No se debe confiar en `X-Forwarded-For` enviado por el cliente. Solo el proxy de confianza del futuro alojamiento podrá identificar la IP.
5. El máximo global es configurable, **no está sincronizado con la cuota real de Gemini**. No garantiza por sí solo evitar un 429.
6. No se añadió facturación, servicio externo, clave, dominio ni despliegue.

## Verificación pendiente
Ejecutar desde la raíz del repositorio:
```powershell
python -m unittest discover -s tests -p "test_*v07.py" -v
python -m unittest discover -s tests -v
```
Después ejecutar las pruebas de JavaScript y navegador que ya usa el proyecto, y comprobar manualmente con Gemini simulado que el chat devuelve 429/503 y conserva los controles de privacidad. **No fusionar sin regresión completa.**

## Siguiente etapa
E2: adaptar un backend de alojamiento con almacenamiento compartido, verificación de acceso y pruebas de carga, **sin desplegar todavía**. Revisar antes las condiciones actuales de Gemini y del proveedor de alojamiento.
