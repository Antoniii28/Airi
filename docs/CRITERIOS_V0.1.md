# AIRI v0.1 — Alcance y criterios de aceptación

**Estado:** propuesta pendiente de diagnóstico y aprobación. No es evidencia de implementación.

## Objetivo
Demostrar un núcleo de AIRI basado en reglas capaz de evaluar **datos del agua**, detectar anomalías y explicar resultados sin depender de una interfaz web o móvil.

## Funcionalidades mínimas
1. Recibir datos manuales o simulados de temperatura, pH, salinidad, amoníaco, nitritos y nitratos.
2. Validar presencia, formato, unidades y rangos de entrada razonables; distinguir dato ausente de dato fuera del rango biológico.
3. Aplicar reglas documentadas y configuración de rangos trazable.
4. Informar parámetros evaluados dentro de rango, sin garantizar la salud total del acuario.
5. Generar alertas cuando una medición válida esté fuera de rango, identificando parámetro, valor y referencia utilizada.
6. Solicitar correcciones o datos adicionales cuando la información sea insuficiente.
7. Proporcionar recomendaciones informativas explicables, con límites claros.
8. Probar el comportamiento y documentar cómo ejecutar la versión.

## Lógica mínima
- D = datos válidos y suficientes.
- R = parámetros evaluados dentro de rangos documentados.
- A = alerta; N = informe en rango; I = información insuficiente.
- A = D ∧ ¬R; N = D ∧ R; I = ¬D.

Cuando D es falso, **R no es evaluable**: no afirmar normalidad ni anomalía. No reemplazar información desconocida por Falso en el dominio de negocio.

## Pruebas necesarias
| ID | Caso | Resultado esperado |
|---|---|---|
| T01 | Falta un dato obligatorio | Información insuficiente, sin evaluación definitiva |
| T02 | Unidad incorrecta o valor mal formado | Error de validación comprensible |
| T03 | Datos completos dentro de rangos configurados | Informe en rango con referencia |
| T04 | Una medición válida fuera de rango | Alerta explicada y parámetro identificado |
| T05 | Varias mediciones fuera de rango | Reportar cada anomalía pertinente |
| T06 | No hay configuración biológica fundamentada | No emitir conclusión biológica definitiva |
| T07 | Entrada simulada | Identificarla claramente como simulación |
| T08 | Solicitud de modificar dispositivo físico | No ejecutar acciones físicas |

## Criterios para considerar terminada v0.1
- Instrucciones reproducibles de instalación y ejecución.
- Entrada y salida definidas y demostrables.
- Validaciones y reglas con pruebas automatizadas que realmente se hayan ejecutado.
- Alertas y resultados explicables, sin rangos inventados.
- Documentación coherente con el código.
- Sin funciones futuras presentadas como terminadas.
- Revisión y aprobación explícita del equipo.

## Fuera de alcance de v0.1
Interfaz web completa, aplicación móvil, sensores físicos, actuadores, base de datos de producción, compatibilidad exhaustiva de especies y reconocimiento visual.

## Antes de programar
Revisar el estado real del repositorio, el código y las reglas existentes; proponer arquitectura mínima y resolver decisiones pendientes. No asumir que la planificación equivale a autorización de implementación.
