# AIRI · Contrato de salida del motor de agua (v0.4.1)

**Para:** Paola (interfaz y guía de usuario) y cualquier módulo que muestre resultados del motor.
**Responsable:** José (motor del agua). **Comprobado por:** `motor/pruebas/test_contrato.py` (Python) y la paridad
Python ↔ JavaScript (`test_paridad_js.py`). Si este documento y el código discrepan, falla la prueba.

> El motor compara mediciones con referencias documentadas. **No diagnostica, no garantiza condiciones seguras y no
> ejecuta acciones.** La interfaz muestra el informe; **no recalcula reglas, umbrales ni clasificaciones**.

## 1. Cómo obtener el informe

| Entorno | Llamada |
|---|---|
| Navegador | `window.AIRIMotor.evaluar(mediciones, perfil = null, origen = null)` (cargar antes `airi-motor-datos.js` y `airi-motor.js`) |
| Node | `require("interfaz/motor/airi-motor.js").evaluar(...)` |
| Python | `from airi_motor import evaluar` |

**Entrada** — un objeto `{parametro: {valor, unidad, metodo?}}` con los parámetros
`temperatura`, `ph`, `salinidad`, `amoniaco`, `nitritos`, `nitratos` (los que falten cuentan como faltantes).

| Campo | Tipo admitido | Si no cumple |
|---|---|---|
| medición | objeto, o `null`/ausente | objeto ausente → **EP1**; otro tipo (texto, número, lista…) → **EP2** en Q2 |
| `valor` | texto numérico (coma o punto decimal) o número finito | vacío/espacios → **EP1**; otro tipo o texto no numérico → **EP2** en Q2 |
| `unidad` | texto, o `null`/ausente | otro tipo → **EP2** en Q3. Unidades admitidas: `motor/REFERENCIAS.md` §6 |
| `metodo` | texto opcional (solo `amoniaco`; `"Nessler"` cambia la severidad) | otro tipo → se ignora |
| `mediciones` | objeto o `null` | otro tipo → `TypeError` (error de programación, no de la persona) |

Los espacios al principio y al final (incluidos BOM y espacios Unicode) se ignoran igual en Python y JavaScript.

## 2. Informe

| Campo | Tipo | Significado |
|---|---|---|
| `version` | texto | Versión del motor (`"0.4.1"`) |
| `perfil` | `{id, nombre, aplica_a}` | Perfil de referencias aplicado; mostrar `aplica_a` |
| `origen` | texto o `null` | Eco del parámetro `origen` |
| `resultados` | lista de 6 **resultados**, siempre en el orden de arriba | Uno por parámetro |
| `A` | booleano | Hay al menos una anomalía (EP5) |
| `I` | booleano | Hay información insuficiente (algún EP1, EP2 o EP3) |
| `clasificacion` | `"R1"` · `"R2"` · `"R3"` · `"R4"` | Nodo Q7 del grafo (tabla del §5) |
| `resumen` | texto | Frase fija para la clasificación |
| `alertas` | lista de **alertas** | Una por cada EP5, ordenadas por severidad (mayor primero; empate: orden de parámetros) |
| `recomendaciones` | lista `{parametro, texto}` | **Misma longitud y orden que `alertas`**; textos informativos |
| `solicitudes` | lista de **solicitudes** | Una por cada EP1, EP2 o EP3, en el orden de parámetros |
| `aviso` | texto | Límites de AIRI. **Mostrarlo siempre** |
| `traza` | lista `{de, a, etiqueta, parametro}` | Aristas recorridas del grafo oficial (`parametro` es `null` en C1, Q7, R*, O*) |

### Resultado (uno por parámetro)

| Campo | Tipo | Notas |
|---|---|---|
| `parametro`, `nombre` | texto | Identificador y nombre visible |
| `valor_original`, `unidad_original` | lo recibido | Eco sin modificar (puede ser `null` o un tipo no válido) |
| `valor_canonico` | número, `[mínimo, máximo]` o `null` | **Lista = incertidumbre**: amoníaco sin base química; mostrar el intervalo, no un valor único. `null` en EP1/EP2. Redondeado a 6 decimales: un valor minúsculo puede verse como `0` (o `[0, 0]`) aunque el estado sea EP5; el `motivo` lleva el valor con 4 cifras significativas |
| `unidad_canonica` | texto | Unidad del valor canónico |
| `estado` | `"EP1"`…`"EP5"` | FALTANTE · INVÁLIDO · SIN REFERENCIA · EN RANGO · ANOMALÍA |
| `nombre_estado` | texto | Nombre en mayúsculas del estado |
| `severidad` | texto o `null` | Solo en EP5 (§4) |
| `motivo` | texto, nunca vacío | Por qué se llegó a ese estado (la regla aplicada, en palabras) |
| `fuentes` | lista de ids | EP4/EP5: fuentes de **nivel A** que sustentan la evaluación. EP1/EP2: vacía |
| `contexto` | lista `{texto, fuente}` | Solo **nivel B**: informativo, **nunca** se usa para evaluar. Rotularlo así |
| `notas` | lista de textos | Conversiones, «ppm», intervalo de incertidumbre |

