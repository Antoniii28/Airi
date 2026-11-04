# AIRI — Descripción y alcance del agente

**Proyecto:** AIRI — Agente Inteligente para la Supervisión y Gestión de un Acuario Marino  
**Estado:** Propuesta académica; funciones pendientes de implementación y pruebas.

## 1. Descripción
AIRI es un agente inteligente propuesto para analizar condiciones de un acuario marino y evaluar posibles riesgos de convivencia entre especies. En su primera versión se plantea como un sistema basado en reglas lógicas, sin aprendizaje automático ni sensores físicos.

## 2. Objetivo
Supervisar parámetros del agua y evaluar compatibilidad entre especies con información proporcionada por el usuario o simulada, para generar alertas, explicaciones y recomendaciones prudentes.

## 3. Entradas previstas
- Temperatura del agua (°C).
- pH.
- Salinidad (ppt).
- Amoníaco, nitritos y nitratos (mg/L, con aclaración del método y especie química cuando corresponda).
- Especies presentes y especie candidata.
- Volumen y dimensiones del acuario, cantidad de ejemplares y refugios disponibles para evaluar convivencia.

## 4. Funciones propuestas para la primera versión
1. Recibir y validar datos simulados o introducidos manualmente.
2. Comparar parámetros con rangos de referencia configurables y fundamentados.
3. Detectar y comunicar una o varias anomalías simultáneas.
4. Consultar fichas de especies de una base inicial.
5. Evaluar compatibilidad según comportamiento, ambiente, alimentación, tamaño, territorio y relación con arrecifes.
6. Clasificar resultados como COMPATIBLE, PRECAUCIÓN, INCOMPATIBLE o INFORMACIÓN INSUFICIENTE, explicando los motivos.
7. Generar alertas y recomendaciones sin ejecutar intervenciones físicas.

## 5. Restricciones y límites
- AIRI no medirá el agua mediante sensores físicos en la primera versión.
- No controlará bombas, calentadores, dosificadores ni otros equipos.
- No modificará parámetros del agua ni autorizará automáticamente introducir animales.
- No afirmará compatibilidad cuando falten datos relevantes.
- No reemplazará la evaluación de una persona con experiencia en acuarios marinos.
- No se afirmará que una función está implementada o probada hasta verificarlo.

## 6. Flujo de operación propuesto
**Entrada → Validación → Análisis de reglas y conocimientos → Clasificación → Alerta/recomendación → Nueva evaluación cuando se aporten datos.**

## 7. Alcance posterior (fuera de esta actividad)
Interfaz gráfica, historial persistente, sensores físicos, monitorización en tiempo real, modelos predictivos y automatización supervisada. No forman parte de la primera versión ni de la normativa solicitada actualmente.

## 8. Relación con la actividad
Este documento define el alcance necesario para redactar a continuación la normativa funcional (funciones, permisos y restricciones) y la normativa de seguridad (acceso autorizado, integridad, confidencialidad y protección de registros).

## Referencia conceptual
Russell, S. y Norvig, P., *Artificial Intelligence: A Modern Approach*, 4.ª ed., cap. 2, «Intelligent Agents»: https://aima.cs.berkeley.edu/4th-ed/pdfs/newchap02.pdf
