# AIRI v0.4.1 · Revisión del motor de agua (José, rama `equipo/jose-motor-agente`)

Revisión pedida en [`documentacion/equipo/JOSE.md`](../documentacion/equipo/JOSE.md): inventario de reglas, rutas de
decisión, correcciones con evidencia, pruebas de trazabilidad y contrato de salida. Fecha: 15-11-2026.

**Resumen:** no se cambió ningún umbral, referencia, fuente, regla Q5/Q6 ni criterio de clasificación. Los 34 vectores
de conformidad de v0.4.0 dan **exactamente el mismo resultado**. Se corrigieron tres fallos con evidencia
reproducible (§3) y se añadieron 23 pruebas Python, 5 de Node y 9 vectores de conformidad.

## 1. Inventario de reglas (perfil `peces_marinos_msd`)

| Parámetro | Unidad canónica | Estado de la referencia | Regla aplicada (Q6) | Fuentes (nivel) | Límites de captura (Q4) |
|---|---|---|---|---|---|
| pH | pH | verificada | 7.8–8.3 EN RANGO; (8.3, 8.5] revisión recomendada; resto fuera de referencia | MSD tabla y capítulo (A) | 0–14 |
| Amoníaco total | mg/L TAN-N | verificada | 0 EN RANGO; > 0 y < 0.5 presencia detectable; ≥ 0.5 alerta alta; intervalo que cruza 0.5 o Nessler → revisión recomendada | MSD tabla, resumen de pruebas; UF/IFAS FA031 (A) | ≥ 0 |
| Nitritos | mg/L NO2-N | verificada | 0 EN RANGO; > 0 presencia detectable (sin umbral de severidad documentado) | MSD tabla (A) | ≥ 0 |
| Nitratos | mg/L NO3-N | **pendiente** | No se evalúa (EP3): forma química del < 70 mg/L sin confirmar | MSD (A), pendiente | ≥ 0 |
| Temperatura | °C | **sin referencia** | No se evalúa (EP3); contexto NOAA, FishBase, RLS (B) | — | −2 a 100 °C |
| Salinidad | ppt | **sin referencia** | No se evalúa (EP3); contexto UF/IFAS, NOAA (B) | — | ≥ 0 |

Detalle, citas y conversiones: [`REFERENCIAS.md`](REFERENCIAS.md). Datos: `airi_motor/datos/*.json` (única fuente de
verdad; la web usa una copia generada y comprobada).

## 2. Rutas de decisión revisadas

| Ruta | Comportamiento comprobado | Pruebas |
|---|---|---|
| Medición faltante (Q1 F) | EP1, solicitud «faltante», I = V | `test_reglas`, `test_trazabilidad` |
| Medición inválida: texto, no finito, unidad no admitida, fuera de captura (Q2–Q4 F) | EP2, solicitud «invalido», sin fuentes ni valor canónico | `test_reglas`, `test_validacion_entrada`, `test_trazabilidad` |
| **Entrada mal formada** (no objeto, lista, booleano, unidad no textual) | EP2 en Q2/Q3; nunca error ni EN RANGO (**corregido en v0.4.1**) | `test_validacion_entrada`, `motor.test.js`, 9 vectores |
| Sin referencia / pendiente (Q5 F) | EP3 con el motivo del JSON; contexto solo de nivel B; nunca alerta | `test_reglas`, `test_trazabilidad` |
| Anomalía simple (Q6 F) | EP5 con severidad, fuentes de nivel A y recomendación | `test_reglas`, `test_trazabilidad` |
| Anomalías múltiples | Todas en `alertas`, ordenadas por severidad (empate estable), 1 recomendación por alerta | `test_motor`, `test_trazabilidad` |
| Alertas + información insuficiente | R4 con O1 y O2: no se pierde ni la alerta ni la solicitud | `test_motor`, `test_trazabilidad`, barrido 7⁶ |
| Incertidumbre (amoníaco sin base química) | Intervalo [×0.7765, ×1]; severidad decidida por los dos extremos | `test_reglas`, `test_trazabilidad` |
| Perfil real con datos completos | Nunca R1 ni R2 (temperatura, salinidad y nitratos en EP3) | `test_motor`, barrido 7⁶, `test_trazabilidad` |

