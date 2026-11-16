/* ═══ AIRI · Catálogo de fichas de especies (GENERADO, no editar) ═══
   Origen: especies/datos/catalogo_inicial.json · generador: especies/herramientas/generar_fichas.py
   catalogo_inicial.json  sha256 359bccf9c6571be73661a233d0b4d91cf96426390b9c65394c8cb9d50ac0eb5f */
(function (raiz) {
  "use strict";
  var datos = {
 "version": "0.5",
 "estado": "fichas verificadas con fuentes; pendientes de revisión del equipo. No determinan compatibilidad entre especies.",
 "fecha_consulta": "2026-11-16",
 "responsable": "Brayan (rama equipo/brayan-fichas-especies)",
 "advertencias": [
  "Los rangos de temperatura, pH y salinidad de acuario provienen de una fuente comercial (LiveAquaria) y se contrastan con referencias generales para agua salada (MSD, UF/IFAS, NOAA). No son límites veterinarios específicos de cada especie.",
  "Que dos especies compartan rangos de agua NO implica que puedan convivir.",
  "Los volúmenes mínimos son orientativos: provienen de una sola fuente comercial y otras fuentes de afición publican cifras distintas.",
  "Las conversiones de unidades (°F a °C, galones EE. UU. a litros, pulgadas a cm) son cálculos propios: 1 galón EE. UU. = 3.785 L; 1 pulgada = 2.54 cm; °C = (°F − 32) / 1.8. La gravedad específica no se convierte a ppt porque la conversión depende de la temperatura de medición."
 ],
 "niveles_confianza": {
  "alta": "Fuente taxonómica o institucional primaria (WoRMS, NOAA), o dos fuentes independientes que coinciden.",
  "media": "Una fuente científica de referencia (FishBase), o una fuente comercial que concuerda con una referencia institucional general.",
  "baja": "Una sola fuente comercial sin corroboración independiente, o fuentes que discrepan."
 },
 "parametros_generales_agua_salada": {
  "ph": {
   "msd_tabla": {
    "min": 7.8,
    "max": 8.3,
    "fuente": "msd_tabla_referencia"
   },
   "msd_capitulo": {
    "min": 7.8,
    "max": 8.5,
    "fuente": "msd_capitulo"
   },
   "nota": "Las dos referencias MSD discrepan en el límite superior. El motor de AIRI ya documenta esta discrepancia."
  },
  "salinidad": {
   "agua_de_mar_media_ppt": 35,
   "fuente": "ufifas_ph_sal_temp",
   "contexto_arrecife": {
    "min_ppt": 32,
    "max_ppt": 42,
    "fuente": "noaa_corales",
    "nota": "Requisito de la mayoría de los corales formadores de arrecife en el medio natural, no de los peces."
   }
  }
 },
 "fuentes": {
  "worms_amphiprion_ocellaris": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Amphiprion ocellaris Cuvier, 1830 (AphiaID 278400)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=278400"
  },
  "worms_pterapogon_kauderni": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Pterapogon kauderni Koumans, 1933 (AphiaID 282494)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=282494"
  },
  "worms_nemateleotris_magnifica": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Nemateleotris magnifica Fowler, 1938 (AphiaID 219611)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=219611"
  },
  "worms_gramma_loreto": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Gramma loreto Poey, 1868 (AphiaID 280932)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=280932"
  },
  "worms_zebrasoma_flavescens": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Zebrasoma flavescens (Bennett, 1828) (AphiaID 219683)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=219683"
  },
  "worms_chrysiptera_parasema": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Chrysiptera parasema (Fowler, 1918) (AphiaID 276836)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=276836"
  },
  "fishbase_amphiprion_ocellaris": {
   "tipo": "biología",
   "titulo": "FishBase — Amphiprion ocellaris, Clown anemonefish",
   "url": "https://www.fishbase.se/summary/Amphiprion-ocellaris.html"
  },
  "fishbase_pterapogon_kauderni": {
   "tipo": "biología",
   "titulo": "FishBase — Pterapogon kauderni, Banggai cardinal fish",
   "url": "https://www.fishbase.se/summary/Pterapogon-kauderni.html"
  },
  "fishbase_nemateleotris_magnifica": {
   "tipo": "biología",
   "titulo": "FishBase — Nemateleotris magnifica, Fire goby",
   "url": "https://www.fishbase.se/summary/Nemateleotris-magnifica.html"
  },
  "fishbase_gramma_loreto": {
   "tipo": "biología",
   "titulo": "FishBase — Gramma loreto, Royal gramma",
   "url": "https://www.fishbase.se/summary/Gramma-loreto.html"
  },
  "fishbase_zebrasoma_flavescens": {
   "tipo": "biología",
   "titulo": "FishBase — Zebrasoma flavescens, Yellow tang",
   "url": "https://www.fishbase.se/summary/Zebrasoma-flavescens.html"
  },
  "fishbase_chrysiptera_parasema": {
   "tipo": "biología",
   "titulo": "FishBase — Chrysiptera parasema, Goldtail demoiselle",
   "url": "https://www.fishbase.se/summary/Chrysiptera-parasema.html"
  },
  "noaa_banggai": {
   "tipo": "institucional",
   "titulo": "NOAA Fisheries — Banggai Cardinalfish (Species Directory; actualizada el 18/10/2023)",
   "url": "https://www.fisheries.noaa.gov/species/banggai-cardinalfish"
  },
  "liveaquaria_amphiprion_ocellaris": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Ocellaris Clownfish",
   "url": "https://www.liveaquaria.com/products/ocellaris-clownfish"
  },
  "liveaquaria_pterapogon_kauderni": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Kaudern's Cardinal",
   "url": "https://www.liveaquaria.com/products/kauderns-cardinal-1"
  },
  "liveaquaria_nemateleotris_magnifica": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Firefish Goby",
   "url": "https://www.liveaquaria.com/products/firefish"
  },
  "liveaquaria_gramma_loreto": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Royal Gramma Basslet",
   "url": "https://www.liveaquaria.com/products/royal-gramma-basslet"
  },
  "liveaquaria_zebrasoma_flavescens": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Yellow Tang, Hawaii",
   "url": "https://www.liveaquaria.com/products/yellow-tang-hawaii"
  },
  "liveaquaria_chrysiptera_parasema": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Yellowtail Damselfish",
   "url": "https://www.liveaquaria.com/products/yellowtail-damselfish"
  },
  "msd_tabla_referencia": {
   "tipo": "veterinaria",
   "titulo": "MSD Veterinary Manual — “Normal” Reference Ranges for Routine Water Quality Analysis",
   "url": "https://www.msdvetmanual.com/multimedia/table/normal-reference-ranges-for-routine-water-quality-analysis",
   "fecha_consulta": "2026-11-12",
   "nota": "Reutilizada del registro del motor (motor/airi_motor/datos/fuentes.json); no se volvió a consultar para estas fichas."
  },
  "msd_capitulo": {
   "tipo": "veterinaria",
   "titulo": "MSD Veterinary Manual — Environmental Diseases of Aquatic Animals in Aquatic Systems",
   "url": "https://www.msdvetmanual.com/exotic-and-laboratory-animals/aquatic-systems/environmental-diseases-of-aquatic-animals-in-aquatic-systems",
   "fecha_consulta": "2026-11-12",
   "nota": "Reutilizada del registro del motor (motor/airi_motor/datos/fuentes.json); no se volvió a consultar para estas fichas."
  },
  "ufifas_ph_sal_temp": {
   "tipo": "institucional",
   "titulo": "UF/IFAS — pH, Salinity and Temperature (hoja informativa)",
   "url": "https://waterwatch.ifas.ufl.edu/media/waterwatchifasufledu/FactSheet_pH_Sal_Temp.pdf",
   "fecha_consulta": "2026-11-12",
   "nota": "Reutilizada del registro del motor (motor/airi_motor/datos/fuentes.json); no se volvió a consultar para estas fichas."
  },
  "noaa_corales": {
   "tipo": "institucional",
   "titulo": "NOAA National Ocean Service — In what types of water do corals live?",
   "url": "https://oceanservice.noaa.gov/facts/coralwaters.html",
   "fecha_consulta": "2026-11-12",
   "nota": "Reutilizada del registro del motor (motor/airi_motor/datos/fuentes.json); no se volvió a consultar para estas fichas."
  },
  "worms_naso_lituratus": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Naso lituratus (Forster, 1801) (AphiaID 219665)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=219665"
  },
  "fishbase_naso_lituratus": {
   "tipo": "biología",
   "titulo": "FishBase — Naso lituratus (Forster, 1801)",
   "url": "https://www.fishbase.se/summary/Naso-lituratus.html"
  },
  "liveaquaria_naso_lituratus": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Naso Tang",
   "url": "https://www.liveaquaria.com/products/naso-tang"
  },
  "worms_paracanthurus_hepatus": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Paracanthurus hepatus (Linnaeus, 1766) (AphiaID 219676)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=219676"
  },
  "fishbase_paracanthurus_hepatus": {
   "tipo": "biología",
   "titulo": "FishBase — Paracanthurus hepatus (Linnaeus, 1766)",
   "url": "https://www.fishbase.se/summary/Paracanthurus-hepatus.html"
  },
  "liveaquaria_paracanthurus_hepatus": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Blue Tang",
   "url": "https://www.liveaquaria.com/products/blue-tang-1"
  },
  "worms_siganus_vulpinus": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Siganus vulpinus (Schlegel & Müller, 1845) (AphiaID 273929)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=273929"
  },
  "fishbase_siganus_vulpinus": {
   "tipo": "biología",
   "titulo": "FishBase — Siganus vulpinus (Schlegel & Müller, 1845)",
   "url": "https://www.fishbase.se/summary/Siganus-vulpinus.html"
  },
  "liveaquaria_siganus_vulpinus": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Foxface Lo",
   "url": "https://www.liveaquaria.com/products/foxface-lo"
  },
  "worms_zebrasoma_xanthurum": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Zebrasoma xanthurum (Blyth, 1852) (AphiaID 219681)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=219681"
  },
  "fishbase_zebrasoma_xanthurum": {
   "tipo": "biología",
   "titulo": "FishBase — Zebrasoma xanthurum (Blyth, 1852)",
   "url": "https://www.fishbase.se/summary/Zebrasoma-xanthurum.html"
  },
  "liveaquaria_zebrasoma_xanthurum": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Purple Tang",
   "url": "https://www.liveaquaria.com/products/purple-tang"
  },
  "worms_zanclus_cornutus": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Zanclus cornutus (Linnaeus, 1758) (AphiaID 220083)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=220083"
  },
  "fishbase_zanclus_cornutus": {
   "tipo": "biología",
   "titulo": "FishBase — Zanclus cornutus (Linnaeus, 1758)",
   "url": "https://www.fishbase.se/summary/Zanclus-cornutus.html"
  },
  "liveaquaria_zanclus_cornutus": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Moorish Idol (EXPERT ONLY)",
   "url": "https://www.liveaquaria.com/products/moorish-idol-expert-only"
  },
  "worms_chelmon_rostratus": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Chelmon rostratus (Linnaeus, 1758) (AphiaID 218758)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=218758"
  },
  "fishbase_chelmon_rostratus": {
   "tipo": "biología",
   "titulo": "FishBase — Chelmon rostratus (Linnaeus, 1758)",
   "url": "https://www.fishbase.se/summary/Chelmon-rostratus.html"
  },
  "liveaquaria_chelmon_rostratus": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Copperband Butterflyfish",
   "url": "https://www.liveaquaria.com/products/copperband-butterflyfish"
  },
  "worms_pseudocheilinus_hexataenia": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Pseudocheilinus hexataenia (Bleeker, 1857) (AphiaID 208915)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=208915"
  },
  "fishbase_pseudocheilinus_hexataenia": {
   "tipo": "biología",
   "titulo": "FishBase — Pseudocheilinus hexataenia (Bleeker, 1857)",
   "url": "https://www.fishbase.se/summary/Pseudocheilinus-hexataenia.html"
  },
  "liveaquaria_pseudocheilinus_hexataenia": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Six Line Wrasse",
   "url": "https://www.liveaquaria.com/products/six-line-wrasse"
  },
  "worms_acanthurus_olivaceus": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Acanthurus olivaceus Bloch & Schneider, 1801 (AphiaID 219625)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=219625"
  },
  "fishbase_acanthurus_olivaceus": {
   "tipo": "biología",
   "titulo": "FishBase — Acanthurus olivaceus Bloch & Schneider, 1801",
   "url": "https://www.fishbase.se/summary/Acanthurus-olivaceus.html"
  },
  "liveaquaria_acanthurus_olivaceus": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Orangeshoulder Tang",
   "url": "https://www.liveaquaria.com/products/orangeshoulder-tang"
  },
  "worms_ostracion_cubicum": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Ostracion cubicum Linnaeus, 1758 (AphiaID 403462)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=403462"
  },
  "fishbase_ostracion_cubicum": {
   "tipo": "biología",
   "titulo": "FishBase — Ostracion cubicum Linnaeus, 1758",
   "url": "https://www.fishbase.se/summary/Ostracion-cubicus.html"
  },
  "liveaquaria_ostracion_cubicum": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Cubicus Boxfish (EXPERT ONLY)",
   "url": "https://www.liveaquaria.com/products/cubicus-boxfish-expert-only"
  },
  "worms_synchiropus_splendidus": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Synchiropus splendidus (Herre, 1927) (AphiaID 273264)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=273264"
  },
  "fishbase_synchiropus_splendidus": {
   "tipo": "biología",
   "titulo": "FishBase — Synchiropus splendidus",
   "url": "https://www.fishbase.se/summary/Synchiropus-splendidus.html"
  },
  "liveaquaria_synchiropus_splendidus": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Green Mandarin",
   "url": "https://www.liveaquaria.com/products/green-mandarin"
  },
  "worms_valenciennea_sexguttata": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Valenciennea sexguttata (Valenciennes, 1837) (AphiaID 219598)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=219598"
  },
  "fishbase_valenciennea_sexguttata": {
   "tipo": "biología",
   "titulo": "FishBase — Valenciennea sexguttata",
   "url": "https://www.fishbase.se/summary/Valenciennea-sexguttata.html"
  },
  "liveaquaria_valenciennea_sexguttata": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Sleeper Blue Dot Goby",
   "url": "https://www.liveaquaria.com/products/sleeper-blue-dot-goby"
  },
  "worms_linckia_laevigata": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Linckia laevigata (Linnaeus, 1758) (AphiaID 207610)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=207610"
  },
  "sealifebase_linckia_laevigata": {
   "tipo": "biología",
   "titulo": "SeaLifeBase — Linckia laevigata",
   "url": "https://www.sealifebase.se/summary/Linckia-laevigata.html"
  },
  "liveaquaria_linckia_laevigata": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Linckia Sea Star, Blue (EXPERT ONLY)",
   "url": "https://www.liveaquaria.com/products/linckia-sea-star-blue-expert-only"
  },
  "worms_fromia_milleporella": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Fromia milleporella (Lamarck, 1816) (AphiaID 213299)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=213299"
  },
  "sealifebase_fromia_milleporella": {
   "tipo": "biología",
   "titulo": "SeaLifeBase — Fromia milleporella",
   "url": "https://www.sealifebase.se/summary/Fromia-milleporella.html"
  },
  "qualitymarine_fromia_milleporella": {
   "tipo": "comercial",
   "titulo": "Quality Marine — Red Fromia Sea Star",
   "url": "https://www.qualitymarine.com/quality-marine/invertebrates/stars/fromia/red-fromia-59026/"
  },
  "worms_astropecten_polyacanthus": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Astropecten polyacanthus Müller & Troschel, 1842 (AphiaID 213245)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=213245"
  },
  "sealifebase_astropecten_polyacanthus": {
   "tipo": "biología",
   "titulo": "SeaLifeBase — Astropecten polyacanthus",
   "url": "https://www.sealifebase.se/summary/Astropecten-polyacanthus.html"
  },
  "liveaquaria_astropecten_polyacanthus": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Sand Sifting Sea Star",
   "url": "https://www.liveaquaria.com/products/sand-sifting-sea-star"
  },
  "worms_protoreaster_nodosus": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Protoreaster nodosus (Linnaeus, 1758) (AphiaID 213285)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=213285"
  },
  "sealifebase_protoreaster_nodosus": {
   "tipo": "biología",
   "titulo": "SeaLifeBase — Protoreaster nodosus",
   "url": "https://www.sealifebase.se/summary/Protoreaster-nodosus.html"
  },
  "liveaquaria_protoreaster_nodosus": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Chocolate Chip Sea Star",
   "url": "https://www.liveaquaria.com/products/chocolate-chip-sea-star"
  },
  "worms_thor_amboinensis": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Thor amboinensis (De Man, 1888) (AphiaID 107534)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=107534"
  },
  "sealifebase_thor_amboinensis": {
   "tipo": "biología",
   "titulo": "SeaLifeBase — Thor amboinensis",
   "url": "https://www.sealifebase.se/summary/Thor-amboinensis.html"
  },
  "liveaquaria_thor_amboinensis": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Sexy Anemone Shrimp",
   "url": "https://www.liveaquaria.com/products/sexy-anemone-shrimp"
  },
  "worms_lysmata_amboinensis": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Lysmata amboinensis (De Man, 1888) (AphiaID 241289)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=241289"
  },
  "sealifebase_lysmata_amboinensis": {
   "tipo": "biología",
   "titulo": "SeaLifeBase — Lysmata amboinensis",
   "url": "https://www.sealifebase.se/summary/Lysmata-amboinensis.html"
  },
  "liveaquaria_lysmata_amboinensis": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Scarlet Skunk Cleaner Shrimp",
   "url": "https://www.liveaquaria.com/products/scarlet-skunk-cleaner-shrimp"
  },
  "worms_stenopus_hispidus": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Stenopus hispidus (Olivier, 1811) (AphiaID 210370)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=210370"
  },
  "sealifebase_stenopus_hispidus": {
   "tipo": "biología",
   "titulo": "SeaLifeBase — Stenopus hispidus",
   "url": "https://www.sealifebase.se/summary/Stenopus-hispidus.html"
  },
  "liveaquaria_stenopus_hispidus": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Banded Coral Shrimp",
   "url": "https://www.liveaquaria.com/products/banded-coral-shrimp"
  },
  "worms_paguristes_cadenati": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Paguristes cadenati Forest, 1954 (AphiaID 368215)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=368215"
  },
  "sealifebase_paguristes_cadenati": {
   "tipo": "biología",
   "titulo": "SeaLifeBase — Paguristes cadenati",
   "url": "https://www.sealifebase.se/summary/Paguristes-cadenati.html"
  },
  "liveaquaria_paguristes_cadenati": {
   "tipo": "comercial",
   "titulo": "LiveAquaria — Scarlet Reef Hermit Crabs",
   "url": "https://www.liveaquaria.com/products/scarlet-reef-hermit-crabs"
  },
  "worms_acanthurus_bahianus": {
   "tipo": "taxonomía",
   "titulo": "WoRMS — Acanthurus bahianus Castelnau, 1855 (AphiaID 159578)",
   "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=159578"
  },
  "fishbase_acanthurus_bahianus": {
   "tipo": "biología",
   "titulo": "FishBase — Acanthurus bahianus",
   "url": "https://www.fishbase.se/summary/Acanthurus-bahianus.html"
  },
  "qualitymarine_acanthurus_bahianus": {
   "tipo": "comercial",
   "titulo": "Quality Marine — Ocean Tang",
   "url": "https://www.qualitymarine.com/quality-marine/fish/tangs/acanthurus/ocean-surgeon-31571/"
  }
 },
 "especies": [
  {
   "id": "amphiprion_ocellaris",
   "nombre_comun": "Pez payaso común",
   "otros_nombres": [
    "Clown anemonefish",
    "Ocellaris clownfish"
   ],
   "nombre_cientifico": "Amphiprion ocellaris",
   "autoridad": "Cuvier, 1830",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/amphiprion-ocellaris.jpg",
    "origen": "ia",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/amphiprion-ocellaris.jpg"
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
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Ovalentaria (incertae sedis)",
    "familia": "Pomacentridae",
    "subfamilia": "Pomacentrinae",
    "aphia_id": 278400,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Amphiprion bicolor",
     "Amphiprion melanurus"
    ],
    "fuentes": [
     "worms_amphiprion_ocellaris",
     "fishbase_amphiprion_ocellaris"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Arrecifes coralinos del Indo-Pacífico occidental, en lagunas someras y tranquilas, entre los tentáculos de anémonas grandes (Heteractis magnifica, Stichodactyla gigantea, S. mertensii). Marino, asociado a arrecifes, no migratorio.",
    "profundidad_m": {
     "min": 1,
     "max": 15
    },
    "distribucion": "Océano Índico oriental (Andamán y Nicobar, Tailandia, Malasia, noroeste de Australia) hasta Singapur, Indonesia y Filipinas; al norte hasta Taiwán y las islas Ryukyu.",
    "fuentes": [
     "fishbase_amphiprion_ocellaris"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 11.0,
    "tipo": "longitud total",
    "contraste": "LiveAquaria: 4¼ in (≈ 10.8 cm).",
    "fuentes": [
     "fishbase_amphiprion_ocellaris",
     "liveaquaria_amphiprion_ocellaris"
    ],
    "confianza": "alta"
   },
   "alimentacion": {
    "texto": "Omnívoro. En acuario acepta la mayoría de alimentos cárnicos y preparados congelados herbívoros. FishBase no describe la dieta natural en su resumen (solo nivel trófico 3.1).",
    "fuentes": [
     "liveaquaria_amphiprion_ocellaris",
     "fishbase_amphiprion_ocellaris"
    ],
    "confianza": "baja"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_amphiprion_ocellaris"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "FishBase no indica rango de temperatura para esta especie; el dato de acuario no tiene corroboración independiente."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_amphiprion_ocellaris"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_amphiprion_ocellaris"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 75.7,
    "galones_us": 20,
    "justificacion": "Cifra de LiveAquaria. Es coherente con un pez pequeño (hasta 11 cm), de nado poco amplio, que en la naturaleza permanece junto a su anémona y vive en pareja.",
    "fuentes": [
     "liveaquaria_amphiprion_ocellaris",
     "fishbase_amphiprion_ocellaris"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Hermafrodita protándrico: la pareja es monógama y la hembra es la de mayor tamaño. Ovíparo: pone huevos adheridos al sustrato que el macho cuida y oxigena. Según LiveAquaria es pacífico y resistente, y se reproduce con facilidad en acuario. Se ha registrado que alcanzó 12 años en cautiverio.",
    "fuentes": [
     "fishbase_amphiprion_ocellaris",
     "liveaquaria_amphiprion_ocellaris"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "En la naturaleza usa anémonas como refugio. En acuario la pareja defiende la puesta frente a otros peces. Las fuentes consultadas no establecen si una anémona es imprescindible en cautiverio.",
    "fuentes": [
     "fishbase_amphiprion_ocellaris",
     "liveaquaria_amphiprion_ocellaris"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_amphiprion_ocellaris"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Puede mantenerse con otros peces payaso si se introducen en el acuario al mismo tiempo."
    ],
    "riesgos": [
     "Defiende los huevos frente a otros habitantes del acuario."
    ],
    "fuentes": [
     "liveaquaria_amphiprion_ocellaris"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 03/02/2021, según FishBase",
    "fuentes": [
     "fishbase_amphiprion_ocellaris"
    ]
   },
   "fuentes_verificadas": [
    "worms_amphiprion_ocellaris",
    "fishbase_amphiprion_ocellaris",
    "liveaquaria_amphiprion_ocellaris",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo"
  },
  {
   "id": "pterapogon_kauderni",
   "nombre_comun": "Cardenal de Banggai",
   "otros_nombres": [
    "Banggai cardinalfish",
    "Kaudern's cardinal"
   ],
   "nombre_cientifico": "Pterapogon kauderni",
   "autoridad": "Koumans, 1933",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/pterapogon-kauderni.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/pterapogon-kauderni.jpg"
   },
   "ficha_airi": {
    "nombre_comun": "Cardenal de Banggai",
    "nombre_cientifico": "Pterapogon kauderni",
    "temperamento": {
     "valor": "semiagresivo",
     "nota": "LiveAquaria lo clasifica como semiagresivo; su agresión se dirige sobre todo a ejemplares de su misma especie.",
     "fuentes": [
      "liveaquaria_pterapogon_kauderni"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "territorial"
     ],
     "descripcion": "Nadador lento y pausado. Agresivo con su propia especie: no conviene mantenerlo en grupos grandes. El macho incuba los huevos en la boca.",
     "fuentes": [
      "fishbase_pterapogon_kauderni",
      "liveaquaria_pterapogon_kauderni",
      "noaa_banggai"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "La única fuente consultada que lo evalúa (LiveAquaria) lo considera compatible con arrecife; no hay verificación independiente.",
     "fuentes": [
      "liveaquaria_pterapogon_kauderni"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "carnivoro",
     "alimentos": [
      "copépodos y otro plancton (en la naturaleza)",
      "crustáceos pequeños",
      "alimentos cárnicos: camarón, carne marina"
     ],
     "nota": null,
     "fuentes": [
      "noaa_banggai",
      "fishbase_pterapogon_kauderni",
      "liveaquaria_pterapogon_kauderni"
     ],
     "confianza": "alta"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "FishBase y NOAA no indican rango de temperatura.",
     "fuentes": [
      "liveaquaria_pterapogon_kauderni"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 113.6,
     "galones_us": 30,
     "justificacion": "Cifra de LiveAquaria, que pide rocas con cuevas. Aunque es un pez pequeño (8.6 cm), es agresivo con su propia especie y no debe mantenerse en grupos grandes. El volumen da espacio para separar territorios.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_pterapogon_kauderni"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 8.6,
     "medida": "longitud total (hembra)",
     "tamano_venta_cm": {
      "min": 2.5,
      "max": 5.1,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": 4.1,
     "nota": "NOAA: hasta 3.4 in (8.6 cm), igual que FishBase; LiveAquaria indica 3 in (7.6 cm).",
     "fuentes": [
      "fishbase_pterapogon_kauderni",
      "noaa_banggai",
      "liveaquaria_pterapogon_kauderni"
     ],
     "confianza": "alta"
    }
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Apogoniformes (WoRMS)",
    "familia": "Apogonidae",
    "subfamilia": "Apogoninae",
    "aphia_id": 282494,
    "estado_worms": "aceptado",
    "nota": "El orden varía según la fuente: Apogoniformes (WoRMS), Kurtiformes (FishBase) y Perciformes (NOAA). La familia Apogonidae coincide en las tres. Se toma WoRMS como referencia.",
    "fuentes": [
     "worms_pterapogon_kauderni",
     "fishbase_pterapogon_kauderni",
     "noaa_banggai"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Endémico del archipiélago de Banggai (Indonesia). Vive en aguas someras y tranquilas, entre arrecifes coralinos y praderas marinas (Enhalus acoroides) sobre fondos de arena limosa. Se asocia al erizo de espinas largas Diadema setosum y, cuando es juvenil, también a anémonas, que usa como refugio. Ha sido introducido fuera de su área natural a través del comercio ornamental.",
    "profundidad_m": {
     "min": 0,
     "max": 16,
     "habitual": "1–2 m"
    },
    "distribucion": "Islas Banggai, Indonesia; también islotes al este de Taliabu y cerca de Luwuk.",
    "fuentes": [
     "fishbase_pterapogon_kauderni",
     "noaa_banggai"
    ],
    "confianza": "alta"
   },
   "tamano_adulto": {
    "max_cm": 8.6,
    "tipo": "longitud total (hembra)",
    "contraste": "NOAA: hasta 3.4 in (≈ 8.6 cm); LiveAquaria: 3 in (≈ 7.6 cm).",
    "fuentes": [
     "fishbase_pterapogon_kauderni",
     "noaa_banggai"
    ],
    "confianza": "alta"
   },
   "alimentacion": {
    "texto": "Carnívoro. En la naturaleza se alimenta sobre todo de copépodos, además de otros organismos planctónicos (NOAA); FishBase indica que probablemente come crustáceos bentónicos y planctónicos de noche. En acuario: alimentos cárnicos (camarón, carne de origen marino, larvas de mosquito).",
    "fuentes": [
     "noaa_banggai",
     "fishbase_pterapogon_kauderni",
     "liveaquaria_pterapogon_kauderni"
    ],
    "confianza": "alta"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_pterapogon_kauderni"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "FishBase y NOAA no indican rango de temperatura."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_pterapogon_kauderni"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_pterapogon_kauderni"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 113.6,
    "galones_us": 30,
    "justificacion": "Cifra de LiveAquaria, que pide rocas con cuevas. Aunque es un pez pequeño (8.6 cm), es agresivo con su propia especie y no debe mantenerse en grupos grandes. El volumen da espacio para separar territorios.",
    "fuentes": [
     "liveaquaria_pterapogon_kauderni"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Nadador lento y pausado. Los machos incuban los huevos en la boca y liberan juveniles ya formados, sin fase planctónica. Vive entre 2.5 y 3 años, y como máximo hasta 5. LiveAquaria lo clasifica como semiagresivo y fácil de reproducir en acuario.",
    "fuentes": [
     "noaa_banggai",
     "fishbase_pterapogon_kauderni",
     "liveaquaria_pterapogon_kauderni"
    ],
    "confianza": "alta"
   },
   "territorialidad_refugio": {
    "texto": "Es agresivo con ejemplares de su misma especie. En la naturaleza se refugia entre las espinas de los erizos Diadema; en acuario necesita rocas con cuevas.",
    "fuentes": [
     "fishbase_pterapogon_kauderni",
     "liveaquaria_pterapogon_kauderni"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_pterapogon_kauderni"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Compañeros de acuario pacíficos.",
     "No mantenerlo en grupos grandes de la misma especie."
    ],
    "riesgos": [
     "Agresión entre ejemplares de su especie."
    ],
    "fuentes": [
     "liveaquaria_pterapogon_kauderni"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "En peligro (EN, B2ab(ii,iii,iv,v)), evaluada el 01/03/2007, según FishBase",
    "otros": "Clasificado como amenazado bajo la Ley de Especies en Peligro de EE. UU. (ESA) desde 2016. Sus principales amenazas son la captura para el comercio ornamental y la destrucción del hábitat (NOAA).",
    "recomendacion_airi": "Por su estado de conservación, AIRI debe advertirlo siempre que se consulte esta especie. Se trata de una advertencia derivada de las fuentes, no de una norma legal.",
    "fuentes": [
     "fishbase_pterapogon_kauderni",
     "noaa_banggai"
    ]
   },
   "fuentes_verificadas": [
    "worms_pterapogon_kauderni",
    "fishbase_pterapogon_kauderni",
    "noaa_banggai",
    "liveaquaria_pterapogon_kauderni",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo"
  },
  {
   "id": "nemateleotris_magnifica",
   "nombre_comun": "Pez fuego",
   "otros_nombres": [
    "Fire goby",
    "Firefish goby",
    "Fire dartfish"
   ],
   "nombre_cientifico": "Nemateleotris magnifica",
   "autoridad": "Fowler, 1938",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/nemateleotris-magnifica.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/nemateleotris-magnifica.jpg"
   },
   "ficha_airi": {
    "nombre_comun": "Pez fuego",
    "nombre_cientifico": "Nemateleotris magnifica",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "liveaquaria_nemateleotris_magnifica"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico",
      "territorial"
     ],
     "descripcion": "Tímido: necesita varios refugios entre las rocas. Solo es agresivo con su propia especie; una pareja formada convive en paz. Salta fuera del acuario si se estresa, por lo que necesita tapa.",
     "fuentes": [
      "fishbase_nemateleotris_magnifica",
      "liveaquaria_nemateleotris_magnifica"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "La única fuente consultada que lo evalúa (LiveAquaria) lo considera compatible con arrecife; no hay verificación independiente.",
     "fuentes": [
      "liveaquaria_nemateleotris_magnifica"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "carnivoro",
     "alimentos": [
      "zooplancton",
      "copépodos",
      "larvas de crustáceos",
      "artemia enriquecida y misis (en acuario)"
     ],
     "nota": "FishBase lo describe como planctívoro; LiveAquaria lo clasifica como carnívoro.",
     "fuentes": [
      "fishbase_nemateleotris_magnifica",
      "liveaquaria_nemateleotris_magnifica"
     ],
     "confianza": "alta"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "El rango de acuario cae dentro del rango natural indicado por FishBase.",
     "fuentes": [
      "liveaquaria_nemateleotris_magnifica"
     ],
     "confianza": "media"
    },
    "litraje_recomendado_l": {
     "min": 75.7,
     "galones_us": 20,
     "justificacion": "Cifra de LiveAquaria. Necesita varias zonas de refugio entre rocas y una corriente moderada.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_nemateleotris_magnifica"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 9.0,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": 2.5,
      "max": 7.6,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "Diferencia entre fuentes: FishBase 9 cm; LiveAquaria 3 in (7.6 cm).",
     "fuentes": [
      "fishbase_nemateleotris_magnifica",
      "liveaquaria_nemateleotris_magnifica"
     ],
     "confianza": "media"
    }
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Gobiiformes",
    "familia": "Gobiidae (WoRMS)",
    "subfamilia": null,
    "aphia_id": 219611,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Nemateleotris magnificus (grafía incorrecta)",
     "Nemaeleotris magnifica"
    ],
    "nota": "La familia varía según la fuente: Gobiidae (WoRMS) frente a Microdesmidae, subfamilia Ptereleotrinae (FishBase). Se toma WoRMS como referencia.",
    "fuentes": [
     "worms_nemateleotris_magnifica",
     "fishbase_nemateleotris_magnifica"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Partes altas de las pendientes externas de arrecife en el Indo-Pacífico. Bentopelágico: se mantiene sobre el fondo de cara a la corriente. Marino, asociado a arrecifes, no migratorio.",
    "profundidad_m": {
     "min": 0,
     "max": 70,
     "habitual": "6–28 m"
    },
    "distribucion": "Indo-Pacífico, desde África oriental hasta Hawái, Marquesas y Pitcairn; al norte hasta Ryukyu, al sur hasta Nueva Caledonia y las Australes; toda Micronesia.",
    "fuentes": [
     "fishbase_nemateleotris_magnifica"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 9.0,
    "tipo": "longitud total",
    "contraste": "LiveAquaria: 3 in (≈ 7.6 cm).",
    "fuentes": [
     "fishbase_nemateleotris_magnifica",
     "liveaquaria_nemateleotris_magnifica"
    ],
    "confianza": "media"
   },
   "alimentacion": {
    "texto": "Planctívoro y carnívoro: zooplancton, copépodos y larvas de crustáceos. En acuario: artemia enriquecida, misis y alimentos marinos preparados.",
    "fuentes": [
     "fishbase_nemateleotris_magnifica",
     "liveaquaria_nemateleotris_magnifica"
    ],
    "confianza": "alta"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_nemateleotris_magnifica"
     ],
     "confianza": "media"
    },
    "medio_natural": {
     "min_c": 22,
     "max_c": 28,
     "fuentes": [
      "fishbase_nemateleotris_magnifica"
     ]
    },
    "nota": "El rango de acuario cae dentro del rango natural indicado por FishBase."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_nemateleotris_magnifica"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_nemateleotris_magnifica"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 75.7,
    "galones_us": 20,
    "justificacion": "Cifra de LiveAquaria. Necesita varias zonas de refugio entre rocas y una corriente moderada.",
    "fuentes": [
     "liveaquaria_nemateleotris_magnifica"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Tímido. Se mantiene suspendido sobre el arrecife y agita su primera aleta dorsal. Varios individuos, sobre todo juveniles, pueden compartir un agujero. Es monógamo. Cuando se estresa intenta saltar fuera del acuario.",
    "fuentes": [
     "fishbase_nemateleotris_magnifica",
     "liveaquaria_nemateleotris_magnifica"
    ],
    "confianza": "alta"
   },
   "territorialidad_refugio": {
    "texto": "Cada individuo tiene un agujero de escape al que huye si se siente amenazado. En acuario necesita varias grietas o salientes rocosos. Solo es agresivo con su propia especie; una pareja formada convive en paz.",
    "fuentes": [
     "fishbase_nemateleotris_magnifica",
     "liveaquaria_nemateleotris_magnifica"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_nemateleotris_magnifica"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Acuario con tapa, porque salta.",
     "Es tímido: necesita varias zonas de refugio entre las rocas.",
     "Un solo ejemplar o una pareja ya formada."
    ],
    "riesgos": [
     "Agresión hacia otros ejemplares de su especie.",
     "Salta fuera del acuario cuando se estresa."
    ],
    "fuentes": [
     "liveaquaria_nemateleotris_magnifica"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 18/08/2023, según FishBase",
    "fuentes": [
     "fishbase_nemateleotris_magnifica"
    ]
   },
   "fuentes_verificadas": [
    "worms_nemateleotris_magnifica",
    "fishbase_nemateleotris_magnifica",
    "liveaquaria_nemateleotris_magnifica",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo"
  },
  {
   "id": "gramma_loreto",
   "nombre_comun": "Gramma real",
   "otros_nombres": [
    "Royal gramma",
    "Fairy basslet"
   ],
   "nombre_cientifico": "Gramma loreto",
   "autoridad": "Poey, 1868",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/gramma-loreto.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/gramma-loreto.jpg"
   },
   "ficha_airi": {
    "nombre_comun": "Gramma real",
    "nombre_cientifico": "Gramma loreto",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "liveaquaria_gramma_loreto"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico",
      "territorial",
      "solitario"
     ],
     "descripcion": "Territorial con su propia especie, por lo que se mantiene un solo ejemplar. Pacífico con peces de tamaño y temperamento similares. Se esconde en cuevas y nada con el vientre hacia la roca.",
     "fuentes": [
      "fishbase_gramma_loreto",
      "liveaquaria_gramma_loreto"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "La única fuente consultada que lo evalúa (LiveAquaria) lo considera compatible con arrecife; no hay verificación independiente.",
     "fuentes": [
      "liveaquaria_gramma_loreto"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "carnivoro",
     "alimentos": [
      "ectoparásitos de otros peces (en la naturaleza)",
      "artemia",
      "misis",
      "preparados congelados"
     ],
     "nota": null,
     "fuentes": [
      "fishbase_gramma_loreto",
      "liveaquaria_gramma_loreto"
     ],
     "confianza": "media"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "El rango de acuario cae dentro del rango natural indicado por FishBase.",
     "fuentes": [
      "liveaquaria_gramma_loreto"
     ],
     "confianza": "media"
    },
    "litraje_recomendado_l": {
     "min": 113.6,
     "galones_us": 30,
     "justificacion": "Cifra de LiveAquaria, que recomienda abundante roca con cuevas y luz tenue. El espacio permite que mantenga su territorio sin enfrentarse constantemente con otros peces.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_gramma_loreto"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 8.0,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": 1.3,
      "max": 6.3,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "Diferencia menor entre fuentes: FishBase 8 cm; LiveAquaria 3 in (7.6 cm).",
     "fuentes": [
      "fishbase_gramma_loreto",
      "liveaquaria_gramma_loreto"
     ],
     "confianza": "media"
    }
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Ovalentaria (incertae sedis)",
    "familia": "Grammatidae",
    "subfamilia": null,
    "aphia_id": 280932,
    "estado_worms": "aceptado",
    "nota": "LiveAquaria escribe «Grammidae»; la grafía aceptada es Grammatidae (WoRMS, FishBase).",
    "fuentes": [
     "worms_gramma_loreto",
     "fishbase_gramma_loreto"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Arrecifes del Atlántico centro-occidental. Suele vivir en cuevas o bajo salientes, nadando con el vientre orientado hacia el sustrato. Marino, asociado a arrecifes.",
    "profundidad_m": {
     "min": 1,
     "max": 60,
     "habitual": "1–40 m"
    },
    "distribucion": "Bermudas, Bahamas y Centroamérica hasta el norte de Sudamérica.",
    "fuentes": [
     "fishbase_gramma_loreto"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 8.0,
    "tipo": "longitud total",
    "contraste": "LiveAquaria: 3 in (≈ 7.6 cm).",
    "fuentes": [
     "fishbase_gramma_loreto",
     "liveaquaria_gramma_loreto"
    ],
    "confianza": "media"
   },
   "alimentacion": {
    "texto": "Carnívoro. En la naturaleza come, entre otras cosas, ectoparásitos de otros peces. En acuario: artemia, misis y preparados congelados de calidad.",
    "fuentes": [
     "fishbase_gramma_loreto",
     "liveaquaria_gramma_loreto"
    ],
    "confianza": "media"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_gramma_loreto"
     ],
     "confianza": "media"
    },
    "medio_natural": {
     "min_c": 22,
     "max_c": 27,
     "fuentes": [
      "fishbase_gramma_loreto"
     ]
    },
    "nota": "El rango de acuario cae dentro del rango natural indicado por FishBase."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_gramma_loreto"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_gramma_loreto"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 113.6,
    "galones_us": 30,
    "justificacion": "Cifra de LiveAquaria, que recomienda abundante roca con cuevas y luz tenue. El espacio permite que mantenga su territorio sin enfrentarse constantemente con otros peces.",
    "fuentes": [
     "liveaquaria_gramma_loreto"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Pacífico con peces de tamaño y temperamento similares. Cuando se alarma se esconde en grietas. El macho construye y cuida el nido en pequeños agujeros, y la hembra deposita allí los huevos al amanecer. Se ha criado en cautividad.",
    "fuentes": [
     "fishbase_gramma_loreto",
     "liveaquaria_gramma_loreto"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Es territorialmente agresivo con su propia especie, por lo que conviene mantenerlo como ejemplar único. Necesita cuevas en la roca.",
    "fuentes": [
     "liveaquaria_gramma_loreto",
     "fishbase_gramma_loreto"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_gramma_loreto"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Un solo ejemplar por acuario.",
     "Compañeros de tamaño y temperamento similares."
    ],
    "riesgos": [
     "Agresión territorial hacia otros ejemplares de su especie."
    ],
    "fuentes": [
     "liveaquaria_gramma_loreto"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 21/03/2011, según FishBase",
    "fuentes": [
     "fishbase_gramma_loreto"
    ]
   },
   "fuentes_verificadas": [
    "worms_gramma_loreto",
    "fishbase_gramma_loreto",
    "liveaquaria_gramma_loreto",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo"
  },
  {
   "id": "zebrasoma_flavescens",
   "nombre_comun": "Cirujano amarillo",
   "otros_nombres": [
    "Yellow tang",
    "Yellow Hawaiian tang"
   ],
   "nombre_cientifico": "Zebrasoma flavescens",
   "autoridad": "(Bennett, 1828)",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/zebrasoma-flavescens.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/zebrasoma-flavescens.jpg"
   },
   "ficha_airi": {
    "nombre_comun": "Cirujano amarillo",
    "nombre_cientifico": "Zebrasoma flavescens",
    "temperamento": {
     "valor": "semiagresivo",
     "nota": null,
     "fuentes": [
      "liveaquaria_zebrasoma_flavescens"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "territorial",
      "solitario"
     ],
     "descripcion": "Nadador activo en movimiento casi constante. Territorial con otros peces cirujano y con su especie: uno por acuario, salvo que varios se introduzcan a la vez.",
     "fuentes": [
      "fishbase_zebrasoma_flavescens",
      "liveaquaria_zebrasoma_flavescens"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "La única fuente consultada que lo evalúa (LiveAquaria) lo considera compatible con arrecife; no hay verificación independiente.",
     "fuentes": [
      "liveaquaria_zebrasoma_flavescens"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "herbivoro",
     "alimentos": [
      "algas filamentosas (en la naturaleza)",
      "alga marina seca",
      "algas en general, al menos 3 veces por semana"
     ],
     "nota": null,
     "fuentes": [
      "fishbase_zebrasoma_flavescens",
      "liveaquaria_zebrasoma_flavescens"
     ],
     "confianza": "alta"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "Discrepancia: el límite inferior de acuario (22.2 °C) está por debajo del mínimo natural indicado por FishBase (24 °C). Se recomienda que el equipo revise este dato.",
     "fuentes": [
      "liveaquaria_zebrasoma_flavescens"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 378.5,
     "galones_us": 100,
     "justificacion": "Cifra de LiveAquaria. Es la especie más grande del catálogo (20 cm), nada casi sin parar y necesita mucho espacio libre para nadar.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_zebrasoma_flavescens",
      "fishbase_zebrasoma_flavescens"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 20.0,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": 6.3,
      "max": 8.3,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": 6.3,
     "nota": "LiveAquaria indica 8 in (20.3 cm), coherente con FishBase (20 cm).",
     "fuentes": [
      "fishbase_zebrasoma_flavescens",
      "liveaquaria_zebrasoma_flavescens"
     ],
     "confianza": "alta"
    }
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Acanthuriformes",
    "familia": "Acanthuridae",
    "subfamilia": "Acanthurinae",
    "aphia_id": 219683,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Acanthurus flavescens Bennett, 1828 (combinación original)"
    ],
    "fuentes": [
     "worms_zebrasoma_flavescens",
     "fishbase_zebrasoma_flavescens"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Zonas ricas en coral de lagunas y arrecifes externos del Pacífico, desde debajo de la zona de oleaje hasta unos 46 m. Vive solo o en grupos laxos.",
    "profundidad_m": {
     "min": 2,
     "max": 46
    },
    "distribucion": "Océano Pacífico: islas Ryukyu, Marianas, Marshall, Marcus, Wake y Hawái. También hay registros frente a Florida.",
    "fuentes": [
     "fishbase_zebrasoma_flavescens"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 20.0,
    "tipo": "longitud total",
    "contraste": "LiveAquaria: 8 in (≈ 20.3 cm).",
    "fuentes": [
     "fishbase_zebrasoma_flavescens",
     "liveaquaria_zebrasoma_flavescens"
    ],
    "confianza": "alta"
   },
   "alimentacion": {
    "texto": "Herbívoro: ramonea algas filamentosas. En acuario necesita abundantes algas marinas (por ejemplo, alga seca sujeta a una roca o a una pinza) al menos tres veces por semana. Según LiveAquaria, esto refuerza su sistema inmunitario y reduce su agresividad.",
    "fuentes": [
     "fishbase_zebrasoma_flavescens",
     "liveaquaria_zebrasoma_flavescens"
    ],
    "confianza": "alta"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_zebrasoma_flavescens"
     ],
     "confianza": "baja"
    },
    "medio_natural": {
     "min_c": 24,
     "max_c": 28,
     "fuentes": [
      "fishbase_zebrasoma_flavescens"
     ]
    },
    "nota": "Discrepancia: el límite inferior de acuario (22.2 °C) está por debajo del mínimo natural indicado por FishBase (24 °C). Se recomienda que el equipo revise este dato."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_zebrasoma_flavescens"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_zebrasoma_flavescens"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 378.5,
    "galones_us": 100,
    "justificacion": "Cifra de LiveAquaria. Es la especie más grande del catálogo (20 cm), nada casi sin parar y necesita mucho espacio libre para nadar.",
    "fuentes": [
     "liveaquaria_zebrasoma_flavescens",
     "fishbase_zebrasoma_flavescens"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Nadador activo, en movimiento casi constante. Desova en grupo o en parejas formadas por machos territoriales que cortejan a las hembras, con actividad en torno a la luna llena. LiveAquaria lo clasifica como semiagresivo.",
    "fuentes": [
     "fishbase_zebrasoma_flavescens",
     "liveaquaria_zebrasoma_flavescens"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Agresión territorial hacia su propia especie y hacia otros peces cirujano. Necesita roca viva y amplio espacio abierto para nadar.",
    "fuentes": [
     "liveaquaria_zebrasoma_flavescens"
    ],
    "confianza": "baja"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_zebrasoma_flavescens"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Un solo ejemplar por acuario, salvo que varios se introduzcan a la vez.",
     "Dieta rica en algas para reducir la agresividad."
    ],
    "riesgos": [
     "Agresión hacia otros peces cirujano y hacia los de su especie."
    ],
    "fuentes": [
     "liveaquaria_zebrasoma_flavescens"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 07/05/2010, según FishBase",
    "otros": "FishBase lo describe como el pez marino más exportado de Hawái.",
    "fuentes": [
     "fishbase_zebrasoma_flavescens"
    ]
   },
   "fuentes_verificadas": [
    "worms_zebrasoma_flavescens",
    "fishbase_zebrasoma_flavescens",
    "liveaquaria_zebrasoma_flavescens",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo"
  },
  {
   "id": "chrysiptera_parasema",
   "nombre_comun": "Damisela de cola amarilla",
   "otros_nombres": [
    "Goldtail demoiselle",
    "Yellowtail damselfish",
    "Yellowtail blue damsel"
   ],
   "nombre_cientifico": "Chrysiptera parasema",
   "autoridad": "(Fowler, 1918)",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/chrysiptera-parasema.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/chrysiptera-parasema.jpg"
   },
   "ficha_airi": {
    "nombre_comun": "Damisela de cola amarilla",
    "nombre_cientifico": "Chrysiptera parasema",
    "temperamento": {
     "valor": "semiagresivo",
     "nota": "LiveAquaria la considera menos agresiva que otras damiselas.",
     "fuentes": [
      "liveaquaria_chrysiptera_parasema"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "sociable",
      "territorial"
     ],
     "descripcion": "Vive en pequeños grupos (mejor en número impar). Algunos ejemplares son territoriales con su especie o con peces de tamaño similar; el macho se vuelve muy territorial al cuidar la puesta.",
     "fuentes": [
      "fishbase_chrysiptera_parasema",
      "liveaquaria_chrysiptera_parasema"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "La única fuente consultada que lo evalúa (LiveAquaria) lo considera compatible con arrecife; no hay verificación independiente.",
     "fuentes": [
      "liveaquaria_chrysiptera_parasema"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "omnivoro",
     "alimentos": [
      "zooplancton",
      "algas",
      "misis",
      "camarón enriquecido"
     ],
     "nota": null,
     "fuentes": [
      "liveaquaria_chrysiptera_parasema"
     ],
     "confianza": "baja"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "FishBase no indica rango de temperatura para esta especie.",
     "fuentes": [
      "liveaquaria_chrysiptera_parasema"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 113.6,
     "galones_us": 30,
     "justificacion": "Cifra de LiveAquaria. Aunque es pequeña (7 cm), se recomienda mantenerla en grupos pequeños de número impar y con varios escondites, lo que exige espacio para repartir territorios.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_chrysiptera_parasema"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 7.0,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": 1.3,
      "max": 6.3,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "LiveAquaria indica 2¾ in (7.0 cm), igual que FishBase (7 cm).",
     "fuentes": [
      "fishbase_chrysiptera_parasema",
      "liveaquaria_chrysiptera_parasema"
     ],
     "confianza": "alta"
    }
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Ovalentaria (incertae sedis)",
    "familia": "Pomacentridae",
    "subfamilia": "Pomacentrinae",
    "aphia_id": 276836,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Abudefduf parasema Fowler, 1918 (combinación original)"
    ],
    "fuentes": [
     "worms_chrysiptera_parasema",
     "fishbase_chrysiptera_parasema"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Zonas ricas en coral de lagunas resguardadas y arrecifes costeros. Vive en pequeños grupos sobre colonias de Acropora y es diurno. Marino, asociado a arrecifes, no migratorio.",
    "profundidad_m": {
     "min": 1,
     "max": 16
    },
    "distribucion": "Pacífico occidental: Islas Salomón, norte de Papúa Nueva Guinea, Filipinas e islas Ryukyu. Hay un registro dudoso en la Gran Barrera de Coral.",
    "fuentes": [
     "fishbase_chrysiptera_parasema"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 7.0,
    "tipo": "longitud total",
    "contraste": "LiveAquaria: 2¾ in (≈ 7.0 cm).",
    "fuentes": [
     "fishbase_chrysiptera_parasema",
     "liveaquaria_chrysiptera_parasema"
    ],
    "confianza": "alta"
   },
   "alimentacion": {
    "texto": "Omnívoro. En acuario come zooplancton y algas, y conviene darle una dieta variada de alimentos cárnicos (misis, camarón enriquecido) en varias tomas pequeñas al día. FishBase no describe la dieta natural en su resumen.",
    "fuentes": [
     "liveaquaria_chrysiptera_parasema"
    ],
    "confianza": "baja"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_chrysiptera_parasema"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "FishBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_chrysiptera_parasema"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_chrysiptera_parasema"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 113.6,
    "galones_us": 30,
    "justificacion": "Cifra de LiveAquaria. Aunque es pequeña (7 cm), se recomienda mantenerla en grupos pequeños de número impar y con varios escondites, lo que exige espacio para repartir territorios.",
    "fuentes": [
     "liveaquaria_chrysiptera_parasema"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Diurna y gregaria en pequeños grupos. Durante la reproducción forma parejas bien definidas: los huevos quedan adheridos al sustrato y el macho los cuida y oxigena. LiveAquaria la considera semiagresiva, aunque menos agresiva que otras damiselas.",
    "fuentes": [
     "fishbase_chrysiptera_parasema",
     "liveaquaria_chrysiptera_parasema"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Prefiere tener varios escondites. Algunos ejemplares son territoriales con su especie o con peces de tamaño parecido, y el macho se vuelve muy territorial mientras cuida la puesta.",
    "fuentes": [
     "liveaquaria_chrysiptera_parasema"
    ],
    "confianza": "baja"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_chrysiptera_parasema"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Grupos pequeños de número impar en acuarios del tamaño adecuado.",
     "Compañeros pacíficos."
    ],
    "riesgos": [
     "Territorialidad hacia peces de su especie o de tamaño similar.",
     "Agresividad del macho durante la reproducción."
    ],
    "fuentes": [
     "liveaquaria_chrysiptera_parasema"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 23/09/2021, según FishBase",
    "fuentes": [
     "fishbase_chrysiptera_parasema"
    ]
   },
   "fuentes_verificadas": [
    "worms_chrysiptera_parasema",
    "fishbase_chrysiptera_parasema",
    "liveaquaria_chrysiptera_parasema",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo"
  },
  {
   "id": "naso_lituratus",
   "nombre_comun": "Cirujano naso",
   "otros_nombres": [
    "Orangespine unicornfish",
    "Naso tang"
   ],
   "nombre_cientifico": "Naso lituratus",
   "autoridad": "(Forster, 1801)",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/naso-lituratus.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/naso-lituratus.jpg"
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Acanthuriformes",
    "familia": "Acanthuridae",
    "subfamilia": "Nasinae",
    "aphia_id": 219665,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Acanthurus lituratus Forster, 1801 (combinación original)"
    ],
    "nota": "FishBase indica que la población del océano Índico se considera ahora otra especie, Naso elegans.",
    "fuentes": [
     "worms_naso_lituratus",
     "fishbase_naso_lituratus"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Zonas de coral, roca o cascajo en lagunas y arrecifes externos. Los adultos suelen ir en grupos pequeños y a veces forman grandes agregaciones; los juveniles viven en arrecifes rocosos someros.",
    "profundidad_m": {
     "min": 0,
     "max": 90,
     "habitual": "5–30 m"
    },
    "distribucion": "Pacífico: de Honshu (Japón) a la Gran Barrera de Coral y Nueva Caledonia, y al este hasta Hawái, Polinesia Francesa, Pitcairn y la isla Clipperton.",
    "fuentes": [
     "fishbase_naso_lituratus"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 46.0,
    "tipo": "longitud estándar",
    "contraste": "LiveAquaria: 18 in (≈ 45.7 cm). FishBase mide longitud estándar (sin la aleta caudal), así que la longitud total es mayor.",
    "fuentes": [
     "fishbase_naso_lituratus",
     "liveaquaria_naso_lituratus"
    ],
    "confianza": "alta"
   },
   "alimentacion": {
    "texto": "Herbívoro: en la naturaleza come sobre todo algas pardas foliosas (Sargassum y Dictyota). En acuario necesita abundantes algas marinas, al menos tres veces por semana.",
    "fuentes": [
     "fishbase_naso_lituratus",
     "liveaquaria_naso_lituratus"
    ],
    "confianza": "alta"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_naso_lituratus"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "FishBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_naso_lituratus"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_naso_lituratus"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 681.3,
    "galones_us": 180,
    "justificacion": "Cifra de LiveAquaria (180 gal). Es un pez grande (hasta 46 cm de longitud estándar) y nadador activo que necesita mucho espacio libre, escondites y tapa, porque puede saltar.",
    "fuentes": [
     "liveaquaria_naso_lituratus",
     "fishbase_naso_lituratus"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Nadador activo. Agresivo con otros peces cirujano y pacífico con el resto (LiveAquaria). Puede saltar para escapar. Probablemente desova en parejas (FishBase).",
    "fuentes": [
     "fishbase_naso_lituratus",
     "liveaquaria_naso_lituratus"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Territorial con otros cirujanos. Necesita escondites además de espacio libre para nadar.",
    "fuentes": [
     "liveaquaria_naso_lituratus",
     "fishbase_naso_lituratus"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_naso_lituratus"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Acuario grande con tapa.",
     "Dieta rica en algas."
    ],
    "riesgos": [
     "Agresión hacia otros peces cirujano.",
     "Puede saltar fuera del acuario.",
     "FishBase lo clasifica como venenoso para las personas (muy rara vez)."
    ],
    "fuentes": [
     "liveaquaria_naso_lituratus",
     "fishbase_naso_lituratus"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 06/05/2010, según FishBase",
    "fuentes": [
     "fishbase_naso_lituratus"
    ]
   },
   "fuentes_verificadas": [
    "worms_naso_lituratus",
    "fishbase_naso_lituratus",
    "liveaquaria_naso_lituratus",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Cirujano naso",
    "nombre_cientifico": "Naso lituratus",
    "temperamento": {
     "valor": "semiagresivo",
     "nota": null,
     "fuentes": [
      "liveaquaria_naso_lituratus"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "territorial"
     ],
     "descripcion": "Nadador activo que necesita mucho espacio. Agresivo con otros peces cirujano y pacífico con el resto. Puede saltar: el acuario necesita tapa.",
     "fuentes": [
      "fishbase_naso_lituratus",
      "liveaquaria_naso_lituratus"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "LiveAquaria lo considera compatible con arrecife; no hay verificación independiente.",
     "fuentes": [
      "liveaquaria_naso_lituratus"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "herbivoro",
     "alimentos": [
      "algas pardas foliosas (Sargassum, Dictyota)",
      "alga marina seca",
      "algas al menos 3 veces por semana"
     ],
     "nota": null,
     "fuentes": [
      "fishbase_naso_lituratus",
      "liveaquaria_naso_lituratus"
     ],
     "confianza": "alta"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "FishBase no indica rango de temperatura para esta especie.",
     "fuentes": [
      "liveaquaria_naso_lituratus"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 681.3,
     "galones_us": 180,
     "justificacion": "Cifra de LiveAquaria (180 gal). Es un pez grande (hasta 46 cm de longitud estándar) y nadador activo que necesita mucho espacio libre, escondites y tapa, porque puede saltar.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_naso_lituratus"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 46.0,
     "medida": "longitud estándar",
     "tamano_venta_cm": {
      "min": 2.5,
      "max": 22.9,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "LiveAquaria: 18 in (≈ 45.7 cm). FishBase mide longitud estándar (sin la aleta caudal), así que la longitud total es mayor.",
     "fuentes": [
      "fishbase_naso_lituratus",
      "liveaquaria_naso_lituratus"
     ],
     "confianza": "alta"
    }
   }
  },
  {
   "id": "paracanthurus_hepatus",
   "nombre_comun": "Cirujano azul",
   "otros_nombres": [
    "Palette surgeonfish",
    "Blue tang",
    "Regal tang"
   ],
   "nombre_cientifico": "Paracanthurus hepatus",
   "autoridad": "(Linnaeus, 1766)",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/paracanthurus-hepatus.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/paracanthurus-hepatus.jpg"
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Acanthuriformes",
    "familia": "Acanthuridae",
    "subfamilia": "Acanthurinae",
    "aphia_id": 219676,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Teuthis hepatus Linnaeus, 1766 (combinación original)",
     "Acanthurus hepatus"
    ],
    "fuentes": [
     "worms_paracanthurus_hepatus",
     "fishbase_paracanthurus_hepatus"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Terrazas claras y con corriente de arrecifes externos, en grupos sueltos a 1–2 m sobre el fondo. Juveniles y subadultos viven en grupo cerca de cabezas del coral Pocillopora eydouxi y se esconden entre sus ramas.",
    "profundidad_m": {
     "min": 2,
     "max": 40,
     "habitual": "10–40 m"
    },
    "distribucion": "Indo-Pacífico: de África oriental (incluidas las Mascareñas) a Kiribati; al norte hasta el sur de Japón; al sur hasta la Gran Barrera de Coral, Nueva Caledonia y Samoa.",
    "fuentes": [
     "fishbase_paracanthurus_hepatus"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 31.0,
    "tipo": "longitud total",
    "contraste": "LiveAquaria: 12 in (≈ 30.5 cm), coherente con FishBase.",
    "fuentes": [
     "fishbase_paracanthurus_hepatus",
     "liveaquaria_paracanthurus_hepatus"
    ],
    "confianza": "alta"
   },
   "alimentacion": {
    "texto": "FishBase indica que come zooplancton y ocasionalmente algas; LiveAquaria lo clasifica como herbívoro y recomienda abundantes algas marinas al menos tres veces por semana, además de alimentos cárnicos.",
    "fuentes": [
     "fishbase_paracanthurus_hepatus",
     "liveaquaria_paracanthurus_hepatus"
    ],
    "confianza": "media"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_paracanthurus_hepatus"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "FishBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_paracanthurus_hepatus"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_paracanthurus_hepatus"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 681.3,
    "galones_us": 180,
    "justificacion": "Cifra de LiveAquaria (180 gal), que además recomienda acuarios de al menos 6 pies (≈ 1.8 m) de largo. Es un nadador activo de hasta 31 cm que necesita mucho espacio y escondites en la roca.",
    "fuentes": [
     "liveaquaria_paracanthurus_hepatus",
     "fishbase_paracanthurus_hepatus"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Nadador activo que necesita espacio y escondites. Pacífico con la mayoría de los peces, pero agresivo con los de su especie. Más propenso que otros peces a enfermedades de la línea lateral, erosión de aletas e ich (LiveAquaria).",
    "fuentes": [
     "fishbase_paracanthurus_hepatus",
     "liveaquaria_paracanthurus_hepatus"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Agresivo con su propia especie. Necesita escondites en la roca viva.",
    "fuentes": [
     "liveaquaria_paracanthurus_hepatus",
     "fishbase_paracanthurus_hepatus"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_paracanthurus_hepatus"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Para varios ejemplares, introducirlos todos a la vez en un acuario grande.",
     "Excelente calidad del agua y dieta rica en algas."
    ],
    "riesgos": [
     "Agresión hacia otros cirujanos azules.",
     "Propenso a enfermedades de piel y aletas (ich, erosión de aletas).",
     "FishBase lo clasifica como venenoso (glándula de veneno)."
    ],
    "fuentes": [
     "liveaquaria_paracanthurus_hepatus",
     "fishbase_paracanthurus_hepatus"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 07/05/2010, según FishBase",
    "fuentes": [
     "fishbase_paracanthurus_hepatus"
    ]
   },
   "fuentes_verificadas": [
    "worms_paracanthurus_hepatus",
    "fishbase_paracanthurus_hepatus",
    "liveaquaria_paracanthurus_hepatus",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Cirujano azul",
    "nombre_cientifico": "Paracanthurus hepatus",
    "temperamento": {
     "valor": "semiagresivo",
     "nota": "LiveAquaria lo clasifica como semiagresivo, aunque lo describe como pacífico con la mayoría de los peces.",
     "fuentes": [
      "liveaquaria_paracanthurus_hepatus"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "territorial"
     ],
     "descripcion": "Nadador activo; necesita espacio y escondites. Pacífico con la mayoría de los peces, agresivo con los de su especie. Delicado: propenso al ich y a la erosión de aletas.",
     "fuentes": [
      "fishbase_paracanthurus_hepatus",
      "liveaquaria_paracanthurus_hepatus"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "LiveAquaria lo considera compatible con arrecife; no hay verificación independiente.",
     "fuentes": [
      "liveaquaria_paracanthurus_hepatus"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "omnivoro",
     "alimentos": [
      "zooplancton",
      "algas",
      "alga marina seca",
      "alimentos cárnicos"
     ],
     "nota": "Diferencia entre fuentes: FishBase describe una dieta de zooplancton y algas; LiveAquaria lo clasifica como herbívoro.",
     "fuentes": [
      "fishbase_paracanthurus_hepatus",
      "liveaquaria_paracanthurus_hepatus"
     ],
     "confianza": "media"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "FishBase no indica rango de temperatura para esta especie.",
     "fuentes": [
      "liveaquaria_paracanthurus_hepatus"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 681.3,
     "galones_us": 180,
     "justificacion": "Cifra de LiveAquaria (180 gal), que además recomienda acuarios de al menos 6 pies (≈ 1.8 m) de largo. Es un nadador activo de hasta 31 cm que necesita mucho espacio y escondites en la roca.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_paracanthurus_hepatus"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 31.0,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": 1.3,
      "max": 10.2,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "LiveAquaria: 12 in (≈ 30.5 cm), coherente con FishBase.",
     "fuentes": [
      "fishbase_paracanthurus_hepatus",
      "liveaquaria_paracanthurus_hepatus"
     ],
     "confianza": "alta"
    }
   }
  },
  {
   "id": "siganus_vulpinus",
   "nombre_comun": "Pez zorro (foxface)",
   "otros_nombres": [
    "Foxface rabbitfish",
    "Foxface Lo"
   ],
   "nombre_cientifico": "Siganus vulpinus",
   "autoridad": "(Schlegel & Müller, 1845)",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/siganus-vulpinus.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/siganus-vulpinus.jpg"
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Eupercaria incertae sedis (WoRMS)",
    "familia": "Siganidae",
    "subfamilia": null,
    "aphia_id": 273929,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Amphacanthus vulpinus Schlegel & Müller, 1845 (combinación original)",
     "Lo vulpinus"
    ],
    "nota": "El orden varía según la fuente: Eupercaria incertae sedis (WoRMS) y Acanthuriformes (FishBase). Se toma WoRMS como referencia.",
    "fuentes": [
     "worms_siganus_vulpinus",
     "fishbase_siganus_vulpinus"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Zonas ricas en coral de lagunas y arrecifes externos, a menudo entre corales cuerno de ciervo. Suele ir solo o en parejas; juveniles y subadultos forman a veces grandes cardúmenes entre Acropora, donde comen algas.",
    "profundidad_m": {
     "min": 0,
     "max": 30,
     "habitual": "1–30 m"
    },
    "distribucion": "Pacífico occidental: oeste de Filipinas, Indonesia, Nueva Guinea, Gran Barrera de Coral, Nueva Caledonia, islas Carolinas y Marshall; registrado recientemente en Tonga.",
    "fuentes": [
     "fishbase_siganus_vulpinus"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 25.0,
    "tipo": "longitud estándar",
    "contraste": "LiveAquaria: 9 in (≈ 22.9 cm). FishBase da una longitud habitual de 20 cm (longitud total).",
    "fuentes": [
     "fishbase_siganus_vulpinus",
     "liveaquaria_siganus_vulpinus"
    ],
    "confianza": "media"
   },
   "alimentacion": {
    "texto": "Herbívoro: en la naturaleza come algas. En acuario, verduras frescas y algas indeseables. Si no está bien alimentado puede picar pólipos de corales blandos y LPS.",
    "fuentes": [
     "fishbase_siganus_vulpinus",
     "liveaquaria_siganus_vulpinus"
    ],
    "confianza": "alta"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_siganus_vulpinus"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "FishBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_siganus_vulpinus"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_siganus_vulpinus"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 473.1,
    "galones_us": 125,
    "justificacion": "Cifra de LiveAquaria (125 gal). Alcanza 22–25 cm y es un nadador de tamaño medio que necesita espacio.",
    "fuentes": [
     "liveaquaria_siganus_vulpinus",
     "fishbase_siganus_vulpinus"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Muy pacífico, salvo con otros peces conejo (LiveAquaria). FishBase indica que a veces es territorial. Tiene espinas venenosas capaces de causar picaduras dolorosas; por eso sus depredadores suelen dejarlo en paz.",
    "fuentes": [
     "fishbase_siganus_vulpinus",
     "liveaquaria_siganus_vulpinus"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "A veces territorial (FishBase); agresivo con otros peces conejo (LiveAquaria).",
    "fuentes": [
     "liveaquaria_siganus_vulpinus",
     "fishbase_siganus_vulpinus"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "con precaución",
    "fuentes": [
     "liveaquaria_siganus_vulpinus"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Puede convivir con peces más agresivos.",
     "Un solo pez conejo por acuario.",
     "Bien alimentado con algas para proteger los corales."
    ],
    "riesgos": [
     "Espinas venenosas: picaduras dolorosas para las personas.",
     "Puede picar corales blandos y LPS.",
     "Agresión hacia otros peces conejo."
    ],
    "fuentes": [
     "liveaquaria_siganus_vulpinus",
     "fishbase_siganus_vulpinus"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 12/03/2015, según FishBase",
    "fuentes": [
     "fishbase_siganus_vulpinus"
    ]
   },
   "fuentes_verificadas": [
    "worms_siganus_vulpinus",
    "fishbase_siganus_vulpinus",
    "liveaquaria_siganus_vulpinus",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Pez zorro (foxface)",
    "nombre_cientifico": "Siganus vulpinus",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "liveaquaria_siganus_vulpinus"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico",
      "territorial"
     ],
     "descripcion": "Pacífico, salvo con otros peces conejo; a veces territorial. Tiene espinas dorsales venenosas que causan picaduras dolorosas: manipular con cuidado.",
     "fuentes": [
      "fishbase_siganus_vulpinus",
      "liveaquaria_siganus_vulpinus"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "con_precaucion",
     "explicacion": "Si no está bien alimentado puede picar y comer pólipos de corales blandos y LPS (LiveAquaria).",
     "fuentes": [
      "liveaquaria_siganus_vulpinus"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "herbivoro",
     "alimentos": [
      "algas",
      "verduras frescas",
      "algas indeseables del acuario"
     ],
     "nota": null,
     "fuentes": [
      "fishbase_siganus_vulpinus",
      "liveaquaria_siganus_vulpinus"
     ],
     "confianza": "alta"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "FishBase no indica rango de temperatura para esta especie.",
     "fuentes": [
      "liveaquaria_siganus_vulpinus"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 473.1,
     "galones_us": 125,
     "justificacion": "Cifra de LiveAquaria (125 gal). Alcanza 22–25 cm y es un nadador de tamaño medio que necesita espacio.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_siganus_vulpinus"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 25.0,
     "medida": "longitud estándar",
     "tamano_venta_cm": {
      "min": 2.5,
      "max": 20.3,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "LiveAquaria: 9 in (≈ 22.9 cm). FishBase da una longitud habitual de 20 cm (longitud total).",
     "fuentes": [
      "fishbase_siganus_vulpinus",
      "liveaquaria_siganus_vulpinus"
     ],
     "confianza": "media"
    }
   }
  },
  {
   "id": "zebrasoma_xanthurum",
   "nombre_comun": "Cirujano púrpura",
   "otros_nombres": [
    "Purple tang",
    "Yellowtail tang"
   ],
   "nombre_cientifico": "Zebrasoma xanthurum",
   "autoridad": "(Blyth, 1852)",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/zebrasoma-xanthurum.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/zebrasoma-xanthurum.jpg"
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Acanthuriformes",
    "familia": "Acanthuridae",
    "subfamilia": "Acanthurinae",
    "aphia_id": 219681,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Acanthurus xanthurus Blyth, 1852 (combinación original)"
    ],
    "fuentes": [
     "worms_zebrasoma_xanthurum",
     "fishbase_zebrasoma_xanthurum"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "A menudo en grupos en zonas ricas en coral o sobre fondos rocosos (FishBase). LiveAquaria indica que suele vivir solo, aunque a veces forma cardúmenes en el sur del Mar Rojo.",
    "profundidad_m": {
     "min": 0,
     "max": 20,
     "habitual": "2–20 m"
    },
    "distribucion": "Océano Índico occidental: del Mar Rojo al golfo Pérsico; registrado en Maldivas.",
    "fuentes": [
     "fishbase_zebrasoma_xanthurum"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 36.7,
    "tipo": "longitud total",
    "contraste": "Diferencia importante entre fuentes: FishBase registra 36.7 cm de longitud total (longitud habitual 10 cm); LiveAquaria indica que los adultos llegan a 10 in (≈ 25.4 cm).",
    "fuentes": [
     "fishbase_zebrasoma_xanthurum",
     "liveaquaria_zebrasoma_xanthurum"
    ],
    "confianza": "baja"
   },
   "alimentacion": {
    "texto": "Herbívoro: por sus dientes faríngeos, FishBase deduce que come sobre todo algas filamentosas. En acuario necesita abundantes algas marinas, al menos tres veces por semana.",
    "fuentes": [
     "fishbase_zebrasoma_xanthurum",
     "liveaquaria_zebrasoma_xanthurum"
    ],
    "confianza": "alta"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_zebrasoma_xanthurum"
     ],
     "confianza": "baja"
    },
    "medio_natural": {
     "min_c": 24,
     "max_c": 28,
     "fuentes": [
      "fishbase_zebrasoma_xanthurum"
     ]
    },
    "nota": "Discrepancia: el límite inferior de acuario (22.2 °C) está por debajo del mínimo natural indicado por FishBase (24 °C)."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_zebrasoma_xanthurum"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_zebrasoma_xanthurum"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 492.1,
    "galones_us": 130,
    "justificacion": "Cifra de LiveAquaria (130 gal). Necesita mucho espacio libre para nadar, buena iluminación y escondites.",
    "fuentes": [
     "liveaquaria_zebrasoma_xanthurum",
     "fishbase_zebrasoma_xanthurum"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Puede ser muy agresivo y no tolera compañeros de forma corporal parecida, sobre todo otros cirujanos del género Zebrasoma (LiveAquaria).",
    "fuentes": [
     "fishbase_zebrasoma_xanthurum",
     "liveaquaria_zebrasoma_xanthurum"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Muy territorial con peces de forma corporal parecida, en especial otros Zebrasoma.",
    "fuentes": [
     "liveaquaria_zebrasoma_xanthurum",
     "fishbase_zebrasoma_xanthurum"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_zebrasoma_xanthurum"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Sin otros cirujanos Zebrasoma ni peces de forma parecida.",
     "Dieta rica en algas."
    ],
    "riesgos": [
     "Agresión fuerte hacia otros cirujanos, en especial Zebrasoma (por ejemplo, el cirujano amarillo del catálogo)."
    ],
    "fuentes": [
     "liveaquaria_zebrasoma_xanthurum",
     "fishbase_zebrasoma_xanthurum"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 07/05/2010, según FishBase",
    "fuentes": [
     "fishbase_zebrasoma_xanthurum"
    ]
   },
   "fuentes_verificadas": [
    "worms_zebrasoma_xanthurum",
    "fishbase_zebrasoma_xanthurum",
    "liveaquaria_zebrasoma_xanthurum",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Cirujano púrpura",
    "nombre_cientifico": "Zebrasoma xanthurum",
    "temperamento": {
     "valor": "semiagresivo",
     "nota": "LiveAquaria lo clasifica como semiagresivo, pero advierte que puede ser muy agresivo.",
     "fuentes": [
      "liveaquaria_zebrasoma_xanthurum"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "territorial"
     ],
     "descripcion": "Puede ser muy agresivo con peces de forma parecida, sobre todo otros cirujanos Zebrasoma. Necesita espacio libre para nadar y escondites.",
     "fuentes": [
      "fishbase_zebrasoma_xanthurum",
      "liveaquaria_zebrasoma_xanthurum"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "LiveAquaria lo considera compatible con arrecife; no hay verificación independiente.",
     "fuentes": [
      "liveaquaria_zebrasoma_xanthurum"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "herbivoro",
     "alimentos": [
      "algas filamentosas",
      "alga marina seca",
      "algas al menos 3 veces por semana"
     ],
     "nota": null,
     "fuentes": [
      "fishbase_zebrasoma_xanthurum",
      "liveaquaria_zebrasoma_xanthurum"
     ],
     "confianza": "alta"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "Discrepancia: el límite inferior de acuario (22.2 °C) está por debajo del mínimo natural indicado por FishBase (24 °C).",
     "fuentes": [
      "liveaquaria_zebrasoma_xanthurum"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 492.1,
     "galones_us": 130,
     "justificacion": "Cifra de LiveAquaria (130 gal). Necesita mucho espacio libre para nadar, buena iluminación y escondites.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_zebrasoma_xanthurum"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 36.7,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": 2.5,
      "max": 17.8,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "Diferencia importante entre fuentes: FishBase registra 36.7 cm de longitud total (longitud habitual 10 cm); LiveAquaria indica que los adultos llegan a 10 in (≈ 25.4 cm).",
     "fuentes": [
      "fishbase_zebrasoma_xanthurum",
      "liveaquaria_zebrasoma_xanthurum"
     ],
     "confianza": "baja"
    }
   }
  },
  {
   "id": "zanclus_cornutus",
   "nombre_comun": "Ídolo moro",
   "otros_nombres": [
    "Moorish idol",
    "Kihikihi"
   ],
   "nombre_cientifico": "Zanclus cornutus",
   "autoridad": "(Linnaeus, 1758)",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/zanclus-cornutus.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/zanclus-cornutus.jpg"
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Acanthuriformes",
    "familia": "Zanclidae",
    "subfamilia": null,
    "aphia_id": 220083,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Chaetodon cornutus Linnaeus, 1758 (combinación original)",
     "Zanclus canescens"
    ],
    "nota": "Es el único miembro de la familia Zanclidae (LiveAquaria).",
    "fuentes": [
     "worms_zanclus_cornutus",
     "fishbase_zanclus_cornutus"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Lagunas interiores turbias, planicies arrecifales y arrecifes rocosos y coralinos de aguas claras. Suele ir en grupos pequeños de 2 o 3, a veces solo, en parejas o en grandes cardúmenes.",
    "profundidad_m": {
     "min": 0,
     "max": 182,
     "habitual": "5–182 m"
    },
    "distribucion": "Indo-Pacífico, de África oriental a las islas Rapa y Ducie; al norte hasta el sur de Japón y Hawái; al sur hasta Lord Howe. Pacífico oriental: del sur del golfo de California a Perú.",
    "fuentes": [
     "fishbase_zanclus_cornutus"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 23.0,
    "tipo": "longitud total",
    "contraste": "LiveAquaria: en la naturaleza llega a 7 in (≈ 17.8 cm), pero en acuario es más probable 4 in (≈ 10.2 cm).",
    "fuentes": [
     "fishbase_zanclus_cornutus",
     "liveaquaria_zanclus_cornutus"
    ],
    "confianza": "media"
   },
   "alimentacion": {
    "texto": "En la naturaleza come pequeños animales incrustantes (FishBase). En acuario es muy difícil de alimentar: roca viva con algas y esponjas para que se aclimate, y luego alimentos cárnicos picados, misis, artemia enriquecida, espirulina y algas, varias veces al día (LiveAquaria).",
    "fuentes": [
     "fishbase_zanclus_cornutus",
     "liveaquaria_zanclus_cornutus"
    ],
    "confianza": "media"
   },
   "temperatura": {
    "acuario": null,
    "medio_natural": {
     "min_c": 24,
     "max_c": 28,
     "fuentes": [
      "fishbase_zanclus_cornutus"
     ]
    },
    "nota": "LiveAquaria no publica temperatura de acuario para esta especie; FishBase indica 24–28 °C en el medio natural."
   },
   "ph": {
    "acuario": null,
    "rango_prudente": null,
    "confianza": "baja",
    "nota": "Ninguna fuente específica de la especie publica un rango de pH. Referencia general para agua salada: 7.8–8.3 (MSD)."
   },
   "salinidad": {
    "acuario": null,
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "baja"
   },
   "volumen_minimo": {
    "litros": 473.1,
    "galones_us": 125,
    "justificacion": "LiveAquaria pide al menos 125 gal por su tamaño, su naturaleza gregaria y su necesidad de espacio para nadar.",
    "fuentes": [
     "liveaquaria_zanclus_cornutus",
     "fishbase_zanclus_cornutus"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Muy pacífico y gregario (LiveAquaria). FishBase advierte que, aunque es popular, rara vez sobrevive en acuario. LiveAquaria lo recomienda solo para aficionados expertos y sugiere admirarlo mejor en el mar o en un acuario público.",
    "fuentes": [
     "fishbase_zanclus_cornutus",
     "liveaquaria_zanclus_cornutus"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "No se describe como territorial. Necesita mucho espacio libre para nadar.",
    "fuentes": [
     "liveaquaria_zanclus_cornutus",
     "fishbase_zanclus_cornutus"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "no",
    "fuentes": [
     "liveaquaria_zanclus_cornutus"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Solo para aficionados expertos.",
     "Roca viva con algas y esponjas.",
     "Varias comidas al día."
    ],
    "riesgos": [
     "Rara vez sobrevive en acuario (FishBase).",
     "Come pólipos y corales.",
     "Puede amenazar a invertebrados pequeños."
    ],
    "fuentes": [
     "liveaquaria_zanclus_cornutus",
     "fishbase_zanclus_cornutus"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 10/03/2015, según FishBase",
    "fuentes": [
     "fishbase_zanclus_cornutus"
    ]
   },
   "fuentes_verificadas": [
    "worms_zanclus_cornutus",
    "fishbase_zanclus_cornutus",
    "liveaquaria_zanclus_cornutus",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "baja",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Ídolo moro",
    "nombre_cientifico": "Zanclus cornutus",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "liveaquaria_zanclus_cornutus"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico",
      "sociable"
     ],
     "descripcion": "Pacífico y gregario; necesita mucho espacio para nadar. Muy difícil de mantener: rara vez sobrevive en acuario. Solo para expertos.",
     "fuentes": [
      "fishbase_zanclus_cornutus",
      "liveaquaria_zanclus_cornutus"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "no",
     "explicacion": "Come pólipos y corales, y también puede amenazar a invertebrados pequeños (LiveAquaria).",
     "fuentes": [
      "liveaquaria_zanclus_cornutus"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "omnivoro",
     "alimentos": [
      "pequeños animales incrustantes",
      "esponjas",
      "algas",
      "misis y artemia enriquecida",
      "espirulina"
     ],
     "nota": "FishBase describe una dieta animal; LiveAquaria recomienda en acuario una dieta mixta de alimentos cárnicos y algas.",
     "fuentes": [
      "fishbase_zanclus_cornutus",
      "liveaquaria_zanclus_cornutus"
     ],
     "confianza": "media"
    },
    "temperatura_c": {
     "min": 24,
     "max": 28,
     "nota": "Rango del medio natural (FishBase); ninguna fuente consultada publica un rango para acuario.",
     "fuentes": [
      "fishbase_zanclus_cornutus"
     ],
     "confianza": "media"
    },
    "litraje_recomendado_l": {
     "min": 473.1,
     "galones_us": 125,
     "justificacion": "LiveAquaria pide al menos 125 gal por su tamaño, su naturaleza gregaria y su necesidad de espacio para nadar.",
     "nota": "LiveAquaria no publica datos rápidos de esta especie; la cifra sale de su descripción. Ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_zanclus_cornutus"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 23.0,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": 5.1,
      "max": 14.0,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "LiveAquaria: en la naturaleza llega a 7 in (≈ 17.8 cm), pero en acuario es más probable 4 in (≈ 10.2 cm).",
     "fuentes": [
      "fishbase_zanclus_cornutus",
      "liveaquaria_zanclus_cornutus"
     ],
     "confianza": "media"
    }
   }
  },
  {
   "id": "chelmon_rostratus",
   "nombre_comun": "Pez mariposa bandas de cobre",
   "otros_nombres": [
    "Copperband butterflyfish",
    "Beaked coralfish"
   ],
   "nombre_cientifico": "Chelmon rostratus",
   "autoridad": "(Linnaeus, 1758)",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/chelmon-rostratus.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/chelmon-rostratus.jpg"
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Chaetodontiformes (WoRMS)",
    "familia": "Chaetodontidae",
    "subfamilia": null,
    "aphia_id": 218758,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Chaetodon rostratus Linnaeus, 1758 (combinación original)"
    ],
    "nota": "El orden varía según la fuente: Chaetodontiformes (WoRMS) y Acanthuriformes (FishBase). Se toma WoRMS como referencia.",
    "fuentes": [
     "worms_chelmon_rostratus",
     "fishbase_chelmon_rostratus"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Costas rocosas y arrecifes coralinos; también estuarios y arrecifes interiores con limo. Vive solo o en parejas; es territorial y monógamo.",
    "profundidad_m": {
     "min": 1,
     "max": 25
    },
    "distribucion": "Pacífico occidental: del mar de Andamán a las islas Ryukyu y Australia.",
    "fuentes": [
     "fishbase_chelmon_rostratus"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 20.0,
    "tipo": "longitud total",
    "contraste": "LiveAquaria: 8 in (≈ 20.3 cm), coherente con FishBase. Vive hasta 10 años.",
    "fuentes": [
     "fishbase_chelmon_rostratus",
     "liveaquaria_chelmon_rostratus"
    ],
    "confianza": "alta"
   },
   "alimentacion": {
    "texto": "Carnívoro. Usa su hocico largo para buscar alimento en grietas y agujeros. Es útil para controlar la anémona plaga Aiptasia. Es tímido y difícil de alimentar: puede necesitar varios alimentos distintos para empezar a comer.",
    "fuentes": [
     "liveaquaria_chelmon_rostratus"
    ],
    "confianza": "baja"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_chelmon_rostratus"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "FishBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_chelmon_rostratus"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_chelmon_rostratus"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 492.1,
    "galones_us": 130,
    "justificacion": "Cifra de LiveAquaria (130 gal), que lo recomienda para arrecifes muy grandes o acuarios comunitarios pacíficos.",
    "fuentes": [
     "liveaquaria_chelmon_rostratus",
     "fishbase_chelmon_rostratus"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Pacífico, tímido y de alimentación lenta. En la naturaleza es territorial y monógamo, y forma parejas para reproducirse (FishBase). Debe mantenerse solo, sin otros peces mariposa ni peces que lo estresen (LiveAquaria).",
    "fuentes": [
     "fishbase_chelmon_rostratus",
     "liveaquaria_chelmon_rostratus"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Territorial (FishBase). Un solo ejemplar por acuario, sin otros peces mariposa.",
    "fuentes": [
     "liveaquaria_chelmon_rostratus",
     "fishbase_chelmon_rostratus"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "con precaución",
    "fuentes": [
     "liveaquaria_chelmon_rostratus"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Un solo ejemplar, sin otros peces mariposa.",
     "Compañeros pacíficos que no lo estresen.",
     "Acuario muy grande."
    ],
    "riesgos": [
     "Puede picar anémonas y gusanos plumero.",
     "Difícil de alimentar."
    ],
    "fuentes": [
     "liveaquaria_chelmon_rostratus",
     "fishbase_chelmon_rostratus"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 09/10/2009, según FishBase",
    "fuentes": [
     "fishbase_chelmon_rostratus"
    ]
   },
   "fuentes_verificadas": [
    "worms_chelmon_rostratus",
    "fishbase_chelmon_rostratus",
    "liveaquaria_chelmon_rostratus",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Pez mariposa bandas de cobre",
    "nombre_cientifico": "Chelmon rostratus",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "liveaquaria_chelmon_rostratus"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico",
      "territorial",
      "solitario"
     ],
     "descripcion": "Pacífico y tímido; territorial con su especie y con otros peces mariposa, por lo que se mantiene un solo ejemplar. Difícil de alimentar.",
     "fuentes": [
      "fishbase_chelmon_rostratus",
      "liveaquaria_chelmon_rostratus"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "con_precaucion",
     "explicacion": "Puede picar invertebrados, sobre todo anémonas y gusanos plumero (LiveAquaria).",
     "fuentes": [
      "liveaquaria_chelmon_rostratus"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "carnivoro",
     "alimentos": [
      "pequeños invertebrados de grietas",
      "anémonas Aiptasia",
      "alimentos cárnicos variados"
     ],
     "nota": null,
     "fuentes": [
      "liveaquaria_chelmon_rostratus"
     ],
     "confianza": "baja"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "FishBase no indica rango de temperatura para esta especie.",
     "fuentes": [
      "liveaquaria_chelmon_rostratus"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 492.1,
     "galones_us": 130,
     "justificacion": "Cifra de LiveAquaria (130 gal), que lo recomienda para arrecifes muy grandes o acuarios comunitarios pacíficos.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_chelmon_rostratus"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 20.0,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": 5.1,
      "max": 15.2,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "LiveAquaria: 8 in (≈ 20.3 cm), coherente con FishBase. Vive hasta 10 años.",
     "fuentes": [
      "fishbase_chelmon_rostratus",
      "liveaquaria_chelmon_rostratus"
     ],
     "confianza": "alta"
    }
   }
  },
  {
   "id": "pseudocheilinus_hexataenia",
   "nombre_comun": "Lábrido de seis líneas",
   "otros_nombres": [
    "Sixline wrasse",
    "Sixstripe wrasse"
   ],
   "nombre_cientifico": "Pseudocheilinus hexataenia",
   "autoridad": "(Bleeker, 1857)",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/pseudocheilinus-hexataenia.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/pseudocheilinus-hexataenia.jpg"
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Labriformes (WoRMS)",
    "familia": "Labridae",
    "subfamilia": "Cirrhilabrinae",
    "aphia_id": 208915,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Cheilinus hexataenia Bleeker, 1857 (combinación original)"
    ],
    "nota": "El orden varía según la fuente: Labriformes (WoRMS) y Eupercaria/misc (FishBase). Se toma WoRMS como referencia.",
    "fuentes": [
     "worms_pseudocheilinus_hexataenia",
     "fishbase_pseudocheilinus_hexataenia"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Arrecifes externos, entre las ramas del coral, y aguas costeras claras con coral denso en crestas o pendientes someras hasta unos 20 m. Suele ir en grupos pequeños y sueltos; es tímido y reservado.",
    "profundidad_m": {
     "min": 1,
     "max": 35,
     "habitual": "4–35 m"
    },
    "distribucion": "Indo-Pacífico: del Mar Rojo a Natal (Sudáfrica) y al este hasta las Tuamotu; al norte hasta las Ryukyu; al sur hasta Lord Howe y las Australes.",
    "fuentes": [
     "fishbase_pseudocheilinus_hexataenia"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 10.0,
    "tipo": "longitud total",
    "contraste": "Diferencia entre fuentes: FishBase 10 cm; LiveAquaria 3 in (≈ 7.6 cm).",
    "fuentes": [
     "fishbase_pseudocheilinus_hexataenia",
     "liveaquaria_pseudocheilinus_hexataenia"
    ],
    "confianza": "media"
   },
   "alimentacion": {
    "texto": "Carnívoro: come sobre todo pequeños crustáceos (FishBase). En acuario busca caracoles piramidélidos (parásitos de almejas), gusanos planos y gusanos de cerdas; se le da carne picada y preparados congelados (LiveAquaria).",
    "fuentes": [
     "fishbase_pseudocheilinus_hexataenia",
     "liveaquaria_pseudocheilinus_hexataenia"
    ],
    "confianza": "alta"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_pseudocheilinus_hexataenia"
     ],
     "confianza": "baja"
    },
    "medio_natural": {
     "min_c": 24,
     "max_c": 28,
     "fuentes": [
      "fishbase_pseudocheilinus_hexataenia"
     ]
    },
    "nota": "Discrepancia: el límite inferior de acuario (22.2 °C) está por debajo del mínimo natural indicado por FishBase (24 °C)."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_pseudocheilinus_hexataenia"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_pseudocheilinus_hexataenia"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 227.1,
    "galones_us": 60,
    "justificacion": "Cifra de los datos rápidos de LiveAquaria (60 gal). Aunque es pequeño, necesita muchos escondites y roca viva donde buscar alimento.",
    "fuentes": [
     "liveaquaria_pseudocheilinus_hexataenia",
     "fishbase_pseudocheilinus_hexataenia"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Tímido y reservado en la naturaleza (FishBase), pero puede ser agresivo en acuario con lábridos pacíficos y con peces que se intimidan fácilmente (LiveAquaria). El macho intensifica sus colores durante el cortejo.",
    "fuentes": [
     "fishbase_pseudocheilinus_hexataenia",
     "liveaquaria_pseudocheilinus_hexataenia"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Necesita muchos escondites y roca viva. Puede acosar a peces pequeños y tímidos.",
    "fuentes": [
     "liveaquaria_pseudocheilinus_hexataenia",
     "fishbase_pseudocheilinus_hexataenia"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_pseudocheilinus_hexataenia"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Muchos escondites y roca viva.",
     "Evitar lábridos pacíficos y peces tímidos."
    ],
    "riesgos": [
     "Agresión hacia lábridos pacíficos y peces que se intimidan fácilmente."
    ],
    "fuentes": [
     "liveaquaria_pseudocheilinus_hexataenia",
     "fishbase_pseudocheilinus_hexataenia"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 03/03/2009, según FishBase",
    "fuentes": [
     "fishbase_pseudocheilinus_hexataenia"
    ]
   },
   "fuentes_verificadas": [
    "worms_pseudocheilinus_hexataenia",
    "fishbase_pseudocheilinus_hexataenia",
    "liveaquaria_pseudocheilinus_hexataenia",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Lábrido de seis líneas",
    "nombre_cientifico": "Pseudocheilinus hexataenia",
    "temperamento": {
     "valor": "semiagresivo",
     "nota": null,
     "fuentes": [
      "liveaquaria_pseudocheilinus_hexataenia"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "territorial"
     ],
     "descripcion": "Tímido en la naturaleza, pero puede ser agresivo con lábridos pacíficos y peces que se intimidan fácilmente. Necesita muchos escondites.",
     "fuentes": [
      "fishbase_pseudocheilinus_hexataenia",
      "liveaquaria_pseudocheilinus_hexataenia"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "LiveAquaria lo considera compatible con arrecife y útil contra plagas de la roca viva; no hay verificación independiente.",
     "fuentes": [
      "liveaquaria_pseudocheilinus_hexataenia"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "carnivoro",
     "alimentos": [
      "pequeños crustáceos",
      "caracoles piramidélidos",
      "gusanos planos y de cerdas",
      "carne picada"
     ],
     "nota": null,
     "fuentes": [
      "fishbase_pseudocheilinus_hexataenia",
      "liveaquaria_pseudocheilinus_hexataenia"
     ],
     "confianza": "alta"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "Discrepancia: el límite inferior de acuario (22.2 °C) está por debajo del mínimo natural indicado por FishBase (24 °C).",
     "fuentes": [
      "liveaquaria_pseudocheilinus_hexataenia"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 227.1,
     "galones_us": 60,
     "justificacion": "Cifra de los datos rápidos de LiveAquaria (60 gal). Aunque es pequeño, necesita muchos escondites y roca viva donde buscar alimento.",
     "nota": "Diferencia dentro de LiveAquaria: sus datos rápidos indican 60 gal y su descripción, 30 gal o más. Se adopta la cifra mayor. Ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_pseudocheilinus_hexataenia"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 10.0,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": null,
      "max": 5.1,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "Diferencia entre fuentes: FishBase 10 cm; LiveAquaria 3 in (≈ 7.6 cm).",
     "fuentes": [
      "fishbase_pseudocheilinus_hexataenia",
      "liveaquaria_pseudocheilinus_hexataenia"
     ],
     "confianza": "media"
    }
   }
  },
  {
   "id": "acanthurus_olivaceus",
   "nombre_comun": "Cirujano orange shoulder",
   "otros_nombres": [
    "Orangeshoulder tang",
    "Orangespot surgeonfish",
    "Orange-epaulette surgeonfish"
   ],
   "nombre_cientifico": "Acanthurus olivaceus",
   "autoridad": "Bloch & Schneider, 1801",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/acanthurus-olivaceus.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/acanthurus-olivaceus.jpg"
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Acanthuriformes",
    "familia": "Acanthuridae",
    "subfamilia": "Acanthurinae",
    "aphia_id": 219625,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Acanthurus chrysosoma Bleeker, 1857",
     "Acanthurus humeralis Valenciennes"
    ],
    "fuentes": [
     "worms_acanthurus_olivaceus",
     "fishbase_acanthurus_olivaceus"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Arrecifes externos sobre roca desnuda o mezcla de cascajo y arena, de 9 a al menos 46 m. Los juveniles viven en bahías y lagunas protegidas desde 3 m. Los adultos van solos o en cardúmenes.",
    "profundidad_m": {
     "min": 3,
     "max": 46,
     "habitual": "9–46 m"
    },
    "distribucion": "Pacífico: de las islas Christmas y Cocos-Keeling (Índico oriental) a Hawái y las Tuamotu; al norte hasta Japón; al sur hasta Lord Howe. En el Índico lo reemplaza Acanthurus tennenti.",
    "fuentes": [
     "fishbase_acanthurus_olivaceus"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 35.0,
    "tipo": "longitud total",
    "contraste": "LiveAquaria: 14 in (≈ 35.6 cm), coherente con FishBase. Vive hasta 33 años. El juvenil es amarillo; el adulto es gris con una franja naranja sobre la aleta pectoral.",
    "fuentes": [
     "fishbase_acanthurus_olivaceus",
     "liveaquaria_acanthurus_olivaceus"
    ],
    "confianza": "alta"
   },
   "alimentacion": {
    "texto": "Herbívoro: en la naturaleza come la película de detritos, diatomeas y algas filamentosas finas de la superficie (FishBase). En acuario necesita abundantes algas marinas, al menos tres veces por semana (LiveAquaria).",
    "fuentes": [
     "fishbase_acanthurus_olivaceus",
     "liveaquaria_acanthurus_olivaceus"
    ],
    "confianza": "alta"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_acanthurus_olivaceus"
     ],
     "confianza": "baja"
    },
    "medio_natural": {
     "min_c": 24,
     "max_c": 28,
     "fuentes": [
      "fishbase_acanthurus_olivaceus"
     ]
    },
    "nota": "Discrepancia: el límite inferior de acuario (22.2 °C) está por debajo del mínimo natural indicado por FishBase (24 °C)."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_acanthurus_olivaceus"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_acanthurus_olivaceus"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 681.3,
    "galones_us": 180,
    "justificacion": "Cifra de LiveAquaria (180 gal). Es un cirujano grande (35 cm) que necesita mucho espacio libre para nadar.",
    "fuentes": [
     "liveaquaria_acanthurus_olivaceus",
     "fishbase_acanthurus_olivaceus"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "LiveAquaria lo clasifica como semiagresivo, aunque indica que no es agresivo con otros cirujanos; para tener varios, recomienda añadir un juvenil a un acuario con un adulto. En la naturaleza va solo o en cardúmenes (FishBase).",
    "fuentes": [
     "fishbase_acanthurus_olivaceus",
     "liveaquaria_acanthurus_olivaceus"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "No se describe como agresivo con otros cirujanos. Necesita espacio libre para nadar.",
    "fuentes": [
     "liveaquaria_acanthurus_olivaceus",
     "fishbase_acanthurus_olivaceus"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_acanthurus_olivaceus"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Acuario muy grande.",
     "Para varios ejemplares, añadir un juvenil a un acuario con un adulto.",
     "Dieta rica en algas."
    ],
    "riesgos": [
     "Necesita mucho espacio: en acuarios pequeños no tiene sitio para nadar."
    ],
    "fuentes": [
     "liveaquaria_acanthurus_olivaceus",
     "fishbase_acanthurus_olivaceus"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 04/05/2010, según FishBase",
    "fuentes": [
     "fishbase_acanthurus_olivaceus"
    ]
   },
   "fuentes_verificadas": [
    "worms_acanthurus_olivaceus",
    "fishbase_acanthurus_olivaceus",
    "liveaquaria_acanthurus_olivaceus",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Cirujano orange shoulder",
    "nombre_cientifico": "Acanthurus olivaceus",
    "temperamento": {
     "valor": "semiagresivo",
     "nota": "LiveAquaria lo clasifica como semiagresivo, pero indica que no es agresivo con otros cirujanos.",
     "fuentes": [
      "liveaquaria_acanthurus_olivaceus"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "sociable"
     ],
     "descripcion": "En la naturaleza va solo o en cardúmenes. No suele ser agresivo con otros cirujanos. Necesita mucho espacio para nadar.",
     "fuentes": [
      "fishbase_acanthurus_olivaceus",
      "liveaquaria_acanthurus_olivaceus"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "LiveAquaria lo considera compatible con arrecife; no hay verificación independiente.",
     "fuentes": [
      "liveaquaria_acanthurus_olivaceus"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "herbivoro",
     "alimentos": [
      "detritos",
      "diatomeas",
      "algas filamentosas finas",
      "alga marina seca"
     ],
     "nota": null,
     "fuentes": [
      "fishbase_acanthurus_olivaceus",
      "liveaquaria_acanthurus_olivaceus"
     ],
     "confianza": "alta"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "Discrepancia: el límite inferior de acuario (22.2 °C) está por debajo del mínimo natural indicado por FishBase (24 °C).",
     "fuentes": [
      "liveaquaria_acanthurus_olivaceus"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 681.3,
     "galones_us": 180,
     "justificacion": "Cifra de LiveAquaria (180 gal). Es un cirujano grande (35 cm) que necesita mucho espacio libre para nadar.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_acanthurus_olivaceus"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 35.0,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": 5.1,
      "max": 20.3,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "LiveAquaria: 14 in (≈ 35.6 cm), coherente con FishBase. Vive hasta 33 años. El juvenil es amarillo; el adulto es gris con una franja naranja sobre la aleta pectoral.",
     "fuentes": [
      "fishbase_acanthurus_olivaceus",
      "liveaquaria_acanthurus_olivaceus"
     ],
     "confianza": "alta"
    }
   }
  },
  {
   "id": "ostracion_cubicum",
   "nombre_comun": "Pez cofre amarillo",
   "otros_nombres": [
    "Yellow boxfish",
    "Cubicus boxfish",
    "Polka dot boxfish"
   ],
   "nombre_cientifico": "Ostracion cubicum",
   "autoridad": "Linnaeus, 1758",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/ostracion-cubicum.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/ostracion-cubicum.jpg"
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Tetraodontiformes",
    "familia": "Ostraciidae",
    "subfamilia": null,
    "aphia_id": 403462,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Ostracion cubicus Linnaeus, 1758 (grafía no aceptada)",
     "Ostracion argus Rüppell, 1828",
     "Ostracion tuberculatus Linnaeus, 1758"
    ],
    "nota": "El nombre aceptado es Ostracion cubicum; «cubicus», muy usado en acuariofilia, es una grafía no aceptada (WoRMS).",
    "fuentes": [
     "worms_ostracion_cubicum",
     "fishbase_ostracion_cubicum"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Lagunas y arrecifes externos semiprotegidos. Los juveniles viven entre corales Acropora y se esconden en grietas estrechas. Es solitario; se reproduce en harenes de un macho y 2–4 hembras.",
    "profundidad_m": {
     "min": 1,
     "max": 280,
     "habitual": "1–50 m"
    },
    "distribucion": "Indo-Pacífico: golfo Pérsico, Mar Rojo y África oriental hasta Hawái y las Tuamotu; al norte hasta las Ryukyu; al sur hasta Lord Howe. También en la costa sur de Sudáfrica.",
    "fuentes": [
     "fishbase_ostracion_cubicum"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 45.0,
    "tipo": "longitud total",
    "contraste": "Diferencia entre fuentes: FishBase 45 cm; LiveAquaria 20 in (≈ 50.8 cm). El juvenil es amarillo con puntos y el adulto se vuelve marrón.",
    "fuentes": [
     "fishbase_ostracion_cubicum",
     "liveaquaria_ostracion_cubicum"
    ],
    "confianza": "media"
   },
   "alimentacion": {
    "texto": "Omnívoro: en la naturaleza come algas con microorganismos, invertebrados, moluscos, esponjas, poliquetos, crustáceos, foraminíferos y peces (FishBase). En acuario, al principio artemia viva o larvas de mosquito; después calamar, almejas y mejillones picados, y preparados herbívoros (LiveAquaria).",
    "fuentes": [
     "fishbase_ostracion_cubicum",
     "liveaquaria_ostracion_cubicum"
    ],
    "confianza": "alta"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_ostracion_cubicum"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "FishBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_ostracion_cubicum"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_ostracion_cubicum"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 946.2,
    "galones_us": 250,
    "justificacion": "Cifra de los datos rápidos de LiveAquaria (250 gal). Es un pez grande (45–50 cm) y difícil de mantener.",
    "fuentes": [
     "liveaquaria_ostracion_cubicum",
     "fishbase_ostracion_cubicum"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Solitario (FishBase). Muy difícil de mantener: solo para los aficionados más experimentados. Si se estresa libera ostracitoxina por sus glándulas mucosas, un veneno que puede matar muy rápido a los demás peces del acuario (LiveAquaria).",
    "fuentes": [
     "fishbase_ostracion_cubicum",
     "liveaquaria_ostracion_cubicum"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Solitario. Los juveniles se esconden en grietas estrechas.",
    "fuentes": [
     "liveaquaria_ostracion_cubicum",
     "fishbase_ostracion_cubicum"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "no",
    "fuentes": [
     "liveaquaria_ostracion_cubicum"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Solo para aficionados expertos.",
     "Acuario muy grande y sin fuentes de estrés."
    ],
    "riesgos": [
     "Libera ostracitoxina al estresarse o morir y puede matar a todo el acuario.",
     "Mordisquea gusanos tubícolas."
    ],
    "fuentes": [
     "liveaquaria_ostracion_cubicum",
     "fishbase_ostracion_cubicum"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 18/08/2023, según FishBase",
    "otros": "FishBase lo clasifica como inofensivo para las personas, pero LiveAquaria advierte que es venenoso cuando se estresa o muere.",
    "fuentes": [
     "fishbase_ostracion_cubicum"
    ]
   },
   "fuentes_verificadas": [
    "worms_ostracion_cubicum",
    "fishbase_ostracion_cubicum",
    "liveaquaria_ostracion_cubicum",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Pez cofre amarillo",
    "nombre_cientifico": "Ostracion cubicum",
    "temperamento": {
     "valor": "semiagresivo",
     "nota": null,
     "fuentes": [
      "liveaquaria_ostracion_cubicum"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "solitario"
     ],
     "descripcion": "Solitario y muy difícil de mantener (solo expertos). Si se estresa o muere libera ostracitoxina, un veneno que puede matar rápidamente a los demás peces.",
     "fuentes": [
      "fishbase_ostracion_cubicum",
      "liveaquaria_ostracion_cubicum"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "no",
     "explicacion": "Los datos rápidos de LiveAquaria lo marcan como no apto para arrecife, y su descripción advierte que suele mordisquear gusanos tubícolas.",
     "fuentes": [
      "liveaquaria_ostracion_cubicum"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "omnivoro",
     "alimentos": [
      "algas",
      "invertebrados y moluscos",
      "esponjas y poliquetos",
      "calamar, almejas y mejillones picados"
     ],
     "nota": null,
     "fuentes": [
      "fishbase_ostracion_cubicum",
      "liveaquaria_ostracion_cubicum"
     ],
     "confianza": "alta"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "FishBase no indica rango de temperatura para esta especie.",
     "fuentes": [
      "liveaquaria_ostracion_cubicum"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 946.2,
     "galones_us": 250,
     "justificacion": "Cifra de los datos rápidos de LiveAquaria (250 gal). Es un pez grande (45–50 cm) y difícil de mantener.",
     "nota": "Diferencia dentro de LiveAquaria: sus datos rápidos indican 250 gal y su descripción, un mínimo de 125 gal. Se adopta la cifra mayor. Ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_ostracion_cubicum"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 45.0,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": 2.5,
      "max": 12.7,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según LiveAquaria; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "Diferencia entre fuentes: FishBase 45 cm; LiveAquaria 20 in (≈ 50.8 cm). El juvenil es amarillo con puntos y el adulto se vuelve marrón.",
     "fuentes": [
      "fishbase_ostracion_cubicum",
      "liveaquaria_ostracion_cubicum"
     ],
     "confianza": "media"
    }
   }
  },
  {
   "id": "acanthurus_bahianus",
   "nombre_comun": "Cirujano de Bahía",
   "otros_nombres": [
    "Ocean surgeon",
    "Ocean tang",
    "Barber surgeonfish",
    "Cirujano pardo"
   ],
   "nombre_cientifico": "Acanthurus bahianus",
   "autoridad": "Castelnau, 1855",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/acanthurus-bahianus.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/acanthurus-bahianus.jpg"
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Acanthuriformes",
    "familia": "Acanthuridae",
    "subfamilia": "Acanthurinae",
    "aphia_id": 159578,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Hepatus bahianus",
     "Teuthis bahianus"
    ],
    "fuentes": [
     "worms_acanthurus_bahianus",
     "fishbase_acanthurus_bahianus"
    ],
    "confianza": "alta",
    "nota": "Su nombre viene de Bahía (Brasil). Hay desacuerdo taxonómico: FishBase considera a Acanthurus tractus (Atlántico occidental norte) una especie hermana distinta (Bernal y Rocha, 2011) y limita A. bahianus al Atlántico sur y central; WoRMS sigue usando A. bahianus para todo el Atlántico occidental."
   },
   "habitat": {
    "texto": "Fondos someros con formaciones coralinas o rocosas (WoRMS). Especie diurna asociada a arrecifes (FishBase).",
    "profundidad_m": {
     "min": 2,
     "max": 80
    },
    "distribucion": "Según FishBase: costa de Brasil, del Parcel Manuel Luiz a Santa Catarina, con las islas oceánicas de Fernando de Noronha, Atol das Rocas y Trindade, además de las islas Ascensión y Santa Elena. WoRMS le da una distribución más amplia: de Massachusetts (EE. UU.) y Bermudas al golfo de México y Brasil.",
    "fuentes": [
     "fishbase_acanthurus_bahianus",
     "worms_acanthurus_bahianus"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 14.6,
    "tipo": "longitud estándar",
    "contraste": "Diferencia importante entre fuentes: FishBase registra 14.6 cm de longitud estándar; Quality Marine indica que puede llegar a casi 14 in (≈ 35.6 cm). La diferencia puede deberse a la confusión taxonómica con A. tractus.",
    "fuentes": [
     "fishbase_acanthurus_bahianus",
     "qualitymarine_acanthurus_bahianus"
    ],
    "confianza": "baja"
   },
   "alimentacion": {
    "texto": "Herbívoro: se alimenta de algas (WoRMS). En acuario, Quality Marine recomienda una dieta variada de alimentos a base de algas y cárnicos.",
    "fuentes": [
     "worms_acanthurus_bahianus",
     "qualitymarine_acanthurus_bahianus"
    ],
    "confianza": "media"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "qualitymarine_acanthurus_bahianus"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "FishBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "qualitymarine_acanthurus_bahianus"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "qualitymarine_acanthurus_bahianus"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 1135.5,
    "galones_us": 300,
    "justificacion": "Quality Marine recomienda un acuario mínimo de 300 gal: los cirujanos Acanthurus adultos se vuelven grandes y necesitan mucho espacio para nadar y roca para pastar y esconderse.",
    "fuentes": [
     "qualitymarine_acanthurus_bahianus"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Diurno (FishBase). Quality Marine lo describe como social, pero advierte que los cirujanos Acanthurus pueden ser agresivos con cirujanos de forma similar. Tiene una espina muy afilada junto a la cola. Es poco común en el comercio de acuarios.",
    "fuentes": [
     "fishbase_acanthurus_bahianus",
     "qualitymarine_acanthurus_bahianus"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Agresivo con cirujanos de forma similar. Necesita roca para pastar y esconderse.",
    "fuentes": [
     "qualitymarine_acanthurus_bahianus",
     "fishbase_acanthurus_bahianus"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "con precaución",
    "fuentes": [
     "qualitymarine_acanthurus_bahianus"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Acuario muy grande con espacio para nadar.",
     "Dieta variada de algas y alimentos cárnicos.",
     "Evitar cirujanos de forma similar."
    ],
    "riesgos": [
     "Espina caudal muy afilada: manipular con cuidado (Quality Marine).",
     "Agresión hacia cirujanos de forma similar.",
     "Puede picar invertebrados si está mal alimentado."
    ],
    "fuentes": [
     "qualitymarine_acanthurus_bahianus",
     "fishbase_acanthurus_bahianus"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 03/05/2010, según FishBase",
    "fuentes": [
     "fishbase_acanthurus_bahianus"
    ]
   },
   "fuentes_verificadas": [
    "worms_acanthurus_bahianus",
    "fishbase_acanthurus_bahianus",
    "qualitymarine_acanthurus_bahianus",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Cirujano de Bahía",
    "nombre_cientifico": "Acanthurus bahianus",
    "grupo": "pez",
    "temperamento": {
     "valor": "semiagresivo",
     "nota": "Clasificación de AIRI a partir de Quality Marine: social, pero agresivo con cirujanos de forma similar. La fuente no da una categoría de temperamento.",
     "fuentes": [
      "qualitymarine_acanthurus_bahianus"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "sociable",
      "territorial"
     ],
     "descripcion": "Social y diurno, pero puede ser agresivo con cirujanos de forma parecida. Tiene una espina afilada junto a la cola: manipular con cuidado.",
     "fuentes": [
      "fishbase_acanthurus_bahianus",
      "qualitymarine_acanthurus_bahianus"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "con_precaucion",
     "explicacion": "Se considera apto para arrecife, pero si no está bien alimentado puede picar invertebrados pequeños, móviles o sésiles (Quality Marine).",
     "fuentes": [
      "qualitymarine_acanthurus_bahianus"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "herbivoro",
     "alimentos": [
      "algas",
      "alimentos a base de algas",
      "alimentos cárnicos marinos"
     ],
     "nota": null,
     "fuentes": [
      "worms_acanthurus_bahianus",
      "qualitymarine_acanthurus_bahianus"
     ],
     "confianza": "media"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": "FishBase no indica rango de temperatura; el rango es de Quality Marine.",
     "fuentes": [
      "qualitymarine_acanthurus_bahianus"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 1135.5,
     "galones_us": 300,
     "justificacion": "Quality Marine recomienda un acuario mínimo de 300 gal: los cirujanos Acanthurus adultos se vuelven muy grandes y necesitan mucho espacio para nadar y roca para pastar y esconderse.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "qualitymarine_acanthurus_bahianus"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 14.6,
     "medida": "longitud estándar",
     "tamano_venta_cm": null,
     "talla_madurez_cm": null,
     "nota": "Diferencia importante entre fuentes: FishBase registra 14.6 cm de longitud estándar; Quality Marine indica que puede llegar a casi 14 in (≈ 35.6 cm). La diferencia puede deberse a la confusión taxonómica con A. tractus.",
     "fuentes": [
      "fishbase_acanthurus_bahianus",
      "qualitymarine_acanthurus_bahianus"
     ],
     "confianza": "baja"
    }
   }
  },
  {
   "id": "synchiropus_splendidus",
   "nombre_comun": "Mandarín",
   "otros_nombres": [
    "Mandarinfish",
    "Green mandarin",
    "Gobio mandarín (nombre común incorrecto)"
   ],
   "nombre_cientifico": "Synchiropus splendidus",
   "autoridad": "(Herre, 1927)",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/synchiropus-splendidus.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/synchiropus-splendidus.jpg"
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Callionymiformes",
    "familia": "Callionymidae",
    "subfamilia": null,
    "aphia_id": 273264,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Callionymus splendidus Herre, 1927 (combinación original)",
     "Pterosynchiropus splendidus",
     "Neosynchiropus splendidus"
    ],
    "nota": "Aunque en acuariofilia se le llama «gobio mandarín», no es un gobio: pertenece a los dragoncillos (familia Callionymidae).",
    "fuentes": [
     "worms_synchiropus_splendidus",
     "fishbase_synchiropus_splendidus"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Lagunas protegidas someras y arrecifes costeros, sobre fondos limosos con coral y cascajo. Suele vivir en grupos pequeños repartidos en un área reducida.",
    "profundidad_m": {
     "min": 1,
     "max": 18
    },
    "distribucion": "Pacífico occidental: de las islas Ryukyu a Australia.",
    "fuentes": [
     "fishbase_synchiropus_splendidus"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 7.0,
    "tipo": "longitud total",
    "contraste": "Diferencia entre fuentes: FishBase registra un máximo de 7 cm de longitud total, pero LiveAquaria vende ejemplares de hasta 3 in (≈ 7.6 cm).",
    "fuentes": [
     "fishbase_synchiropus_splendidus"
    ],
    "confianza": "media"
   },
   "alimentacion": {
    "texto": "Carnívoro: en acuario come artemia viva enriquecida, gusanos negros vivos y presas naturales de la roca viva y la arena viva (LiveAquaria).",
    "fuentes": [
     "liveaquaria_synchiropus_splendidus"
    ],
    "confianza": "baja"
   },
   "temperatura": {
    "acuario": null,
    "medio_natural": null,
    "nota": "FishBase no indica rango de temperatura y la página de LiveAquaria no publica datos rápidos de esta especie."
   },
   "ph": {
    "acuario": null,
    "rango_prudente": null,
    "confianza": "baja",
    "nota": "Ninguna fuente específica de la especie publica un rango de pH. Referencia general para agua salada: 7.8–8.3 (MSD)."
   },
   "salinidad": {
    "acuario": null,
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "baja"
   },
   "volumen_minimo": {
    "litros": 113.6,
    "galones_us": 30,
    "justificacion": "LiveAquaria pide un acuario bien establecido de 30 gal o más, con roca viva, arena viva y muchos escondites, porque se alimenta de presas que viven en ellos.",
    "fuentes": [
     "liveaquaria_synchiropus_splendidus"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "No es muy agresivo con otros peces, salvo con los de su especie (LiveAquaria). Se ha reproducido en acuario (FishBase y LiveAquaria).",
    "fuentes": [
     "fishbase_synchiropus_splendidus",
     "liveaquaria_synchiropus_splendidus"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Agresivo con su propia especie. Necesita muchos escondites.",
    "fuentes": [
     "liveaquaria_synchiropus_splendidus",
     "fishbase_synchiropus_splendidus"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_synchiropus_splendidus"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Acuario bien establecido con roca viva y arena viva.",
     "Un solo ejemplar o una pareja."
    ],
    "riesgos": [
     "Puede morir de hambre si el acuario no tiene suficientes presas vivas.",
     "Agresión hacia otros mandarines."
    ],
    "fuentes": [
     "liveaquaria_synchiropus_splendidus",
     "fishbase_synchiropus_splendidus"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 12/10/2018, según FishBase",
    "fuentes": [
     "fishbase_synchiropus_splendidus"
    ]
   },
   "fuentes_verificadas": [
    "worms_synchiropus_splendidus",
    "fishbase_synchiropus_splendidus",
    "liveaquaria_synchiropus_splendidus",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "baja",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Mandarín",
    "nombre_cientifico": "Synchiropus splendidus",
    "grupo": "pez",
    "temperamento": {
     "valor": "pacifico",
     "nota": "LiveAquaria no publica datos rápidos; su descripción indica que no es muy agresivo salvo con su especie.",
     "fuentes": [
      "liveaquaria_synchiropus_splendidus"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico",
      "territorial"
     ],
     "descripcion": "Pacífico con otros peces, pero no con los de su especie. Necesita un acuario maduro con mucha roca viva y arena viva donde cazar presas pequeñas.",
     "fuentes": [
      "fishbase_synchiropus_splendidus",
      "liveaquaria_synchiropus_splendidus"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "LiveAquaria lo describe como moderadamente resistente en acuarios de arrecife si recibe cuidados especiales.",
     "fuentes": [
      "liveaquaria_synchiropus_splendidus"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "carnivoro",
     "alimentos": [
      "presas vivas de la roca y la arena (pequeños crustáceos)",
      "artemia viva enriquecida",
      "gusanos negros vivos"
     ],
     "nota": null,
     "fuentes": [
      "liveaquaria_synchiropus_splendidus"
     ],
     "confianza": "baja"
    },
    "temperatura_c": {
     "min": null,
     "max": null,
     "nota": "Ninguna fuente consultada publica un rango de temperatura para esta especie.",
     "fuentes": [],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": 113.6,
     "galones_us": 30,
     "justificacion": "LiveAquaria pide un acuario bien establecido de 30 gal o más, con roca viva, arena viva y muchos escondites, porque se alimenta de presas que viven en ellos.",
     "nota": "LiveAquaria no publica datos rápidos de esta especie; la cifra sale de su descripción.",
     "fuentes": [
      "liveaquaria_synchiropus_splendidus"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 7.0,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": 2.5,
      "max": 7.6,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según la fuente comercial; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "Diferencia entre fuentes: FishBase registra un máximo de 7 cm de longitud total, pero LiveAquaria vende ejemplares de hasta 3 in (≈ 7.6 cm).",
     "fuentes": [
      "fishbase_synchiropus_splendidus"
     ],
     "confianza": "media"
    }
   }
  },
  {
   "id": "valenciennea_sexguttata",
   "nombre_comun": "Gobio arenero de 6 puntos",
   "otros_nombres": [
    "Sixspot goby",
    "Sleeper blue dot goby",
    "Ladder goby"
   ],
   "nombre_cientifico": "Valenciennea sexguttata",
   "autoridad": "(Valenciennes, 1837)",
   "grupo": "pez",
   "imagen": {
    "archivo": "imagenes/valenciennea-sexguttata.jpg",
    "autor": null,
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": null,
    "ruta_web": null
   },
   "taxonomia": {
    "clase": "Teleostei",
    "orden": "Gobiiformes",
    "familia": "Gobiidae",
    "subfamilia": "Gobiinae",
    "aphia_id": 219598,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Eleotris sexguttata Valenciennes, 1837 (combinación original)",
     "Eleotriodes sexguttatus"
    ],
    "fuentes": [
     "worms_valenciennea_sexguttata",
     "fishbase_valenciennea_sexguttata"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Zonas limosas o arenosas de lagunas y bahías. Suele vivir en pareja en una madriguera bajo las rocas; en lagunas de atolones forma agregaciones sobre grandes áreas.",
    "profundidad_m": {
     "min": 3,
     "max": 25
    },
    "distribucion": "Indo-Pacífico: Mar Rojo, golfo Pérsico y África oriental hasta Samoa; al norte hasta Yaeyama y Ryukyu; al sur hasta Queensland (Australia).",
    "fuentes": [
     "fishbase_valenciennea_sexguttata"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 14.0,
    "tipo": "longitud total",
    "contraste": "LiveAquaria indica 5½ in (≈ 14.0 cm), igual que FishBase.",
    "fuentes": [
     "fishbase_valenciennea_sexguttata",
     "liveaquaria_valenciennea_sexguttata"
    ],
    "confianza": "alta"
   },
   "alimentacion": {
    "texto": "Carnívoro: filtra la arena a bocados y come los organismos que viven en ella. En acuario, artemia y misis vivas o congeladas, gusanos negros vivos y preparados para carnívoros, con frecuencia (LiveAquaria).",
    "fuentes": [
     "liveaquaria_valenciennea_sexguttata"
    ],
    "confianza": "baja"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_valenciennea_sexguttata"
     ],
     "confianza": "media"
    },
    "medio_natural": {
     "min_c": 22,
     "max_c": 28,
     "fuentes": [
      "fishbase_valenciennea_sexguttata"
     ]
    },
    "nota": "Rango del medio natural según la fuente biológica."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_valenciennea_sexguttata"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_valenciennea_sexguttata"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": 113.6,
    "galones_us": 30,
    "justificacion": "Cifra de LiveAquaria (30 gal), que pide arena viva como sustrato y un refugio poblado conectado para que tenga alimento.",
    "fuentes": [
     "liveaquaria_valenciennea_sexguttata"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Monógamo: suele vivir en pareja en una madriguera (FishBase). Rara vez es agresivo con otros peces, pero es territorial y pelea con los de su especie salvo que sean pareja (LiveAquaria).",
    "fuentes": [
     "fishbase_valenciennea_sexguttata",
     "liveaquaria_valenciennea_sexguttata"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Territorial; excava una madriguera bajo las rocas.",
    "fuentes": [
     "liveaquaria_valenciennea_sexguttata",
     "fishbase_valenciennea_sexguttata"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_valenciennea_sexguttata"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Arena viva como sustrato.",
     "Un solo ejemplar o una pareja.",
     "Refugio con alimento vivo."
    ],
    "riesgos": [
     "Puede pasar hambre en acuarios sin fauna en la arena.",
     "Pelea con otros de su especie."
    ],
    "fuentes": [
     "liveaquaria_valenciennea_sexguttata",
     "fishbase_valenciennea_sexguttata"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "Preocupación menor (LC), evaluada el 20/06/2017, según FishBase",
    "fuentes": [
     "fishbase_valenciennea_sexguttata"
    ]
   },
   "fuentes_verificadas": [
    "worms_valenciennea_sexguttata",
    "fishbase_valenciennea_sexguttata",
    "liveaquaria_valenciennea_sexguttata",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Gobio arenero de 6 puntos",
    "nombre_cientifico": "Valenciennea sexguttata",
    "grupo": "pez",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "liveaquaria_valenciennea_sexguttata"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico",
      "territorial"
     ],
     "descripcion": "Pacífico con otros peces, territorial con los de su especie salvo en pareja. Vive en una madriguera bajo las rocas y remueve la arena.",
     "fuentes": [
      "fishbase_valenciennea_sexguttata",
      "liveaquaria_valenciennea_sexguttata"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "LiveAquaria lo considera compatible con arrecife; no hay verificación independiente.",
     "fuentes": [
      "liveaquaria_valenciennea_sexguttata"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "carnivoro",
     "alimentos": [
      "organismos de la arena",
      "artemia y misis",
      "gusanos negros vivos"
     ],
     "nota": null,
     "fuentes": [
      "liveaquaria_valenciennea_sexguttata"
     ],
     "confianza": "baja"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": null,
     "fuentes": [
      "liveaquaria_valenciennea_sexguttata"
     ],
     "confianza": "media"
    },
    "litraje_recomendado_l": {
     "min": 113.6,
     "galones_us": 30,
     "justificacion": "Cifra de LiveAquaria (30 gal), que pide arena viva como sustrato y un refugio poblado conectado para que tenga alimento.",
     "nota": "Es el mínimo recomendado por una sola fuente comercial; ninguna fuente científica consultada establece un litraje.",
     "fuentes": [
      "liveaquaria_valenciennea_sexguttata"
     ],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 14.0,
     "medida": "longitud total",
     "tamano_venta_cm": {
      "min": 1.3,
      "max": 10.2,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según la fuente comercial; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "LiveAquaria indica 5½ in (≈ 14.0 cm), igual que FishBase.",
     "fuentes": [
      "fishbase_valenciennea_sexguttata",
      "liveaquaria_valenciennea_sexguttata"
     ],
     "confianza": "alta"
    }
   }
  },
  {
   "id": "linckia_laevigata",
   "nombre_comun": "Estrella Linckia azul",
   "otros_nombres": [
    "Blue linckia",
    "Blue sea star",
    "Comet sea star"
   ],
   "nombre_cientifico": "Linckia laevigata",
   "autoridad": "(Linnaeus, 1758)",
   "grupo": "estrella de mar",
   "imagen": {
    "archivo": "imagenes/linckia-laevigata.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/linckia-laevigata.jpg"
   },
   "taxonomia": {
    "clase": "Asteroidea",
    "orden": "Valvatida",
    "familia": "Ophidiasteridae",
    "subfamilia": null,
    "aphia_id": 207610,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Asterias laevigata Linnaeus, 1758 (combinación original)",
     "Ophidiaster laevigatus"
    ],
    "fuentes": [
     "worms_linckia_laevigata",
     "sealifebase_linckia_laevigata"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Zonas someras del arrecife sobre roca, coral muerto o cascajo, y en la pendiente arrecifal entre esponjas, macroalgas y pastos marinos. Los juveniles se esconden bajo corales y rocas.",
    "profundidad_m": {
     "min": 0,
     "max": 60
    },
    "distribucion": "Indo-Pacífico.",
    "fuentes": [
     "sealifebase_linckia_laevigata"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 40.0,
    "tipo": "diámetro",
    "contraste": "Diferencia entre fuentes: SeaLifeBase 40 cm de diámetro; LiveAquaria 1 pie (≈ 30.5 cm).",
    "fuentes": [
     "sealifebase_linckia_laevigata",
     "liveaquaria_linckia_laevigata"
    ],
    "confianza": "media"
   },
   "alimentacion": {
    "texto": "Omnívora: come detritos, pequeños invertebrados de las alfombras de algas y animales muertos; probablemente también algas cespitosas y película bacteriana (SeaLifeBase). En acuario se puede complementar con trozos de almeja o tabletas (LiveAquaria).",
    "fuentes": [
     "sealifebase_linckia_laevigata",
     "liveaquaria_linckia_laevigata"
    ],
    "confianza": "alta"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_linckia_laevigata"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "SeaLifeBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_linckia_laevigata"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.023,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_linckia_laevigata"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": null,
    "galones_us": null,
    "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
    "fuentes": [
     "liveaquaria_linckia_laevigata"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Generalmente solitaria, pero tolera otras estrellas y peces tranquilos. Muy sensible a cambios de oxígeno, salinidad y pH; no tolera el cobre; nunca debe exponerse al aire. Puede portar el caracol parásito Thyca crystallina (LiveAquaria).",
    "fuentes": [
     "sealifebase_linckia_laevigata",
     "liveaquaria_linckia_laevigata"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "No territorial. De juvenil se esconde en cuevas pequeñas; necesita escondites en la roca y sustrato de arena o cascajo bien iluminado.",
    "fuentes": [
     "liveaquaria_linckia_laevigata",
     "sealifebase_linckia_laevigata"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_linckia_laevigata"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Acuario maduro y estable; solo para expertos.",
     "Aclimatación por goteo, sin exponerla al aire.",
     "Revisar si porta el caracol parásito Thyca crystallina."
    ],
    "riesgos": [
     "No tolera medicamentos con cobre ni cambios bruscos de salinidad, pH u oxígeno; requiere aclimatación por goteo.",
     "Muere con facilidad si los parámetros del agua cambian."
    ],
    "fuentes": [
     "liveaquaria_linckia_laevigata",
     "sealifebase_linckia_laevigata"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "No evaluada por la UICN, según SeaLifeBase",
    "fuentes": [
     "sealifebase_linckia_laevigata"
    ]
   },
   "fuentes_verificadas": [
    "worms_linckia_laevigata",
    "sealifebase_linckia_laevigata",
    "liveaquaria_linckia_laevigata",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Estrella Linckia azul",
    "nombre_cientifico": "Linckia laevigata",
    "grupo": "estrella de mar",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "liveaquaria_linckia_laevigata"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico",
      "solitario"
     ],
     "descripcion": "Solitaria y pacífica. Muy delicada (solo para expertos): no tolera cambios bruscos del agua ni el cobre, y no debe sacarse del agua.",
     "fuentes": [
      "sealifebase_linckia_laevigata",
      "liveaquaria_linckia_laevigata"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "LiveAquaria la considera compatible con arrecife; no hay verificación independiente.",
     "fuentes": [
      "liveaquaria_linckia_laevigata"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "omnivoro",
     "alimentos": [
      "película de microorganismos y algas",
      "detritos",
      "pequeños invertebrados",
      "trozos de almeja (suplemento)"
     ],
     "nota": null,
     "fuentes": [
      "sealifebase_linckia_laevigata",
      "liveaquaria_linckia_laevigata"
     ],
     "confianza": "alta"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": null,
     "fuentes": [
      "liveaquaria_linckia_laevigata"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": null,
     "galones_us": null,
     "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "nota": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "fuentes": [],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 40.0,
     "medida": "diámetro",
     "tamano_venta_cm": {
      "min": 1.3,
      "max": 5.1,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según la fuente comercial; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "Diferencia entre fuentes: SeaLifeBase 40 cm de diámetro; LiveAquaria 1 pie (≈ 30.5 cm).",
     "fuentes": [
      "sealifebase_linckia_laevigata",
      "liveaquaria_linckia_laevigata"
     ],
     "confianza": "media"
    }
   }
  },
  {
   "id": "fromia_milleporella",
   "nombre_comun": "Estrella Fromia naranja",
   "otros_nombres": [
    "Red Fromia sea star",
    "Red sea star"
   ],
   "nombre_cientifico": "Fromia milleporella",
   "autoridad": "(Lamarck, 1816)",
   "grupo": "estrella de mar",
   "imagen": {
    "archivo": "imagenes/fromia-milleporella.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "especie_confirmada": false,
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real. La especie de la imagen no está confirmada: sus brazos largos y finos se parecen más a Echinaster que a Fromia milleporella. Se usa por decisión del responsable mientras se consigue otra.",
    "ruta_web": "fichas/imagenes/fromia-milleporella.jpg"
   },
   "taxonomia": {
    "clase": "Asteroidea",
    "orden": "Valvatida",
    "familia": "Goniasteridae",
    "subfamilia": null,
    "aphia_id": 213299,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Asterias milleporella Lamarck, 1816 (combinación original)",
     "Fromia pistoria",
     "Scytaster milleporellus"
    ],
    "nota": "Quality Marine la describe de color rojo a rojo anaranjado. SeaLifeBase y WoRMS la sitúan en la familia Goniasteridae.",
    "fuentes": [
     "worms_fromia_milleporella",
     "sealifebase_fromia_milleporella"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Bentónica, en aguas tropicales someras (SeaLifeBase). Quality Marine la sitúa en aguas someras del Indo-Pacífico, incluidos el Mar Rojo y el océano Índico.",
    "profundidad_m": {
     "min": 0,
     "max": 73,
     "habitual": "0–30 m (WoRMS)"
    },
    "distribucion": "Indo-Pacífico occidental.",
    "fuentes": [
     "sealifebase_fromia_milleporella"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 15.2,
    "tipo": "diámetro",
    "contraste": "SeaLifeBase no indica tamaño máximo; Quality Marine indica que llega a unas 6 in (≈ 15.2 cm).",
    "fuentes": [
     "sealifebase_fromia_milleporella",
     "qualitymarine_fromia_milleporella"
    ],
    "confianza": "baja"
   },
   "alimentacion": {
    "texto": "Detritívora y carroñera: come materia orgánica, algas y partículas pequeñas del sustrato y la roca viva. Si falta alimento natural, se le dan pellets de camarón que se hundan o trocitos de pescado o mejillón (Quality Marine). SeaLifeBase la describe como comedora de depósitos.",
    "fuentes": [
     "sealifebase_fromia_milleporella",
     "qualitymarine_fromia_milleporella"
    ],
    "confianza": "media"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "qualitymarine_fromia_milleporella"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "SeaLifeBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "qualitymarine_fromia_milleporella"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.023,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "qualitymarine_fromia_milleporella"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": null,
    "galones_us": null,
    "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
    "fuentes": [
     "qualitymarine_fromia_milleporella"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Pacífica. Puede regenerar un brazo dañado. Sensible a los cambios de parámetros y al cobre (Quality Marine).",
    "fuentes": [
     "sealifebase_fromia_milleporella",
     "qualitymarine_fromia_milleporella"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "No territorial. Necesita un lecho profundo de arena y espacio abierto.",
    "fuentes": [
     "qualitymarine_fromia_milleporella",
     "sealifebase_fromia_milleporella"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "qualitymarine_fromia_milleporella"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Acuario bien establecido, con lecho profundo de arena.",
     "Alimento suplementario si no hay suficiente alimento natural."
    ],
    "riesgos": [
     "No tolera medicamentos con cobre ni cambios bruscos de salinidad, pH u oxígeno; requiere aclimatación por goteo."
    ],
    "fuentes": [
     "qualitymarine_fromia_milleporella",
     "sealifebase_fromia_milleporella"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "No evaluada por la UICN, según SeaLifeBase",
    "fuentes": [
     "sealifebase_fromia_milleporella"
    ]
   },
   "fuentes_verificadas": [
    "worms_fromia_milleporella",
    "sealifebase_fromia_milleporella",
    "qualitymarine_fromia_milleporella",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "baja",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Estrella Fromia naranja",
    "nombre_cientifico": "Fromia milleporella",
    "grupo": "estrella de mar",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "qualitymarine_fromia_milleporella"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico"
     ],
     "descripcion": "Pacífica y apta para arrecife. Necesita un acuario bien establecido con mucho alimento natural en la roca y la arena.",
     "fuentes": [
      "sealifebase_fromia_milleporella",
      "qualitymarine_fromia_milleporella"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "Quality Marine la considera generalmente apta para arrecife y pacífica.",
     "fuentes": [
      "qualitymarine_fromia_milleporella"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "omnivoro",
     "alimentos": [
      "materia orgánica y detritos",
      "algas",
      "pellets de camarón (suplemento)",
      "trocitos de pescado o mejillón"
     ],
     "nota": null,
     "fuentes": [
      "sealifebase_fromia_milleporella",
      "qualitymarine_fromia_milleporella"
     ],
     "confianza": "media"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": null,
     "fuentes": [
      "qualitymarine_fromia_milleporella"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": null,
     "galones_us": null,
     "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "nota": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "fuentes": [],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 15.2,
     "medida": "diámetro",
     "tamano_venta_cm": null,
     "talla_madurez_cm": null,
     "nota": "SeaLifeBase no indica tamaño máximo; Quality Marine indica que llega a unas 6 in (≈ 15.2 cm).",
     "fuentes": [
      "sealifebase_fromia_milleporella",
      "qualitymarine_fromia_milleporella"
     ],
     "confianza": "baja"
    }
   }
  },
  {
   "id": "astropecten_polyacanthus",
   "nombre_comun": "Estrella arenera",
   "otros_nombres": [
    "Sand sifting sea star",
    "Brown spotted combstar"
   ],
   "nombre_cientifico": "Astropecten polyacanthus",
   "autoridad": "Müller & Troschel, 1842",
   "grupo": "estrella de mar",
   "imagen": {
    "archivo": "imagenes/astropecten-polyacanthus.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/astropecten-polyacanthus.jpg"
   },
   "taxonomia": {
    "clase": "Asteroidea",
    "orden": "Paxillosida",
    "familia": "Astropectinidae",
    "subfamilia": null,
    "aphia_id": 213245,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Astropecten hystrix Müller & Troschel, 1842",
     "Astropecten samoensis Perrier, 1869"
    ],
    "nota": "LiveAquaria escribe «polycanthus» y, por error, indica la familia Hippolytidae en sus datos rápidos; WoRMS y SeaLifeBase la sitúan en Astropectinidae.",
    "fuentes": [
     "worms_astropecten_polyacanthus",
     "sealifebase_astropecten_polyacanthus"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Fondos de arena: de día permanece enterrada y de noche sale a alimentarse sobre la arena.",
    "profundidad_m": {
     "min": 0,
     "max": 222,
     "habitual": "0–185 m (WoRMS)"
    },
    "distribucion": "Atlántico sudoriental y todo el Indo-Pacífico tropical, del Mar Rojo y Sudáfrica a Hawái.",
    "fuentes": [
     "sealifebase_astropecten_polyacanthus"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 12.0,
    "tipo": "diámetro",
    "contraste": "Diferencia entre fuentes: SeaLifeBase 12 cm de diámetro; LiveAquaria 8 in (≈ 20.3 cm).",
    "fuentes": [
     "sealifebase_astropecten_polyacanthus",
     "liveaquaria_astropecten_polyacanthus"
    ],
    "confianza": "baja"
   },
   "alimentacion": {
    "texto": "Carnívora: come sobre todo bivalvos, caracoles y otros invertebrados pequeños enterrados en la arena (SeaLifeBase). En acuario consume detritos y restos de comida, pero también camarones, erizos, moluscos y estrellas pequeñas; debe alimentarse activamente o morirá de hambre (LiveAquaria).",
    "fuentes": [
     "sealifebase_astropecten_polyacanthus",
     "liveaquaria_astropecten_polyacanthus"
    ],
    "confianza": "alta"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_astropecten_polyacanthus"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "SeaLifeBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_astropecten_polyacanthus"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.023,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_astropecten_polyacanthus"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": null,
    "galones_us": null,
    "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
    "fuentes": [
     "liveaquaria_astropecten_polyacanthus"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Nocturna: se entierra y remueve grandes cantidades de arena buscando alimento. Pacífica con los peces, pero se come invertebrados pequeños (SeaLifeBase y LiveAquaria).",
    "fuentes": [
     "sealifebase_astropecten_polyacanthus",
     "liveaquaria_astropecten_polyacanthus"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "No territorial. Necesita un lecho de arena grande y profundo, de varias pulgadas.",
    "fuentes": [
     "liveaquaria_astropecten_polyacanthus",
     "sealifebase_astropecten_polyacanthus"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "con precaución",
    "fuentes": [
     "liveaquaria_astropecten_polyacanthus"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Lecho de arena grande y profundo.",
     "Alimentación activa además de lo que encuentre en la arena.",
     "Sin peces globo ni otros depredadores."
    ],
    "riesgos": [
     "Se come invertebrados pequeños (camarones, erizos, moluscos, estrellas pequeñas).",
     "Puede morir de hambre y descomponerse en la arena.",
     "No tolera medicamentos con cobre ni cambios bruscos de salinidad, pH u oxígeno; requiere aclimatación por goteo."
    ],
    "fuentes": [
     "liveaquaria_astropecten_polyacanthus",
     "sealifebase_astropecten_polyacanthus"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "No evaluada por la UICN, según SeaLifeBase",
    "fuentes": [
     "sealifebase_astropecten_polyacanthus"
    ]
   },
   "fuentes_verificadas": [
    "worms_astropecten_polyacanthus",
    "sealifebase_astropecten_polyacanthus",
    "liveaquaria_astropecten_polyacanthus",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Estrella arenera",
    "nombre_cientifico": "Astropecten polyacanthus",
    "grupo": "estrella de mar",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "liveaquaria_astropecten_polyacanthus"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico"
     ],
     "descripcion": "Nocturna y pacífica con los peces. Se entierra y remueve la arena. Se come invertebrados pequeños y puede morir de hambre en acuarios con poca fauna.",
     "fuentes": [
      "sealifebase_astropecten_polyacanthus",
      "liveaquaria_astropecten_polyacanthus"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "con_precaucion",
     "explicacion": "Los datos rápidos de LiveAquaria dicen que es apta, pero su descripción advierte que come camarones, erizos, moluscos, bivalvos y estrellas pequeñas.",
     "fuentes": [
      "liveaquaria_astropecten_polyacanthus"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "carnivoro",
     "alimentos": [
      "bivalvos y caracoles enterrados",
      "invertebrados pequeños",
      "detritos y restos de comida"
     ],
     "nota": "LiveAquaria la llama omnívora en su descripción y carnívora en sus datos rápidos; SeaLifeBase describe una dieta animal.",
     "fuentes": [
      "sealifebase_astropecten_polyacanthus",
      "liveaquaria_astropecten_polyacanthus"
     ],
     "confianza": "alta"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": null,
     "fuentes": [
      "liveaquaria_astropecten_polyacanthus"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": null,
     "galones_us": null,
     "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "nota": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "fuentes": [],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 12.0,
     "medida": "diámetro",
     "tamano_venta_cm": {
      "min": 2.5,
      "max": 6.3,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según la fuente comercial; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "Diferencia entre fuentes: SeaLifeBase 12 cm de diámetro; LiveAquaria 8 in (≈ 20.3 cm).",
     "fuentes": [
      "sealifebase_astropecten_polyacanthus",
      "liveaquaria_astropecten_polyacanthus"
     ],
     "confianza": "baja"
    }
   }
  },
  {
   "id": "protoreaster_nodosus",
   "nombre_comun": "Estrella chocochip",
   "otros_nombres": [
    "Chocolate chip sea star",
    "Horned sea star",
    "Nodular sea star"
   ],
   "nombre_cientifico": "Protoreaster nodosus",
   "autoridad": "(Linnaeus, 1758)",
   "grupo": "estrella de mar",
   "imagen": {
    "archivo": "imagenes/protoreaster-nodosus.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/protoreaster-nodosus.jpg"
   },
   "taxonomia": {
    "clase": "Asteroidea",
    "orden": "Valvatida",
    "familia": "Oreasteridae",
    "subfamilia": null,
    "aphia_id": 213285,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Asterias nodosa Linnaeus, 1758 (combinación original)",
     "Pentaceros nodosus",
     "Oreaster turritus"
    ],
    "fuentes": [
     "worms_protoreaster_nodosus",
     "sealifebase_protoreaster_nodosus"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Praderas marinas y zonas de algas, sobre todo planicies arrecifales. SeaLifeBase la considera una buena especie bioindicadora de la salud del arrecife.",
    "profundidad_m": {
     "min": 0,
     "max": 37,
     "habitual": "0–30 m (WoRMS)"
    },
    "distribucion": "Indo-Pacífico occidental, de Seychelles a Australia y Japón.",
    "fuentes": [
     "sealifebase_protoreaster_nodosus"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 30.0,
    "tipo": "diámetro",
    "contraste": "Diferencia entre fuentes: SeaLifeBase 30 cm de diámetro; LiveAquaria hasta 15 in (≈ 38.1 cm).",
    "fuentes": [
     "sealifebase_protoreaster_nodosus",
     "liveaquaria_protoreaster_nodosus"
    ],
    "confianza": "media"
   },
   "alimentacion": {
    "texto": "En la naturaleza se alimenta de películas de microbios y microalgas, hojas de pastos marinos vivas y en descomposición, y algas verdes filamentosas (SeaLifeBase). En acuario, LiveAquaria la clasifica como carnívora: los adultos comen corales blandos, esponjas, gusanos tubícolas, almejas y otras estrellas.",
    "fuentes": [
     "sealifebase_protoreaster_nodosus",
     "liveaquaria_protoreaster_nodosus"
    ],
    "confianza": "media"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_protoreaster_nodosus"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "SeaLifeBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_protoreaster_nodosus"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.023,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_protoreaster_nodosus"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": null,
    "galones_us": null,
    "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
    "fuentes": [
     "liveaquaria_protoreaster_nodosus"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Pacífica con los peces, pero se come corales blandos, esponjas, gusanos tubícolas, almejas y otras estrellas. Exige muy buena calidad del agua y no tolera nitratos altos (LiveAquaria). Se recolecta mucho como adorno (SeaLifeBase).",
    "fuentes": [
     "sealifebase_protoreaster_nodosus",
     "liveaquaria_protoreaster_nodosus"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "No territorial. Necesita un acuario grande con un lecho de arena maduro de varias pulgadas.",
    "fuentes": [
     "liveaquaria_protoreaster_nodosus",
     "sealifebase_protoreaster_nodosus"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "no",
    "fuentes": [
     "liveaquaria_protoreaster_nodosus"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Acuario muy grande, sin corales ni invertebrados sésiles (solo peces y roca viva).",
     "Peces tranquilos; sin peces ballesta ni peces globo."
    ],
    "riesgos": [
     "Come corales blandos, esponjas, gusanos tubícolas, almejas y otras estrellas.",
     "No tolera nitratos altos.",
     "No tolera medicamentos con cobre ni cambios bruscos de salinidad, pH u oxígeno; requiere aclimatación por goteo."
    ],
    "fuentes": [
     "liveaquaria_protoreaster_nodosus",
     "sealifebase_protoreaster_nodosus"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "No evaluada por la UICN, según SeaLifeBase",
    "fuentes": [
     "sealifebase_protoreaster_nodosus"
    ]
   },
   "fuentes_verificadas": [
    "worms_protoreaster_nodosus",
    "sealifebase_protoreaster_nodosus",
    "liveaquaria_protoreaster_nodosus",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Estrella chocochip",
    "nombre_cientifico": "Protoreaster nodosus",
    "grupo": "estrella de mar",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "liveaquaria_protoreaster_nodosus"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico"
     ],
     "descripcion": "Pacífica con los peces, pero se come corales blandos, esponjas, almejas y otras estrellas. Exige agua de muy buena calidad.",
     "fuentes": [
      "sealifebase_protoreaster_nodosus",
      "liveaquaria_protoreaster_nodosus"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "no",
     "explicacion": "LiveAquaria no la considera apta para arrecife: los adultos comen corales blandos, esponjas, gusanos tubícolas, almejas y otras estrellas.",
     "fuentes": [
      "liveaquaria_protoreaster_nodosus"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "omnivoro",
     "alimentos": [
      "películas de microbios y microalgas",
      "pastos marinos y algas",
      "invertebrados sésiles (corales blandos, esponjas, almejas)"
     ],
     "nota": "Diferencia entre fuentes: SeaLifeBase describe una dieta de microalgas y pastos marinos; LiveAquaria la clasifica como carnívora en acuario.",
     "fuentes": [
      "sealifebase_protoreaster_nodosus",
      "liveaquaria_protoreaster_nodosus"
     ],
     "confianza": "media"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": null,
     "fuentes": [
      "liveaquaria_protoreaster_nodosus"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": null,
     "galones_us": null,
     "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "nota": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "fuentes": [],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 30.0,
     "medida": "diámetro",
     "tamano_venta_cm": null,
     "talla_madurez_cm": null,
     "nota": "Diferencia entre fuentes: SeaLifeBase 30 cm de diámetro; LiveAquaria hasta 15 in (≈ 38.1 cm).",
     "fuentes": [
      "sealifebase_protoreaster_nodosus",
      "liveaquaria_protoreaster_nodosus"
     ],
     "confianza": "media"
    }
   }
  },
  {
   "id": "thor_amboinensis",
   "nombre_comun": "Camarón sexy",
   "otros_nombres": [
    "Sexy anemone shrimp",
    "Squat anemone shrimp"
   ],
   "nombre_cientifico": "Thor amboinensis",
   "autoridad": "(De Man, 1888)",
   "grupo": "crustáceo",
   "imagen": {
    "archivo": "imagenes/thor-amboinensis.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/thor-amboinensis.jpg"
   },
   "taxonomia": {
    "clase": "Malacostraca",
    "orden": "Decapoda",
    "familia": "Thoridae",
    "subfamilia": null,
    "aphia_id": 107534,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Hippolyte amboinensis De Man, 1888 (combinación original)",
     "Thor discosomatis Kemp, 1916"
    ],
    "nota": "LiveAquaria lo sitúa en la familia Hippolytidae; WoRMS y SeaLifeBase, en Thoridae. Se toma WoRMS como referencia.",
    "fuentes": [
     "worms_thor_amboinensis",
     "sealifebase_thor_amboinensis"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Bentónico, en bahías y zonas costeras. Vive asociado a anémonas de mar como simbionte generalista, en arrecifes y praderas marinas.",
    "profundidad_m": {
     "min": 0,
     "max": 60
    },
    "distribucion": "Indo-Pacífico y océano Atlántico, en aguas tropicales y subtropicales.",
    "fuentes": [
     "sealifebase_thor_amboinensis"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 3.8,
    "tipo": "longitud",
    "contraste": "SeaLifeBase no indica tamaño. LiveAquaria se contradice: sus datos rápidos dicen ½ in (≈ 1.3 cm) y su descripción, que la mayoría llega a unas 1½ in (≈ 3.8 cm).",
    "fuentes": [
     "sealifebase_thor_amboinensis",
     "liveaquaria_thor_amboinensis"
    ],
    "confianza": "baja"
   },
   "alimentacion": {
    "texto": "Carnívoro: en acuario come plancton y alimentos en escamas, congelados y cárnicos (LiveAquaria).",
    "fuentes": [
     "liveaquaria_thor_amboinensis"
    ],
    "confianza": "baja"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_thor_amboinensis"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "SeaLifeBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_thor_amboinensis"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.023,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_thor_amboinensis"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": null,
    "galones_us": null,
    "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
    "fuentes": [
     "liveaquaria_thor_amboinensis"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Pacífico con los de su especie y con otros habitantes. Mueve el abdomen de un lado a otro al caminar, de ahí su nombre. Crece rápido y muda aproximadamente una vez al mes (LiveAquaria).",
    "fuentes": [
     "sealifebase_thor_amboinensis",
     "liveaquaria_thor_amboinensis"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "No territorial. En la naturaleza se refugia entre los tentáculos de una anémona.",
    "fuentes": [
     "liveaquaria_thor_amboinensis",
     "sealifebase_thor_amboinensis"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_thor_amboinensis"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "En grupos pequeños.",
     "Sin peces depredadores.",
     "Yodo suficiente para que mude bien."
    ],
    "riesgos": [
     "Los peces depredadores pueden comérselo por su tamaño pequeño.",
     "No tolera nitratos altos.",
     "No tolera medicamentos con cobre ni cambios bruscos de salinidad, pH u oxígeno; requiere aclimatación por goteo."
    ],
    "fuentes": [
     "liveaquaria_thor_amboinensis",
     "sealifebase_thor_amboinensis"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "No evaluado por la UICN, según SeaLifeBase",
    "fuentes": [
     "sealifebase_thor_amboinensis"
    ]
   },
   "fuentes_verificadas": [
    "worms_thor_amboinensis",
    "sealifebase_thor_amboinensis",
    "liveaquaria_thor_amboinensis",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "baja",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Camarón sexy",
    "nombre_cientifico": "Thor amboinensis",
    "grupo": "crustáceo",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "liveaquaria_thor_amboinensis"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico",
      "sociable"
     ],
     "descripcion": "Pacífico; mejor en grupos pequeños. Suele vivir entre los tentáculos de una anémona. Mueve el abdomen al caminar.",
     "fuentes": [
      "sealifebase_thor_amboinensis",
      "liveaquaria_thor_amboinensis"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "LiveAquaria lo considera compatible con arrecife.",
     "fuentes": [
      "liveaquaria_thor_amboinensis"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "carnivoro",
     "alimentos": [
      "plancton",
      "alimentos congelados y cárnicos",
      "escamas"
     ],
     "nota": null,
     "fuentes": [
      "liveaquaria_thor_amboinensis"
     ],
     "confianza": "baja"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": null,
     "fuentes": [
      "liveaquaria_thor_amboinensis"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": null,
     "galones_us": null,
     "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "nota": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "fuentes": [],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 3.8,
     "medida": "longitud",
     "tamano_venta_cm": {
      "min": 0.6,
      "max": 1.9,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según la fuente comercial; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "SeaLifeBase no indica tamaño. LiveAquaria se contradice: sus datos rápidos dicen ½ in (≈ 1.3 cm) y su descripción, que la mayoría llega a unas 1½ in (≈ 3.8 cm).",
     "fuentes": [
      "sealifebase_thor_amboinensis",
      "liveaquaria_thor_amboinensis"
     ],
     "confianza": "baja"
    }
   }
  },
  {
   "id": "lysmata_amboinensis",
   "nombre_comun": "Camarón limpiador",
   "otros_nombres": [
    "Scarlet skunk cleaner shrimp",
    "Skunk cleaner shrimp",
    "Pacific cleaner shrimp"
   ],
   "nombre_cientifico": "Lysmata amboinensis",
   "autoridad": "(De Man, 1888)",
   "grupo": "crustáceo",
   "imagen": {
    "archivo": "imagenes/lysmata-amboinensis.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/lysmata-amboinensis.jpg"
   },
   "taxonomia": {
    "clase": "Malacostraca",
    "orden": "Decapoda",
    "familia": "Lysmatidae",
    "subfamilia": null,
    "aphia_id": 241289,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Hippolysmata vittata var. amboinensis De Man, 1888 (combinación original)",
     "Hippolysmata amboinensis"
    ],
    "nota": "LiveAquaria lo sitúa en la familia Hippolytidae; WoRMS y SeaLifeBase, en Lysmatidae. Se toma WoRMS como referencia.",
    "fuentes": [
     "worms_lysmata_amboinensis",
     "sealifebase_lysmata_amboinensis"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Bentónico; a menudo en grupos entre roca viva o coral (LiveAquaria). SeaLifeBase no describe su hábitat.",
    "profundidad_m": {
     "min": 1,
     "max": 120
    },
    "distribucion": "Indo-Pacífico.",
    "fuentes": [
     "sealifebase_lysmata_amboinensis"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 10.2,
    "tipo": "longitud",
    "contraste": "SeaLifeBase no indica tamaño; LiveAquaria indica 4 in (≈ 10.2 cm).",
    "fuentes": [
     "sealifebase_lysmata_amboinensis",
     "liveaquaria_lysmata_amboinensis"
    ],
    "confianza": "baja"
   },
   "alimentacion": {
    "texto": "Carnívoro: limpia a los peces de ectoparásitos y tejido muerto, incluso dentro de su boca. Se complementa con alimentos liofilizados, congelados y en escamas (LiveAquaria).",
    "fuentes": [
     "liveaquaria_lysmata_amboinensis"
    ],
    "confianza": "baja"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_lysmata_amboinensis"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "SeaLifeBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_lysmata_amboinensis"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.023,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_lysmata_amboinensis"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": null,
    "galones_us": null,
    "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
    "fuentes": [
     "liveaquaria_lysmata_amboinensis"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Limpiador activo: se instala en la roca o el coral y espera a que los peces vengan a limpiarse. Pacífico; a menudo en grupos (LiveAquaria).",
    "fuentes": [
     "sealifebase_lysmata_amboinensis",
     "liveaquaria_lysmata_amboinensis"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "No territorial. Se instala en una «estación de limpieza» en la roca o el coral.",
    "fuentes": [
     "liveaquaria_lysmata_amboinensis",
     "sealifebase_lysmata_amboinensis"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_lysmata_amboinensis"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Compañeros pacíficos.",
     "Yodo suficiente para que mude y crezca."
    ],
    "riesgos": [
     "Peces halcón, peces león y camarones o cangrejos depredadores pueden comérselo.",
     "No tolera nitratos altos.",
     "No tolera medicamentos con cobre ni cambios bruscos de salinidad, pH u oxígeno; requiere aclimatación por goteo."
    ],
    "fuentes": [
     "liveaquaria_lysmata_amboinensis",
     "sealifebase_lysmata_amboinensis"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "No evaluado por la UICN, según SeaLifeBase",
    "fuentes": [
     "sealifebase_lysmata_amboinensis"
    ]
   },
   "fuentes_verificadas": [
    "worms_lysmata_amboinensis",
    "sealifebase_lysmata_amboinensis",
    "liveaquaria_lysmata_amboinensis",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "baja",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Camarón limpiador",
    "nombre_cientifico": "Lysmata amboinensis",
    "grupo": "crustáceo",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "liveaquaria_lysmata_amboinensis"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico",
      "sociable"
     ],
     "descripcion": "Pacífico y sociable. Limpia a los peces de parásitos y tejido muerto, incluso dentro de su boca.",
     "fuentes": [
      "sealifebase_lysmata_amboinensis",
      "liveaquaria_lysmata_amboinensis"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "LiveAquaria lo considera compatible con arrecife.",
     "fuentes": [
      "liveaquaria_lysmata_amboinensis"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "carnivoro",
     "alimentos": [
      "ectoparásitos y tejido muerto de peces",
      "alimentos congelados y liofilizados",
      "escamas"
     ],
     "nota": null,
     "fuentes": [
      "liveaquaria_lysmata_amboinensis"
     ],
     "confianza": "baja"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": null,
     "fuentes": [
      "liveaquaria_lysmata_amboinensis"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": null,
     "galones_us": null,
     "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "nota": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "fuentes": [],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 10.2,
     "medida": "longitud",
     "tamano_venta_cm": {
      "min": 1.3,
      "max": 8.3,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según la fuente comercial; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "SeaLifeBase no indica tamaño; LiveAquaria indica 4 in (≈ 10.2 cm).",
     "fuentes": [
      "sealifebase_lysmata_amboinensis",
      "liveaquaria_lysmata_amboinensis"
     ],
     "confianza": "baja"
    }
   }
  },
  {
   "id": "stenopus_hispidus",
   "nombre_comun": "Camarón boxeador",
   "otros_nombres": [
    "Banded coral shrimp",
    "Coral banded shrimp",
    "Boxing shrimp"
   ],
   "nombre_cientifico": "Stenopus hispidus",
   "autoridad": "(Olivier, 1811)",
   "grupo": "crustáceo",
   "imagen": {
    "archivo": "imagenes/stenopus-hispidus.jpg",
    "autor": "Brayan",
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": "2026-11-16",
    "origen": "ia",
    "nota": "Imagen ilustrativa generada con IA; no es una fotografía real.",
    "ruta_web": "fichas/imagenes/stenopus-hispidus.jpg"
   },
   "taxonomia": {
    "clase": "Malacostraca",
    "orden": "Decapoda",
    "familia": "Stenopodidae",
    "subfamilia": null,
    "aphia_id": 210370,
    "estado_worms": "aceptado",
    "sinonimos": [
     "Palaemon hispidus Olivier, 1811 (combinación original)"
    ],
    "fuentes": [
     "worms_stenopus_hispidus",
     "sealifebase_stenopus_hispidus"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Fondos rocosos y arrecifes coralinos; vive en grietas profundas y bajo salientes del arrecife. LiveAquaria indica que suele colgar boca abajo en cuevas, con solo las antenas fuera.",
    "profundidad_m": {
     "min": 1,
     "max": 200
    },
    "distribucion": "Indo-Pacífico (del Mar Rojo y Sudáfrica a las Tuamotu, Hawái e isla de Pascua) y Atlántico occidental (de Carolina del Norte y Bermudas al Caribe y São Paulo, Brasil).",
    "fuentes": [
     "sealifebase_stenopus_hispidus"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 7.6,
    "tipo": "longitud del cuerpo",
    "contraste": "SeaLifeBase no indica tamaño; LiveAquaria indica que rara vez supera 3 in (≈ 7.6 cm), o 6 in (≈ 15.2 cm) con las antenas.",
    "fuentes": [
     "sealifebase_stenopus_hispidus",
     "liveaquaria_stenopus_hispidus"
    ],
    "confianza": "baja"
   },
   "alimentacion": {
    "texto": "Carnívoro: come sobre todo pequeños artrópodos y otros invertebrados marinos. Además actúa como limpiador: retira parásitos, tejido dañado y restos de comida de los peces (SeaLifeBase).",
    "fuentes": [
     "sealifebase_stenopus_hispidus",
     "liveaquaria_stenopus_hispidus"
    ],
    "confianza": "alta"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_stenopus_hispidus"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "SeaLifeBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_stenopus_hispidus"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.023,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_stenopus_hispidus"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": null,
    "galones_us": null,
    "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
    "fuentes": [
     "liveaquaria_stenopus_hispidus"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Activo; sostiene en alto sus pinzas grandes como un boxeador. Agresivo con otros camarones boxeadores y con camarones más pequeños, pero pacífico con peces, corales e invertebrados (LiveAquaria). Se esconde 1–2 días al mudar.",
    "fuentes": [
     "sealifebase_stenopus_hispidus",
     "liveaquaria_stenopus_hispidus"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "Territorial con su especie. Se refugia en cuevas y grietas; necesita espacio para que sus antenas no toquen corales ni anémonas.",
    "fuentes": [
     "liveaquaria_stenopus_hispidus",
     "sealifebase_stenopus_hispidus"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_stenopus_hispidus"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Un solo ejemplar o una pareja formada.",
     "Cuevas y grietas en la roca."
    ],
    "riesgos": [
     "Agresión hacia otros camarones boxeadores y camarones más pequeños.",
     "No tolera medicamentos con cobre ni cambios bruscos de salinidad, pH u oxígeno; requiere aclimatación por goteo."
    ],
    "fuentes": [
     "liveaquaria_stenopus_hispidus",
     "sealifebase_stenopus_hispidus"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "No evaluado por la UICN, según SeaLifeBase",
    "fuentes": [
     "sealifebase_stenopus_hispidus"
    ]
   },
   "fuentes_verificadas": [
    "worms_stenopus_hispidus",
    "sealifebase_stenopus_hispidus",
    "liveaquaria_stenopus_hispidus",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "media",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Camarón boxeador",
    "nombre_cientifico": "Stenopus hispidus",
    "grupo": "crustáceo",
    "temperamento": {
     "valor": "semiagresivo",
     "nota": null,
     "fuentes": [
      "liveaquaria_stenopus_hispidus"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "territorial"
     ],
     "descripcion": "Pacífico con peces y corales, pero agresivo con otros camarones boxeadores y camarones pequeños. Un solo ejemplar o una pareja formada.",
     "fuentes": [
      "sealifebase_stenopus_hispidus",
      "liveaquaria_stenopus_hispidus"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "LiveAquaria lo considera compatible con arrecife.",
     "fuentes": [
      "liveaquaria_stenopus_hispidus"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "carnivoro",
     "alimentos": [
      "pequeños artrópodos e invertebrados",
      "parásitos y tejido dañado de peces",
      "restos de comida"
     ],
     "nota": null,
     "fuentes": [
      "sealifebase_stenopus_hispidus",
      "liveaquaria_stenopus_hispidus"
     ],
     "confianza": "alta"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": null,
     "fuentes": [
      "liveaquaria_stenopus_hispidus"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": null,
     "galones_us": null,
     "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "nota": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "fuentes": [],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 7.6,
     "medida": "longitud del cuerpo",
     "tamano_venta_cm": null,
     "talla_madurez_cm": null,
     "nota": "SeaLifeBase no indica tamaño; LiveAquaria indica que rara vez supera 3 in (≈ 7.6 cm), o 6 in (≈ 15.2 cm) con las antenas.",
     "fuentes": [
      "sealifebase_stenopus_hispidus",
      "liveaquaria_stenopus_hispidus"
     ],
     "confianza": "baja"
    }
   }
  },
  {
   "id": "paguristes_cadenati",
   "nombre_comun": "Ermitaño patas rojas",
   "otros_nombres": [
    "Scarlet reef hermit crab",
    "Red reef hermit",
    "Red legged hermit crab"
   ],
   "nombre_cientifico": "Paguristes cadenati",
   "autoridad": "Forest, 1954",
   "grupo": "crustáceo",
   "imagen": {
    "archivo": "imagenes/paguristes-cadenati.jpg",
    "autor": null,
    "licencia": null,
    "url_origen": null,
    "fecha_consulta": null,
    "ruta_web": null
   },
   "taxonomia": {
    "clase": "Malacostraca",
    "orden": "Decapoda",
    "familia": "Diogenidae",
    "subfamilia": null,
    "aphia_id": 368215,
    "estado_worms": "aceptado",
    "sinonimos": [],
    "nota": "Es un cangrejo ermitaño, no un caracol: vive dentro de conchas vacías de caracol.",
    "fuentes": [
     "worms_paguristes_cadenati",
     "sealifebase_paguristes_cadenati"
    ],
    "confianza": "alta"
   },
   "habitat": {
    "texto": "Bentónico, en fondos duros de roca y cascajo (WoRMS). LiveAquaria lo sitúa en paredes de arrecife y cascajo de coral del Caribe y el Atlántico occidental.",
    "profundidad_m": {
     "min": 1,
     "max": 52,
     "habitual": "0–100 m (WoRMS)"
    },
    "distribucion": "Atlántico occidental: Belice (SeaLifeBase); el holotipo procede de Martinica (WoRMS).",
    "fuentes": [
     "sealifebase_paguristes_cadenati"
    ],
    "confianza": "media"
   },
   "tamano_adulto": {
    "max_cm": 3.8,
    "tipo": "longitud",
    "contraste": "SeaLifeBase no indica tamaño; LiveAquaria indica 1½ in (≈ 3.8 cm).",
    "fuentes": [
     "sealifebase_paguristes_cadenati",
     "liveaquaria_paguristes_cadenati"
    ],
    "confianza": "baja"
   },
   "alimentacion": {
    "texto": "Omnívoro: come detritos y algas, en especial algas filamentosas, de pelo y de limo, y cianobacterias; también comida de peces. Si faltan algas, se complementa con alga seca (LiveAquaria).",
    "fuentes": [
     "liveaquaria_paguristes_cadenati"
    ],
    "confianza": "baja"
   },
   "temperatura": {
    "acuario": {
     "min_c": 22.2,
     "max_c": 25.6,
     "original": "72–78 °F",
     "fuentes": [
      "liveaquaria_paguristes_cadenati"
     ],
     "confianza": "baja"
    },
    "medio_natural": null,
    "nota": "SeaLifeBase no indica rango de temperatura para esta especie."
   },
   "ph": {
    "acuario": {
     "min": 8.1,
     "max": 8.4,
     "fuentes": [
      "liveaquaria_paguristes_cadenati"
     ]
    },
    "rango_prudente": {
     "min": 8.1,
     "max": 8.3,
     "criterio": "Intersección con la tabla MSD para agua salada (7.8–8.3)."
    },
    "confianza": "media"
   },
   "salinidad": {
    "acuario": {
     "gravedad_especifica_min": 1.02,
     "gravedad_especifica_max": 1.025,
     "unidad": "gravedad específica (adimensional)",
     "fuentes": [
      "liveaquaria_paguristes_cadenati"
     ]
    },
    "referencia": "Agua de mar media: 35 ppt (UF/IFAS).",
    "confianza": "media"
   },
   "volumen_minimo": {
    "litros": null,
    "galones_us": null,
    "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
    "fuentes": [
     "liveaquaria_paguristes_cadenati"
    ],
    "confianza": "baja"
   },
   "comportamiento": {
    "texto": "Muy resistente y, a diferencia de otros ermitaños, muy pacífico con sus compañeros. Necesita conchas vacías para cambiarse al crecer (LiveAquaria).",
    "fuentes": [
     "sealifebase_paguristes_cadenati",
     "liveaquaria_paguristes_cadenati"
    ],
    "confianza": "media"
   },
   "territorialidad_refugio": {
    "texto": "No territorial. Necesita conchas vacías de repuesto para mudarse al crecer.",
    "fuentes": [
     "liveaquaria_paguristes_cadenati",
     "sealifebase_paguristes_cadenati"
    ],
    "confianza": "media"
   },
   "compatibilidad_arrecife": {
    "valor": "sí",
    "fuentes": [
     "liveaquaria_paguristes_cadenati"
    ],
    "confianza": "baja"
   },
   "convivencia": {
    "condiciones": [
     "Acuario de arrecife establecido con algas.",
     "Conchas vacías de repuesto.",
     "Sin depredadores de invertebrados."
    ],
    "riesgos": [
     "Sin conchas vacías de repuesto no puede cambiar de concha al crecer.",
     "No tolera medicamentos con cobre ni cambios bruscos de salinidad, pH u oxígeno; requiere aclimatación por goteo."
    ],
    "fuentes": [
     "liveaquaria_paguristes_cadenati",
     "sealifebase_paguristes_cadenati"
    ],
    "confianza": "baja"
   },
   "conservacion": {
    "uicn": "No evaluado por la UICN, según SeaLifeBase",
    "fuentes": [
     "sealifebase_paguristes_cadenati"
    ]
   },
   "fuentes_verificadas": [
    "worms_paguristes_cadenati",
    "sealifebase_paguristes_cadenati",
    "liveaquaria_paguristes_cadenati",
    "msd_tabla_referencia",
    "ufifas_ph_sal_temp"
   ],
   "fecha_consulta": "2026-11-16",
   "nivel_confianza_global": "baja",
   "estado_verificacion": "verificada; pendiente de revisión del equipo",
   "ficha_airi": {
    "nombre_comun": "Ermitaño patas rojas",
    "nombre_cientifico": "Paguristes cadenati",
    "grupo": "crustáceo",
    "temperamento": {
     "valor": "pacifico",
     "nota": null,
     "fuentes": [
      "liveaquaria_paguristes_cadenati"
     ],
     "confianza": "baja"
    },
    "comportamiento": {
     "etiquetas": [
      "pacifico"
     ],
     "descripcion": "Pacífico y resistente. Forma parte del «equipo de limpieza»: come algas molestas y detritos. Necesita conchas vacías de repuesto.",
     "fuentes": [
      "sealifebase_paguristes_cadenati",
      "liveaquaria_paguristes_cadenati"
     ],
     "confianza": "media"
    },
    "adecuado_arrecife": {
     "valor": "si",
     "explicacion": "LiveAquaria lo considera compatible con arrecife y muy útil contra algas molestas.",
     "fuentes": [
      "liveaquaria_paguristes_cadenati"
     ],
     "confianza": "baja"
    },
    "alimentacion": {
     "tipo": "omnivoro",
     "alimentos": [
      "detritos",
      "algas filamentosas y de pelo",
      "cianobacterias",
      "alga seca y restos de comida"
     ],
     "nota": null,
     "fuentes": [
      "liveaquaria_paguristes_cadenati"
     ],
     "confianza": "baja"
    },
    "temperatura_c": {
     "min": 22.2,
     "max": 25.6,
     "nota": null,
     "fuentes": [
      "liveaquaria_paguristes_cadenati"
     ],
     "confianza": "baja"
    },
    "litraje_recomendado_l": {
     "min": null,
     "galones_us": null,
     "justificacion": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "nota": "Ninguna fuente consultada publica un litraje mínimo para esta especie; se deja en null en lugar de estimarlo.",
     "fuentes": [],
     "confianza": "baja"
    },
    "tamano_adulto_cm": {
     "max": 3.8,
     "medida": "longitud",
     "tamano_venta_cm": {
      "min": 1.3,
      "max": 3.2,
      "nota": "Tamaño habitual al comprarlo (juvenil o subadulto), según la fuente comercial; no es el tamaño adulto."
     },
     "talla_madurez_cm": null,
     "nota": "SeaLifeBase no indica tamaño; LiveAquaria indica 1½ in (≈ 3.8 cm).",
     "fuentes": [
      "sealifebase_paguristes_cadenati",
      "liveaquaria_paguristes_cadenati"
     ],
     "confianza": "baja"
    }
   }
  }
 ],
 "ficha_airi_valores": {
  "temperamento": [
   "pacifico",
   "semiagresivo",
   "agresivo"
  ],
  "comportamiento.etiquetas": [
   "pacifico",
   "territorial",
   "solitario",
   "sociable"
  ],
  "adecuado_arrecife": [
   "si",
   "no",
   "con_precaucion"
  ],
  "alimentacion.tipo": [
   "herbivoro",
   "carnivoro",
   "omnivoro"
  ],
  "nota": "Valores normalizados (sin tildes) para comparar especies. Un dato no verificable se registra como null.",
  "grupo": [
   "pez",
   "estrella de mar",
   "crustáceo"
  ]
 }
};
  if (typeof module === "object" && module.exports) module.exports = datos;
  else raiz.AIRIFichasDatos = datos;
})(typeof window !== "undefined" ? window : globalThis);
