# AIRI — Contrato de datos de las fichas de especies (v0.8)

Documento para **Yair** (compatibilidad) y **Paola** (interfaz). Describe cómo leer el catálogo sin depender de su estructura interna. Fuente única: `especies/datos/catalogo_inicial.json`.

## Cómo usarlo
- **Identificador estable:** cada especie tiene un `id` en `snake_case` que **no cambiará**. Úsenlo para relacionar especies; no usen el nombre común.
- **Datos para comparar especies:** el bloque `ficha_airi` de cada especie, con valores normalizados (sin tildes).
- **Datos detallados:** taxonomía, hábitat, pH, salinidad, conservación y fuentes, en el resto de cada especie.
- **Dato no verificado = `null`.** Nunca significa «sin restricción» ni «cero». La compatibilidad no debe darlo por bueno.
- **Fuentes:** cada dato cita identificadores que están en `fuentes`, con título y URL. Cada bloque trae su `confianza` (`alta`, `media` o `baja`).
- **Validación:** `python especies/herramientas/generar_fichas.py --comprobar` falla si un campo obligatorio falta, si un valor no está en las listas permitidas o si una fuente citada no existe.

## Campos de `ficha_airi`
| Campo | Tipo | Valores |
|---|---|---|
| `nombre_comun`, `nombre_cientifico` | texto | — |
| `grupo` | texto | `pez`, `estrella de mar`, `crustáceo`, `coral`, `anémona`, `caracol`, `erizo de mar`, `gusano`, `pepino de mar`, `almeja` |
| `temperamento.valor` | texto | `pacifico`, `semiagresivo`, `agresivo` |
| `comportamiento.etiquetas` | lista | `pacifico`, `territorial`, `solitario`, `sociable` (puede estar vacía) |
| `comportamiento.descripcion` | texto | — |
| `adecuado_arrecife.valor` | texto | `si`, `no`, `con_precaucion` (+ `explicacion`) |
| `alimentacion.tipo` | texto | `herbivoro`, `carnivoro`, `omnivoro`, `fotosintetico`, `filtrador` (+ `alimentos`, lista) |
| `temperatura_c.min` / `.max` | número o `null` | °C |
| `litraje_recomendado_l.min` | número o `null` | litros (`galones_us` aparte) |
| `tamano_adulto_cm.max` | número o `null` | cm (`medida` dice si es longitud total, estándar o diámetro) |
| `tamano_adulto_cm.tamano_venta_cm` | objeto o `null` | tamaño al comprarlo, distinto del adulto |

Cada campo trae además `fuentes`, `confianza` y, cuando hace falta, una `nota` con diferencias entre fuentes. Los corales y anémonas tienen también `cuidado_coral` (iluminación, corriente, ubicación y suplementos).

## Datos útiles para compatibilidad (sin calcularla)
Las fichas **no dictaminan compatibilidad**. Sí registran hechos con fuente que el módulo de Yair puede usar: agresión hacia la propia especie o hacia peces parecidos (`convivencia.riesgos`), especies que comen invertebrados o pican corales (`adecuado_arrecife`), toxinas (pez cofre, pepino de mar) y sensibilidad al cobre de los invertebrados.

