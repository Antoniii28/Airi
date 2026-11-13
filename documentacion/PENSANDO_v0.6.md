# AIRI v0.6 · E4: la mascota «piensa» mientras Gemini responde

**Rama:** `feature/voz-conversacion-airi-v0.6`. **Fecha:** 13-11-2026. **Estado:** implementada y probada; no está
fusionada con `main` ni publicada.

## Qué hace

Cuando el usuario envía una pregunta en el chat, la mascota pasa al nuevo estado `pensando` hasta que llega la respuesta
de Gemini:

| Momento | Mascota |
|---|---|
| Pregunta enviada | `pensando`: nado muy lento, aleteo y antena suaves, luz que «respira» y una burbuja blanca con tres puntos que suben y bajan |
| Llega la respuesta con la lectura en voz alta **desactivada** | Vuelve a `espera` (reposo) y la burbuja desaparece |
| Llega la respuesta con la lectura **activada** (E3) | Deja de pensar y habla con Sabina (`airi-m-hablando`). Al terminar vuelve a reposo |
| Nueva pregunta mientras habla | Se calla y vuelve a pensar |
| Error de Gemini (por ejemplo, 429) o «Nueva conversación» | Vuelve a `espera` |
| Movimiento reducido | Sin animaciones; se ven tres puntos fijos en la burbuja y el halo cian |

Mientras piensa no abre el globo, no cambia el mensaje y no habla, así que no interfiere con Sabina ni con los
controles de voz de E3.

## Decisiones de diseño

- **Antes de implementar se revisaron los estados existentes.** En v0.5 el chat reutilizaba `analisis`, pero esa
  animación es intensa: cola a 0,45 s, luz parpadeando cada 0,35 s y anillos de escaneo cada 0,9 s. Además, es la
  animación demostrativa del análisis del agua, así que conviene no mezclar los dos significados. Por eso se creó
  `pensando` como estado propio, y `analisis` sigue igual para «Validar entradas».
- **Se reutilizan las piezas existentes:** las mismas capas del personaje, las animaciones `airi-m-aleteo`,
  `airi-m-antena` y `airi-m-brillo` (solo más lentas), la señal `.airi-m-senal` que ya mostraba «?» y «!» (ahora con
  tres puntos) y la regla global `.airi-m-reducido`. La única animación nueva es `airi-m-pensar`, para los puntos.
- **Es discreta:** todas las animaciones activas duran 1,4 s o más, el nado va a 12 px/s frente a los 45 px/s de
  `espera` y no hay anillos de escaneo. Los colores son los de la identidad visual (aqua `#80EAF2` y azul océano
  `#0982C7`).
- **El chat solo cambia una línea:** `esperaMascota()` usa `pensando` en lugar de `analisis` y, al terminar, solo
  devuelve la mascota a `espera` si sigue pensando, para no pisar otro estado.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `interfaz/mascota/mascota.js` | Estado `pensando` en `ESTADOS` y `VELOCIDAD` (12); la señal muestra tres puntos en ese estado |
| `interfaz/mascota/mascota.css` | Bloque «v0.6 E4 · Estado pensando» (al final, sin tocar las reglas anteriores) |
| `interfaz/chat/chat.js` | `esperaMascota()` usa `pensando` |
| `interfaz/mascota/pruebas/pensando.test.js` | 3 pruebas unitarias nuevas |
| `interfaz/chat/pruebas/e2e_pensando.py` | 17 comprobaciones nuevas en Chrome |
| `interfaz/chat/pruebas/e2e_chat.py` | 2 comprobaciones actualizadas: la espera ahora se marca con `pensando` en lugar de `analisis` |
| `interfaz/mascota/README.md`, `chat/README.md`, `documentacion/PLAN_VOZ_v0.6.md` | Documentación |

No se tocó el motor científico v0.4, sus umbrales ni el grafo, ni el servidor, ni `voz.js`/`voz-chat.js`.

## Pruebas

```bash
node --test interfaz/mascota/pruebas/pensando.test.js      # 3 pruebas unitarias
python interfaz/chat/pruebas/e2e_pensando.py               # 17 comprobaciones en Chrome (Gemini y voz simulados)
```

`e2e_pensando.py` comprueba:
- el estado `pensando` y la burbuja con tres puntos;
- que todas las animaciones duran ≥ 1,4 s y no hay escaneo;
- que pensar no habla ni cambia el globo;
- el paso a reposo con la lectura desactivada, y el paso a hablar con Sabina y luego a reposo con la lectura activada;
- una pregunta nueva mientras habla, un error 429 y «Nueva conversación» durante la espera;
- que el análisis del agua conserva `analisis`;
- el movimiento reducido y el celular (390 px);
- la ausencia de errores de JavaScript y que la clave no aparece en el registro.

Las capturas quedan en la carpeta temporal `airi-pensando`.

**Regresión completa (todo en verde):**

| Grupo | Resultado |
|---|---|
| Servidor | 29 |
| Motor (Python) | 52 |
| Pruebas `node --test` (markdown, habla, mascota, voz, personalidad, pensando, motor JS) | 63 |
| Chat | 35 |
| Voz del chat | 24 |
| Pensando | 17 |
| Mascota | 76 |
| Voz | 50 |
| Ajustes de voz | 43 |
| Análisis | 57 |
| Diagnóstico de voz | 17 |

## Prueba manual en el equipo

1. Actualiza la rama:
   ```powershell
   git pull
   ```
2. Arranca el servidor como en E2–E3:
   ```powershell
   python chat/servidor.py
   ```
   La clave se pide con entrada oculta.
3. Abre `http://127.0.0.1:8765/interfaz/prototipo/` y ve a la pestaña Chat.
4. Pregunta algo. Mientras llega la respuesta, la mascota flotante nada muy despacio y muestra la burbuja con tres
   puntos.
5. Con «Leer respuestas» desactivado, al llegar la respuesta vuelve a reposo. Con la lectura activada, habla con
   Sabina y después vuelve a reposo.
6. Opcional: activa «Reducir animaciones» en los ajustes de la mascota; los puntos deben quedar fijos.

## Limitaciones

- La duración del estado depende del tiempo de respuesta de Gemini; no hay indicador de progreso real, porque la API
  no lo ofrece en esta configuración.
- Los ojos y la boca no cambian, igual que en los demás estados, porque hacerlo requeriría redibujar el personaje.
- La validación visual se hizo en Chrome de escritorio y en la emulación de celular de Playwright; falta comprobarlo
  en un teléfono real (eso tiene sentido cuando exista el acceso público de v0.7).
- El indicador «Pensando…» del texto del chat (v0.5) se mantiene, así que hay dos señales: una en la conversación y
  otra en la mascota. Es intencionado, porque la mascota puede estar oculta o minimizada.
