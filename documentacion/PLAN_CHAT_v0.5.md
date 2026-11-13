# AIRI v0.5 — Diseño del chat inteligente (propuesta inicial)

**Estado:** planificación; ninguna funcionalidad de chat está implementada todavía.
**Base:** rama `feature/chat-inteligente-airi-v0.5`, creada desde `main` después de fusionar v0.4.

## Objetivo
Permitir que una persona converse por texto con AIRI sobre acuarios marinos, formule preguntas de seguimiento y reciba respuestas que distingan conocimiento general, datos de mediciones y resultados del motor científico v0.4. La búsqueda de información en Internet será una capacidad **separada y verificable**, no una promesa automática de cualquier modelo.

## Alcance propuesto
1. Pestaña «Chat con AIRI», adaptada a móvil y escritorio; enviar mensajes, mostrar respuestas y errores, conservar el historial durante la sesión y ofrecer borrar conversación.
2. Conectar un modelo de lenguaje mediante un **backend**; nunca incluir claves privadas en HTML, JavaScript público ni GitHub Pages.
3. Contexto limitado a la conversación actual y a los resultados de agua que el usuario decida compartir. No enviar mediciones automáticamente.
4. Consulta de fuentes fiables con búsqueda externa **solo si se habilita**; presentar título, enlace y fecha cuando estén disponibles, diferenciar fuentes consultadas de conocimiento del modelo y decir cuando no se pudo verificar.
5. La mascota puede mostrar un estado «procesando» y leer la respuesta con la voz actual si el usuario lo activa. Las animaciones expresivas nuevas quedan para v0.6.
6. Mensajes de límites: no diagnosticar enfermedades, no afirmar que el agua es segura, no recomendar automatización física ni sustituir a especialistas.

## Arquitectura recomendada
- **Frontend estático:** interfaz de chat en `interfaz/`; conserva compatibilidad con el prototipo actual.
- **Backend separado:** endpoint `POST /api/chat` que valida entradas, limita longitud y tasa, protege secretos, gestiona errores y llama al proveedor del modelo.
- **Búsqueda y citas:** servicio optativo independiente; registrar qué enlaces se consultaron realmente; no inventar citas.
- **Privacidad:** no guardar conversaciones permanentemente por defecto; explicar al usuario qué datos salen hacia el proveedor, pedir consentimiento antes de enviar y ofrecer limpieza del historial. No usar micrófono.
- **Resiliencia:** si no hay conexión o proveedor, mostrar un error claro sin afectar al motor de agua ni a la mascota v0.4.
- **Despliegue:** GitHub Pages solo aloja frontend; se requiere un backend externo o local para llamadas seguras a modelos. No publicar automáticamente ramas de desarrollo.

## Etapas y criterios de aceptación
- **E1 Diagnóstico:** inspeccionar archivos, puntos de integración y opciones de backend/proveedor. No modificar la interfaz hasta cerrar decisiones.
- **E2 Chat visual:** componentes accesibles, responsive, estados vacío/cargando/error y pruebas sin llamadas reales; sin simular que es IA operativa.
- **E3 Servicio seguro:** integrar un proveedor elegido; secretos en entorno servidor, validación y pruebas; autorización del usuario antes de enviar contenido a terceros.
- **E4 Búsqueda fundamentada:** fuentes enlazadas a consultas reales, manejo de ausencia de evidencia y pruebas contra citas inventadas.
- **E5 Mascota y voz:** conexión con la interfaz actual, sin alterar la clasificación R1–R4.
- **E6 Pruebas y revisión:** navegador escritorio/móvil, seguridad, accesibilidad, privacidad, documentación y PR sin fusionar automáticamente.

## Decisiones pendientes antes de E3
1. **Proveedor del modelo:** API comercial (costos y cuenta del equipo) o modelo local (hardware y despliegue).
2. **Backend:** equipo local para desarrollo o alojamiento en servidor; Pages por sí solo no puede proteger una API key.
3. **Búsqueda web:** proveedor, límites y costo; el modelo sin búsqueda no investiga Internet en tiempo real.
4. **Retención:** por defecto, solo sesión y borrado explícito; decidir si se desea guardar historial más adelante.

## Exclusiones de v0.5
Reconocimiento de fotos, sensores, control físico, compatibilidad automática entre especies, memoria permanente y rediseño expresivo de la mascota (v0.6).

## Verificación del estado
Este documento es un **plan**, no evidencia de que el chat ya funcione. Las funciones de v0.4 permanecen sin cambios.