## Ejemplo antes / después (pez payaso)
**Antes (v0.1):**
```json
{
  "nombre_comun": "Pez payaso común",
  "nombre_cientifico": "Amphiprion ocellaris",
  "temperatura": null,
  "ph": null,
  "salinidad": null,
  "volumen_minimo": null,
  "alimentacion": null,
  "comportamiento": null,
  "compatibilidad": null,
  "fuentes_verificadas": [],
  "estado_verificacion": "pendiente"
}
```
**Después (v0.7.1), solo campos de contrato** (el resto de la ficha se omite aquí):
```json
{
  "id": "amphiprion_ocellaris",
  "nombre_comun": "Pez payaso común",
  "nombre_cientifico": "Amphiprion ocellaris",
  "grupo": "pez",
  "imagen": {
    "archivo": "imagenes/amphiprion-ocellaris.jpg",
    "origen": "ia",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real."
  },
  "ficha_airi": {
    "nombre_comun": "Pez payaso común",
    "nombre_cientifico": "Amphiprion ocellaris",
    "temperamento": {
      "valor": "pacifico",
      "nota": null,
      "fuentes": [
        "liveaquaria_amphiprion_ocellaris"
      ],
      "confianza": "baja"
    },
    "comportamiento": {
      "etiquetas": [
        "pacifico",
        "territorial"
      ],
      "descripcion": "Vive en pareja monógama; la hembra es la más grande. En la naturaleza se refugia en anémonas. Defiende sus huevos frente a otros peces.",
      "fuentes": [
        "fishbase_amphiprion_ocellaris",
        "liveaquaria_amphiprion_ocellaris"
      ],
      "confianza": "media"
    },
    "adecuado_arrecife": {
      "valor": "si",
      "explicacion": "La única fuente consultada que lo evalúa (LiveAquaria) lo considera compatible con arrecife; no hay verificación independiente.",
      "fuentes": [
        "liveaquaria_amphiprion_ocellaris"
      ],
      "confianza": "baja"
    },
    "alimentacion": {
      "tipo": "omnivoro",
      "alimentos": [
        "alimentos cárnicos (misis, artemia)",
        "preparados congelados herbívoros"
      ],
      "nota": null,
      "fuentes": [
        "liveaquaria_amphiprion_ocellaris"
      ],
      "confianza": "baja"
    },
    "temperatura_c": {
      "min": 22.2,
      "max": 25.6,
      "nota": "FishBase no indica rango de temperatura para esta especie; el dato de acuario no tiene corroboración independiente.",
      "fuentes": [
        "liveaquaria_amphiprion_ocellaris"
      ],
      "confianza": "baja"
    },
    "litraje_recomendado_l": {
      "min": 75.7,
      "galones_us": 20,
      "justificacion": "Cifra de LiveAquaria. Es coherente con un pez pequeño (hasta 11 cm), de nado poco amplio, que en la naturaleza permanece junto a su anémona y vive en pareja.",
      "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
      "fuentes": [
        "liveaquaria_amphiprion_ocellaris",
        "fishbase_amphiprion_ocellaris"
      ],
      "confianza": "baja"
    },
    "tamano_adulto_cm": {
      "max": 11.0,
      "medida": "longitud total",
      "tamano_venta_cm": {
        "min": 2.5,
        "max": 10.8,
        "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
      },
      "talla_madurez_cm": null,
      "nota": "LiveAquaria indica 4¼ in (10.8 cm), coherente con FishBase (11 cm).",
      "fuentes": [
        "fishbase_amphiprion_ocellaris",
        "liveaquaria_amphiprion_ocellaris"
      ],
      "confianza": "alta"
    }
  }
}
```

## Cambios de esquema respecto a v0.1
- Se agregaron `id`, `grupo`, `imagen`, `ficha_airi`, `taxonomia`, `habitat`, `tamano_adulto`, `conservacion` y `fuentes`.
- `temperatura`, `ph`, `salinidad`, `volumen_minimo`, `alimentacion` y `comportamiento` pasaron de `null` a objetos con valores, fuente y confianza.
- `compatibilidad` (siempre `null` en v0.1) se sustituyó por `compatibilidad_arrecife` y `convivencia`, que describen hechos y no un veredicto entre especies.