Los ids de `fuentes` y `contexto[].fuente` (texto o lista) se resuelven con `AIRIMotor.datos.fuentes.fuentes[id]`
(`titulo`, `url`, `nivel`).

### Alerta y solicitud

- **Alerta:** `{parametro, nombre, severidad, severidad_nombre, motivo, fuentes}` (copia del resultado EP5).
- **Solicitud:** `{parametro, tipo, texto}` con `tipo` = `"faltante"` (EP1), `"invalido"` (EP2) o `"sin_referencia"` (EP3).

## 3. Reglas que la interfaz debe respetar

1. **R3 y R4 nunca se presentan como «todo bien».** R4 muestra a la vez alertas y solicitudes.
2. Con el perfil real, temperatura, salinidad y nitratos quedan en EP3: **R1 y R2 no aparecen** con mediciones completas.
3. El color nunca es la única señal: usar `nombre_estado`, `severidad_nombre` y `motivo`.
4. No reescribir `motivo`, `resumen`, `recomendaciones` ni `aviso` con afirmaciones de seguridad o diagnóstico.
5. Ante un campo desconocido, ignorarlo. Un campo nuevo o un cambio de tipo se acuerda antes, con ejemplo antes/después.

## 4. Severidades (solo ordenan; ninguna es «peligro confirmado»)

| `severidad` | `severidad_nombre` | Prioridad |
|---|---|---|
| `alerta_alta` | Alerta de mayor severidad | 4 |
| `fuera_de_referencia` | Fuera de la referencia | 3 |
| `revision_recomendada` | Revisión recomendada | 2 |
| `presencia_detectable` | Presencia detectable | 1 |

## 5. Clasificación

| `A` | `I` | `clasificacion` | Salidas del grafo |
|---|---|---|---|
| F | F | R1 | FIN |
| V | F | R2 | O1 (explicar) |
| F | V | R3 | O2 (pedir datos) |
| V | V | R4 | O1 y O2 |

## 6. Ejemplo real (abreviado)

Entrada: pH 8.4, amoníaco 0.6 «mg/L (NH₃/NH₄⁺ total)», temperatura 26 °C, nitritos «abc».

```json
{
 "version": "0.4.1", "clasificacion": "R4", "A": true, "I": true,
 "alertas": [
  {"parametro": "ph", "severidad": "revision_recomendada", "fuentes": ["msd_tabla_referencia", "msd_capitulo"], "motivo": "8.4 está por encima de la tabla de referencia (7.8–8.3), pero dentro de lo que el mismo capítulo considera habitual en tanques marinos (hasta 8.5). Las fuentes discrepan: conviene revisar."},
  {"parametro": "amoniaco", "severidad": "revision_recomendada", "fuentes": ["msd_tabla_referencia", "msd_resumen_pruebas", "ufifas_fa031"], "motivo": "Amoníaco detectable. Como la unidad no indica si es «como N», «como NH3» o «como NH4+», el valor equivale a 0.4659–0.6 mg/L TAN-N y no se puede saber si alcanza 0.5 mg/L. Indica la base química del kit."}
 ],
 "solicitudes": [
  {"parametro": "temperatura", "tipo": "sin_referencia"}, {"parametro": "salinidad", "tipo": "faltante"},
  {"parametro": "nitritos", "tipo": "invalido", "texto": "Corrige nitritos: «abc» no es un número válido."},
  {"parametro": "nitratos", "tipo": "faltante"}
 ]
}
```

El resultado del amoníaco en ese informe tiene `"valor_canonico": [0.465891, 0.6]` y una nota que explica el intervalo.

## 7. Cambios del contrato

| Versión | Cambio | Efecto en la interfaz |
|---|---|---|
| 0.4.0 | Contrato inicial | — |
| 0.4.1 | Sin campos nuevos ni renombrados. Entradas mal formadas → EP2 (antes: error en Python o «EN RANGO» en JS); espacios Unicode tratados igual; `version` = `"0.4.1"` | Ninguno: el formulario envía textos y sigue igual |
| 0.4.1 + §8 | **Adición, sin cambios en el informe:** función `condiciones_medidas` / `condicionesMedidas` (§8) para otros módulos | Ninguno: la interfaz actual no la usa |

## 8. Condiciones medidas (para otros módulos, p. ej. compatibilidad)

