# Imágenes de especies

Guarda aquí una foto por especie con **exactamente** estos nombres:

| Especie | Archivo |
|---|---|
| Pez payaso común | `amphiprion-ocellaris.jpg` |
| Cardenal de Banggai | `pterapogon-kauderni.jpg` |
| Pez fuego | `nemateleotris-magnifica.jpg` |
| Gramma real | `gramma-loreto.jpg` |
| Cirujano amarillo | `zebrasoma-flavescens.jpg` |
| Damisela de cola amarilla | `chrysiptera-parasema.jpg` |
| Cirujano naso | `naso-lituratus.jpg` |
| Cirujano azul | `paracanthurus-hepatus.jpg` |
| Pez zorro (foxface) | `siganus-vulpinus.jpg` |
| Cirujano púrpura | `zebrasoma-xanthurum.jpg` |
| Ídolo moro | `zanclus-cornutus.jpg` |
| Pez mariposa bandas de cobre | `chelmon-rostratus.jpg` |
| Lábrido de seis líneas | `pseudocheilinus-hexataenia.jpg` |
| Cirujano orange shoulder | `acanthurus-olivaceus.jpg` |
| Pez cofre amarillo | `ostracion-cubicum.jpg` |
| Cirujano de Bahía | `acanthurus-bahianus.jpg` |
| Mandarín | `synchiropus-splendidus.jpg` |
| Gobio arenero de 6 puntos | `valenciennea-sexguttata.jpg` |
| Estrella Linckia azul | `linckia-laevigata.jpg` |
| Estrella Fromia naranja | `fromia-milleporella.jpg` |
| Estrella mosaico | `fromia-monilis.jpg` |
| Estrella arenera | `astropecten-polyacanthus.jpg` |
| Estrella chocochip | `protoreaster-nodosus.jpg` |
| Camarón sexy | `thor-amboinensis.jpg` |
| Camarón limpiador | `lysmata-amboinensis.jpg` |
| Camarón boxeador | `stenopus-hispidus.jpg` |
| Ermitaño patas rojas | `paguristes-cadenati.jpg` |
| Pez halcón de nariz larga | `oxycirrhites-typus.jpg` |
| Ángel llama | `centropyge-loriculus.jpg` |
| Pez mariposa de nariz larga | `forcipiger-flavissimus.jpg` |
| Pez ballesta Picasso | `rhinecanthus-aculeatus.jpg` |
| Morena copo de nieve | `echidna-nebulosa.jpg` |
| Pez ballesta payaso | `balistoides-conspicillum.jpg` |
| Cirujano Aquiles | `acanthurus-achilles.jpg` |
| Pez halcón llama | `neocirrhites-armatus.jpg` |
| Blenio Midas | `ecsenius-midas.jpg` |
| Lábrido arlequín | `choerodon-fasciatus.jpg` |
| Pólipo estrella verde | `briareum-violaceum.jpg` |
| Anémona burbuja | `entacmaea-quadricolor.jpg` |
| Anémona sebae | `radianthus-crispa.jpg` |
| Anémona magnífica | `radianthus-magnifica.jpg` |
| Árbol de Kenia | `capnella-sp.jpg` |
| Xenia pulsante | `xenia-elongata.jpg` |
| Zoántidos | `zoanthus-sp.jpg` |
| Coral candy cane | `caulastraea-furcata.jpg` |
| Pólipos de clavo | `clavularia-sp.jpg` |
| Caracol Nassarius | `nassarius-sp.jpg` |
| Caracol turbo | `turbo-fluctuosus.jpg` |
| Erizo tuxedo | `mespilia-globulus.jpg` |
| Erizo de puntas largas | `diadema-setosum.jpg` |
| Gusano plumero | `sabellastarte-sp.jpg` |
| Pepino de mar negro | `holothuria-atra.jpg` |
| Pez ángel francés | `pomacanthus-paru.jpg` |
| Pez globo cara de perro | `arothron-nigropunctatus.jpg` |
| Cirujano gemma | `zebrasoma-gemmatum.jpg` |
| Cirujano desjardini | `zebrasoma-desjardinii.jpg` |
| Pez payaso tomate | `amphiprion-frenatus.jpg` |
| Pez payaso marrón | `amphiprion-biaculeatus.jpg` |
| Cirujano chocolate | `acanthurus-pyroferus.jpg` |
| Cirujano tomini | `ctenochaetus-tominiensis.jpg` |
| Cirujano polvo azul | `acanthurus-leucosternon.jpg` |
| Cirujano polvo café | `acanthurus-japonicus.jpg` |
| Cirujano scopas | `zebrasoma-scopas.jpg` |
| Lábrido limpiador | `labroides-dimidiatus.jpg` |
| Pez ángel reina | `holacanthus-ciliaris.jpg` |
| Gobio watchman | `cryptocentrus-cinctus.jpg` |
| Pez ángel emperador | `pomacanthus-imperator.jpg` |
| Estrella de mar cornuda | `protoreaster-lincki.jpg` |
| Pez vaca | `lactoria-cornuta.jpg` |
| Foxface magnífico | `siganus-magnificus.jpg` |
| Cirujano pimienta | `prionurus-punctatus.jpg` |
| Cirujano convicto | `acanthurus-triostegus.jpg` |
| Damisela dominó | `dascyllus-trimaculatus.jpg` |
| Tiburón bambú | `chiloscyllium-punctatum.jpg` |
| Raya de manchas azules | `taeniura-lymma.jpg` |
| Coral torch | `euphyllia-glabrescens.jpg` |
| Camarón pimienta | `lysmata-wurdemanni.jpg` |
| Pez león | `pterois-volitans.jpg` |
| Almeja fuego | `ctenoides-scaber.jpg` |

Si tu foto es `.png` o `.webp`, cambia también la extensión en el campo `imagen.archivo` del JSON.

## Pasos

1. Busca la especie por su nombre científico en **Wikimedia Commons** (https://commons.wikimedia.org). Usa solo fotos con licencia libre (CC BY, CC BY-SA, CC0 o dominio público), fotos de NOAA o fotos propias. **No** uses fotos de Google ni de tiendas como LiveAquaria.
2. Descarga una versión mediana, de unos 800 px de ancho y menos de 300 KB, y guárdala aquí con el nombre de la tabla.
3. En `especies/datos/catalogo_inicial.json`, llena el bloque `imagen` de esa especie:
   - `autor`: el nombre del autor que aparece en Commons.
   - `licencia`: por ejemplo, `CC BY-SA 4.0`.
   - `url_origen`: la página `https://commons.wikimedia.org/wiki/File:...`.
   - `fecha_consulta`: la fecha en que la descargaste.
4. Ejecuta:

   ```
   python especies/herramientas/generar_fichas.py
   ```

   La foto aparecerá en la ficha `.md` con su crédito. Si falta algún dato del crédito, el script se detiene y te dice cuál.

## Imágenes generadas con IA

Si la imagen la generaste con IA, en el bloque `imagen` pon `"origen": "ia"`, tu nombre en `autor` y la fecha en `fecha_consulta`. Deja `licencia` y `url_origen` en `null`. La ficha la mostrará como **imagen ilustrativa**, con un aviso de que no es una fotografía real. Revisa que la especie se vea correcta: número y color de las franjas, forma de las aletas, etc.

Mientras una especie no tenga foto, el script solo muestra un aviso y la ficha se genera sin imagen.
