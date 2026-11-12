# AIRI · Motor de análisis de parámetros del agua (v0.4)

Motor en Python (solo biblioteca estándar, Python ≥ 3.10) que aplica el **grafo de decisiones oficial**
(`grafo/grafo_decisiones_airi.dot`) a seis mediciones: temperatura, pH, salinidad, amoníaco, nitritos y nitratos.

> AIRI compara las mediciones con referencias documentadas. **No diagnostica enfermedades, no garantiza
> condiciones seguras y no ejecuta acciones**: las decisiones sobre el acuario las toma una persona.

Las fuentes, los niveles de evidencia, las conversiones y las decisiones pendientes están en
[`REFERENCIAS.md`](REFERENCIAS.md). Este documento explica el uso, la arquitectura y las pruebas.

## Uso

```bash
cd motor
python -m airi_motor evaluar ejemplos/mediciones_prototipo.json        # informe legible
python -m airi_motor evaluar ejemplos/mediciones_prototipo.json --json # informe completo, con traza
python -m airi_motor perfiles                                          # perfiles y estado de cada referencia
python -m airi_motor fuentes                                           # fuentes documentadas (nivel A/B)
```

Formato de entrada (las unidades del prototipo se reconocen tal cual):

```json
{
  "ph":       {"valor": "8,1", "unidad": "pH"},
  "amoniaco": {"valor": "0.2", "unidad": "mg/L TAN-N", "metodo": "salicilato"}
}
```

Desde Python:

```python
from airi_motor import evaluar
informe = evaluar({"ph": {"valor": "8.4", "unidad": "pH"}})
informe["clasificacion"]   # "R4": anomalía (pH) + datos faltantes
```

La CLI solo lee el archivo indicado: no escribe archivos, no usa red ni dispositivos. Código de salida 2 ante
archivo inexistente, JSON inválido o perfil desconocido.

## Arquitectura

| Archivo | Función |
|---|---|
| `airi_motor/datos/fuentes.json` | Fuentes con nivel de evidencia (A = puede evaluar, B = solo contexto) |
| `airi_motor/datos/referencias.json` | Unidades canónicas, límites de captura y perfil `peces_marinos_msd` |
| `airi_motor/unidades.py` | Lectura numérica (admite coma decimal), reconocimiento de unidades y conversiones por masa molar |
| `airi_motor/datos.py` | Carga y validación de coherencia de los JSON |
| `airi_motor/reglas.py` | Q1–Q6 por parámetro → EP1–EP5 y severidad |
| `airi_motor/motor.py` | C1/Q7 → R1–R4, salidas O1/O2, traza, alertas, sugerencias y solicitudes |
| `airi_motor/cli.py` | Línea de comandos |
| `herramientas/generar_casos.py` | Genera `casos_conformidad.json` |
| `casos_conformidad.json` | 34 vectores que toda implementación (Python o la futura JS) debe reproducir |

Los datos de referencia viven **solo** en los JSON. La futura versión web en JavaScript (aprobada) deberá
generar sus datos a partir de estos mismos archivos y superar `casos_conformidad.json`.

## Correspondencia con el grafo

| Nodo | Implementación |
|---|---|
| Q1 ¿presente? | valor vacío o ausente → **EP1 FALTANTE** |
| Q2 ¿número? | no numérico, `nan`, `inf` → **EP2 INVÁLIDO** |
| Q3 ¿unidad? | unidad no reconocida o sin forma química (p. ej. `mg/L` a secas en nitratos) → **EP2** |
| Q4 ¿plausible? | fuera de los límites de captura (p. ej. negativos, pH > 14) → **EP2** |
| Q5 ¿referencia con fuente? | referencia `pendiente` o `sin_referencia` → **EP3 SIN REFERENCIA** |
| Q6 ¿dentro? | sí → **EP4 EN RANGO**; no → **EP5 ANOMALÍA** con severidad |
| C1 | A = algún EP5; I = algún EP1/EP2/EP3 |
| Q7 | R1 (F,F) · R2 (V,F) · R3 (F,V) · R4 (V,V); R4 conserva alertas **y** solicitudes |
| O1 / O2 | explicar anomalías / pedir datos |

Cada informe incluye `traza`: la lista de aristas recorridas. Las pruebas verifican que cada arista y su
etiqueta existen en el `.dot` oficial.

## Reglas del perfil `peces_marinos_msd`

