# AIRI · Motor de análisis en la web (v0.4)

Versión JavaScript del motor de análisis y su integración en la sección **Parámetros del agua** del prototipo.
La implementación de **referencia** es la de Python (`motor/airi_motor`); esta es una traducción fiel que usa
**los mismos datos** y debe producir **el mismo informe**.

> AIRI compara las mediciones con referencias documentadas. **No diagnostica enfermedades, no garantiza
> condiciones seguras y no ejecuta acciones**: las decisiones sobre el acuario las toma una persona.

## Archivos

| Archivo | Función |
|---|---|
| `airi-motor-datos.js` | **Generado** desde `motor/airi_motor/datos/*.json` con `motor/herramientas/generar_datos_js.py` (incluye la huella SHA-256 de cada JSON). No se edita a mano. Se incrusta en un script porque con `file://` el navegador bloquea `fetch()` de archivos locales |
| `airi-motor.js` | Motor (unidades, reglas Q1–Q6, clasificación R1–R4, traza). Sin dependencias; funciona en el navegador y en Node |
| `analisis-prototipo.js` | Integración: añade el panel de análisis debajo de la validación de formato y prepara el mensaje de la mascota |
| `analisis.css` | Estilos del panel (prefijo `airi-a-`, sin estilos globales) |
| `herramientas/evaluar_lote.js` | Evalúa un lote en Node; lo usa la prueba de paridad de Python |
| `pruebas/motor.test.js` | Pruebas Node: 34 casos de conformidad, datos compartidos, formato numérico, lectura de números, mensajes |
| `pruebas/e2e_analisis.py` | 45 comprobaciones en Chrome (escritorio y celular) |

Orden de carga en `interfaz/prototipo/index.html`: después de `mascota.js`, `voz.js`, `ayuda.js` y `ajustes-voz.js`,
y antes de `interaccion.js` e `integracion-prototipo.js`.

## Qué ve la persona

1. **Validación de formato** del prototipo, sin cambios en su lógica (se ajustaron dos textos: ver abajo).
2. **Análisis con referencias documentadas**: perfil usado, resultado (R1–R4) con su explicación, valores que
   conviene revisar (ordenados por severidad, con sugerencia informativa y fuentes enlazadas), datos que faltan o
   no se pueden evaluar, detalle por parámetro (valor capturado, equivalencia canónica, explicación, notas,
   contexto científico plegable rotulado «no se usa para evaluar», recorrido por el grafo) y el aviso de límites.
3. **Mascota AIRI**:

| Informe | Estado | Voz | Contenido del mensaje |
|---|---|---|---|
| Hay anomalías (R2/R4) | `alerta`, señal «!», etiqueta «Advertencia informativa» | matiz serio de «alerta» (tono y velocidad algo menores) | Qué valores conviene revisar y por qué, sugerencia de repetir la medición, **y además** (R4) qué falta, qué es inválido y qué no se evalúa. Termina con «No es un diagnóstico». |
| Valores inválidos sin anomalías | `error` | matiz «error» | Campos inválidos y faltantes, lo que sí está dentro de la referencia y lo que no se evalúa |
| Faltan datos o referencias (R3) | `insuficiente`, señal «?» | matiz tranquilo | Qué falta, qué está dentro de la referencia y qué no se evalúa. Termina con «Esto no garantiza que el agua sea adecuada». |

Las palabras se eligieron para ser serias sin alarmar: no se usan «peligro», «urgente», «emergencia» ni similares
(lo comprueban las pruebas). La pausa de «análisis» sigue marcada como animación demostrativa.

## Cambios en archivos existentes

| Archivo | Cambio | Motivo |
|---|---|---|
| `interfaz/prototipo/index.html` | + 1 hoja de estilos y 3 scripts. Título «Validación de formato». La línea de un dato válido ya no dice «SIN REFERENCIA BIOLÓGICA VERIFICADA», y la nota inferior explica que el análisis solo evalúa parámetros con referencia | Esa frase contradecía el análisis de pH, amoníaco y nitritos. La lógica de validación no cambia |
| `interfaz/mascota/integracion-prototipo.js` | Usa el mensaje del motor si está disponible | Conectar el informe real con la mascota y la voz |
| `interfaz/mascota/pruebas/e2e_mascota.py`, `e2e_voz.py` | Comprobaciones ajustadas al comportamiento v0.4 | Ver `interfaz/mascota/README.md` |

## Diferencias deliberadas con la validación de formato del prototipo

El prototipo y el motor validan por separado y ambas validaciones se muestran. El motor es más estricto en un caso:
aplica **límites de captura** (p. ej. temperatura de −2 a 100 °C), así que 150 °C tiene «formato válido» en el
prototipo, pero el motor lo marca como inválido. Es una comprobación adicional, no un rango biológico.

## Pruebas

```bash
node --test interfaz/motor/pruebas/motor.test.js     # 5 pruebas (incluye los 34 casos de conformidad)
python interfaz/motor/pruebas/e2e_analisis.py         # 45 comprobaciones en Chrome
cd motor && python -m unittest discover -s pruebas    # 51 pruebas; test_paridad_js compara Python y JS
```

## Limitaciones

- Las pruebas usan Chrome sin interfaz (escritorio de 1366×900 y celular emulado de 390×844 con pantalla táctil).
  No se probó en un teléfono físico ni en Safari o Firefox.
- La voz se midió con un simulador (tono, velocidad y texto) y se ejecutó con la síntesis real de Chrome para descartar
  errores; en ese entorno no hay voces instaladas, así que no se escuchó el resultado.
- Los mensajes largos (R4) ocupan buena parte del globo en el celular; el globo se contrae al desplazarse o al
  usar el formulario (comportamiento de la mascota, sin cambios).
- `airi-motor-datos.js` debe regenerarse cada vez que cambien los JSON; una prueba lo exige.
