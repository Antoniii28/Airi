# AIRI — Instrucciones oficiales de colaboración (propuesta para revisión)

Repositorio público: https://github.com/Antoniii28/Airi  
Objetivo de entrega del proyecto: **2 de diciembre de 2026** (confirmar hitos con el cronograma académico original).

## 1. Antes de cambiar código
1. Leer el [README principal](../../README.md), el documento individual de esta carpeta y los README de los módulos asignados.
2. Revisar los archivos y pruebas **reales de la rama main actualizada**. El README principal puede describir una versión anterior; comprobar el código y los cambios recientes. AIRI ya tiene motor Python/JS, interfaz, fichas preliminares, mascota y piloto web v0.7.3.
3. Comprobar que la rama personal existe en GitHub. **Los nombres de rama de esta guía son asignaciones; escribirlos aquí no crea ramas.** Si falta una, pedir al coordinador que la cree desde `main` o crearla con autorización. No empezar desde una copia antigua.
4. Elaborar una propuesta breve: archivos a tocar, datos de entrada/salida, pruebas existentes, pruebas nuevas y dependencias.
5. Implementar exclusivamente el módulo asignado. Si se necesita editar un archivo de otro integrante, abrir una propuesta y acordar la interfaz antes de tocarlo.

## 2. Responsabilidades sin duplicación
| Persona | Rama asignada (verificar existencia) | Dueño de | NO es responsable de |
|---|---|---|---|
| José | `equipo/jose-motor-agente` | Motor de evaluación del agua, reglas, referencias y coordinación técnica | Fichas, fotos, diseño visual o compatibilidad entre especies |
| Brayan | `equipo/brayan-fichas-especies` | Datos y fotografías con licencia de fichas biológicas | Algoritmo de compatibilidad, motor de agua o interfaz |
| Yair | `equipo/yair-compatibilidad` | Algoritmo explicable de compatibilidad entre especies | Redactar fichas, editar interfaz o alterar motor del agua |
| Paola | `equipo/paola-interfaz-documentacion` | Presentación visual e integración de resultados ya calculados; guía de usuario | Inventar reglas, alterar datos biológicos o cambiar seguridad del piloto |

Guías: [José](JOSE.md) · [Brayan](BRAYAN.md) · [Yair](YAIR.md) · [Paola](PAOLA.md).

## 3. Contratos de integración: acordarlos sin bloquear el trabajo
- **Brayan → Yair y Paola:** fichas con `id` estable, nombres, foto/licencia, datos biológicos, fuentes y campos faltantes. Mantener el esquema existente o proponer su evolución por PR; no cambiarlo unilateralmente.
- **Yair → Paola:** salida documentada con identificadores de especies, estado orientativo, motivos, evidencia y datos faltantes. Los nombres exactos de campos se acuerdan y prueban; no asumirlos existentes.
- **José → Paola:** reutilizar la salida actual del motor de agua; preservar alertas, falta de referencia y trazabilidad. Si hace falta un campo nuevo, acordarlo previamente.
- **Paola:** consumir las salidas anteriores; mientras llegan, utilizar datos de prueba separados de producción. No recalcular ni sobrescribir reglas en la interfaz.
- Una modificación del contrato requiere aviso a los afectados, ejemplo JSON antes/después y pruebas. Nadie debe esperar a que otro termine: cada módulo se desarrolla con datos simulados **claramente identificados como prueba**.

## 4. Zonas de trabajo y límites
- José: `motor/`, `interfaz/motor/`, `grafo/` (solo lo necesario y con pruebas).
- Brayan: `especies/` y recursos de imagen asociados; evitar modificar el HTML de la interfaz.
- Yair: módulo de compatibilidad nuevo o existente identificado tras inspección; evitar editar directamente `especies/` y `interfaz/`.
- Paola: `interfaz/prototipo/`, estilos y documentación de usuario; no modificar `motor/`, `especies/` ni backend del chat.
- Archivos transversales como `README.md`, configuración, scripts de build, `publico/`, pruebas globales y dependencias requieren coordinación previa.

## 5. Seguridad y continuidad de AIRI
- No publicar credenciales, tokens, `.dev.vars`, claves Gemini, secretos Turnstile, códigos de acceso ni sales. Una sitekey pública no autoriza a compartir secretos.
- No ejecutar `wrangler deploy`, cambiar variables/secretos ni publicar el Worker `airi`; solo el responsable autorizado puede hacerlo tras revisar el PR y las pruebas.
- No eliminar ni eludir controles de acceso, Turnstile, restricciones de edad/región, cuotas, políticas de seguridad o avisos existentes.
- No presentar un acuario como seguro cuando faltan referencias. Mantener alertas y datos insuficientes. No introducir diagnósticos veterinarios ni automatización física.
- Respetar derechos de autor de fotografías y citar fuentes técnicas verificables.

## 6. Fechas propuestas (sujetas al cronograma aprobado)
- **15 noviembre:** Brayan propone formato de ficha y ejemplo; Yair y Paola pueden seguir con datos simulados.
- **22 noviembre:** un PR revisable por persona con pruebas y evidencia.
- **23–29 noviembre:** revisión cruzada, integración y correcciones.
- **30 noviembre–2 diciembre:** validación final y entrega. Si el cronograma oficial indica otra fecha, prevalece el oficial.

## 7. Flujo Git y revisión
1. Clonar repositorio público y obtener `main` actualizado.
2. Cambiar a la rama propia; verificar `git branch --show-current` y `git status`. Nunca trabajar directamente en `main`.
3. Hacer commits pequeños y subir **solo a la rama propia**.
4. Abrir PR hacia `main` con objetivo, archivos modificados, capturas (si aplica), pruebas con resultados, fuentes, pendientes y cambios de contrato.
5. El coordinador revisa conflictos, contratos, seguridad y pruebas antes de fusionar. Ningún PR implica despliegue automático autorizado.
6. Si hay conflictos, no sobrescribir cambios de otros: pedir revisión conjunta.

## 8. Cómo pedir ayuda a ChatGPT o Claude
El repositorio es público y puede consultarse sin ser colaborador, pero **leerlo no significa tener permiso de escritura**. Un asistente solo puede trabajar directamente en GitHub si dispone de herramientas y autorización. Nunca compartir tokens.

Mensaje para copiar:
> Trabajo en AIRI: https://github.com/Antoniii28/Airi. Soy [NOMBRE], mi rama asignada es [RAMA] y mi guía es documentacion/equipo/[ARCHIVO].md. Primero comprueba que puedes leer el repositorio y mi rama; lee README.md, documentacion/equipo/README.md, mi guía y el código real de mi módulo. Distingue lo ya implementado de lo pendiente. Resume objetivo, archivos que puedo editar, contratos, pruebas y entregables. Propón un plan breve antes de cambiar nada. Trabaja solo en mi rama, sin editar módulos de otros, sin cambiar main, sin desplegar y sin exponer secretos. Si no puedes acceder a los archivos, pídemelos; no inventes su contenido.

## 9. Criterios para aceptar una entrega
El PR cumple su objetivo, no modifica zonas ajenas sin acuerdo, no rompe pruebas previas, incluye nuevas pruebas pertinentes, documenta limitaciones y fuentes, y permite integrar sin cambiar la seguridad del piloto.
