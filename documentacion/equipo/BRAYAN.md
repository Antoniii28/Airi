# Brayan — Fichas biológicas y fotografías de especies

**Rama asignada:** `equipo/brayan-fichas-especies` (comprobar que existe).  
**Objetivo exclusivo:** mejorar el catálogo existente de especies marinas con información comprobable y fotografías de uso permitido. Su conocimiento práctico sirve para detectar dudas, pero cada afirmación técnica requiere fuente.

## Revisar primero
`especies/`, `especies/fichas/README.md`, JSON actuales y su uso en `interfaz/prototipo/`. Hay seis fichas preliminares: revisar antes de duplicar.

## Tareas concretas
1. Antes del **15 nov**, enviar a Yair y Paola un ejemplo de ficha con campos existentes y propuesta de ampliación: `id` estable, nombre común/científico, alimentación, tamaño, condiciones documentadas, comportamiento, imagen, licencia/autor, fuentes y campos pendientes.
2. Verificar y corregir las fichas existentes. Preparar como primera meta **cinco fichas revisadas** (pueden ser fichas ya existentes; no es obligatorio añadir cinco especies nuevas).
3. Incorporar fotografías propias o con licencia compatible, documentando autor, URL, licencia y atribución. Si no hay foto legalmente reutilizable, usar marcador visual sin copiar imágenes ajenas.
4. Citar fuente específica por dato relevante; señalar incertidumbre y diferencias entre especies. No inventar valores ni compatibilidad.
5. Mantener formato JSON compatible; si cambia el esquema, acordarlo con Yair y Paola antes de modificarlo.

## Archivos permitidos
`especies/` y recursos de imágenes relacionados con el catálogo, evitando tocar código de compatibilidad, motor e interfaz.

## Entregables verificables
- Al menos cinco fichas revisadas con fuentes.
- Fotografías con derechos/atribución documentados o ausencia de imagen señalada.
- Validación de JSON y listado de IDs y campos para Yair y Paola.
- PR con cambios y ejemplos antes/después.

**Ejemplo de esquema:** 15 nov. **PR revisable:** 22 nov. Fechas sujetas al cronograma oficial.

**No hacer:** algoritmo de compatibilidad, reglas del agua, HTML/CSS del sitio, Worker o despliegue.
