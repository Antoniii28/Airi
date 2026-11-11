# Grafo de decisiones del agente AIRI

**Actividad:** Fundamentos de la IA — grafo relacionado con el proyecto AIRI.
**Estado:** representación académica del **funcionamiento propuesto** de AIRI v0.1. No describe código implementado: el agente todavía no se ha programado.

![Grafo de decisiones del agente AIRI](grafo_decisiones_airi.png)

| Archivo | Uso |
|---|---|
| [`grafo_decisiones_airi.png`](grafo_decisiones_airi.png) | Imagen para presentar (200 dpi) |
| [`grafo_decisiones_airi.pdf`](grafo_decisiones_airi.pdf) | Versión vectorial para imprimir |
| [`grafo_decisiones_airi.svg`](grafo_decisiones_airi.svg) | Versión vectorial para web |
| [`grafo_decisiones_airi.dot`](grafo_decisiones_airi.dot) | Código fuente Graphviz que genera las tres anteriores |

## 1. Tipo de grafo

Es un **grafo dirigido acíclico de decisiones y estados del agente**. Cada nodo es un paso, una decisión o un resultado; cada arista es una transición con su condición. Al no tener ciclos, todo recorrido termina en un único nodo final.

Se relaciona con el modelo de agente de Russell y Norvig (cap. 2): **percepción** (recibir mediciones) → **razonamiento** (validar, evaluar, clasificar) → **acción**, que en AIRI es únicamente informativa.

Los valores del agua **no son nodos**. Esto lo diferencia del grafo de estados del prototipo anterior `Acuario-IA`, que representaba combinaciones de temperatura, salinidad y pH para algoritmos de búsqueda.

## 2. Cómo leerlo

- **Rombo:** decisión con salidas **V** (Verdadero) y **F** (Falso).
- **Caja:** estado de un parámetro o resultado del informe.
- **Borde continuo:** requisito documentado. **Borde discontinuo:** decisión de diseño propuesta.
- Las decisiones se identifican con **Q** (y no con V) para no confundirlas con el valor lógico V.
- Los colores siguen la **paleta V2** de [identidad visual](../identidad-visual/README.md).

## 3. Nodos (21)

| ID | Nodo | Tipo | Fundamento |
|---|---|---|---|
| E0 | Recibir mediciones manuales o simuladas con el origen identificado | Entrada | F-01, F-11, T07 |
| Q1 | ¿Dato presente? | Validación | F-02, F-06 |
| Q2 | ¿Número válido? (formato numérico finito) | Validación | F-02, S-07 |
| Q3 | ¿Unidad reconocida? (unidad y especie química) | Validación | F-02 |
| Q4 | ¿Valor plausible? (límites de medición configurados) | Validación | F-02, S-07 |
| Q5 | ¿Existe referencia con fuente para el perfil del acuario? | Evaluación | F-03, T06 |
| Q6 | ¿Dentro del rango de referencia? | Evaluación | F-03 |
| EP1 | FALTANTE | Estado del parámetro | F-06, T01 |
| EP2 | INVÁLIDO | Estado del parámetro | F-02, T02 |
| EP3 | SIN REFERENCIA | Estado del parámetro | F-03, T06 |
| EP4 | EN RANGO | Estado del parámetro | F-03, T03 |
| EP5 | ANOMALÍA | Estado del parámetro | F-03, T04 |
| C1 | Consolidar los seis resultados y calcular A e I | Consolidación | Propuesta de diseño, F-04 |
| Q7 | Clasificar el informe según A e I | Decisión | Propuesta de diseño |
| R1 | Informe en rango (no garantiza la salud del acuario) | Resultado | T03, F-11 |
| R2 | Alertas: una por parámetro anómalo | Resultado | F-04, T04, T05 |
| R3 | Información insuficiente (no declara normalidad) | Resultado | F-04, F-06, T01 |
| R4 | Alertas + información insuficiente | Resultado | Propuesta de diseño, F-04, F-06 |
| O1 | Recomendación informativa | Salida | F-04, F-10 |
| O2 | Solicitud de datos o corrección | Salida | F-06 |
| FIN | Decisión del usuario; AIRI no ejecuta acciones físicas | Fin | F-10, T08 |

Q1–Q6 y EP1–EP5 forman el bloque de **evaluación individual**, que se aplica a cada uno de los seis parámetros documentados: temperatura, pH, salinidad, amoníaco, nitritos y nitratos.

## 4. Transiciones (30)

