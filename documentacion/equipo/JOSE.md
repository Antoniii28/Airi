# José — Motor inteligente y coordinación

**Rama:** `equipo/jose-motor-agente`  
**Objetivo:** mejorar el análisis de parámetros del agua, reglas, clasificación de riesgos y recomendaciones sin romper el piloto publicado.

## Punto de partida
Revisar `motor/`, `interfaz/motor/`, `grafo/`, sus README y pruebas. Reutilizar el motor existente y verificar su paridad Python/JavaScript.

## Actividades
1. Identificar qué reglas y referencias están verificadas y cuáles carecen de sustento.
2. Revisar que faltantes, anomalías múltiples y referencias insuficientes conserven su estado correctamente.
3. Mejorar trazabilidad: mostrar regla aplicada, fuente y motivo de alerta.
4. Coordinar contrato de datos con Brayan y Yair y puntos de integración con Paola.
5. Añadir casos de prueba y revisar PR del equipo.

## Entrega
Cambios probados en motor y documentación breve de reglas y limitaciones. Primer PR revisable **22 nov**; integración **23–29 nov**.

## Restricciones
No sustituir reglas por respuestas generativas no verificadas. No alterar secretos, acceso o Worker de producción. Evitar prometer seguridad del agua.
