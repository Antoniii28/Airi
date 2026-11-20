# AIRI · Contrato del evaluador de compatibilidad (v0.3.0, propuesta)

**Responsable:** Yair (rama `equipo/yair-compatibilidad`).  
**Estado:** propuesta para revisión del equipo. Los nombres de estados y campos **no están aprobados**; si el equipo los
cambia, se actualizan este documento, `ESTADOS`/`ETIQUETAS` en `airi-compatibilidad.js`, las pruebas y los ejemplos.  
**Comprobado por:** `compatibilidad/pruebas/compatibilidad.test.js` (26 pruebas).  
**Datos:** las fichas reales de Brayan (`especies/datos/catalogo_inicial.json`, contrato `especies/CONTRATO_FICHAS.md`,
v0.8 con 79 especies, PR #17). Los datos ficticios de `datos_prueba/` solo cubren casos que las fichas reales aún no
tienen (relaciones declaradas, contradicciones).

## 1. Llamada

| Entorno | Llamada |
|---|---|
| Navegador | `<script src="compatibilidad/airi-compatibilidad.js">` → `AIRICompatibilidad.evaluar(entrada, catalogo)` |
| Node | `require("./compatibilidad/airi-compatibilidad.js").evaluar(entrada, catalogo)` |

`catalogo` es el objeto de `especies/datos/catalogo_inicial.json` (Brayan). El módulo **no lo modifica** ni lo
carga por sí mismo: quien lo integra decide de dónde viene (en el prototipo, `airi-fichas-datos.js`).

## 2. Entrada

```json
{
  "especies": ["amphiprion_ocellaris", { "id": "zebrasoma_flavescens", "cantidad": 2 }],
  "acuario": {
    "volumen_l": 300,
    "tipo": "arrecife",
    "condiciones": "<salida de AIRIMotor.condicionesMedidas(informe), contrato del motor §8>"
  }
}
```

| Campo | Obligatorio | Significado |
|---|---|---|
| `especies` | sí | Lista no vacía de `id` de ficha (texto) o `{ id, cantidad }`. Ids repetidos se suman. `cantidad` > 1 evalúa la convivencia entre ejemplares de la misma especie |
| `acuario` | no | Si falta o es `null`, solo se evalúan pares de especies |
| `acuario.volumen_l` | no | Litros. Se compara con el mínimo orientativo de cada ficha |
| `acuario.tipo` | no | `"arrecife"`, `"solo_peces"` o `null` |
| `acuario.condiciones` | no | Vista §8 del motor de agua (José). Se usa tal cual: no se convierten unidades ni se recalculan alertas |

Entrada mal formada → `TypeError`. Un id que no existe en el catálogo **no** es error: da `sin_datos`.

**Identificadores.** Se comparan como texto exacto (sin distinguir otra cosa que espacios al inicio o al final, que se
quitan). El módulo nunca usa ids de especies ni de fuentes como claves de objetos normales: usa `Map`/`Set` y
propiedades propias, de modo que ids como `__proto__`, `constructor` o `toString` se tratan como cualquier otro y no
alteran objetos de JavaScript. Si un id aparece **repetido** en el catálogo, esa ficha no se usa (`sin_datos`, con el
motivo) porque no se sabe cuál es la correcta.

## 3. Salida

| Campo | Tipo | Significado |
|---|---|---|
| `version` | texto | Versión del módulo |
| `catalogo_version` | texto o `null` | `version` del catálogo usado |
| `estado_global` | estado | El más restrictivo de todos los pares y de la evaluación frente al acuario |
| `etiqueta_global` | texto | Texto visible del estado |
| `especies` | lista | `{ id, cantidad, encontrada, nombre_comun, nombre_cientifico }` |
| `pares` | lista | Un resultado por par de especies (y uno por especie con `cantidad` > 1, con `especies: [id, id]`) |
| `acuario` | lista | Un resultado por especie frente al acuario (vacía si no se envió `acuario`) |
| `intervalo_comun` | objeto | `temperatura_c` y `ph`: intersección de rangos documentados (`{min,max}` o `null`) y `nota` |
| `datos_faltantes` | lista | `{ especie, campo }` sin duplicados. `especie: null` = dato del acuario |
| `fuentes` | objeto | `{ id: { titulo, url, tipo } }` de **todas** las fuentes citadas; `no_registrada: true` (y `url: null`) si el id no es una propiedad propia de `catalogo.fuentes` con URL `http(s)` |
| `aviso` | texto | Límites de la evaluación. **Mostrarlo siempre** junto al resultado |

**Resultado** (cada elemento de `pares` y de `acuario`):

| Campo | Tipo | Significado |
|---|---|---|
| `especies` / `especie` | ids | Par evaluado / especie frente al acuario |
| `estado`, `etiqueta` | estado, texto | Ver §4 |
| `contradiccion` | booleano | `true` si hay evidencia a favor y en contra: se aplicó lo más restrictivo y conviene revisión humana |
| `resumen` | texto | Una frase para mostrar o leer en voz alta |
| `motivos` | lista | `{ criterio, nombre, efecto, texto, fuentes, confianza }`. `efecto` es un estado o `"sin_conflicto"` |
| `notas_convivencia` | lista | `{ especie, tipo, texto, fuentes, confianza }` con los textos de `convivencia.condiciones` (`tipo: "condicion"`) y `convivencia.riesgos` (`tipo: "riesgo"`) de las fichas del par (o de la especie, frente al acuario). Son **informativos**: la interfaz debe mostrarlos, pero no cambian el estado. Vacía si la especie no está en el catálogo |
| `datos_faltantes` | lista | `{ especie, campo }` |

## 4. Estados (propuestos) y cómo se decide

Para la interfaz se utilizan etiquetas sencillas: **Compatible**, **No compatibles**, **Precaución: revisar convivencia** y **Faltan datos**. Los escenarios de demostración y la descripción breve del módulo se exponen en `ESCENARIOS_DEMO` y `DESCRIPCION_MODULO` dentro del archivo JavaScript.

| Estado | Etiqueta | Cuándo |
|---|---|---|
| `incompatible` | No compatibles | Algún motivo con efecto `incompatible` |
| `precaucion` | Precaución: revisar convivencia | Algún motivo `precaucion` y ninguno `incompatible` |
| `compatible` | Compatible | **Solo** si hay convivencia declarada con fuentes registradas (§5), están los datos esenciales (**temperatura, pH** y temperamento de ambas) y ningún motivo en contra |
| `sin_datos` | Faltan datos (F-06) | Cualquier otro caso: faltan datos, especie no encontrada, o no hay conflictos pero ninguna fuente confirma la convivencia |

Gravedad para combinar: `incompatible` > `precaucion` > `sin_datos` > `compatible`. El estado global es
`compatible` solo si **todos** los resultados lo son. Frente al acuario el resultado nunca es `compatible`: estar
dentro de rangos no confirma bienestar y la salinidad aún no se puede comparar.

### Criterios

| Criterio | Datos de la ficha (adaptador `normalizarFicha`) | Efecto |
|---|---|---|
| `temperatura` | `ficha_airi.temperatura_c.{min,max}` | Rangos sin solapamiento → `incompatible`; con solapamiento → `sin_conflicto` (nunca prueba compatibilidad) |
| `ph` | `ph.acuario.{min,max}` | Igual que temperatura |
| `temperamento` | `ficha_airi.temperamento.valor` | Una especie no pacífica con una pacífica → `precaucion` |
| `territorialidad` | `ficha_airi.comportamiento.etiquetas` | Ambas «territorial» y al menos una no pacífica → `precaucion` |
| `misma_especie` | `comportamiento.etiquetas` | `cantidad` > 1 y «solitario» o «territorial» → `precaucion` |
| `relacion` | `convivencia.relaciones` (§5) | El efecto declarado, solo si **todas** sus fuentes existen en `catalogo.fuentes` con URL. Si no, se informa con efecto `sin_datos` y el dato faltante `convivencia.relaciones.fuentes` |
| `volumen` | `ficha_airi.litraje_recomendado_l.min` | `acuario.volumen_l` menor → `precaucion` (cifra orientativa, confianza baja) |
| `arrecife` | `ficha_airi.adecuado_arrecife.valor` | Con `tipo: "arrecife"`: `no` → `incompatible`; `con_precaucion` → `precaucion` |
| `agua_temperatura`, `agua_ph` | rangos anteriores + condición §8 | Valor medido fuera del rango de la ficha → `precaucion`. Intervalos: se comparan ambos extremos. EP3 se compara citando la fuente de la ficha |
| `agua_salinidad` | — | Siempre `sin_datos`: la ficha usa gravedad específica y el motor ppt (contrato del motor §8, regla 4) |

## 5. Propuesta para Brayan: `convivencia.relaciones`

El catálogo (v0.8) describe la convivencia en texto libre (`convivencia.condiciones`/`riesgos`). Interpretar texto
libre no es fiable, así que el módulo **no lo usa para decidir**: desde la v0.3.0 lo devuelve tal cual, con sus fuentes,
en `notas_convivencia` para que la interfaz lo muestre y no se pierda. Se propone añadir una lista estructurada, sin
cambiar los campos existentes:

```json
"convivencia": {
  "condiciones": ["…"], "riesgos": ["…"], "fuentes": ["…"], "confianza": "baja",
  "relaciones": [
    { "con": { "genero": "Zebrasoma" }, "efecto": "incompatible",
      "motivo": "Agresión fuerte hacia otros cirujanos Zebrasoma.",
      "fuentes": ["liveaquaria_zebrasoma_xanthurum"], "confianza": "baja" },
    { "con": { "misma_especie": true }, "efecto": "precaucion",
      "motivo": "Un solo ejemplar por acuario, salvo que se introduzcan a la vez.",
      "fuentes": ["liveaquaria_zebrasoma_flavescens"], "confianza": "baja" },
    { "con": { "temperamento": "pacifico" }, "efecto": "compatible",
      "motivo": "La fuente recomienda compañeros de acuario pacíficos.",
      "fuentes": ["liveaquaria_pterapogon_kauderni"], "confianza": "baja" }
  ]
}
```

- `con` selecciona a la otra especie por `id`, `genero`, `familia` (`taxonomia.familia`), `grupo` o `temperamento`
  (valor o lista; si hay varias claves, deben cumplirse todas), o `{ "misma_especie": true }`.
- `efecto`: `compatible`, `precaucion` o `incompatible`.
- `fuentes`: ids que **deben existir** en `catalogo.fuentes` (propiedad propia, con URL `http(s)`). Una relación sin
  fuentes, o con alguna fuente que no esté registrada, **no cuenta como evidencia** (ni a favor ni en contra).
- Los ejemplos de arriba resumen textos que ya existen en la rama de Brayan; él decide si se codifican así.

Hasta que existan relaciones en el catálogo real, ningún par real puede salir `compatible` (lo comprueba una prueba).

## 6. Ejemplos para Paola

- `compatibilidad/ejemplos/catalogo_real/*.json`: **fichas reales** del catálogo v0.8 de Brayan — sin conflictos
  pero sin evidencia (`sin_datos`), precaución por temperamento, varios cirujanos amarillos, especie sin pH documentado
  y acuario de arrecife con la salida del motor.
- `compatibilidad/ejemplos/*.json`: **datos de prueba ficticios** para los casos que las fichas reales aún no tienen:
  compatible sustentado, incompatible por rangos, contradicción y especie inexistente.

Se regeneran con `node compatibilidad/herramientas/generar_ejemplos.js [--catalogo RUTA]`. La interfaz debe mostrar estado, `resumen`, `motivos` con sus fuentes enlazadas, `contradiccion`,
`datos_faltantes` y `aviso`, sin recalcular nada.

## 7. Historial

| Versión | Cambio | Afecta a |
|---|---|---|
| 0.1.0 | Propuesta inicial | — |
| 0.2.0 | Revisión del PR #19: (1) las fuentes de una relación deben existir en `catalogo.fuentes`; (2) el pH pasa a ser dato esencial para `compatible`; (3) ids de especies y fuentes con `Map`/propiedades propias, ids repetidos en el catálogo → `sin_datos`; ejemplos con las fichas reales | Estructura de salida sin cambios. Algunos pares que antes salían `compatible` sin pH ahora salen `sin_datos` |
| 0.3.0 | Observación de Paola: los textos de `convivencia.condiciones` y `convivencia.riesgos` (catálogo v0.8) se devuelven en `notas_convivencia`, con fuentes, sin cambiar el estado | Campo nuevo en cada resultado; los demás campos no cambian |