| Origen | Condición | Destino |
|---|---|---|
| E0 | para cada parámetro | Q1 |
| Q1 | F / V | EP1 / Q2 |
| Q2 | F / V | EP2 / Q3 |
| Q3 | F / V | EP2 / Q4 |
| Q4 | F / V | EP2 / Q5 |
| Q5 | F / V | EP3 / Q6 |
| Q6 | V / F | EP4 / EP5 |
| EP1…EP5 | registrar | C1 |
| C1 | A, I | Q7 |
| Q7 | A = F, I = F | R1 |
| Q7 | A = V, I = F | R2 |
| Q7 | A = F, I = V | R3 |
| Q7 | A = V, I = V | R4 |
| R2, R4 | explicar | O1 |
| R3, R4 | pedir datos | O2 |
| R1, O1, O2 | entregar | FIN |

## 5. Lógica de clasificación (propuesta de diseño)

- **A** = V si al menos un parámetro está en ANOMALÍA.
- **I** = V si al menos un parámetro está FALTANTE, INVÁLIDO o SIN REFERENCIA.

| A | I | Resultado |
|---|---|---|
| F | F | R1 · Informe en rango |
| V | F | R2 · Alertas |
| F | V | R3 · Información insuficiente |
| V | V | R4 · Alertas + información insuficiente |

Garantías:
1. AIRI solo informa "en rango" cuando A = F e I = F. **Nunca declara normalidad si faltan datos.**
2. Un dato faltante **no oculta** las anomalías de otros parámetros válidos (R4).
3. Lo desconocido no se convierte en F: un parámetro sin dato o sin referencia queda como **no evaluado**.

Esta lógica amplía la propuesta global de [`CRITERIOS_V0.1.md`](https://github.com/Antoniii28/Airi/blob/docs/planificacion-airi-v0.1-20261111/docs/CRITERIOS_V0.1.md) (`A = D ∧ ¬R`, `N = D ∧ R`, `I = ¬D`) aplicándola por parámetro. La evaluación por parámetro y la clasificación por A e I son **propuestas de diseño aprobadas para este grafo**, no reglas que ya estuvieran documentadas.

## 6. Requisitos documentados y propuestas

**Documentados en este repositorio:**
- Normativa funcional F-01 a F-11: [`02_normativa_basica.md`](../documentacion/02_normativa_basica.md).
- Medidas de seguridad S-01 a S-12: [`03_normativa_seguridad.md`](../documentacion/03_normativa_seguridad.md).
- Casos T01–T08 y lógica mínima: `docs/CRITERIOS_V0.1.md` en la rama `docs/planificacion-airi-v0.1-20261111` (propuesta pendiente de aprobación).

**Propuestas de diseño (borde discontinuo):** el bloque de evaluación individual, C1, Q7 y R4.

**Fuera del alcance de este grafo:** compatibilidad de especies (F-05, prevista para v0.2) y reconocimiento visual (F-07 a F-09, previsto para v0.5).

## 7. Limitaciones

- Los datos son **simbólicos**: el grafo no contiene rangos biológicos. Los rangos deberán fundamentarse con fuentes especializadas antes de implementarse.
- Q4 usa "límites de medición configurados" para detectar errores de captura; **no son rangos biológicos** ni límites físicos universales.
- Las recomendaciones son informativas: ninguna transición representa una acción física automática.

## 8. Regenerar los archivos

Requiere [Graphviz](https://graphviz.org/). No necesita Python ni otras dependencias.

```bash
cd grafo
dot -Tsvg grafo_decisiones_airi.dot -o grafo_decisiones_airi.svg
dot -Tpng -Gdpi=200 grafo_decisiones_airi.dot -o grafo_decisiones_airi.png
dot -Tpdf grafo_decisiones_airi.dot -o grafo_decisiones_airi.pdf
```

## 9. Verificación realizada (11 de noviembre de 2026)

Con Graphviz 2.43.0, a partir del DOT exportado a JSON:

- 21 nodos lógicos, 30 transiciones, sin aristas duplicadas y todas con etiqueta.
- Q1–Q6 tienen exactamente una salida V y una F; Q7 cubre las cuatro combinaciones de A e I.
- Grafo acíclico; todos los nodos son alcanzables desde E0 y FIN es el único nodo terminal.
- Casos simulados: datos completos y en rango → R1; datos incompletos → R3; una anomalía → R2; tres anomalías → R2 con tres alertas; formato inválido, unidad no reconocida, valor no plausible y sin referencia → R3; anomalía con dato faltante → R4 (con O1 y O2).
- Comprobación exhaustiva de las 117 649 combinaciones posibles de estados para los seis parámetros: nunca se informa "en rango" con anomalías o datos no evaluados, las alertas nunca se pierden y todos los recorridos terminan en FIN.
- SVG válido; PDF de una página con fuentes incrustadas; PNG de 3046 × 5646 px.
- Contraste de texto (WCAG): entre 4.18:1 y 14.76:1. El valor más bajo corresponde al texto blanco sobre azul océano, y supera 3:1, el mínimo para texto grande o en negrita.
