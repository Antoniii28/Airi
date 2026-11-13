# AIRI v0.7 — E2: Worker del piloto y seguridad

**Estado:** IMPLEMENTADO y PROBADO CON SIMULACIONES (13-11-2026). **No desplegado y cerrado por defecto.**
El detalle completo de la arquitectura, la seguridad, las pruebas, las limitaciones y los pasos de publicación está en
[`PILOTO_v0.7.md`](PILOTO_v0.7.md).

## Bloqueos del prototipo anterior y cómo quedaron

| Bloqueo anotado en el prototipo | Resultado |
|---|---|
| 1. Turnstile verificado en el servidor, con expiración y uso único | Hecho: siteverify con secreto, IP, `idempotency_key`, comprobación de dominio y acción; el token es de un solo uso y la interfaz pide uno nuevo tras cada consulta |
| 2. Contadores compartidos atómicos (Durable Object, no KV) | Hecho: `ControlCuotasAIRI` (SQLite, plan gratuito) con sección crítica síncrona; prueba de concurrencia y prueba de mutación |
| 3. Identidad del cliente desde metadatos confiables | Hecho: `CF-Connecting-IP` (huella HMAC) para intentos fallidos; el participante sale del código verificado |
| 4. Acceso del piloto sin código en HTML o JS | Hecho: códigos personales que escribe cada persona; el Worker solo guarda huellas SHA-256 |
| 5. Portar las instrucciones, la llamada a Gemini y sus errores; clave como secreto | Hecho: `gemini.js` con prueba de paridad frente a `chat/servidor.py` |
| 6. Pruebas de seguridad, concurrencia y regresión | Hecho: 32 pruebas del Worker, 26 de navegador del piloto y regresión completa en verde |
| 7. Cuenta o proyecto solo con autorización; sin facturación | **Pendiente de tu autorización**: no se creó nada |

## Verificación local

```powershell
cd publico
node --test                                  # 32 pruebas (Worker y cuotas)
node preparar-estaticos.mjs
node dev/servidor-dev.mjs                    # vista previa SIMULADA en http://127.0.0.1:8787/
```

## Historial

- Prototipo inicial: validación, región, código único provisional y cierre permanente (20 pruebas, todas en verde
  en el equipo del responsable).
- 13-11-2026: Turnstile, cuotas atómicas, códigos personales, Gemini, apagado automático, interfaz del piloto, CSP y
  vista previa local. El código único `AIRI_CODIGO_ACCESO` y la cabecera `x-airi-access` se sustituyeron por
  `AIRI_CODIGOS` (huellas) y `X-AIRI-Acceso`.