## Listado de IDs (79 especies)
| `id` | Nombre común | Nombre científico | Grupo | Imagen |
|---|---|---|---|---|
| `amphiprion_ocellaris` | Pez payaso común | *Amphiprion ocellaris* | pez | sí |
| `pterapogon_kauderni` | Cardenal de Banggai | *Pterapogon kauderni* | pez | sí |
| `nemateleotris_magnifica` | Pez fuego | *Nemateleotris magnifica* | pez | sí |
| `gramma_loreto` | Gramma real | *Gramma loreto* | pez | sí |
| `zebrasoma_flavescens` | Cirujano amarillo | *Zebrasoma flavescens* | pez | sí |
| `chrysiptera_parasema` | Damisela de cola amarilla | *Chrysiptera parasema* | pez | sí |
| `naso_lituratus` | Cirujano naso | *Naso lituratus* | pez | sí |
| `paracanthurus_hepatus` | Cirujano azul | *Paracanthurus hepatus* | pez | sí |
| `siganus_vulpinus` | Pez zorro (foxface) | *Siganus vulpinus* | pez | sí |
| `zebrasoma_xanthurum` | Cirujano púrpura | *Zebrasoma xanthurum* | pez | sí |
| `zanclus_cornutus` | Ídolo moro | *Zanclus cornutus* | pez | sí |
| `chelmon_rostratus` | Pez mariposa bandas de cobre | *Chelmon rostratus* | pez | sí |
| `pseudocheilinus_hexataenia` | Lábrido de seis líneas | *Pseudocheilinus hexataenia* | pez | sí |
| `acanthurus_olivaceus` | Cirujano orange shoulder | *Acanthurus olivaceus* | pez | sí |
| `ostracion_cubicum` | Pez cofre amarillo | *Ostracion cubicum* | pez | sí |
| `acanthurus_bahianus` | Cirujano de Bahía | *Acanthurus bahianus* | pez | sí |
| `synchiropus_splendidus` | Mandarín | *Synchiropus splendidus* | pez | sí |
| `valenciennea_sexguttata` | Gobio arenero de 6 puntos | *Valenciennea sexguttata* | pez | sí |
| `linckia_laevigata` | Estrella Linckia azul | *Linckia laevigata* | estrella de mar | sí |
| `fromia_milleporella` | Estrella Fromia naranja | *Fromia milleporella* | estrella de mar | sí |
| `fromia_monilis` | Estrella mosaico | *Fromia monilis* | estrella de mar | sí |
| `astropecten_polyacanthus` | Estrella arenera | *Astropecten polyacanthus* | estrella de mar | sí |
| `protoreaster_nodosus` | Estrella chocochip | *Protoreaster nodosus* | estrella de mar | sí |
| `thor_amboinensis` | Camarón sexy | *Thor amboinensis* | crustáceo | sí |
| `lysmata_amboinensis` | Camarón limpiador | *Lysmata amboinensis* | crustáceo | sí |
| `stenopus_hispidus` | Camarón boxeador | *Stenopus hispidus* | crustáceo | sí |
| `paguristes_cadenati` | Ermitaño patas rojas | *Paguristes cadenati* | crustáceo | sí |
| `oxycirrhites_typus` | Pez halcón de nariz larga | *Oxycirrhites typus* | pez | sí |
| `centropyge_loriculus` | Ángel llama | *Centropyge loriculus* | pez | sí |
| `forcipiger_flavissimus` | Pez mariposa de nariz larga | *Forcipiger flavissimus* | pez | sí |
| `rhinecanthus_aculeatus` | Pez ballesta Picasso | *Rhinecanthus aculeatus* | pez | sí |
| `echidna_nebulosa` | Morena copo de nieve | *Echidna nebulosa* | pez | sí |
| `balistoides_conspicillum` | Pez ballesta payaso | *Balistoides conspicillum* | pez | sí |
| `acanthurus_achilles` | Cirujano Aquiles | *Acanthurus achilles* | pez | sí |
| `neocirrhites_armatus` | Pez halcón llama | *Neocirrhites armatus* | pez | sí |
| `ecsenius_midas` | Blenio Midas | *Ecsenius midas* | pez | sí |
| `choerodon_fasciatus` | Lábrido arlequín | *Choerodon fasciatus* | pez | sí |
| `briareum_violaceum` | Pólipo estrella verde | *Briareum violaceum* | coral | sí |
| `entacmaea_quadricolor` | Anémona burbuja | *Entacmaea quadricolor* | anémona | sí |
| `radianthus_crispa` | Anémona sebae | *Radianthus crispa* | anémona | sí |
| `radianthus_magnifica` | Anémona magnífica | *Radianthus magnifica* | anémona | sí |
| `capnella_sp` | Árbol de Kenia | *Capnella sp.* | coral | sí |
| `xenia_elongata` | Xenia pulsante | *Xenia elongata* | coral | sí |
| `zoanthus_sp` | Zoántidos | *Zoanthus sp.* | coral | sí |
| `caulastraea_furcata` | Coral candy cane | *Caulastraea furcata* | coral | sí |
| `clavularia_sp` | Pólipos de clavo | *Clavularia sp.* | coral | sí |
| `nassarius_sp` | Caracol Nassarius | *Nassarius sp.* | caracol | sí |
| `turbo_fluctuosus` | Caracol turbo | *Turbo fluctuosus* | caracol | sí |
| `mespilia_globulus` | Erizo tuxedo | *Mespilia globulus* | erizo de mar | sí |
| `diadema_setosum` | Erizo de puntas largas | *Diadema setosum* | erizo de mar | sí |
| `sabellastarte_sp` | Gusano plumero | *Sabellastarte sp.* | gusano | sí |
| `holothuria_atra` | Pepino de mar negro | *Holothuria atra* | pepino de mar | sí |
| `pomacanthus_paru` | Pez ángel francés | *Pomacanthus paru* | pez | sí |
| `arothron_nigropunctatus` | Pez globo cara de perro | *Arothron nigropunctatus* | pez | sí |
| `zebrasoma_gemmatum` | Cirujano gemma | *Zebrasoma gemmatum* | pez | sí |
| `zebrasoma_desjardinii` | Cirujano desjardini | *Zebrasoma desjardinii* | pez | sí |
| `amphiprion_frenatus` | Pez payaso tomate | *Amphiprion frenatus* | pez | sí |
| `amphiprion_biaculeatus` | Pez payaso marrón | *Amphiprion biaculeatus* | pez | sí |
| `acanthurus_pyroferus` | Cirujano chocolate | *Acanthurus pyroferus* | pez | sí |
| `ctenochaetus_tominiensis` | Cirujano tomini | *Ctenochaetus tominiensis* | pez | sí |
| `acanthurus_leucosternon` | Cirujano polvo azul | *Acanthurus leucosternon* | pez | sí |
| `acanthurus_japonicus` | Cirujano polvo café | *Acanthurus japonicus* | pez | sí |
| `zebrasoma_scopas` | Cirujano scopas | *Zebrasoma scopas* | pez | sí |
| `labroides_dimidiatus` | Lábrido limpiador | *Labroides dimidiatus* | pez | sí |
| `holacanthus_ciliaris` | Pez ángel reina | *Holacanthus ciliaris* | pez | sí |
| `cryptocentrus_cinctus` | Gobio watchman | *Cryptocentrus cinctus* | pez | sí |
| `pomacanthus_imperator` | Pez ángel emperador | *Pomacanthus imperator* | pez | sí |
| `protoreaster_lincki` | Estrella de mar cornuda | *Protoreaster lincki* | estrella de mar | sí |
| `lactoria_cornuta` | Pez vaca | *Lactoria cornuta* | pez | sí |
| `siganus_magnificus` | Foxface magnífico | *Siganus magnificus* | pez | sí |
| `prionurus_punctatus` | Cirujano pimienta | *Prionurus punctatus* | pez | sí |
| `acanthurus_triostegus` | Cirujano convicto | *Acanthurus triostegus* | pez | sí |
| `dascyllus_trimaculatus` | Damisela dominó | *Dascyllus trimaculatus* | pez | sí |
| `chiloscyllium_punctatum` | Tiburón bambú | *Chiloscyllium punctatum* | pez | sí |
| `taeniura_lymma` | Raya de manchas azules | *Taeniura lymma* | pez | sí |
| `euphyllia_glabrescens` | Coral torch | *Euphyllia glabrescens* | coral | sí |
| `lysmata_wurdemanni` | Camarón pimienta | *Lysmata wurdemanni* | crustáceo | sí |
| `pterois_volitans` | Pez león | *Pterois volitans* | pez | sí |
| `ctenoides_scaber` | Almeja fuego | *Ctenoides scaber* | almeja | sí |
