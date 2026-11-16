# AIRI — Fichas de especies (v0.5)

Veintiséis fichas **verificadas con fuentes** (15 peces, 4 estrellas de mar y 7 crustáceos) y pendientes de revisión del equipo. No son recomendaciones de compra ni dictámenes de compatibilidad.

- **Fuente única de datos:** [`../datos/catalogo_inicial.json`](../datos/catalogo_inicial.json).
- **Fichas legibles:** se generan desde el JSON con `python especies/herramientas/generar_fichas.py`. No se editan a mano.
- **Validación:** `python especies/herramientas/generar_fichas.py --comprobar` revisa que no falten campos obligatorios, que toda fuente citada tenga URL, que los rangos y los niveles de confianza sean válidos y que las fichas estén al día.
- **Fecha de consulta:** 2026-11-16.
- **Ficha AIRI (v0.3):** cada especie tiene un bloque `ficha_airi` con los nueve campos estandarizados: nombre común, nombre científico, temperamento, comportamiento, adecuado para arrecife, tipo de alimentación, temperatura, litraje recomendado y tamaño adulto. Sus valores están normalizados para poder comparar especies, y un dato no verificable se registra como `null`. El resto de los datos verificados se conserva.
- **Interfaz:** el apartado «Fichas de especies» del prototipo (`interfaz/prototipo/fichas/`) lee los datos de `airi-fichas-datos.js`, que el mismo script genera junto con la copia de las imágenes. Después de cambiar el JSON o una imagen, vuelve a ejecutar el script.
- **Imágenes:** se guardan en [`../imagenes/`](../imagenes/README.md), con autor y licencia en el bloque `imagen` del JSON.

| Nombre común | Nombre científico | Grupo | WoRMS | Tamaño máx. | Volumen mín. | Confianza | Ficha |
|---|---|---|---|---|---|---|---|
| Pez payaso común | *Amphiprion ocellaris* Cuvier, 1830 | pez | 278400 | 11 cm | 75.7 L | media | [ficha](amphiprion-ocellaris.md) |
| Cardenal de Banggai | *Pterapogon kauderni* Koumans, 1933 | pez | 282494 | 8.6 cm | 113.6 L | media | [ficha](pterapogon-kauderni.md) |
| Pez fuego | *Nemateleotris magnifica* Fowler, 1938 | pez | 219611 | 9 cm | 75.7 L | media | [ficha](nemateleotris-magnifica.md) |
| Gramma real | *Gramma loreto* Poey, 1868 | pez | 280932 | 8 cm | 113.6 L | media | [ficha](gramma-loreto.md) |
| Cirujano amarillo | *Zebrasoma flavescens* (Bennett, 1828) | pez | 219683 | 20 cm | 378.5 L | media | [ficha](zebrasoma-flavescens.md) |
| Damisela de cola amarilla | *Chrysiptera parasema* (Fowler, 1918) | pez | 276836 | 7 cm | 113.6 L | media | [ficha](chrysiptera-parasema.md) |
| Cirujano naso | *Naso lituratus* (Forster, 1801) | pez | 219665 | 46 cm | 681.3 L | media | [ficha](naso-lituratus.md) |
| Cirujano azul | *Paracanthurus hepatus* (Linnaeus, 1766) | pez | 219676 | 31 cm | 681.3 L | media | [ficha](paracanthurus-hepatus.md) |
| Pez zorro (foxface) | *Siganus vulpinus* (Schlegel & Müller, 1845) | pez | 273929 | 25 cm | 473.1 L | media | [ficha](siganus-vulpinus.md) |
| Cirujano púrpura | *Zebrasoma xanthurum* (Blyth, 1852) | pez | 219681 | 36.7 cm | 492.1 L | media | [ficha](zebrasoma-xanthurum.md) |
| Ídolo moro | *Zanclus cornutus* (Linnaeus, 1758) | pez | 220083 | 23 cm | 473.1 L | baja | [ficha](zanclus-cornutus.md) |
| Pez mariposa bandas de cobre | *Chelmon rostratus* (Linnaeus, 1758) | pez | 218758 | 20 cm | 492.1 L | media | [ficha](chelmon-rostratus.md) |
| Lábrido de seis líneas | *Pseudocheilinus hexataenia* (Bleeker, 1857) | pez | 208915 | 10 cm | 227.1 L | media | [ficha](pseudocheilinus-hexataenia.md) |
| Cirujano orange shoulder | *Acanthurus olivaceus* Bloch & Schneider, 1801 | pez | 219625 | 35 cm | 681.3 L | media | [ficha](acanthurus-olivaceus.md) |
| Pez cofre amarillo | *Ostracion cubicum* Linnaeus, 1758 | pez | 403462 | 45 cm | 946.2 L | media | [ficha](ostracion-cubicum.md) |
| Cirujano de Bahía | *Acanthurus bahianus* Castelnau, 1855 | pez | 159578 | 14.6 cm | 1135.5 L | media | [ficha](acanthurus-bahianus.md) |
| Mandarín | *Synchiropus splendidus* (Herre, 1927) | pez | 273264 | 7 cm | 113.6 L | baja | [ficha](synchiropus-splendidus.md) |
| Gobio arenero de 6 puntos | *Valenciennea sexguttata* (Valenciennes, 1837) | pez | 219598 | 14 cm | 113.6 L | media | [ficha](valenciennea-sexguttata.md) |
| Estrella Linckia azul | *Linckia laevigata* (Linnaeus, 1758) | estrella de mar | 207610 | 40 cm | null | media | [ficha](linckia-laevigata.md) |
| Estrella Fromia naranja | *Fromia milleporella* (Lamarck, 1816) | estrella de mar | 213299 | 15.2 cm | null | baja | [ficha](fromia-milleporella.md) |
| Estrella arenera | *Astropecten polyacanthus* Müller & Troschel, 1842 | estrella de mar | 213245 | 12 cm | null | media | [ficha](astropecten-polyacanthus.md) |
| Estrella chocochip | *Protoreaster nodosus* (Linnaeus, 1758) | estrella de mar | 213285 | 30 cm | null | media | [ficha](protoreaster-nodosus.md) |
| Camarón sexy | *Thor amboinensis* (De Man, 1888) | crustáceo | 107534 | 3.8 cm | null | baja | [ficha](thor-amboinensis.md) |
| Camarón limpiador | *Lysmata amboinensis* (De Man, 1888) | crustáceo | 241289 | 10.2 cm | null | baja | [ficha](lysmata-amboinensis.md) |
| Camarón boxeador | *Stenopus hispidus* (Olivier, 1811) | crustáceo | 210370 | 7.6 cm | null | media | [ficha](stenopus-hispidus.md) |
| Ermitaño patas rojas | *Paguristes cadenati* Forest, 1954 | crustáceo | 368215 | 3.8 cm | null | baja | [ficha](paguristes-cadenati.md) |

