# AIRI — Normativa funcional y de seguridad

**Documento integrado para revisión académica**  
**Estado:** propuesta fundamentada; no equivale a certificación ni implementación probada.

## Índice
1. Descripción y alcance
2. Normativa básica o funcional
3. Investigación y normativa de seguridad
4. Fundamentación
5. Fuentes consultadas

---

# 1. Descripción y alcance

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

## 10. Referencias normativas investigadas
- **Principales:** ISO/IEC 27001:2022 (gestión de seguridad de la información) e ISO/IEC 42001:2023 (gestión de IA).
- **Complementaria:** ISO/IEC 23894:2023 (orientación para riesgos de IA) y NIST AI RMF 1.0.
- **Condicional:** ISO/IEC 27701:2025 (privacidad), pertinente si se tratan datos personales identificables.

Su investigación, pertinencia y aplicación propuesta están documentadas en [normativa de seguridad](03_normativa_seguridad.md), [fundamentación](04_fundamentacion.md) y [referencias](referencias.md). **No implican certificación ni cumplimiento demostrado**.

## 11. Relación con la actividad
Este alcance servirá para redactar la normativa funcional (capacidades, permisos y prohibiciones) y la normativa de seguridad (autorización, confidencialidad, integridad, protección de imágenes y registros), justificando cada regla.

## Referencia conceptual
Russell, S. y Norvig, P., *Artificial Intelligence: A Modern Approach*, 4.ª ed., cap. 2, «Intelligent Agents»: https://aima.cs.berkeley.edu/4th-ed/pdfs/newchap02.pdf

---

# 2. Normativa básica o funcional

**Estado:** normativa propuesta para el diseño académico; no representa funcionalidades ya implementadas.  
**Objeto:** definir capacidades, permisos, prohibiciones y responsabilidades del agente AIRI.

## 1. Alcance
AIRI está diseñado para (a) supervisar parámetros de un acuario marino a partir de datos manuales o simulados; (b) evaluar compatibilidad entre especies según información disponible; y (c) en una etapa posterior, sugerir la identificación de peces mediante fotografías aportadas por el usuario. No realizará ajustes físicos autónomos.

## 2. Reglas funcionales
| Código | Regla propuesta | Justificación |
|---|---|---|
| F-01 | AIRI solo analizará información ingresada por el usuario, datos simulados o imágenes expresamente seleccionadas/capturadas. | Limitar la recopilación a la finalidad del agente. |
| F-02 | Validará unidades, valores plausibles, datos faltantes y vigencia de las mediciones antes de evaluar el agua. | Evitar alertas engañosas por entradas incorrectas. |
| F-03 | Identificará anomalías con reglas y rangos de referencia documentados, configurables según el tipo de acuario y las especies. | No existe un rango universal seguro para todos los acuarios. |
| F-04 | Explicará los parámetros que originaron cada alerta y no ocultará datos insuficientes o contradictorios. | Permitir la revisión humana. |
| F-05 | Evaluará compatibilidad considerando condiciones del agua, volumen, tamaño, conducta, territorialidad, alimentación y requisitos particulares de especies. | La convivencia no depende de un solo atributo. |
| F-06 | Si la evidencia es insuficiente, mostrará «INFORMACIÓN INSUFICIENTE» y solicitará datos pertinentes. | Evitar conclusiones no sustentadas. |
| F-07 | En el módulo visual futuro, la imagen se procesará únicamente después de la acción y autorización del usuario. | Respetar el control sobre la cámara y los archivos. |
| F-08 | La identificación visual se presentará como probable y podrá incluir alternativas o indicar que no es posible identificar la especie. | Reconocer las limitaciones del modelo. |
| F-09 | El usuario deberá confirmar la especie antes de incorporarla al registro del acuario. | Evitar que una identificación equivocada afecte decisiones posteriores. |
| F-10 | Las recomendaciones serán informativas; ninguna acción física o introducción de animales se ejecutará automáticamente. | Proteger a los organismos y mantener supervisión humana. |
| F-11 | AIRI distinguirá funciones existentes, prototipos y funciones previstas. | Evitar declaraciones falsas sobre sus capacidades. |

## 3. Permisos
- **Datos del acuario:** autorización para utilizar parámetros y especies que el usuario introduzca voluntariamente.
- **Cámara (módulo futuro):** permiso explícito del dispositivo al tomar una fotografía; sin activación automática o permanente.
- **Galería/archivos:** selección individual de la fotografía; no acceso general a la galería cuando no sea necesario.
- **Almacenamiento:** definir y comunicar previamente si se guardarán fotografías, resultados e historial; permitir eliminación cuando corresponda.
- **Servicios externos:** antes de transmitir imágenes a un proveedor de IA, informar qué datos se enviarán y bajo qué condiciones.
- **Administración:** limitar funciones de modificación de registros y configuración a usuarios autorizados.

