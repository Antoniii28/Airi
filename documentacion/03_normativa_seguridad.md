# AIRI — Investigación y normativa de seguridad

**Alcance:** investigación documental y propuesta de medidas para AIRI, no auditoría ni certificación.  
**Fuentes:** catálogos oficiales ISO, NIST y legislación mexicana. Las normas ISO completas pueden requerir compra; aquí se emplean sus descripciones y alcances públicos, sin atribuirles cláusulas no verificadas.

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

## 3. ISO/IEC 27701:2025 — Gestión de información de privacidad
**Objetivo:** requisitos y orientación para un sistema de gestión de privacidad respecto de información personal identificable, por responsables y encargados de su tratamiento. La edición de 2025 es una norma de sistema de gestión independiente.

**Relación con AIRI:** una fotografía de un pez no es necesariamente dato personal, pero podría mostrar rostros, personas, etiquetas con nombres, ubicaciones u otros identificadores; también podrían existir cuentas de usuarios.

**Medidas propuestas:**
- Solicitar solo los datos necesarios y explicar finalidad.
- Evitar capturar personas u objetos identificables cuando no se requieran.
- Definir conservación, eliminación, destinatarios y posible procesamiento por terceros antes del despliegue.
- Permitir al usuario gestionar sus imágenes y registros conforme a las obligaciones aplicables.
- No reutilizar fotografías para entrenar modelos sin base jurídica y comunicación apropiada.

**Justificación:** prevenir tratamiento excesivo de datos personales. Su aplicabilidad depende del diseño final y de si se tratan datos personales.

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