## Niveles de confianza

- **alta:** fuente taxonómica o institucional primaria (WoRMS, NOAA), o dos fuentes independientes que coinciden.
- **media:** una fuente científica de referencia (FishBase), o una fuente comercial que concuerda con una referencia institucional general.
- **baja:** una sola fuente comercial sin corroboración independiente, o fuentes que discrepan.

## Hallazgos que debe revisar el equipo

1. **Parámetros de acuario de una sola fuente.** Temperatura, pH, gravedad específica, volumen y compatibilidad con arrecife provienen de LiveAquaria, una tienda. Por eso tienen confianza baja o media.
2. **pH:** LiveAquaria indica 8.1–8.4, pero la tabla veterinaria MSD para agua salada llega solo hasta 8.3. Las fichas proponen un rango prudente de 8.1–8.3.
3. **Salinidad:** LiveAquaria la expresa en gravedad específica (1.020–1.025), no en ppt. No se convirtió porque la equivalencia depende de la temperatura. Como referencia, el agua de mar media tiene 35 ppt (UF/IFAS).
4. **Cirujano amarillo:** el límite inferior de temperatura de acuario (22.2 °C) está por debajo del mínimo natural según FishBase (24 °C).
5. **Cardenal de Banggai:** está En peligro según la UICN y amenazado según la ESA de EE. UU. desde 2016 (NOAA). AIRI debe advertirlo siempre que se consulte esta especie.
6. **Taxonomía:** el orden y la familia de algunas especies varían según la fuente (por ejemplo, Gobiidae en WoRMS frente a Microdesmidae en FishBase para el pez fuego). Se toma WoRMS como referencia y la discrepancia queda anotada en cada ficha.

**Regla:** no convertir campos vacíos en ceros ni inferir que dos especies son compatibles por compartir rangos de agua.
