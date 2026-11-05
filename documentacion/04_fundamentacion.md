# AIRI — Fundamentación de decisiones normativas

**Propósito:** demostrar por qué se proponen las reglas funcionales y de seguridad, vinculando riesgo, medida y referencia documental.

| Decisión de AIRI | Problema que previene | Fundamento documental | Justificación concreta |
|---|---|---|---|
| Solicitar permiso antes de usar la cámara | Captura no autorizada de imágenes | ISO/IEC 27001; ISO/IEC 27701 cuando haya datos personales; LFPDPPP según ámbito | El usuario conserva el control de qué imagen se captura y procesa. |
| Procesar solo imágenes elegidas | Acceso excesivo a archivos | ISO/IEC 27001; ISO/IEC 27701 si hay datos personales | Reduce la superficie de exposición y los datos tratados. |
| Informar si se usan servicios externos | Transmisión de imágenes no esperada | ISO/IEC 27001; ISO/IEC 27701 y legislación si hay datos personales | Permite decidir con información suficiente sobre el tratamiento. |
| Definir retención y eliminación | Conservación innecesaria | ISO/IEC 27001; ISO/IEC 27701 y LFPDPPP cuando correspondan | Limita exposición y facilita gestionar información personal cuando exista. |
| Proteger registros y transmisiones | Filtración o alteración de datos | ISO/IEC 27001 | Protege confidencialidad e integridad de entradas y resultados. |
| Validar mediciones antes de generar alertas | Recomendaciones basadas en datos inválidos | ISO/IEC 23894; NIST AI RMF | Reduce riesgos derivados de entradas incorrectas o incompletas. |
| Mostrar identificación como probable | Confundir especies parecidas | ISO/IEC 42001; ISO/IEC 23894 | Comunica incertidumbre y evita aparentar certeza inexistente. |
| Permitir «no identificable» | Forzar respuestas incorrectas | ISO/IEC 23894; NIST AI RMF | Un resultado incierto no debe convertirse en una identificación definitiva. |
| Solicitar confirmación humana | Registrar especies incorrectas o actuar sin revisión | ISO/IEC 42001; ISO/IEC 23894 | Mantiene supervisión sobre decisiones que afectan al acuario. |
| Prohibir control físico autónomo en la primera versión | Cambios de agua o equipos sin validación | ISO/IEC 23894; NIST AI RMF | Limita consecuencias mientras el sistema no esté validado. |
| Documentar fuentes, versiones y pruebas | Dificultad para explicar errores | ISO/IEC 42001; NIST AI RMF | Hace posible revisar y mejorar el comportamiento del agente. |

## Ejemplos de aplicación
**Caso 1: fotografía de un pez.** El usuario toma o selecciona la imagen. AIRI solo procesa esa fotografía; si el modelo duda entre dos especies, muestra alternativas y pide confirmación antes de actualizar el inventario. Se fundamenta en limitación de acceso, gestión de riesgos de IA y supervisión humana.

**Caso 2: medición anómala.** Si falta la unidad o el valor es implausible, AIRI no emite una recomendación categórica: señala la inconsistencia y solicita una nueva medición. Esto protege la integridad de las decisiones.

**Caso 3: fotografía con una persona al fondo.** AIRI debe evitar utilizar datos identificables no necesarios y definir cómo se gestionará la imagen. La aplicación de la ley depende del contexto real de tratamiento.

## Alcance de las afirmaciones
- **ISO/IEC 27001** y **42001** establecen requisitos para sistemas de gestión organizacionales, no certifican por sí solas un programa.
- **ISO/IEC 27701** se centra en la gestión de privacidad de información personal identificable.
- **ISO/IEC 23894** y **NIST AI RMF** orientan la gestión de riesgos.
- Las medidas de la tabla son **interpretaciones y decisiones de diseño para AIRI**: no se presentan como cláusulas literales ni como obligaciones universales.
- Las normas ISO no reemplazan el cumplimiento de la legislación aplicable.

## Conclusión
La normativa propuesta establece límites claros para AIRI, protege el acceso a imágenes y registros, reconoce la incertidumbre del reconocimiento visual y mantiene las decisiones sobre el acuario bajo control humano. Antes de implementarse deberá traducirse en pruebas, documentación técnica y políticas de tratamiento reales.

**Fuentes consultadas:** véase [referencias.md](referencias.md).
