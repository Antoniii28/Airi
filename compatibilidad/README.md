# AIRI · Evaluador orientativo de compatibilidad (v0.1.0)

Módulo independiente que compara las fichas del catálogo de especies y devuelve un resultado **explicable**:
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
| `datos_prueba/catalogo_prueba.json` | **Datos ficticios** (ids `prueba_*`, fuentes `example.org`) con el esquema del catálogo v0.5 |
| `ejemplos/*.json` | Seis ejemplos de entrada/salida para la interfaz (Paola) |
| `herramientas/generar_ejemplos.js` | Regenera los ejemplos (`--comprobar` solo verifica) |
| `pruebas/compatibilidad.test.js` | 19 pruebas con `node:test` |

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
```

Cubren: coincidencia sustentada, incompatibilidad sustentada (rangos y relación declarada), contradicciones,
datos insuficientes y especie inexistente, varios ejemplares, acuario con la salida real del motor de agua,
contrato de salida, validación de entrada, no modificación de datos y el catálogo real de `especies/` (con el de
`main` v0.1 y con el v0.5 de la rama de Brayan: ningún par sale `compatible` sin relaciones con fuente).

## Límites conocidos

- No interpreta el texto libre de `convivencia` (condiciones/riesgos); necesita `convivencia.relaciones` (CONTRATO §5).
- No evalúa depredación por tamaño, alimentación, carga biológica total ni orden de introducción: no hay datos
  estructurados ni umbrales con fuente para ello. El tamaño solo se muestra como contexto.
- La salinidad no se compara (gravedad específica en las fichas, ppt en el motor) hasta acordar una conversión con fuente.
- Las cifras de las fichas vienen sobre todo de una fuente comercial (confianza baja/media); cada motivo muestra su
  `confianza` para que la interfaz la haga visible.
- Con el catálogo v0.5 muchos pares salen `precaucion` por diferencia de temperamento: es intencional y conservador.

## Coordinación pendiente

- **Equipo:** aprobar los nombres de estado `compatible`, `precaucion`, `incompatible`, `sin_datos`.
- **Brayan:** confirmar ids y rutas de campos (adaptador `normalizarFicha`) y valorar `convivencia.relaciones`.
- **Paola:** revisar `ejemplos/` y qué campos mostrar; integrar con `<script>` sin recalcular reglas.
- **José:** confirmar el uso de `condicionesMedidas` (§8 del motor), que este módulo consume sin modificarla.
