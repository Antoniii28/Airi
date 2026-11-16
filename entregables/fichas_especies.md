# AIRI — Entrega de fichas de especies (v0.7.1)

**Responsable:** Brayan · **Rama:** `equipo/brayan-fichas-especies` · **Fecha de consulta:** 2026-11-16

Se completaron y verificaron las seis fichas del catálogo inicial (pez payaso común, cardenal de Banggai, pez fuego, gramma real, cirujano amarillo y damisela de cola amarilla), y el catálogo se amplió a **52 especies**: 28 peces, 5 estrellas de mar, 4 crustáceos, 6 corales, 3 anémonas, 2 caracoles, 2 erizos de mar, 1 gusano y 1 pepino de mar. La lista completa está en `especies/fichas/README.md`. Cada ficha incluye:

- Taxonomía según WoRMS
- Hábitat
- Tamaño
- Alimentación
- Temperatura, pH y salinidad con sus unidades
- Volumen mínimo con justificación
- Comportamiento, territorialidad y refugio
- Compatibilidad con arrecife
- Condiciones y riesgos de convivencia
- Fuentes, fecha de consulta y nivel de confianza por campo

- Datos: `especies/datos/catalogo_inicial.json` (fuente única).
- Fichas: `especies/fichas/` (índice y hallazgos en `especies/fichas/README.md`).
- Fuentes: `especies/fuentes.md`.
- Interfaz: apartado «Fichas de especies» del prototipo (`interfaz/prototipo/fichas/`). Muestra en cada tarjeta la imagen, los datos clave con su nivel de confianza y la ficha completa con sus fuentes, y alerta cuando una especie está amenazada.
- Generación y validación: `python especies/herramientas/generar_fichas.py --comprobar`.

**Límites:** los parámetros de acuario provienen de una fuente comercial y se contrastan con referencias veterinarias e institucionales generales. Las fichas **no** establecen compatibilidad entre especies. En la interfaz solo se modificó el apartado de fichas; el motor no se tocó.

**Próximo paso:** que el equipo revise los hallazgos señalados en `especies/fichas/README.md` antes de cerrar la versión; el motor todavía no usa estos datos.