## 4. Acciones prohibidas
AIRI no podrá: encender la cámara sin autorización; capturar video continuo bajo la función de fotografías; extraer archivos ajenos a la selección del usuario; publicar o compartir imágenes sin autorización; inventar identificaciones concluyentes; modificar equipos del acuario; garantizar la supervivencia o compatibilidad de organismos; ni ocultar errores conocidos.

## 5. Responsabilidades
- **Desarrolladores:** documentar reglas, fuentes, límites, pruebas y cambios; proteger datos; corregir fallos.
- **Usuario:** proporcionar datos adecuados, revisar resultados y decidir sobre intervenciones físicas.
- **Agente:** presentar resultados explicables y límites de confianza; solicitar confirmación cuando sea necesario. AIRI no tiene responsabilidad jurídica independiente.

## 6. Criterios de aceptación para una futura implementación
1. Una imagen no seleccionada por el usuario nunca se procesa.
2. La denegación de acceso a la cámara no bloquea las funciones que no la necesitan.
3. Un valor faltante o una especie dudosa genera aviso de incertidumbre.
4. Ninguna identificación se guarda como definitiva sin confirmación.
5. Las alertas explican qué entradas y reglas se utilizaron.
6. El agente no envía comandos a dispositivos físicos.

## 7. Fundamentación
Las reglas de autorización, limitación de acceso y seguridad se inspiran principalmente en la gestión de riesgos de ISO/IEC 27001:2022. ISO/IEC 27701:2025 es una referencia adicional únicamente si AIRI llega a tratar información personal identificable. La transparencia, supervisión y validación del componente visual se fundamentan en los enfoques de gestión responsable y riesgos de ISO/IEC 42001:2023 e ISO/IEC 23894:2023. Estas son **decisiones de diseño propuestas**, no citas literales de obligaciones técnicas impuestas por dichas normas.

**Fuentes oficiales:** https://www.iso.org/es/norma/27001 · https://www.iso.org/standard/42001 · https://www.iso.org/standard/27701 · https://www.iso.org/es/contents/data/standard/07/73/77304.html

Véanse también [normativa de seguridad](03_normativa_seguridad.md), [fundamentación](04_fundamentacion.md) y [referencias](referencias.md).

---

# 3. Investigación y normativa de seguridad

**Alcance:** investigación documental y propuesta de medidas para AIRI, no auditoría ni certificación.  
**Fuentes:** catálogos oficiales ISO, NIST y legislación mexicana. Las normas ISO completas pueden requerir compra; aquí se emplean sus descripciones y alcances públicos, sin atribuirles cláusulas no verificadas.

## Clasificación para el proyecto

**Principales:** ISO/IEC 27001 e ISO/IEC 42001. **Complementarias:** ISO/IEC 23894 y NIST AI RMF. **Condicional:** ISO/IEC 27701 si se tratan datos personales. Esta clasificación responde a la pertinencia para AIRI, no a una jerarquía oficial.

## 1. ISO/IEC 27001:2022 — Seguridad de la información
**Objetivo:** establecer, implementar, mantener y mejorar un sistema de gestión de seguridad de la información (SGSI) para tratar riesgos. La información debe protegerse respecto a confidencialidad, integridad y disponibilidad.

**Relación con AIRI:** los parámetros del agua, especies registradas, resultados, imágenes y configuraciones podrían almacenarse o transmitirse. La manipulación o exposición no autorizada afectaría la privacidad o produciría recomendaciones erróneas.

**Medidas propuestas:**
- Acceso autorizado a registros y configuración, con privilegios mínimos.
- Conexiones cifradas (HTTPS/TLS) si se transmiten datos; protección adecuada del almacenamiento.
- Validación de entradas, copias de seguridad cuando exista persistencia y registro de cambios relevantes.
- Actualizaciones de dependencias, gestión de incidentes y revisión periódica de riesgos.
- No guardar claves o credenciales en repositorios.

**Justificación:** estas medidas ayudan a proteger confidencialidad, integridad y disponibilidad. No se afirma que cada medida sea una obligación textual específica de la norma ni que el proyecto tenga un SGSI certificado.

Fuente: https://www.iso.org/es/norma/27001

## 2. ISO/IEC 42001:2023 — Sistema de gestión de IA
**Objetivo:** establecer y mejorar un sistema de gestión para el desarrollo o uso responsable de IA, considerando riesgos, oportunidades, gobernanza y transparencia.

**Relación con AIRI:** el módulo visual podría confundir especies similares; las recomendaciones podrían interpretarse como órdenes seguras.