| Parámetro | Estado | Comportamiento |
|---|---|---|
| pH | verificada | 7.8–8.3 en rango; (8.3, 8.5] revisión recomendada (tabla y texto del MSD discrepan); resto fuera de referencia |
| Amoníaco | verificada | 0 en rango; > 0 y < 0.5 mg/L TAN-N presencia detectable; ≥ 0.5 alerta alta. Base química desconocida → intervalo [×0.7765, ×1]; si el intervalo cruza 0.5 → revisión recomendada. Método Nessler → revisión recomendada. **No se calcula NH₃ no ionizado** |
| Nitritos | verificada | 0 en rango; > 0 presencia detectable (sin umbral de severidad documentado) |
| Nitratos | **pendiente** | la forma química del valor de 70 mg/L no está confirmada → EP3, nunca alerta |
| Temperatura | **sin referencia** | EP3 con datos científicos de contexto (nivel B), que no se usan como límites |
| Salinidad | **sin referencia** | igual que temperatura |

Severidades (orden de las alertas): alerta alta › fuera de referencia › revisión recomendada › presencia detectable.

Consecuencia deliberada: con las referencias actuales, un juego de mediciones completo **nunca llega a R1 ni a R2**,
porque temperatura, salinidad y nitratos siempre quedan sin referencia. AIRI lo dice explícitamente en lugar de
afirmar que todo está bien.

## Pruebas

```bash
cd motor
python -m unittest discover -s pruebas -v
python herramientas/generar_casos.py --check
```

| Suite | Pruebas | Qué cubre |
|---|---|---|
| `test_unidades.py` | 6 | factores molares, lectura numérica, unidades del prototipo, unidades rechazadas, conversiones |
| `test_reglas.py` | 22 | Q1–Q4, límites inclusivos de pH, umbral de amoníaco con cada base, Nessler, nitritos, nitratos pendientes, contexto solo nivel B, coherencia de datos |
| `test_motor.py` | 11 | aristas de la traza ⊂ grafo (30 aristas), R1–R4, R4 sin pérdida de información, orden de alertas, ausencia de frases de seguridad o diagnóstico, determinismo |
| `test_cli_y_conformidad.py` | 8 | CLI, archivo de conformidad al día, 34 vectores reproducidos, **barrido exhaustivo 7⁶ = 117 649 combinaciones** con el perfil real y con el de prueba |
| `test_paridad_js.py` (v0.4 E4) | 4 | Informe **completo** idéntico en Python y JavaScript (textos incluidos) en los 34 casos y en 5 500 entradas aleatorias con semilla fija; `airi-motor-datos.js` generado de los mismos JSON |

Resultado de la última ejecución (12-11-2026, E4): **51 pruebas, 0 fallos** (≈ 16 s). En E3 eran 47.
Durante el desarrollo fallaron 2 pruebas por expectativas mal escritas (no por el motor): un caso R4 olvidaba que
también faltaban nitratos, y 212 °F = 100 °C está dentro del límite de captura inclusivo. Se corrigieron las pruebas.

El perfil «de prueba» usado para alcanzar R1/R2 tiene valores **ficticios** y existe solo en las pruebas y en
`casos_conformidad.json`; no es una referencia biológica.

## Revisión previa a la integración web (E4)

Antes de integrar se volvieron a ejecutar las 47 pruebas, los 34 casos y se repasaron las reglas frente al grafo.
Todo pasaba, pero al preparar la traducción a JavaScript aparecieron estas inconsistencias, ya corregidas.
**Ninguna cambia un criterio científico, un umbral ni un resultado R1–R4** (los 34 vectores no cambiaron de estado):

| # | Inconsistencia | Corrección |
|---|---|---|
| 1 | `leer_numero` usaba `\d`, que en Python acepta dígitos de otros sistemas (p. ej. «٣»); en JavaScript no | Solo dígitos ASCII `[0-9]`; prueba añadida |
| 2 | El comentario de Q4 decía «antes de convertir», pero los límites se aplican (correctamente) tras convertir a la unidad canónica | Comentario corregido |
| 3 | Con unidad ausente, el mensaje mostraba «None» | «No se indicó la unidad…»; el mensaje de límites de captura incluye la unidad capturada |
| 4 | El caso `salinidad_ppm` probaba en realidad «g/kg» | Renombrado `salinidad_g_kg` |
| 5 | Con amoníaco de base química desconocida y valor ≥ 0.5 en todo el intervalo, el informe mostraba un intervalo sin explicar por qué | Nota: «La unidad no indica si el valor es como N, como NH3 o como NH4+…» |

## Limitaciones

- Una sola referencia general de peces marinos; no es específica de corales, invertebrados ni especies.
- Temperatura, salinidad y nitratos no se evalúan hasta que el equipo apruebe referencias verificables.
- No se convierte densidad relativa a salinidad (depende de la temperatura y del instrumento).
- No se calcula la fracción tóxica NH₃ (requiere pH, temperatura, salinidad y un método validado).
- No hay historial ni tendencias: cada evaluación es independiente.
- Las sugerencias son informativas («repite la medición…»); el motor no actúa sobre ningún equipo.
- Desde E4 la interfaz web usa la versión JavaScript (`interfaz/motor`), con paridad comprobada; ver `interfaz/motor/README.md`.