**Estado:** propuesta del motor, pendiente de confirmar con Yair (compatibilidad). No cambia el informe ni la
interfaz actual. **Comprobado por:** `motor/pruebas/test_condiciones.py` (incluye paridad Python ↔ JavaScript) y
`interfaz/motor/pruebas/motor.test.js`.

Un módulo que necesite **los valores medidos** (por ejemplo, para compararlos con los rangos de una especie) no debe
leer `valor_original` ni convertir unidades por su cuenta: usa esta vista, que **copia** del informe el valor ya
convertido y su estado. No vuelve a evaluar nada, no modifica el informe y no decide si un valor es adecuado.

| Entorno | Llamada |
|---|---|
| Navegador | `AIRIMotor.condicionesMedidas(informe)` |
| Node | `require("interfaz/motor/airi-motor.js").condicionesMedidas(informe)` |
| Python | `from airi_motor import condiciones_medidas` → `condiciones_medidas(informe)` |

`informe` es lo que devuelve `evaluar(...)`; otro tipo de objeto → `TypeError`.

| Campo | Tipo | Significado |
|---|---|---|
| `version` | texto | `version` del informe |
| `perfil` | texto | `perfil.id` del informe |
| `clasificacion` | texto | `clasificacion` del informe (R1–R4) |
| `condiciones` | objeto `{parametro: condición}` | Los 6 parámetros, en el orden del §1 |
| `no_disponibles` | lista de ids | Parámetros FALTANTES o INVÁLIDOS (EP1/EP2), en orden |
| `aviso` | texto | Límites de la vista. Mostrarlo si se presentan estos valores |

**Condición** (una por parámetro):

| Campo | Tipo | Significado |
|---|---|---|
| `nombre` | texto | Nombre visible |
| `disponible` | booleano | `true` si la medición es válida (EP3, EP4 o EP5). **No significa «adecuado»** |
| `valor` | número, `[mínimo, máximo]` o `null` | `valor_canonico` si `disponible`; si no, `null` |
| `intervalo` | booleano | `true` si `valor` es un intervalo de incertidumbre (amoníaco sin base química): comparar **ambos extremos** |
| `unidad` | texto | `unidad_canonica`: °C, pH, ppt, mg/L TAN-N, mg/L NO2-N, mg/L NO3-N |
| `estado` | `"EP1"`…`"EP5"` | Estado del motor. EP3 = medido pero **no evaluado** por falta de referencia |
| `severidad` | texto o `null` | Severidad del motor (solo EP5) |

Reglas para quien la consuma:

1. Un parámetro en `no_disponibles` es **dato faltante**, nunca una condición favorable (equivale a «sin datos»).
2. EP3 (temperatura, salinidad y nitratos con el perfil real) aporta el valor medido, pero el motor **no** lo
   comparó con ninguna referencia: el otro módulo debe citar su propia fuente si lo compara.
3. Las alertas del agua siguen siendo las del informe (`alertas`, `recomendaciones`); otro módulo no las recalcula ni
   las oculta.
4. **Salinidad:** el motor la expresa en ppt (‰, g/kg). La gravedad específica no se acepta (EP2), porque su
   conversión depende de la temperatura de medición. Si unos rangos de especie están en gravedad específica, la
   comparación queda sin datos hasta acordar una conversión con fuente.

Ejemplo (misma entrada que el §6):

```json
{
 "version": "0.4.1", "perfil": "peces_marinos_msd", "clasificacion": "R4",
 "condiciones": {
  "temperatura": {"nombre": "Temperatura", "valor": 26.0, "unidad": "°C", "intervalo": false, "disponible": true, "estado": "EP3", "severidad": null},
  "ph": {"nombre": "pH", "valor": 8.4, "unidad": "pH", "intervalo": false, "disponible": true, "estado": "EP5", "severidad": "revision_recomendada"},
  "salinidad": {"nombre": "Salinidad", "valor": null, "unidad": "ppt", "intervalo": false, "disponible": false, "estado": "EP1", "severidad": null},
  "amoniaco": {"nombre": "Amoníaco total", "valor": [0.465891, 0.6], "unidad": "mg/L TAN-N", "intervalo": true, "disponible": true, "estado": "EP5", "severidad": "revision_recomendada"},
  "nitritos": {"nombre": "Nitritos", "valor": null, "unidad": "mg/L NO2-N", "intervalo": false, "disponible": false, "estado": "EP2", "severidad": null},
  "nitratos": {"nombre": "Nitratos", "valor": null, "unidad": "mg/L NO3-N", "intervalo": false, "disponible": false, "estado": "EP1", "severidad": null}
 },
 "no_disponibles": ["salinidad", "nitritos", "nitratos"],
 "aviso": "Valores medidos y convertidos por el motor de agua. Que un valor esté disponible no significa que sea adecuado para el acuario ni para una especie; la ausencia de un valor nunca equivale a una condición favorable."
}
```
