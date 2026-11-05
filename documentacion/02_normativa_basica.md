# AIRI — Normativa básica o funcional

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
