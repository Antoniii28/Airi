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

## Nota de actualización (v0.4)
Este documento describe la entrega v0.1 y se conserva como tal. Desde v0.4 el prototipo añade, después de la
validación de formato, una **evaluación con referencias documentadas** (`interfaz/motor/README.md`). Por eso:

- Paso 5: los valores numéricos se muestran como «dato con formato válido» y, en el paso 2 del resultado, el pH, el
  amoníaco total y los nitritos se comparan con referencias del Manual Veterinario MSD; temperatura, salinidad y
  nitratos aparecen «sin referencia para evaluar». Sigue sin declararse normalidad ni seguridad.
- Paso 7: además del funcionamiento en móvil y escritorio, el mensaje de la mascota puede cerrarse con «×» y
  reabrirse tocando a AIRI.
- Límites: ya existen alertas basadas en referencias con fuente para pH, amoníaco total y nitritos. Siguen sin
  existir backend, sensores, reconocimiento visual, evaluación de compatibilidad y diagnóstico biológico.

