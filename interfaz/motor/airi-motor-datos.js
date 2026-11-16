/* ═══ AIRI · Datos de referencia del motor de análisis (GENERADO, no editar) ═══
   Origen: motor/airi_motor/datos/*.json · generador: motor/herramientas/generar_datos_js.py
   referencias.json  sha256 7ca5c69e9a41f6b68dda3a03aaa9067f8a1003eac55e58fe2a4ffe513c01b2ac
   fuentes.json  sha256 356079ff1c09298e9bf509b12ffe69234a4f7a27dedbe31a38e039dc1f23bb41 */
(function (raiz) {
  "use strict";
  var datos = {
 "referencias": {
  "version": "0.4.0",
  "perfil_predeterminado": "peces_marinos_msd",
  "parametros": {
   "temperatura": {
    "nombre": "Temperatura",
    "unidad_canonica": "°C",
    "limites_captura": {
     "minimo": -2,
     "maximo": 100,
     "justificacion": "Rango del agua líquida a presión atmosférica (el agua de mar se congela cerca de −2 °C). Detecta errores de captura; no es un rango biológico."
    }
   },
   "ph": {
    "nombre": "pH",
    "unidad_canonica": "pH",
    "limites_captura": {
     "minimo": 0,
     "maximo": 14,
     "justificacion": "Escala de los medidores y kits de pH habituales. Detecta errores de captura; no es un límite físico universal ni un rango biológico."
    }
   },
   "salinidad": {
    "nombre": "Salinidad",
    "unidad_canonica": "ppt",
    "limites_captura": {
     "minimo": 0,
     "maximo": null,
     "justificacion": "La salinidad no puede ser negativa."
    }
   },
   "amoniaco": {
    "nombre": "Amoníaco total",
    "unidad_canonica": "mg/L TAN-N",
    "limites_captura": {
     "minimo": 0,
     "maximo": null,
     "justificacion": "Una concentración no puede ser negativa."
    }
   },
   "nitritos": {
    "nombre": "Nitritos",
    "unidad_canonica": "mg/L NO2-N",
    "limites_captura": {
     "minimo": 0,
     "maximo": null,
     "justificacion": "Una concentración no puede ser negativa."
    }
   },
   "nitratos": {
    "nombre": "Nitratos",
    "unidad_canonica": "mg/L NO3-N",
    "limites_captura": {
     "minimo": 0,
     "maximo": null,
     "justificacion": "Una concentración no puede ser negativa."
    }
   }
  },
  "perfiles": {
   "peces_marinos_msd": {
    "nombre": "Peces marinos · referencia veterinaria general (MSD)",
    "aplica_a": "Sistemas de agua salada con peces. No es específica de corales, invertebrados ni de una especie concreta.",
    "referencias": {
     "ph": {
      "estado": "verificada",
      "tipo": "rango_con_tolerancia_documental",
      "minimo": 7.8,
      "maximo": 8.3,
      "maximo_tolerancia": 8.5,
      "fuentes": [
       "msd_tabla_referencia",
       "msd_capitulo"
      ],
      "explicacion": "La tabla del MSD da 7.8–8.3 para agua salada; el texto del mismo capítulo considera habitualmente normal 7.8–8.5 en tanques marinos. Entre 8.3 y 8.5 las fuentes discrepan: se recomienda revisar, sin alerta de mayor severidad.",
      "condiciones": [
       "Medición en el agua del sistema, con instrumento calibrado.",
       "El pH varía a lo largo del día."
      ],
      "contexto": [
       {
        "texto": "El pH medio del agua superficial del océano es de 8.1.",
        "fuente": "nist_ph_oceano"
       }
      ]
     },
     "amoniaco": {
      "estado": "verificada",
      "tipo": "cero_con_umbral",
      "valor_normal": 0,
      "umbral_severidad": 0.5,
      "unidad_umbral": "mg/L TAN-N",
      "fuentes": [
       "msd_tabla_referencia",
       "msd_resumen_pruebas",
       "ufifas_fa031"
      ],
      "explicacion": "Referencia normal del MSD para agua salada: TAN 0 mg/L. Según su nota b, los peces de agua salada suelen tolerar TAN < 0.5 mg/L. El umbral solo se aplica si la medición se puede expresar como nitrógeno amoniacal total (TAN-N) y el método es compatible con agua de mar.",
      "condiciones": [
       "El umbral se refiere a TAN (NH3 + NH4+), no a NH3 libre.",
       "No se calcula el NH3 no ionizado: requeriría pH, temperatura y salinidad medidos al mismo tiempo y un método validado.",
       "El método de Nessler da reacciones falsas en agua de mar (UF/IFAS)."
      ]
     },
     "nitritos": {
      "estado": "verificada",
      "tipo": "cero",
      "valor_normal": 0,
      "fuentes": [
       "msd_tabla_referencia",
       "msd_resumen_pruebas"
      ],
      "explicacion": "Referencia normal del MSD para agua salada: nitrito 0 mg/L. El MSD no da un umbral de severidad para agua salada; el valor de 0.10 mg/L de UF/IFAS es general y no se usa aquí.",
      "condiciones": [
       "El MSD indica que el nitrito no suele medirse en sistemas marinos."
      ]
     },
     "nitratos": {
      "estado": "pendiente",
      "tipo": "maximo",
      "valor_documentado": 70,
      "fuentes": [
       "msd_tabla_referencia",
       "msd_capitulo"
      ],
      "motivo": "La tabla del MSD da < 70 mg/L sin indicar si es nitrato (NO3−) o nitrógeno de nitrato (NO3-N). En el mismo capítulo, la tabla de riesgos y el texto usan NO3-N ≥ 70 mg/L, pero eso no confirma la forma de la tabla de referencia. Hasta confirmarla, no se usa para evaluar ni para emitir alertas.",
      "condiciones": []
     },
     "temperatura": {
      "estado": "sin_referencia",
      "motivo": "No hay una referencia veterinaria o institucional para la temperatura de acuarios marinos en general: depende de las especies.",
      "contexto": [
       {
        "texto": "Corales formadores de arrecife en el medio natural: muchos crecen de forma óptima entre 23 y 29 °C y no toleran menos de 18 °C.",
        "fuente": "noaa_corales"
       },
       {
        "texto": "Amphiprion ocellaris (pez payaso): temperatura preferida estimada con modelos de 26.2–29.3 °C; registrado en mares de 24.4–31.8 °C.",
        "fuente": [
         "fishbase_ocellaris",
         "rls_ocellaris"
        ]
       }
      ]
     },
     "salinidad": {
      "estado": "sin_referencia",
      "motivo": "No hay una referencia veterinaria o institucional de salinidad para acuarios marinos en general.",
      "contexto": [
       {
        "texto": "La salinidad media del agua de mar es de 35 ppt.",
        "fuente": "ufifas_ph_sal_temp"
       },
       {
        "texto": "La mayoría de los corales formadores de arrecife del medio natural requieren de 32 a 42 ppt.",
        "fuente": "noaa_corales"
       }
      ]
     }
    }
   }
  }
 },
 "fuentes": {
  "version": "0.4.0",
  "fecha_consulta": "2026-11-12",
  "niveles": {
   "A": "Referencia veterinaria o institucional para sistemas con peces. Es la única que permite evaluar.",
   "B": "Dato del medio natural o de una especie. Solo se muestra como contexto; nunca se usa como límite de seguridad."
  },
  "fuentes": {
   "msd_tabla_referencia": {
    "nivel": "A",
    "titulo": "“Normal” Reference Ranges for Routine Water Quality Analysis (tabla)",
    "obra": "MSD Veterinary Manual (Merck & Co.), capítulo «Environmental Diseases of Aquatic Animals in Aquatic Systems»",
    "autores": "Ruth Francis-Floyd, Roy P. E. Yanong y Barbara D. Petty (University of Florida); la tabla no muestra autores ni fecha propios",
    "url": "https://www.msdvetmanual.com/multimedia/table/normal-reference-ranges-for-routine-water-quality-analysis",
    "datos_usados": "Agua salada: pH 7.8–8.3; TAN 0 mg/L; NH3 no ionizado 0 mg/L; nitrito 0 mg/L; nitrato < 70 mg/L. Nota b: los peces de agua salada suelen tolerar TAN < 0.5 mg/L; NH3 < 0.05 mg/L no se considera dañino, con diferencias por especie y situación. Notas c y d: los kits pueden reportar solo nitrógeno de nitrito o de nitrato; el nitrito no suele medirse en sistemas marinos."
   },
   "msd_capitulo": {
    "nivel": "A",
    "titulo": "Environmental Diseases of Aquatic Animals in Aquatic Systems",
    "obra": "MSD Veterinary Manual, versión profesional",
    "autores": "Ruth Francis-Floyd, Roy P. E. Yanong y Barbara D. Petty (University of Florida); revisión por pares de Angel Abuelo (Michigan State University)",
    "fechas": "Revisión completa: mayo de 2023; última actualización: junio de 2026",
    "url": "https://www.msdvetmanual.com/exotic-and-laboratory-animals/aquatic-systems/environmental-diseases-of-aquatic-animals-in-aquatic-systems",
    "datos_usados": "Para tanques marinos suele considerarse normal un pH de 7.8–8.5 (discrepa de la tabla: 7.8–8.3); los peces marinos toleran mucho peor las fluctuaciones de pH; la fracción de NH3 no ionizado aumenta con el pH y la temperatura; la tabla de riesgos indica toxicidad por nitrato con NO3-N ≥ 70 mg/L; la mayoría de los kits miden mg/L de NO3-N y para pasar a NO3 se multiplica por 4.4; conviene distinguir NO3-N de NO3 en la literatura."
   },
   "msd_resumen_pruebas": {
    "nivel": "A",
    "titulo": "A Summary of Water Quality Tests and Recommended Use (tabla)",
    "obra": "MSD Veterinary Manual",
    "url": "https://www.msdvetmanual.com/multimedia/table/a-summary-of-water-quality-tests-and-recommended-use",
    "datos_usados": "Nota b: si el amoníaco o el nitrito son detectables, la frecuencia de monitoreo debe aumentar a diaria; el TAN combina NH3 y NH4+ y el NH3 no ionizado se calcula."
   },
   "ufifas_fa031": {
    "nivel": "A",
    "titulo": "Ammonia in Aquatic Systems (FA031)",
    "obra": "UF/IFAS Extension, University of Florida (EDIS)",
    "autores": "Ruth Francis-Floyd, Craig Watson, Denise Petty y Deborah B. Pouder",
    "url": "https://ask.ifas.ufl.edu/publication/FA031",
    "datos_usados": "TAN = NH3 no ionizado + NH4+ ionizado; el NH3 es mucho más tóxico; la fracción no ionizada sube con el pH y la temperatura y baja ligeramente con la salinidad; en sistemas sanos el amoníaco debería ser cero; el método de Nessler da reacciones falsas en agua de mar y el de salicilato es más preciso; el nitrito es tóxico desde 0.10 mg/L (dato general, no específico de agua salada)."
   },
   "nist_ph_oceano": {
    "nivel": "B",
    "titulo": "How Do You Measure the Acidity (pH) of the Ocean?",
    "obra": "National Institute of Standards and Technology (NIST)",
    "url": "https://www.nist.gov/how-do-you-measure-it/how-do-you-measure-acidity-ph-ocean",
    "datos_usados": "pH medio del agua superficial del océano: 8.1."
   },
   "ufifas_ph_sal_temp": {
    "nivel": "B",
    "titulo": "pH, Salinity and Temperature (hoja informativa)",
    "obra": "UF/IFAS, programa de monitoreo de agua (waterwatch.ifas.ufl.edu)",
    "url": "https://waterwatch.ifas.ufl.edu/media/waterwatchifasufledu/FactSheet_pH_Sal_Temp.pdf",
    "datos_usados": "Salinidad media del agua de mar: 35 ppt; pH medio del agua de mar 8.2, entre 7.5 y 8.5 según las condiciones locales."
   },
   "noaa_corales": {
    "nivel": "B",
    "titulo": "In what types of water do corals live?",
    "obra": "NOAA National Ocean Service",
    "url": "https://oceanservice.noaa.gov/facts/coralwaters.html",
    "datos_usados": "Corales formadores de arrecife en el medio natural: no toleran menos de 18 °C; muchos crecen de forma óptima entre 23 y 29 °C; la mayoría requiere salinidad de 32 a 42 ppt."
   },
   "fishbase_ocellaris": {
    "nivel": "B",
    "titulo": "Amphiprion ocellaris, Clown anemonefish (ficha resumen)",
    "obra": "FishBase",
    "url": "https://fishbase.se/summary/6509",
    "datos_usados": "Temperatura preferida estimada con modelos a partir de su distribución natural: 26.2–29.3 °C (media 28.7 °C)."
   },
   "rls_ocellaris": {
    "nivel": "B",
    "titulo": "Amphiprion ocellaris",
    "obra": "Reef Life Survey",
    "url": "https://reeflifesurvey.com/species/amphiprion-ocellaris/",
    "datos_usados": "Rango de temperatura del mar donde se ha registrado: 24.4–31.8 °C."
   }
  }
 }
};
  if (typeof module === "object" && module.exports) module.exports = datos;
  else raiz.AIRIMotorDatos = datos;
})(typeof window !== "undefined" ? window : globalThis);
