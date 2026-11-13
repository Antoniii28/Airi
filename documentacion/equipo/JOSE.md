# José — Motor del agua y coordinación técnica

**Rama asignada:** `equipo/jose-motor-agente` (comprobar que existe).  
**Objetivo exclusivo:** mejorar la calidad, trazabilidad y pruebas del motor de evaluación de parámetros del agua. Coordinar contratos y revisar integración.

## Revisar primero
`motor/`, `motor/REFERENCIAS.md`, `interfaz/motor/`, `grafo/`, pruebas Python/JS y casos de conformidad. Confirmar qué ya está implementado; no rehacer el motor.

## Tareas concretas
1. Inventariar parámetros, unidades, referencias verificadas, referencias pendientes y comportamiento actual.
2. Revisar las rutas de decisión: mediciones inválidas, faltantes, sin referencia, anomalías simples y múltiples, alertas más información insuficiente.
3. Proponer correcciones solo cuando haya evidencia de fallo o referencia verificable. Conservar clasificación y paridad Python/JavaScript.
4. Añadir o actualizar pruebas de regresión y trazabilidad (regla aplicada, motivo, fuente, incertidumbre).
5. Acordar con Paola cómo se consume el resultado actual; revisar PR de los demás para evitar conflictos.

## Archivos permitidos
`motor/`, `interfaz/motor/`, `grafo/` y documentación técnica directamente relacionada. Cambios fuera de esas rutas requieren acuerdo.

## Entregables verificables
- Lista breve de reglas revisadas, fuentes y límites.
- PR con mejoras justificadas y pruebas ejecutadas (incluyendo paridad Python/JS cuando aplique).
- Contrato de salida documentado para Paola y revisión de integración.

**Primer PR:** 22 nov. **Integración:** 23–29 nov, según cronograma oficial.

**No hacer:** fichas/fotos, compatibilidad entre especies, rediseño de interfaz, cambios en `publico/` o despliegue. No declarar «seguro» el acuario con datos insuficientes.