**Trazabilidad por resultado** (`test_trazabilidad.py`, sobre 43 vectores y 4 000 entradas aleatorias): la regla aplicada se
reconstruye de la `traza` (E0 → Q1 → … → última decisión → estado → C1, todas aristas del grafo oficial); cada
resultado tiene `motivo`; EP4/EP5 citan exactamente las fuentes de nivel A de su referencia; EP3 repite el motivo del
JSON; EP1/EP2 no citan fuentes; `alertas`, `recomendaciones` y `solicitudes` corresponden 1:1 con los estados.

## 3. Fallos encontrados y corregidos (con evidencia)

| # | Fallo | Evidencia (antes) | Corrección |
|---|---|---|---|
| 1 | La huella SHA-256 de `airi-motor-datos.js` dependía de los saltos de línea. El commit `35662f9` la «sincronizó» con la copia CRLF de Windows (`core.autocrlf=true`) sin que los JSON cambiaran, así que la comprobación habría fallado en cualquier copia con LF (Linux, macOS, CI) | `git show HEAD:…/referencias.json \| sha256sum` = `7ca5c69e…` ≠ `8d192017…` escrito en el archivo | El generador calcula la huella con LF; el archivo vuelve a ser idéntico al de `main` |
| 2 | **JavaScript daba EN RANGO con datos mal formados**: `{"valor": [8.1]}` → EP4; `{"unidad": ["mg/L TAN-N"]}` aceptada; `[]` → FALTANTE | Sonda Python ↔ JS con 14 entradas atípicas | Solo número o texto como valor; solo texto como unidad; medición no objeto → EP2 |
| 3 | **Python se detenía con una excepción** con medición no objeto (`AttributeError`), `metodo` no textual, `mediciones` como lista o un entero de 400 cifras (`OverflowError`) | Misma sonda | EP2 con motivo; `mediciones` no objeto → `TypeError` explícito en ambos |
| 4 | Espacios Unicode tratados distinto: el BOM (U+FEFF) lo recortaba JS y no Python; U+001C–U+001F y U+0085, al revés. Con `metodo: "﻿Nessler"` daba **alerta alta en Python y revisión recomendada en JS** | Sonda con 9 espacios | Conjunto explícito `ESPACIOS` (unión de ambos), igual en los dos motores y comprobado por prueba |

Ninguna corrección afecta al formulario actual, que envía siempre textos.

## 4. Observaciones sin cambio (no hay evidencia suficiente o requieren acuerdo)

- `valor_canonico` se redondea a 6 decimales: un amoníaco de 1e-7 se ve como `0` aunque sea «presencia detectable».
  El `motivo` lleva el valor correcto. Documentado en el contrato; cambiarlo alteraría la conformidad.
- Decisiones pendientes del equipo, sin cambios: forma química del límite de nitratos; referencias de nivel A para
  temperatura y salinidad; pedir en el formulario la base química y el método del amoníaco (`REFERENCIAS.md` §9).
- La prueba e2e en Chrome (`interfaz/motor/pruebas/e2e_analisis.py`) se actualizó (lee la versión y el número de casos
  del archivo de conformidad), pero no se ejecutó: Playwright no está instalado en este equipo.

## 5. Contrato con la interfaz

[`CONTRATO_SALIDA.md`](CONTRATO_SALIDA.md): entrada admitida, campos del informe, significado, reglas de presentación y
ejemplo real. Sin campos nuevos ni renombrados respecto a v0.4.0. `test_contrato.py` falla si el informe y el documento
divergen, o si la interfaz lee un campo que no está en el contrato.

## 6. Verificación

```bash
python -m unittest discover -s motor/pruebas -v      # 75 pruebas
node --test interfaz/motor/pruebas/*.test.js         # 10 pruebas (43 vectores de conformidad)
python motor/herramientas/generar_casos.py --check
python motor/herramientas/generar_datos_js.py --check
```
