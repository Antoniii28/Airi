# AIRI v0.4 · Pruebas, errores encontrados y limitaciones

Registro de la verificación del motor de análisis (E1–E5) en la rama `feature/motor-analisis-airi-v0.4`.
Todos los resultados son de ejecuciones reales del 12-11-2026 (Python 3.13, Node 22, Chrome con Playwright).

## Cómo ejecutar todo

Desde la raíz del repositorio:

```bash
(cd motor && python -m unittest discover -s pruebas)        # motor Python + paridad con JavaScript
python motor/herramientas/generar_casos.py --check          # casos de conformidad al día
python motor/herramientas/generar_datos_js.py --check       # datos web generados de los mismos JSON
node --test interfaz/motor/pruebas/motor.test.js            # motor JavaScript
node --test interfaz/mascota/pruebas/mascota.test.js
node --test interfaz/mascota/pruebas/voz.test.js
node --test interfaz/mascota/pruebas/voz_personalidad.test.js
python interfaz/mascota/pruebas/e2e_mascota.py              # Chrome: mascota (escritorio y celular)
python interfaz/mascota/pruebas/e2e_voz.py                  # Chrome: voz y menú
python interfaz/mascota/pruebas/e2e_ajustes_voz.py          # Chrome: ajustes de voz
python interfaz/motor/pruebas/e2e_analisis.py               # Chrome: motor + mascota + voz (escritorio y celular)
```

## Resultados por etapa

| Suite | E2 | E3 | E4 | **E5 (final)** |
|---|---|---|---|---|
| Motor Python (`motor/pruebas`) | 39 | 47 | 51 | **52/52** |
| · de ellas, barrido exhaustivo 7⁶ = 117 649 combinaciones (perfil real y de prueba) | — | ✓ | ✓ | ✓ |
| · de ellas, paridad Python ↔ JS (informe completo en 34 casos + 5 500 entradas aleatorias) | — | — | ✓ | ✓ |
| Casos de conformidad (`casos_conformidad.json`) | — | 34 | 34 | **34, al día** |
| Datos web generados (`airi-motor-datos.js`) | — | — | al día | **al día** |
| Motor JavaScript (Node) | — | — | 5/5 | **5/5** |
| Mascota (Node) | 12/12 | 12/12 | 12/12 | **12/12** |
| Voz y ayuda (Node) | 16/16 | 16/16 | 16/16 | **16/16** |
| Personalidad de voz (Node) | 11/11 | 11/11 | 11/11 | **11/11** |
| e2e mascota (Chrome) | 76/76 | 76/76 | 76/76 | **76/76** |
| e2e voz (Chrome) | 50/50 | 50/50 | 50/50 | **50/50** |
| e2e ajustes de voz (Chrome) | 43/43 | 43/43 | 43/43 | **43/43** |
| e2e análisis (Chrome, escritorio y celular) | — | — | 45/45 | **57/57** |

### Qué cubre la prueba de integración `e2e_analisis.py` (57 comprobaciones)

- **Carga:** el motor JavaScript se carga y los 34 casos se reproducen **dentro del navegador**.
- **Dos pasos (E5):** guía previa; resultado numerado 1 (formato) y 2 (referencias); el paso 1 aclara que no juzga el
  valor y ya no usa verde.
- **Validación de formato del prototipo:** se conserva, y el paso 2 añade los límites de captura.
- **Panel:** R3 y R4, alertas ordenadas por severidad con texto (no solo color), solicitudes de datos conservadas en
  R4, fuentes enlazadas en pestaña nueva segura, valor capturado más su equivalencia, explicación del intervalo del
  amoníaco.
- **Mascota:** estados `insuficiente`, `alerta` y `error` según el informe; mensaje R4 con anomalías y datos
  insuficientes a la vez; **mensaje breve (39 palabras)** y explicación completa en el panel; sin palabras alarmistas.
- **Voz (simulada):** matiz tranquilo en R3 y serio en alerta (tono 1.07 y velocidad 0.97 con la configuración
  predeterminada); no lee la pausa demostrativa.
- **Botón «×» (E5):** cierra el mensaje, el foco pasa a AIRI, y tocar a AIRI lo reabre (escritorio y celular).
- **Celular 390×844 táctil:**
  - el globo ocupa como máximo el 38 % de la altura (medido: 195 de 844 px);
  - el «×» mide 36×36 px;
  - no hay desplazamiento horizontal;
  - el asistente y las tarjetas caben en la pantalla;
  - al desplazarse, el globo se contrae.
