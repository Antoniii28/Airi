# AIRI — Plan de desarrollo evolutivo

**Estado:** propuesta para revisión del equipo. **Prioridad:** versión 0.1.

## Propósito
AIRI (Agente Inteligente para la Supervisión y Gestión de un Acuario Marino) busca analizar información del acuario, detectar anomalías, evaluar compatibilidad de especies y ofrecer recomendaciones explicables. La identificación de peces por fotografía se considera futura. No ejecutará acciones físicas automáticas.

## Fuentes internas y precedencia
Antes de implementar, leer la documentación ya existente en `documentacion/`, especialmente `01_descripcion_agente.md`, `02_normativa_basica.md`, `03_normativa_seguridad.md`, `04_fundamentacion.md` y `referencias.md`. Revisar asimismo la documentación de reglas, tablas de verdad e `identidad-visual/` si están disponibles. **Este plan no sustituye ni modifica esos documentos.** Si hay contradicciones, registrarlas y pedir una decisión al equipo.

## Principios
- Desarrollo incremental: una versión comprobable antes de ampliar el alcance.
- Separar motor de reglas, entrada/salida y futuras interfaces.
- La primera versión puede ejecutarse sin web ni app móvil.
- Página web funcional como objetivo posterior; aplicación móvil en una etapa futura, ambas reutilizando la lógica del agente mediante una API cuando corresponda.
- No inventar rangos biológicos, fuentes ni resultados de pruebas. Diferenciar datos simulados y reales.
- No atribuir certificaciones ISO al proyecto.
- Mantener compatibilidad con trabajo existente y evitar cambios destructivos.

## Arquitectura conceptual (sujeta a diagnóstico)
1. **Núcleo Python:** validación, reglas, resultados y explicaciones.
2. **Conocimiento/configuración:** rangos y criterios documentados, con procedencia verificable.
3. **Servicios/API futura:** acceso al núcleo sin duplicar reglas.
4. **Web futura:** panel, entradas, alertas y compatibilidad.
5. **Persistencia futura:** acuarios, especies y mediciones.
6. **Visión futura:** fotografías elegidas/autorizadas, incertidumbre y confirmación humana.
7. **App móvil futura:** cliente de la misma API.

No elegir frameworks ni crear módulos vacíos antes de revisar el código actual.

## Forma de trabajo
1. Diagnóstico de repositorio y coherencia documental.
2. Plan de tareas y criterios de aceptación de v0.1.
3. Autorización del equipo.
4. Implementación en rama de desarrollo, cambios pequeños.
5. Pruebas y revisión.
6. Documentación de resultados, pendientes y propuestas.
7. Aprobación de la siguiente versión.

## Control de cambios
No modificar `main` directamente sin aprobación. No hacer force push, eliminar recursos previos ni afirmar que un módulo existe solo porque está documentado. Mantener versiones previas mediante Git; etiquetar versiones solo cuando estén verificadas y autorizadas.

## Alcance inmediato
Únicamente **diagnosticar y planificar AIRI v0.1**. La implementación requiere aprobación posterior. Véase [criterios v0.1](CRITERIOS_V0.1.md), [roadmap](ROADMAP.md) y [propuestas](PROPUESTAS_EQUIPO.md).

## Repositorio y actividad prioritaria (acuerdo actualizado)

**Único repositorio oficial de AIRI:** `Antoniii28/Airi`, para documentación y desarrollo. `Antoniii28/Acuario-IA` corresponde a una actividad anterior independiente; no usarlo como destino de implementación ni modificarlo. Antes de iniciar v0.1, completar la actividad académica del grafo de decisiones en una rama independiente de `Airi`, con la identidad visual V2 y sin sobrescribir recursos existentes. Véase [organización y flujo de trabajo](ORGANIZACION_Y_FLUJO_TRABAJO.md). Esta actualización aclara la organización, no autoriza por sí sola cambios de código ni la fusión de ramas.