**Medidas propuestas:**
- Documentar finalidad, datos de entrenamiento o proveedor del modelo, versión y limitaciones.
- Probar identificaciones con fotografías representativas y especies visualmente similares.
- Informar que la especie sugerida es probable y admitir «no identificable».
- Exigir confirmación humana antes de registrar especies o actuar.
- Revisar errores reportados y actualizar fichas y reglas con trazabilidad.

**Justificación:** facilita un uso responsable y controlable de IA. No se declara cumplimiento integral del sistema de gestión.

Fuente: https://www.iso.org/standard/42001

## 3. ISO/IEC 27701:2025 — Gestión de información de privacidad (referencia complementaria y condicional)
**Objetivo:** requisitos y orientación para un sistema de gestión de privacidad respecto de información personal identificable, por responsables y encargados de su tratamiento. La edición de 2025 es una norma de sistema de gestión independiente.

**Evaluación de pertinencia:** los datos de calidad del agua, nombres de especies y fotografías exclusivamente de peces no son por sí mismos información personal identificable. Esta norma solo se considera especialmente pertinente si AIRI incorpora cuentas con datos identificables, imágenes de personas identificables u otros tratamientos de datos personales. No se exige adoptar un sistema de gestión de privacidad completo para el prototipo académico.

**Relación con AIRI:** una fotografía de un pez no es necesariamente dato personal, pero podría mostrar rostros, personas, etiquetas con nombres, ubicaciones u otros identificadores; también podrían existir cuentas de usuarios.

**Medidas propuestas:**
- Solicitar solo los datos necesarios y explicar finalidad.
- Evitar capturar personas u objetos identificables cuando no se requieran.
- Definir conservación, eliminación, destinatarios y posible procesamiento por terceros antes del despliegue.
- Permitir al usuario gestionar sus imágenes y registros conforme a las obligaciones aplicables.
- No reutilizar fotografías para entrenar modelos sin base jurídica y comunicación apropiada.

**Justificación:** prevenir tratamiento excesivo de datos personales cuando corresponda. **Decisión:** mantener ISO/IEC 27701 como referencia complementaria condicionada, no como requisito principal del proyecto. Su pertinencia depende del diseño final y de si se tratan datos personales.

Fuente: https://www.iso.org/standard/27701

## 4. ISO/IEC 23894:2023 — Gestión de riesgos de IA
**Objetivo:** ofrecer orientación para integrar la gestión de riesgos relacionados específicamente con IA en organizaciones que la desarrollan o utilizan.

**Relación con AIRI:** los riesgos incluyen identificación equivocada de especies, imágenes de baja calidad, datos insuficientes, fichas desactualizadas y confianza excesiva en recomendaciones.

**Medidas propuestas:**
- Identificar riesgos y evaluar probabilidad e impacto antes del despliegue.
- Reducir riesgos mediante validación, avisos de incertidumbre y confirmación humana.
- Medir errores en pruebas y revisar el desempeño al cambiar modelo o base de especies.
- Documentar riesgos residuales y casos donde AIRI no puede decidir.

Fuente: https://www.iso.org/es/contents/data/standard/07/73/77304.html

## 5. Marco complementario NIST AI RMF 1.0 (2023)
Marco voluntario de gestión de riesgos de IA organizado en cuatro funciones: **GOVERN, MAP, MEASURE y MANAGE**. Para AIRI implica definir responsabilidades, identificar errores posibles, medir resultados y gestionar mejoras. No es una norma ISO ni una certificación.

Fuente: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10

## 6. Legislación mexicana: LFPDPPP
La **Ley Federal de Protección de Datos Personales en Posesión de los Particulares**, publicada el 20 de marzo de 2025 y con reforma consultada de 14 de noviembre de 2025, regula el tratamiento de datos personales por particulares dentro de su ámbito de aplicación. Contempla una excepción para recolección y almacenamiento exclusivamente personales sin divulgación o utilización comercial (art. 1). La aplicación concreta a AIRI dependerá de quién lo opere, qué datos trate y para qué finalidad.

**Decisión para AIRI:** antes de un despliegue con cuentas o fotografías identificables, determinar si se requiere aviso de privacidad, bases de tratamiento, medidas de seguridad y procedimientos para derechos de titulares. No se presume que toda foto de pez sea dato personal ni que la excepción personal cubra un servicio ofrecido a terceros.

Fuente oficial: https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf

## 7. Política de seguridad propuesta para AIRI
| Código | Medida | Riesgo mitigado | Evidencia futura |
|---|---|---|---|
| S-01 | Cámara solo por acción y autorización del usuario | Captura no consentida | Prueba de permisos |
| S-02 | Selección individual de fotografías | Acceso excesivo | Prueba de selector de archivos |
| S-03 | Informar destino de imágenes y proveedor externo, si existe | Uso no informado | Política de tratamiento |
| S-04 | Definir plazo de retención y mecanismo de eliminación | Acumulación innecesaria | Configuración y prueba de borrado |
| S-05 | Restringir acceso a registros y configuración | Divulgación o modificación indebida | Pruebas de autorización |
| S-06 | Cifrar datos en tránsito cuando exista red | Intercepción | Revisión HTTPS/TLS |
| S-07 | Validar valores y procedencia de datos | Alertas erróneas | Casos de prueba |
| S-08 | Mostrar incertidumbre de identificaciones | Falsa seguridad | Evaluación con imágenes difíciles |
| S-09 | Confirmación humana de especie y decisiones | Error automatizado | Pruebas de flujo |
| S-10 | Documentar cambios, incidentes y límites | Fallos repetidos | Registro de versiones e incidencias |
| S-11 | Evitar credenciales y datos reales sensibles en GitHub | Exposición accidental | Revisión del repositorio |
| S-12 | Restringir formatos/tamaño de imágenes y procesarlas de forma segura | Archivos maliciosos o consumo excesivo | Pruebas de carga |

Estas son **reglas propuestas para el proyecto** basadas en los objetivos de las referencias, no transcripciones de controles normativos.

## 8. Límites de esta investigación
- Se verificó el alcance público de las normas, no el texto íntegro de sus requisitos.
- Las obligaciones legales dependen de las características reales del servicio y deben revisarse antes de publicarlo.
- AIRI no cuenta todavía con evidencias de implementación, pruebas, auditoría o certificación.
- Las recomendaciones de acuario requieren fuentes biológicas especializadas y validación aparte; las normas de seguridad no establecen rangos adecuados para peces.

Referencias completas: `referencias.md`.

---

# 4. Fundamentación de decisiones

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

---

# 5. Referencias

**Criterio de selección:** documentos oficiales de los organismos emisores y legislación publicada por una fuente institucional. Consulta realizada el 4 de noviembre de 2026.

1. International Organization for Standardization (ISO). (2022). **ISO/IEC 27001:2022**, *Information security, cybersecurity and privacy protection — Information security management systems — Requirements*. https://www.iso.org/es/norma/27001  
   Fuente oficial del alcance del sistema de gestión de seguridad de la información. ISO también registra una enmienda de 2024.

2. ISO. (2023). **ISO/IEC 42001:2023**, *Information technology — Artificial intelligence — Management system*. https://www.iso.org/standard/42001  
   Fuente oficial de la norma sobre sistemas de gestión de IA.

3. ISO. (2025). **ISO/IEC 27701:2025**, *Information security, cybersecurity and privacy protection — Privacy information management systems — Requirements and guidance*. https://www.iso.org/standard/27701  
   Fuente oficial de la segunda edición; sustituye a la edición de 2019.

4. ISO. (2023). **ISO/IEC 23894:2023**, *Information technology — Artificial intelligence — Guidance on risk management*. https://www.iso.org/es/contents/data/standard/07/73/77304.html  
   Fuente oficial de orientación para gestionar riesgos de IA.

5. National Institute of Standards and Technology (NIST). (2023). **Artificial Intelligence Risk Management Framework (AI RMF 1.0)**, NIST AI 100-1. https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10  
   Marco voluntario para la gestión de riesgos de IA.

6. Cámara de Diputados del H. Congreso de la Unión. (2025). **Ley Federal de Protección de Datos Personales en Posesión de los Particulares**. Nueva ley publicada el 20 de marzo de 2025; última reforma indicada en el texto consultado: 14 de noviembre de 2025. https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf  
   Fuente oficial del texto legal mexicano.

7. Russell, S., y Norvig, P. (2021). *Artificial Intelligence: A Modern Approach* (4.ª ed.), cap. 2, «Intelligent Agents». https://aima.cs.berkeley.edu/4th-ed/pdfs/newchap02.pdf  
   Referencia conceptual del funcionamiento de agentes inteligentes.

## Clasificación para AIRI
**Principales:** referencias 1 y 2. **Complementarias:** referencias 4 y 5. **Condicionales al tratamiento de datos personales:** referencias 3 y 6. **Conceptual:** referencia 7.

La selección no implica que todas las normas resulten jurídicamente obligatorias para AIRI.

## Nota metodológica
Las fichas oficiales de ISO permiten verificar la existencia, edición y finalidad de las normas, pero **no equivalen a consultar íntegramente el contenido de pago**. Por ello, los documentos del proyecto no atribuyen a números de cláusulas concretos obligaciones que no se hayan contrastado en el texto normativo completo. Tampoco afirman que AIRI esté certificado o auditado.

Las normas sobre seguridad y gestión de IA no sustituyen referencias científicas de acuariofilia marina; los rangos ambientales y fichas de especies deberán sustentarse por separado antes de su implementación.