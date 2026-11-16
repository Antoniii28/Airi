# AIRI — Fichas de especies (v0.7.1)

Cincuenta y dos fichas **verificadas con fuentes** (28 peces, 5 estrellas de mar, 4 crustáceos, 6 corales, 3 anémonas, 2 caracoles, 2 erizos de mar, 1 gusano y 1 pepino de mar) y pendientes de revisión del equipo. No son recomendaciones de compra ni dictámenes de compatibilidad.

- **Contrato para Yair y Paola:** [`../CONTRATO_FICHAS.md`](../CONTRATO_FICHAS.md), con los IDs, los campos, los valores permitidos y un ejemplo antes/después.
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
| Estrella Linckia azul | *Linckia laevigata* (Linnaeus, 1758) | estrella de mar | 207610 | 40 cm | 94.6 L | media | [ficha](linckia-laevigata.md) |
| Estrella Fromia naranja | *Fromia milleporella* (Lamarck, 1816) | estrella de mar | 213299 | 15.2 cm | 37.9 L | baja | [ficha](fromia-milleporella.md) |
| Estrella mosaico | *Fromia monilis* Perrier, 1869 | estrella de mar | 213301 | 12.7 cm | 56.8 L | media | [ficha](fromia-monilis.md) |
| Estrella arenera | *Astropecten polyacanthus* Müller & Troschel, 1842 | estrella de mar | 213245 | 12 cm | 37.9 L | media | [ficha](astropecten-polyacanthus.md) |
| Estrella chocochip | *Protoreaster nodosus* (Linnaeus, 1758) | estrella de mar | 213285 | 30 cm | 75.7 L | media | [ficha](protoreaster-nodosus.md) |
| Camarón sexy | *Thor amboinensis* (De Man, 1888) | crustáceo | 107534 | 3.8 cm | 18.9 L | baja | [ficha](thor-amboinensis.md) |
| Camarón limpiador | *Lysmata amboinensis* (De Man, 1888) | crustáceo | 241289 | 10.2 cm | 75.7 L | baja | [ficha](lysmata-amboinensis.md) |
| Camarón boxeador | *Stenopus hispidus* (Olivier, 1811) | crustáceo | 210370 | 7.6 cm | 113.6 L | media | [ficha](stenopus-hispidus.md) |
| Ermitaño patas rojas | *Paguristes cadenati* Forest, 1954 | crustáceo | 368215 | 3.8 cm | 18.9 L | baja | [ficha](paguristes-cadenati.md) |
| Pez halcón de nariz larga | *Oxycirrhites typus* Bleeker, 1857 | pez | 218865 | 13 cm | 113.6 L | media | [ficha](oxycirrhites-typus.md) |
| Ángel llama | *Centropyge loriculus* (Günther, 1874) | pez | 402161 | 15 cm | 264.9 L | media | [ficha](centropyge-loriculus.md) |
| Pez mariposa de nariz larga | *Forcipiger flavissimus* Jordan & McGregor, 1898 | pez | 218760 | 22 cm | 473.1 L | media | [ficha](forcipiger-flavissimus.md) |
| Pez ballesta Picasso | *Rhinecanthus aculeatus* (Linnaeus, 1758) | pez | 219890 | 30 cm | 681.3 L | media | [ficha](rhinecanthus-aculeatus.md) |
| Morena copo de nieve | *Echidna nebulosa* (Ahl, 1789) | pez | 217469 | 100 cm | 189.2 L | media | [ficha](echidna-nebulosa.md) |
| Pez ballesta payaso | *Balistoides conspicillum* (Bloch & Schneider, 1801) | pez | 219876 | 50 cm | 1135.5 L | media | [ficha](balistoides-conspicillum.md) |
| Cirujano Aquiles | *Acanthurus achilles* Shaw, 1803 | pez | 272957 | 24 cm | 681.3 L | media | [ficha](acanthurus-achilles.md) |
| Pez halcón llama | *Neocirrhites armatus* Castelnau, 1873 | pez | 281678 | 9 cm | 113.6 L | media | [ficha](neocirrhites-armatus.md) |
| Blenio Midas | *Ecsenius midas* Starck, 1969 | pez | 219271 | 13 cm | 113.6 L | media | [ficha](ecsenius-midas.md) |
| Lábrido arlequín | *Choerodon fasciatus* (Günther, 1867) | pez | 277268 | 30 cm | 473.1 L | media | [ficha](choerodon-fasciatus.md) |
| Pólipo estrella verde | *Briareum violaceum* (Quoy & Gaimard, 1833) | coral | 517640 | null | 113.6 L | baja | [ficha](briareum-violaceum.md) |
| Anémona burbuja | *Entacmaea quadricolor* (Leuckart in Rüppell & Leuckart, 1828) | anémona | 289898 | 40 cm | 113.6 L | media | [ficha](entacmaea-quadricolor.md) |
| Anémona sebae | *Radianthus crispa* (Hemprich & Ehrenberg in Ehrenberg, 1834) | anémona | 290089 | 50.8 cm | 113.6 L | baja | [ficha](radianthus-crispa.md) |
| Anémona magnífica | *Radianthus magnifica* (Quoy & Gaimard, 1833) | anémona | 854493 | 91.4 cm | null | baja | [ficha](radianthus-magnifica.md) |
| Árbol de Kenia | *Capnella sp.* Gray, 1869 (género) | coral | 146763 | null | 189.2 L | baja | [ficha](capnella-sp.md) |
| Xenia pulsante | *Xenia elongata* Dana, 1846 | coral | 287872 | null | 94.6 L | baja | [ficha](xenia-elongata.md) |
| Zoántidos | *Zoanthus sp.* Lamarck, 1801 (género) | coral | 206284 | null | 189.2 L | baja | [ficha](zoanthus-sp.md) |
| Coral candy cane | *Caulastraea furcata* Dana, 1846 | coral | 289577 | null | 189.2 L | media | [ficha](caulastraea-furcata.md) |
| Pólipos de clavo | *Clavularia sp.* Blainville, 1830 (género) | coral | 125286 | null | null | baja | [ficha](clavularia-sp.md) |
| Caracol Nassarius | *Nassarius sp.* Duméril, 1805 (género) | caracol | 138235 | 1.3 cm | 18.9 L | baja | [ficha](nassarius-sp.md) |
| Caracol turbo | *Turbo fluctuosus* W. Wood, 1828 | caracol | 413380 | 5.1 cm | null | baja | [ficha](turbo-fluctuosus.md) |
| Erizo tuxedo | *Mespilia globulus* (Linnaeus, 1758) | erizo de mar | 214476 | 5 cm | 75.7 L | media | [ficha](mespilia-globulus.md) |
| Erizo de puntas largas | *Diadema setosum* (Leske, 1778) | erizo de mar | 213372 | 10.2 cm | 283.9 L | media | [ficha](diadema-setosum.md) |
| Gusano plumero | *Sabellastarte sp.* Krøyer, 1856 (género) | gusano | 206071 | 17.8 cm | 37.9 L | baja | [ficha](sabellastarte-sp.md) |
| Pepino de mar negro | *Holothuria atra* Jaeger, 1833 | pepino de mar | 1672768 | 60 cm | null | media | [ficha](holothuria-atra.md) |

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
