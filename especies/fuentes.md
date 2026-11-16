# AIRI — Fuentes de las fichas de especies

**Estado:** fuentes consultadas el 2026-11-16, salvo las indicadas. El registro completo, con un identificador por fuente, está en `especies/datos/catalogo_inicial.json` (clave `fuentes`). Cada dato de las fichas cita su fuente por ese identificador.

| Fuente | Uso en las fichas | Tipo |
|---|---|---|
| **WoRMS** (World Register of Marine Species), https://www.marinespecies.org/ | Nombre aceptado, autoridad, AphiaID, sinónimos y clasificación | Taxonómica (referencia principal) |
| **FishBase**, https://www.fishbase.se/ | Hábitat, distribución, profundidad, tamaño máximo, dieta natural, comportamiento, reproducción, temperatura natural y estado UICN | Científica de referencia |
| **SeaLifeBase**, https://www.sealifebase.se/ (base hermana de FishBase para invertebrados) | Hábitat, distribución, tamaño, dieta y comportamiento de estrellas de mar y crustáceos | Científica de referencia |
| **Quality Marine** (mayorista de especies marinas) | Parámetros de acuario, litraje y notas de convivencia del cirujano de Bahía y de la estrella *Fromia*, que LiveAquaria no vende | Comercial: confianza baja o media |
| **Saltwaterfish** (tienda en línea) | Litraje mínimo («Minimum Tank Size») de invertebrados y corales que LiveAquaria y Quality Marine no publican | Comercial: confianza baja |
| **NOAA Fisheries**, ficha del cardenal de Banggai | Hábitat, dieta, longevidad, amenazas y estado ESA | Institucional |
| **LiveAquaria** (páginas de producto de cada especie) | Parámetros de acuario (°F, pH, gravedad específica, dKH), volumen mínimo, temperamento, compatibilidad con arrecife y notas de convivencia | Comercial: confianza baja o media |
| **MSD Veterinary Manual** (tabla y capítulo) | pH de referencia para agua salada (7.8–8.3 y 7.8–8.5) | Veterinaria; reutilizada del motor, consultada el 2026-11-12 |
| **UF/IFAS**, hoja informativa sobre pH, salinidad y temperatura | Salinidad media del agua de mar (35 ppt) | Institucional; reutilizada del motor, consultada el 2026-11-12 |
| **NOAA National Ocean Service**, agua de los corales | Contexto de arrecife (32–42 ppt) | Institucional; reutilizada del motor, consultada el 2026-11-12 |

## Limitaciones

- El estado UICN se tomó de FishBase, que muestra la versión 2025-2 de la Lista Roja, y no se consultó directamente en iucnredlist.org.
- Las páginas de LiveAquaria se leyeron en navegador porque el sitio limita las consultas automáticas. Su contenido puede cambiar, ya que son páginas comerciales.
- Las referencias taxonómicas por sí solas **no** justifican rangos de mantenimiento en acuario.