- **Accesibilidad:** región `aria-live`, encabezados, contexto científico plegable con teclado y rotulado «no se usa
  para evaluar».
- **Movimiento reducido:** la alerta aparece sin pausa.
- **Respaldo:** si el motor no carga, todo funciona como en v0.3, sin una alerta inventada.
- **Voz real de Chrome:** sin errores.
- **Sin errores de JavaScript ni peticiones a servicios externos.**
- Fichas de especies y ayuda: sin regresiones.

## Errores encontrados y cómo se resolvieron

| Etapa | Error | Tipo | Resolución |
|---|---|---|---|
| E2 | Un caso R4 de prueba no contaba que también faltaban los nitratos | Expectativa de la prueba | Prueba corregida |
| E2 | Se esperaba que 212 °F fuera inválido, pero equivale a 100 °C, dentro del límite inclusivo | Expectativa de la prueba | Prueba corregida (213 °F) |
| E2 | Se confirmó `__pycache__` en un commit no publicado | Repositorio | Eliminado y `motor/.gitignore` añadido antes de subir |
| E3 | Recuentos de pruebas por suite equivocados en el README | Documentación | Corregidos |
| E4 | `\d` de Python aceptaba dígitos no ASCII; JavaScript no | Inconsistencia del motor | Solo `[0-9]` en ambos |
| E4 | Comentario de Q4 contrario al código | Documentación del código | Corregido |
| E4 | «None» en el mensaje de unidad ausente | Texto del motor | Mensaje propio |
| E4 | Caso `salinidad_ppm` que probaba g/kg | Nombre de caso | `salinidad_g_kg` |
| E4 | Intervalo del amoníaco sin explicación | Texto del motor | Nota explicativa |
| E4 | Valores esperados de `fmtG` escritos a mano mal (8.125 ya tiene 4 cifras) | Expectativa de la prueba | Valores obtenidos del propio Python |
| E4 | «SIN REFERENCIA BIOLÓGICA VERIFICADA» contradecía el análisis del pH | Texto del prototipo | Texto ajustado; lógica intacta |
| E4 | 9 comprobaciones e2e previas describían el comportamiento sin motor (la regresión copiaba la página sin `interfaz/motor`; datos de ejemplo ahora detectables → alerta; frases de ayuda retiradas) | Pruebas desactualizadas | Ajustadas con comentario «v0.4» |
| E5 | Mayúscula automática convertía «pH» en «PH» al inicio del mensaje | Error de la integración | Eliminada la conversión |
| E5 | Con amoníaco 0 de base desconocida aparecían una nota de intervalo y otra de «conversión por masas molares» que no correspondían | Texto del motor (Python y JS) | Cada nota solo cuando corresponde; prueba añadida |
| E5 | `tap` de Playwright sobre el avatar animado agotaba el tiempo de espera | Prueba | `force=True`, como en las suites existentes |
| E5 | Comprobaciones que esperaban los mensajes largos de E4 | Pruebas desactualizadas | Ajustadas al mensaje breve |

Ningún cambio modificó umbrales científicos, reglas del grafo ni criterios de clasificación: los 34 vectores de
conformidad no cambiaron de estado ni de clasificación en E4 ni en E5.

## Limitaciones pendientes

1. **Referencias:** temperatura, salinidad y nitratos siguen **sin referencia para evaluación** (decisión del equipo).
   Por eso, con mediciones completas, el resultado nunca es R1 ni R2.
2. **Perfil único:** referencia veterinaria general de peces marinos (MSD); no es específica de corales,
   invertebrados ni especies.
3. **Dispositivos:** solo Chrome automatizado (escritorio 1366×900 y celular emulado 390×844). Falta probar en un
   teléfono físico y en Safari o Firefox; requeriría publicar en GitHub Pages (no autorizado) o abrir el archivo en el
   teléfono.
4. **Voz:** tono y velocidad medidos con simulador; la síntesis real solo se ejecutó para descartar errores (no hay
   voces instaladas en el entorno de prueba). En el equipo del usuario hay solo voces es-ES; el efecto audible del
   matiz serio no se ha confirmado de oído.
5. **Diferencia de validación:** el paso 2 aplica límites de captura que el paso 1 no aplica (p. ej. 150 °C).
   Está rotulado, pero son dos validaciones distintas.
6. **Sin historial:** no hay historial ni tendencias; cada evaluación es independiente.
7. **Sin conversiones de salinidad o NH₃:** no convierte densidad relativa a salinidad ni calcula NH₃ no ionizado.
8. **Pie del prototipo:** sigue diciendo «AIRI v0.1 · Prototipo de interfaz» (no se modificó).
