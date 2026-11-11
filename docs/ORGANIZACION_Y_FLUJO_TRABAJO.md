# AIRI — Organización oficial y forma de trabajo

**Estado:** acuerdos de organización del proyecto, 11 de noviembre de 2026.  
**Repositorio oficial:** [Antoniii28/Airi](https://github.com/Antoniii28/Airi).

## 1. Un solo repositorio para AIRI

Todo el proyecto AIRI (Agente Inteligente para la Supervisión y Gestión de un Acuario Marino) se documentará y desarrollará en **`Antoniii28/Airi`**. Comprende documentación, normativa, reglas, identidad visual, planificación, grafos, código Python, pruebas, API, interfaz web y, posteriormente, aplicación móvil.

**`Antoniii28/Acuario-IA` es una actividad académica anterior e independiente.** No es el repositorio de implementación de AIRI. Su grafo y sus algoritmos BFS, UCS y A* se conservan sin modificaciones; pueden consultarse como antecedente, pero no copiarse, fusionarse o sustituirse automáticamente.

## 2. Material existente que se conserva

- `documentacion/`: descripción, normativa, fundamentación y referencias.
- `entregables/`: documentos académicos existentes.
- `identidad-visual/`: logotipos históricos V1 y V2, paletas y manual; **V2 es la identidad principal**.
- `docs/` en esta rama: plan de desarrollo, roadmap, propuestas y criterios v0.1.

No eliminar ni sobrescribir estos recursos. Los cambios a requisitos o decisiones deberán quedar justificados y revisados por el equipo. No confundir las reglas funcionales F-01 a F-11 con los controles de seguridad S-01 a S-12 ni con las 12 reglas académicas elaboradas aparte; comprobar si estas últimas y sus tablas de verdad están efectivamente versionadas antes de afirmar que existen en GitHub.

## 3. Prioridad inmediata: actividad del grafo

La profesora solicitó **un grafo del proyecto AIRI**, sin requerir expresamente BFS, UCS ni A*. Se propone crear desde cero un **grafo dirigido de decisiones** de AIRI v0.1, basado en la documentación existente:

- Entrada manual o simulada y origen de las mediciones.
- Validación por parámetro de temperatura, pH, salinidad, amoníaco, nitritos y nitratos.
- Verificación de referencias documentadas.
- Resultados por parámetro: faltante, inválido, sin referencia, en rango o anomalía.
- Consolidación sin ocultar anomalías cuando otros datos sean insuficientes.
- Alertas y recomendaciones **informativas**, sin acciones físicas automáticas.

La clasificación propuesta usa **A = existe alguna anomalía evaluable** e **I = existe algún parámetro no evaluable**. Los cuatro resultados son: sin anomalías evaluadas ni datos pendientes (A=F,I=F), alertas (A=V,I=F), información insuficiente (A=F,I=V), o alertas e información insuficiente (A=V,I=V). Esta es una **propuesta de diseño** que debe armonizarse con `CRITERIOS_V0.1.md`, cuya lógica anterior usa D y R para el conjunto completo. No declarar el acuario sano por tener valores en rango.

El grafo debe ser legible, con paleta V2, y entregarse preferentemente como fuente DOT y visualizaciones SVG, PNG y PDF. Evitar nodos superpuestos, rangos biológicos inventados y confundir límites de validación con rangos de bienestar animal.

**Lugar de implementación:** rama independiente `feature/grafo-decisiones-airi` creada desde `main` de **Airi**, después de comprobar que no exista y de recibir autorización. No escribir en `Acuario-IA`. La actividad del grafo no autoriza comenzar el desarrollo general del agente.

## 4. Desarrollo posterior por versiones

Consultar [ROADMAP.md](ROADMAP.md) y [PLAN_DESARROLLO_AIRI.md](PLAN_DESARROLLO_AIRI.md).

- **v0.1:** núcleo Python con validación, reglas del agua, alertas, recomendaciones y pruebas; inicialmente puede funcionar sin interfaz gráfica.
- **v0.2:** compatibilidad de especies.
- **v0.3:** API y página web adaptable usando la identidad V2.
- **v0.4:** historial y persistencia.
- **v0.5:** identificación por fotografías aportadas con autorización y confirmación humana.
- **v1.0:** integración y versión web estable.
- **v2.0:** aplicación móvil futura que reutilice el núcleo/API.

Las versiones son propuestas ajustables. Nuevas ideas del equipo se registran en [PROPUESTAS_EQUIPO.md](PROPUESTAS_EQUIPO.md), se evalúan y se aprueban antes de asignarlas a una versión. No presentar capacidades futuras como implementadas.

## 5. Flujo de colaboración con Claude

1. Leer el repositorio **Airi** y ambas ramas relevantes (`main` y esta rama de planificación).
2. Distinguir hechos verificados, propuestas y pendientes.
3. Revisar coherencia con requisitos, reglas, seguridad e identidad visual.
4. Presentar diagnóstico, alcance, archivos afectados y pruebas.
5. Esperar autorización para cambios.
6. Implementar en rama específica, con commits pequeños, sin modificar `main` directamente.
7. Ejecutar pruebas y verificar archivos generados; no inventar resultados.
8. Presentar evidencias y cambios para revisión del equipo.
9. Fusionar solo después de aprobación.

No hacer force push, borrar historial, eliminar recursos o fusionar repositorios. Si hay contradicciones, documentarlas y pedir decisión, no reescribirlas silenciosamente.

## 6. Pendientes explícitos

- Revisar y, si procede, incorporar las **12 reglas académicas y sus tablas de verdad** desde el documento original.
- Resolver contradicciones entre `documentacion/01_descripcion_agente.md` y el roadmap sobre cuándo se incorpora compatibilidad.
- Sustentar rangos de agua con fuentes técnicas verificables antes de usarlos como referencias definitivas.
- Alinear los criterios de datos incompletos y alertas simultáneas.
- Actualizar el README principal cuando el equipo apruebe integrar la planificación a `main`, preservando el historial y los entregables normativos.
