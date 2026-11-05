# AIRI — Descripción y alcance del agente

**Proyecto:** AIRI — Agente Inteligente para la Supervisión y Gestión de un Acuario Marino  
**Estado:** Propuesta académica; no se declara ninguna función implementada o probada.

## 1. Descripción
AIRI es un agente inteligente propuesto para supervisar condiciones de un acuario marino, evaluar riesgos de convivencia entre especies y, como capacidad planificada, reconocer especies de peces a partir de fotografías. El análisis de parámetros y compatibilidad se plantea inicialmente mediante reglas lógicas; el reconocimiento visual requerirá un componente de visión por computadora o un modelo de IA que todavía debe seleccionarse, desarrollarse y evaluarse.

AIRI no es principalmente un chatbot ni ejecuta intervenciones físicas autónomas.

## 2. Objetivo
Diseñar un agente que analice parámetros del agua, evalúe compatibilidad entre especies y permita en una etapa posterior identificar especies mediante fotografías proporcionadas por el usuario, para ofrecer información, alertas y recomendaciones prudentes con supervisión humana.

## 3. Entradas previstas
**Supervisión del agua:** temperatura (°C), pH, salinidad (ppt), amoníaco, nitritos y nitratos (mg/L, especificando método y especie química cuando corresponda).

**Compatibilidad:** especies presentes y candidata, volumen y dimensiones del acuario, cantidad y tamaño de ejemplares, refugios y condiciones ambientales.

**Reconocimiento visual planificado:** fotografía tomada expresamente por el usuario o archivo de imagen seleccionado por él. No se plantea vigilancia continua ni transmisión permanente de video.

## 4. Funciones propuestas para la primera versión
1. Recibir y validar parámetros simulados o introducidos manualmente.
2. Comparar los valores con rangos de referencia configurables y fundamentados.
3. Detectar una o varias anomalías simultáneas.
4. Consultar fichas de especies de una base inicial.
5. Evaluar compatibilidad considerando comportamiento, ambiente, alimentación, tamaño, territorio y compatibilidad con arrecifes.
6. Clasificar resultados como COMPATIBLE, PRECAUCIÓN, INCOMPATIBLE o INFORMACIÓN INSUFICIENTE, explicando los motivos.
7. Generar alertas y recomendaciones sin ejecutar intervenciones físicas.

## 5. Módulo de reconocimiento visual planificado (etapa posterior)
1. El usuario captura una fotografía o selecciona una imagen.
2. Con autorización, AIRI procesa la imagen para sugerir una o varias especies probables.
3. Muestra nombre común y científico, cuando la identificación esté suficientemente respaldada, y consulta la base de conocimientos.
4. Advierte cuando la imagen es insuficiente o hay especies visualmente parecidas; no presenta la identificación como infalible.
5. Solicita confirmación antes de incorporar una especie al registro del acuario.

**Análisis «en tiempo real»** significa responder tras recibir una fotografía, no analizar un video continuo. Todavía no se ha elegido ni implementado el modelo de visión, por lo que no se promete precisión ni latencia específica.

## 6. Permisos y tratamiento de datos previstos
- La cámara solo se solicitará al capturar una fotografía, con autorización explícita del usuario y conforme a los permisos del dispositivo.
- Para subir una imagen, el usuario elegirá el archivo; no se requiere acceso general a su galería.
- No se activará la cámara en segundo plano ni se capturará video continuo.
- Las imágenes se usarán para la finalidad informada. Se deberá definir antes de implementar si se procesan localmente o mediante un proveedor externo, así como su conservación y eliminación.
- No se solicitarán datos personales innecesarios. Si aparecen personas o datos identificables en fotografías, se aplicarán medidas de minimización y protección.
- Se deberán proteger los registros frente a accesos no autorizados y alteraciones.

## 7. Restricciones y límites
- Sin sensores físicos en la primera versión.
- Sin control de bombas, calentadores, dosificadores u otros equipos.
- Sin ajustes automáticos del agua ni autorización automática para introducir animales.
- Sin conclusiones de compatibilidad o identificación cuando falten datos suficientes.
- Sin acceso a cámara, imágenes o registros sin la autorización correspondiente.
- AIRI no sustituye el criterio de una persona con experiencia en acuarios marinos.
- Ninguna capacidad se declarará implementada o validada hasta comprobarlo.

## 8. Flujos previstos
**Agua:** Entrada → Validación → Reglas → Clasificación → Alerta/recomendación.

**Compatibilidad:** Registro del acuario → Consulta de especies → Evaluación de criterios → Resultado explicado.

**Imagen (futuro):** Fotografía autorizada → Análisis visual → Identificación probable o incertidumbre → Confirmación humana → Consulta de ficha y posible evaluación de compatibilidad.

## 9. Etapas y alcance
- **Primera versión:** datos simulados, supervisión del agua mediante reglas, base inicial de especies, evaluación de compatibilidad y alertas.
- **Etapa posterior:** captura o carga de fotografías y reconocimiento visual, sujeto a validación técnica y medidas de privacidad; interfaz e historial según las necesidades del proyecto.
- **Futuro:** sensores físicos, monitoreo continuo de parámetros, modelos predictivos y automatización supervisada.

La presente actividad académica se concentra en la **normativa de funcionamiento y seguridad**, no en desarrollar todavía estos módulos.

## 10. Referencias normativas que se investigarán
- **ISO/IEC 27001:2022:** sistema de gestión de seguridad de la información y controles basados en riesgos.
- **ISO/IEC 42001:2023:** sistema de gestión de inteligencia artificial.
- **ISO/IEC 27701:2025:** gestión de información de privacidad, si el tratamiento de datos personales lo justifica.
- **ISO/IEC 23894:2023:** orientación para gestión de riesgos de IA.

Estas referencias **no implican certificación ni cumplimiento demostrado**. Su pertinencia y aplicación específica deberán fundamentarse en documentos posteriores.

## 11. Relación con la actividad
Este alcance servirá para redactar la normativa funcional (capacidades, permisos y prohibiciones) y la normativa de seguridad (autorización, confidencialidad, integridad, protección de imágenes y registros), justificando cada regla.

## Referencia conceptual
Russell, S. y Norvig, P., *Artificial Intelligence: A Modern Approach*, 4.ª ed., cap. 2, «Intelligent Agents»: https://aima.cs.berkeley.edu/4th-ed/pdfs/newchap02.pdf
