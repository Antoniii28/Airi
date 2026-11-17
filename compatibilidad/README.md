# AIRI · Evaluador orientativo de compatibilidad (v0.2.0)

Módulo independiente que compara las fichas del catálogo de especies de Brayan (`especies/datos/catalogo_inicial.json`, v0.7.1) y devuelve un resultado **explicable**:
estado orientativo, motivos con fuentes, contradicciones y datos faltantes. Responsable: Yair
(rama `equipo/yair-compatibilidad`). Contrato completo: [CONTRATO.md](CONTRATO.md).

> La evaluación es orientativa. **La falta de datos nunca equivale a compatibilidad** y compartir rangos de agua o
> el mismo ambiente no demuestra que dos especies puedan convivir. AIRI no introduce animales ni garantiza su
> bienestar: decide una persona.

## Archivos

| Archivo | Función |
|---|---|
| `airi-compatibilidad.js` | Módulo (navegador: `window.AIRICompatibilidad`; Node: `require`). Sin dependencias |
| `CONTRATO.md` | Entrada, salida, estados, criterios y propuesta de campo `convivencia.relaciones` para Brayan |
| `datos_prueba/catalogo_prueba.json` | **Datos ficticios** (ids `prueba_*`, fuentes `example.org`) con el esquema del catálogo de Brayan (v0.5–v0.7.1) |
| `ejemplos/catalogo_real/*.json` | Cinco ejemplos con las **fichas reales** de Brayan para la interfaz (Paola) |
| `ejemplos/*.json` | Seis ejemplos con datos ficticios para casos que las fichas reales aún no tienen |
| `herramientas/generar_ejemplos.js` | Regenera los ejemplos (`--comprobar` solo verifica; `--catalogo RUTA` elige el catálogo real) |
| `pruebas/compatibilidad.test.js` | 25 pruebas con `node:test` |

## Textos sencillos para la interfaz

El módulo también expone `AIRICompatibilidad.DESCRIPCION_MODULO` y `AIRICompatibilidad.ESCENARIOS_DEMO` para que la interfaz muestre una explicación breve y un selector con nombres fáciles de entender. Los textos visibles de los resultados se encuentran en `ETIQUETAS`.

Descripción del módulo:

> En este módulo puedes seleccionar cualquiera de estos escenarios para conocer si las especies pueden convivir, si no son compatibles o si todavía falta información sobre ellas.

## Uso rápido

```js
const Compat = require("./compatibilidad/airi-compatibilidad.js");
const Motor = require("./interfaz/motor/airi-motor.js");
const catalogo = require("./especies/datos/catalogo_inicial.json");

const condiciones = Motor.condicionesMedidas(Motor.evaluar({ temperatura: { valor: "25", unidad: "°C" } }));
const r = Compat.evaluar({
  especies: ["amphiprion_ocellaris", "zebrasoma_flavescens"],
  acuario: { volumen_l: 300, tipo: "arrecife", condiciones }
}, catalogo);
console.log(r.estado_global, r.pares[0].resumen);
```

## Pruebas

```bash
node --test compatibilidad/pruebas/compatibilidad.test.js
node compatibilidad/herramientas/generar_ejemplos.js --comprobar
# Con otro catálogo real (por ejemplo, el de la rama de Brayan antes de fusionarse):
AIRI_CATALOGO=ruta/catalogo_inicial.json node --test compatibilidad/pruebas/compatibilidad.test.js
```

La prueba «fichas reales de Brayan» se omite si el catálogo del repositorio todavía es el v0.1 (sin fichas); en
cuanto se fusione el PR #17 se ejecuta sola. Probado con el catálogo v0.7.1: 25/25.

Cubren: coincidencia sustentada, incompatibilidad sustentada (rangos y relación declarada), contradicciones,
fuentes de relaciones inexistentes, pH obligatorio, ids especiales (`__proto__`, `constructor`…) e ids repetidos,
datos insuficientes y especie inexistente, varios ejemplares, acuario con la salida real del motor de agua,
contrato de salida, validación de entrada, no modificación de datos y las fichas reales (de 1 326 pares del catálogo
v0.7.1, 758 salen `precaucion` y 568 `sin_datos`; ninguno `compatible` porque aún no hay relaciones con fuente).

## Límites conocidos

- No interpreta el texto libre de `convivencia` (condiciones/riesgos); necesita `convivencia.relaciones` (CONTRATO §5).
- No evalúa depredación por tamaño, alimentación, carga biológica total ni orden de introducción: no hay datos
  estructurados ni umbrales con fuente para ello. El tamaño solo se muestra como contexto.
- La salinidad no se compara (gravedad específica en las fichas, ppt en el motor) hasta acordar una conversión con fuente.
- Las cifras de las fichas vienen sobre todo de una fuente comercial (confianza baja/media); cada motivo muestra su
  `confianza` para que la interfaz la haga visible.
- Muchos pares reales salen `precaucion` por diferencia de temperamento: es intencional y conservador.
- Especies sin pH documentado (p. ej. `zanclus_cornutus`) nunca pueden salir `compatible`.

## Coordinación pendiente

- **Equipo:** aprobar los nombres de estado `compatible`, `precaucion`, `incompatible`, `sin_datos`.
- **Brayan:** el adaptador `normalizarFicha` sigue `especies/CONTRATO_FICHAS.md` (v0.7.1); valorar `convivencia.relaciones`.
- **Paola:** revisar `ejemplos/` y qué campos mostrar; integrar con `<script>` sin recalcular reglas.
- **José:** confirmar el uso de `condicionesMedidas` (§8 del motor), que este módulo consume sin modificarla.
