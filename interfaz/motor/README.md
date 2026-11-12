# AIRI · Motor de análisis en la web (v0.4)

Versión JavaScript del motor de análisis y su integración en la sección **Parámetros del agua** del prototipo.
La implementación de **referencia** es la de Python (`motor/airi_motor`); esta es una traducción fiel que usa
**los mismos datos** y produce **el mismo informe** (comprobado, textos incluidos).

> AIRI compara las mediciones con referencias documentadas. **No diagnostica enfermedades, no garantiza
> condiciones seguras y no ejecuta acciones**: las decisiones sobre el acuario las toma una persona.

## Archivos

| Archivo | Función |
|---|---|
| `airi-motor-datos.js` | **Generado** desde `motor/airi_motor/datos/*.json` con `motor/herramientas/generar_datos_js.py` (incluye la huella SHA-256 de cada JSON). No se edita a mano. Se incrusta en un script porque con `file://` el navegador bloquea `fetch()` de archivos locales |
| `airi-motor.js` | Motor (unidades, reglas Q1–Q6, clasificación R1–R4, traza). Sin dependencias; funciona en el navegador y en Node |
| `analisis-prototipo.js` | Integración: guía de dos pasos, rótulo del paso 1 sobre la validación del prototipo, panel del paso 2 y mensaje breve de la mascota |
| `analisis.css` | Estilos de la guía, los dos pasos y el panel (prefijos `airi-a-` y `airi-paso`) |
| `herramientas/evaluar_lote.js` | Evalúa un lote en Node; lo usa la prueba de paridad de Python |
| `pruebas/motor.test.js` | 5 pruebas Node: 34 casos de conformidad, datos compartidos, formato numérico, lectura de números, mensajes |
| `pruebas/e2e_analisis.py` | 57 comprobaciones en Chrome (escritorio y celular) |

Orden de carga en `interfaz/prototipo/index.html`: después de `mascota.js`, `voz.js`, `ayuda.js` y `ajustes-voz.js`,
y antes de `interaccion.js` e `integracion-prototipo.js`.

## Qué ve la persona

**Antes de validar**, una guía con dos tarjetas explica los dos pasos.

**Tras «Validar entradas»**, el resultado aparece en dos bloques numerados y con estilos distintos:

| Paso | Estilo | Qué responde | Qué NO responde |
|---|---|---|---|
| **1 · Validación de formato** (del prototipo, sin cambios en su lógica) | gris neutro; «formato válido» ya no usa verde | ¿El dato existe y es un número válido? | Si el valor es adecuado para el acuario |
| **2 · Evaluación con referencias científicas** (motor) | borde azul | ¿El valor está dentro de una referencia documentada (MSD, UF/IFAS)? | Diagnósticos ni garantías; temperatura, salinidad y nitratos no se evalúan |

El paso 2 contiene: perfil, resultado R1–R4 explicado, valores que conviene revisar (por severidad, con motivo,
sugerencia informativa y fuentes enlazadas), datos que faltan o no se pueden evaluar, detalle por parámetro
(valor capturado, equivalencia canónica, explicación, notas, contexto científico plegable rotulado «no se usa para
evaluar», recorrido por el grafo), decisión global y aviso de límites.

**La mascota** da un mensaje **breve** (se lee en voz alta y cabe en el globo del celular); la explicación completa
queda en el paso 2:

| Informe | Estado y voz | Ejemplo real (R4: pH 8.4, amoníaco 0.8, nitritos 0.1, sin salinidad) |
|---|---|---|
| Hay anomalías (R2/R4) | `alerta`, señal «!», etiqueta «Advertencia informativa»; matiz de voz serio (tono y velocidad algo menores) | «Conviene revisar 3 valores: Amoníaco total, pH y Nitritos. Además, falta el dato de Salinidad; Temperatura y Nitratos no se evalúan por falta de referencia. Repite esas mediciones y consulta el detalle en el análisis. No es un diagnóstico.» (39 palabras; en E4 eran 75) |
| Valores inválidos sin anomalías | `error`, señal «!» | «Hay valores inválidos en Temperatura y Nitratos. Revisa esos campos. También falta el dato de Amoníaco total. El detalle está en el análisis.» |
| Faltan datos (R3) | `insuficiente`, señal «?», matiz tranquilo | «Información insuficiente: faltan los datos de … Esto no es una alerta del acuario.» |
| Todo válido (R3 por falta de referencias) | `insuficiente`, matiz tranquilo | «pH, Amoníaco total y Nitritos están dentro de la referencia. Temperatura, Salinidad y Nitratos no se evalúan por falta de referencia. Esto no garantiza que el agua sea adecuada.» |

No se usan «peligro», «urgente», «emergencia» ni similares (lo comprueban las pruebas). La pausa de «análisis» sigue
marcada como animación demostrativa.

**Asistente flotante (E5):** el globo tiene un botón «×» para cerrar el mensaje; tocar a AIRI lo vuelve a abrir. En
celular el globo ocupa como máximo el 38 % de la altura de la pantalla (con desplazamiento interno) y sigue
contrayéndose al desplazarse, al usar el formulario o pasados 6 s (comportamiento previo, sin cambios).

## Cambios en archivos existentes

| Archivo | Cambio | Motivo |
|---|---|---|
| `interfaz/prototipo/index.html` | + 1 hoja de estilos y 3 scripts. Título «Validación de formato». La línea de un dato válido ya no dice «SIN REFERENCIA BIOLÓGICA VERIFICADA»; la nota inferior explica que el análisis solo evalúa parámetros con referencia | Esa frase contradecía el análisis de pH, amoníaco y nitritos. La lógica de validación no cambia |
| `interfaz/mascota/integracion-prototipo.js` | Usa el mensaje del motor si está disponible | Conectar el informe real con la mascota y la voz |
| `interfaz/mascota/mascota.js`, `mascota.css` (E5) | Botón «×» del globo flotante y altura máxima del globo en celular | Que el asistente no dificulte la lectura en celular |
| `interfaz/mascota/pruebas/e2e_mascota.py`, `e2e_voz.py` | Comprobaciones ajustadas al comportamiento v0.4 | Ver `interfaz/mascota/README.md` |

Sin motor (por ejemplo, si un script no carga), la guía, los pasos y el panel no aparecen y la página, la mascota y
la ayuda funcionan exactamente como en v0.3 (comprobado).

## Diferencias deliberadas con la validación de formato del prototipo

El motor aplica además **límites de captura** (p. ej. temperatura de −2 a 100 °C): 150 °C tiene «formato válido» en
el paso 1, pero el paso 2 lo marca como inválido. Es una comprobación de captura, no un rango biológico.

## Pruebas

```bash
node --test interfaz/motor/pruebas/motor.test.js     # 5 pruebas (incluye los 34 casos de conformidad)
python interfaz/motor/pruebas/e2e_analisis.py         # 57 comprobaciones en Chrome
cd motor && python -m unittest discover -s pruebas    # 52 pruebas; test_paridad_js compara Python y JS
```

Resultados y errores encontrados en cada etapa: [`motor/PRUEBAS_v0.4.md`](../../motor/PRUEBAS_v0.4.md).

## Limitaciones

- Probado en Chrome automatizado (escritorio de 1366×900 y celular emulado de 390×844 con pantalla táctil). No se
  probó en un teléfono físico ni en Safari o Firefox.
- La voz se midió con un simulador (tono, velocidad y texto) y se ejecutó con la síntesis real de Chrome solo para
  descartar errores; en ese entorno no hay voces instaladas, así que no se escuchó.
- `airi-motor-datos.js` debe regenerarse cada vez que cambien los JSON; una prueba lo exige.
