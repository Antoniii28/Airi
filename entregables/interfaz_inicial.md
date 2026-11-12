# AIRI — Entrega de interfaz inicial v0.1

## Objetivo
Mostrar una propuesta funcional de navegación para el agente AIRI sin simular capacidades inexistentes.

## Ubicación
`interfaz/prototipo/index.html`. Abrir localmente con un navegador o servir desde un servidor estático. El logotipo V2 se carga mediante ruta relativa al archivo original de `identidad-visual/`.

## Pantallas
- Inicio: objetivo, alcance y límites.
- Parámetros del agua: registro de seis entradas y validación básica; origen MANUAL/SIMULADO.
- Fichas de especies: búsqueda de seis entradas preliminares.
- Próximas versiones: compatibilidad, fotografías y app móvil, expresamente no implementadas.

## Pruebas manuales sugeridas
1. Abrir la página desde el repositorio descargado y comprobar la imagen.
2. Navegar por las cuatro pestañas.
3. Introducir un campo vacío: debe mostrar INFORMACIÓN INSUFICIENTE.
4. Introducir texto no numérico o valor negativo: debe mostrar VALOR INVÁLIDO.
5. Introducir valores numéricos: debe indicar SIN REFERENCIA BIOLÓGICA VERIFICADA, sin declarar normalidad.
6. Buscar por nombre común y científico en el catálogo.
7. Comprobar visualización en móvil y escritorio.

## Límites
No hay backend, sensores, reconocimiento visual, evaluación de compatibilidad ni alertas basadas en rangos científicos. La validación es ilustrativa y no constituye diagnóstico biológico.
