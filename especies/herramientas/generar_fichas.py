"""Genera las fichas Markdown de especies y los datos de la interfaz a partir de especies/datos/catalogo_inicial.json.

Salidas: especies/fichas/*.md, interfaz/prototipo/fichas/airi-fichas-datos.js e
interfaz/prototipo/fichas/imagenes/ (copia de las imágenes con créditos completos).

El JSON es la fuente única: edita el JSON y vuelve a ejecutar este script.

Uso:
    python especies/herramientas/generar_fichas.py              # valida y escribe las fichas
    python especies/herramientas/generar_fichas.py --comprobar  # solo valida; falla si las fichas están desactualizadas
"""

from __future__ import annotations

import hashlib
import json
import shutil
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
CATALOGO = RAIZ / "datos" / "catalogo_inicial.json"
DIR_FICHAS = RAIZ / "fichas"
DIR_WEB = RAIZ.parent / "interfaz" / "prototipo" / "fichas"  # datos e imágenes que usa la interfaz

DIR_IMAGENES = RAIZ / "imagenes"
EXTENSIONES_IMAGEN = {".jpg", ".jpeg", ".png", ".webp"}
TAMANO_MAX_IMAGEN = 500 * 1024  # bytes
CREDITOS_IMAGEN = ("autor", "licencia", "url_origen", "fecha_consulta")
CREDITOS_IMAGEN_IA = ("autor", "fecha_consulta")  # imagen generada con IA: no hay URL ni licencia de terceros


def creditos_requeridos(img: dict) -> tuple[str, ...]:
    return CREDITOS_IMAGEN_IA if img.get("origen") == "ia" else CREDITOS_IMAGEN

CAMPOS_OBLIGATORIOS = [
    "nombre_comun", "nombre_cientifico", "autoridad", "taxonomia", "habitat",
    "tamano_adulto", "alimentacion", "temperatura", "ph", "salinidad",
    "volumen_minimo", "comportamiento", "territorialidad_refugio",
    "compatibilidad_arrecife", "convivencia", "fuentes_verificadas",
    "fecha_consulta", "nivel_confianza_global",
]
NIVELES = {"alta", "media", "baja"}
GRUPOS = {"pez", "estrella de mar", "crustáceo", "coral", "anémona", "caracol", "erizo de mar", "gusano", "pepino de mar", "almeja"}
VALORES_FICHA = {
    "temperamento": {"pacifico", "semiagresivo", "agresivo"},
    "etiquetas": {"pacifico", "territorial", "solitario", "sociable"},
    "arrecife": {"si", "no", "con_precaucion"},
    "alimentacion": {"herbivoro", "carnivoro", "omnivoro", "fotosintetico", "filtrador"},
}
ETIQUETAS = {
    "pacifico": "Pacífico", "semiagresivo": "Semiagresivo", "agresivo": "Agresivo",
    "territorial": "Territorial", "solitario": "Solitario", "sociable": "Sociable",
    "si": "Sí", "no": "No", "con_precaucion": "Con precaución",
    "herbivoro": "Herbívoro", "carnivoro": "Carnívoro", "omnivoro": "Omnívoro", "fotosintetico": "Fotosintético", "filtrador": "Filtrador",
}


def validar_ficha_airi(e: dict) -> list[str]:
    """Comprueba los nueve campos estandarizados. null es válido (dato no verificable)."""
    n = e.get("nombre_cientifico", "?")
    f = e.get("ficha_airi")
    if not f:
        return [f"{n}: falta el bloque ficha_airi"]
    err = []
    for campo in ("nombre_comun", "nombre_cientifico"):
        if f.get(campo) != e.get(campo):
            err.append(f"{n}: ficha_airi.{campo} no coincide con la especie")
    def valor(ruta, permitidos):
        v = f
        for k in ruta.split("."):
            v = v.get(k) if isinstance(v, dict) else None
        if v is not None and v not in permitidos:
            err.append(f"{n}: ficha_airi.{ruta} = {v!r} no es uno de {sorted(permitidos)}")
    valor("temperamento.valor", VALORES_FICHA["temperamento"])
    valor("adecuado_arrecife.valor", VALORES_FICHA["arrecife"])
    valor("alimentacion.tipo", VALORES_FICHA["alimentacion"])
    for et in (f.get("comportamiento") or {}).get("etiquetas") or []:
        if et not in VALORES_FICHA["etiquetas"]:
            err.append(f"{n}: etiqueta de comportamiento desconocida {et!r}")
    t = f.get("temperatura_c") or {}
    if t.get("min") is not None and t.get("max") is not None and not t["min"] < t["max"]:
        err.append(f"{n}: ficha_airi.temperatura_c invertida")
    tam = f.get("tamano_adulto_cm") or {}
    venta = tam.get("tamano_venta_cm") or {}
    if (tam.get("max") and venta.get("max") and venta["max"] > tam["max"] * 1.05
            and "Diferencia entre fuentes" not in (tam.get("nota") or "")):
        err.append(f"{n}: el tamaño de venta supera al tamaño adulto")
    return err


def _ids_fuente(obj):
    """Recorre el objeto y devuelve todos los identificadores de fuente citados."""
    if isinstance(obj, dict):
        for clave, valor in obj.items():
            if clave == "fuentes" and isinstance(valor, list):
                yield from valor
            elif clave == "fuente" and isinstance(valor, str):
                yield valor
            else:
                yield from _ids_fuente(valor)
    elif isinstance(obj, list):
        for v in obj:
            yield from _ids_fuente(v)


def _confianzas(obj):
    if isinstance(obj, dict):
        for clave, valor in obj.items():
            if clave in ("confianza", "nivel_confianza_global"):
                yield valor
            else:
                yield from _confianzas(valor)
    elif isinstance(obj, list):
        for v in obj:
            yield from _confianzas(v)


def validar(cat: dict) -> list[str]:
    errores = []
    fuentes = cat.get("fuentes", {})
    for fid, f in fuentes.items():
        if not str(f.get("url", "")).startswith("https://"):
            errores.append(f"fuente {fid}: falta URL https")
    for fid in _ids_fuente(cat.get("parametros_generales_agua_salada", {})):
        if fid not in fuentes:
            errores.append(f"parámetros generales: fuente desconocida {fid}")
    especies = cat.get("especies", [])
    if len(especies) < 5:
        errores.append("se requieren al menos cinco fichas")
    for e in especies:
        nombre = e.get("nombre_cientifico", "?")
        for campo in CAMPOS_OBLIGATORIOS:
            if e.get(campo) in (None, "", [], {}):
                errores.append(f"{nombre}: campo vacío {campo}")
        for fid in set(_ids_fuente(e)) | set(e.get("fuentes_verificadas", [])):
            if fid not in fuentes:
                errores.append(f"{nombre}: fuente desconocida {fid}")
        if e.get("grupo") not in GRUPOS:
            errores.append(f"{nombre}: grupo {e.get('grupo')!r} no es uno de {sorted(GRUPOS)}")
        errores += validar_ficha_airi(e)
        for nivel in _confianzas(e):
            if nivel not in NIVELES:
                errores.append(f"{nombre}: nivel de confianza inválido {nivel!r}")
        t = e.get("temperatura", {}).get("acuario") or {}
        if t and not t["min_c"] < t["max_c"]:
            errores.append(f"{nombre}: rango de temperatura invertido")
        p = (e.get("ph") or {}).get("acuario") or {}
        if p and not p["min"] < p["max"]:
            errores.append(f"{nombre}: rango de pH invertido")
        v = e.get("volumen_minimo") or {}
        if v and v.get("litros") is not None and abs(v["galones_us"] * 3.785 - v["litros"]) > 0.2:
            errores.append(f"{nombre}: litros no coinciden con galones")
    return errores


def revisar_imagen(e: dict) -> tuple[list[str], list[str]]:
    """Devuelve (errores, avisos) del bloque `imagen` de una especie."""
    errores, avisos = [], []
    nombre = e.get("nombre_cientifico", "?")
    img = e.get("imagen")
    if not img or not img.get("archivo"):
        return errores, [f"{nombre}: sin bloque imagen.archivo"]
    ruta = RAIZ / img["archivo"]
    faltan = [c for c in creditos_requeridos(img) if not img.get(c)]
    if ruta.suffix.lower() not in EXTENSIONES_IMAGEN:
        errores.append(f"{nombre}: extensión de imagen no admitida ({ruta.suffix})")
    if not ruta.exists():
        if any(img.get(c) for c in CREDITOS_IMAGEN):
            errores.append(f"{nombre}: hay créditos pero no existe {img['archivo']}")
        else:
            avisos.append(f"{nombre}: imagen pendiente ({img['archivo']})")
        return errores, avisos
    if faltan:
        errores.append(f"{nombre}: la imagen existe pero faltan créditos: {', '.join(faltan)}")
    if img.get("url_origen") and not str(img["url_origen"]).startswith("https://"):
        errores.append(f"{nombre}: imagen.url_origen debe empezar con https://")
    if ruta.stat().st_size > TAMANO_MAX_IMAGEN:
        avisos.append(f"{nombre}: la imagen pesa más de 500 KB; conviene reducirla")
    return errores, avisos


def imagen_lista(e: dict) -> bool:
    img = e.get("imagen") or {}
    return (bool(img.get("archivo")) and (RAIZ / img["archivo"]).exists()
            and all(img.get(c) for c in creditos_requeridos(img)))


def _citas(ids, fuentes):
    return ", ".join(f"[{i}]({fuentes[i]['url']})" for i in ids)


def _num(x):
    return f"{x:g}"


def ficha_md(e: dict, cat: dict) -> str:
    F = cat["fuentes"]
    tx, hab, tam = e["taxonomia"], e["habitat"], e["tamano_adulto"]
    tmp, ph, sal = e["temperatura"], e["ph"], e["salinidad"]
    vol, conv = e["volumen_minimo"], e["convivencia"]
    prof = hab.get("profundidad_m") or {}
    prof_txt = f"{_num(prof['min'])}–{_num(prof['max'])} m" if prof else "no indicada"
    if prof.get("habitual"):
        prof_txt += f" (habitual {prof['habitual']})"

    L = []
    a = L.append
    a(f"# {e['nombre_comun']} — *{e['nombre_cientifico']}* {e['autoridad']}")
    a("")
    a("> Archivo generado desde `especies/datos/catalogo_inicial.json` con "
      "`especies/herramientas/generar_fichas.py`. No editar a mano.")
    a("")
    if imagen_lista(e):
        img = e["imagen"]
        a(f"![{e['nombre_comun']} ({e['nombre_cientifico']})](../{img['archivo']})")
        a("")
        if img.get("origen") == "ia":
            a(f"*Imagen ilustrativa generada con IA por {img['autor']} ({img['fecha_consulta']}). "
              "No es una fotografía de un ejemplar real; puede contener errores anatómicos.*")
            if img.get("especie_confirmada") is False:
                a("")
                a("> **Aviso:** la especie de esta imagen no está confirmada. " + img.get("nota", ""))
        else:
            a(f"*Foto: {img['autor']} · {img['licencia']} · [origen]({img['url_origen']}) · consultada el {img['fecha_consulta']}*")
        a("")
    a(f"**Grupo:** {e.get('grupo', '—')}  ")
    a(f"**Otros nombres:** {', '.join(e.get('otros_nombres', [])) or '—'}  ")
    a(f"**Fecha de consulta:** {e['fecha_consulta']}  ")
    a(f"**Confianza global:** {e['nivel_confianza_global']}  ")
    a(f"**Estado:** {e.get('estado_verificacion', '')}")
    a("")
    fa = e["ficha_airi"]
    def et(v):
        return ETIQUETAS.get(v, "null (no verificado)") if v is not None else "null (no verificado)"
    def nota(x):
        return f" *{x['nota']}*" if x.get("nota") else ""
    tf, lf, zf = fa["temperatura_c"], fa["litraje_recomendado_l"], fa["tamano_adulto_cm"]
    venta = zf.get("tamano_venta_cm") or {}
    a("## Ficha AIRI")
    a("")
    a("| Campo | Valor |")
    a("|---|---|")
    resumen = [
        ("Nombre común", fa["nombre_comun"]),
        ("Nombre científico", f"*{fa['nombre_cientifico']}*"),
        ("Temperamento", et(fa["temperamento"]["valor"]) + nota(fa["temperamento"])),
        ("Comportamiento", ", ".join(et(x) for x in fa["comportamiento"]["etiquetas"]) + ". " + fa["comportamiento"]["descripcion"]),
        ("Adecuado para arrecife", et(fa["adecuado_arrecife"]["valor"]) + ". " + fa["adecuado_arrecife"]["explicacion"]),
        ("Tipo de alimentación", et(fa["alimentacion"]["tipo"]) + ": " + ", ".join(fa["alimentacion"]["alimentos"]) + "." + nota(fa["alimentacion"])),
        ("Temperatura", f"{_num(tf['min'])}–{_num(tf['max'])} °C" + nota(tf) if tf.get("min") is not None else "null (no verificado)"),
        ("Litraje recomendado", f"{_num(lf['min'])} L ({_num(lf['galones_us'])} gal EE. UU.)." + nota(lf) if lf.get("min") is not None else "null (no verificado)." + nota(lf)),
        ("Tamaño adulto", (f"{_num(zf['max'])} cm ({zf['medida']})." if zf.get("max") is not None else "null (no verificado).") + ((f" Al venderse mide {_num(venta['min'])}–{_num(venta['max'])} cm (juvenil o subadulto)." if venta.get("min") is not None
              else f" Al venderse mide hasta {_num(venta['max'])} cm (juvenil o subadulto).") if venta else "")
            + (f" Madura desde {_num(zf['talla_madurez_cm'])} cm." if zf.get("talla_madurez_cm") else "") + nota(zf)),
    ]
    for campo, val in resumen:
        a(f"| {campo} | {str(val).replace('|', '/')} |")
    a("")
    a("## Detalle verificado")
    a("")
    a("| Campo | Dato | Confianza | Fuentes |")
    a("|---|---|---|---|")

    def fila(campo, dato, conf, ids):
        dato = str(dato).replace("|", "\\|").replace("\n", " ")
        a(f"| {campo} | {dato} | {conf} | {_citas(ids, F)} |")

    clasif = (f"Clase {tx['clase']}; orden {tx['orden']}; familia {tx['familia']}"
              + (f"; subfamilia {tx['subfamilia']}" if tx.get("subfamilia") else "")
              + f". WoRMS AphiaID {tx['aphia_id']} ({tx['estado_worms']}).")
    if tx.get("sinonimos"):
        clasif += f" Sinónimos: {', '.join(tx['sinonimos'])}."
    if tx.get("nota"):
        clasif += f" {tx['nota']}"
    fila("Clasificación taxonómica", clasif, tx["confianza"], tx["fuentes"])
    fila("Hábitat natural", f"{hab['texto']} Profundidad: {prof_txt}. Distribución: {hab['distribucion']}",
         hab["confianza"], hab["fuentes"])
    fila("Tamaño adulto", (f"Máx. {_num(tam['max_cm'])} cm ({tam['tipo']}). " if tam.get("max_cm") is not None else "null (no verificado). ") + tam.get("contraste", ""),
         tam["confianza"], tam["fuentes"])
    fila("Alimentación", e["alimentacion"]["texto"], e["alimentacion"]["confianza"], e["alimentacion"]["fuentes"])

    ta = tmp.get("acuario")
    t_ids = []
    if ta:
        t_txt = f"Acuario: {_num(ta['min_c'])}–{_num(ta['max_c'])} °C ({ta['original']})."
        t_ids += ta["fuentes"]
    else:
        t_txt = "Acuario: null (no verificado)."
    if tmp.get("medio_natural"):
        tn = tmp["medio_natural"]
        t_txt += f" Medio natural: {_num(tn['min_c'])}–{_num(tn['max_c'])} °C."
        t_ids += tn["fuentes"]
    if tmp.get("nota"):
        t_txt += f" {tmp['nota']}"
    fila("Temperatura del agua", t_txt, ta["confianza"] if ta else "media", t_ids)

    pa, pp = ph.get("acuario"), ph.get("rango_prudente")
    if pa and pp:
        fila("Rango de pH",
             f"Fuente de acuario: {_num(pa['min'])}–{_num(pa['max'])}. Rango prudente AIRI: "
             f"{_num(pp['min'])}–{_num(pp['max'])}. Criterio: {pp['criterio']}",
             ph["confianza"], pa["fuentes"] + ["msd_tabla_referencia", "msd_capitulo"])
    else:
        fila("Rango de pH", "null (no verificado). " + ph.get("nota", ""), ph["confianza"], ["msd_tabla_referencia"])

    sa = sal.get("acuario")
    if sa:
        fila("Salinidad",
             f"{sa['gravedad_especifica_min']:.3f}–{sa['gravedad_especifica_max']:.3f} de {sa['unidad']}. "
             f"{sal['referencia']} No se convierte a ppt porque la equivalencia depende de la temperatura.",
             sal["confianza"], sa["fuentes"] + ["ufifas_ph_sal_temp"])
    else:
        fila("Salinidad", f"null (no verificado). {sal['referencia']}", sal["confianza"], ["ufifas_ph_sal_temp"])
    fila("Volumen mínimo",
         (f"{_num(vol['litros'])} L ({_num(vol['galones_us'])} gal EE. UU.). " if vol.get("litros") is not None else "null (no verificado). ")
         + f"Justificación: {vol['justificacion']}",
         vol["confianza"], vol["fuentes"])
    fila("Comportamiento", e["comportamiento"]["texto"], e["comportamiento"]["confianza"], e["comportamiento"]["fuentes"])
    tr = e["territorialidad_refugio"]
    fila("Territorialidad y refugio", tr["texto"], tr["confianza"], tr["fuentes"])
    ca = e["compatibilidad_arrecife"]
    fila("Compatibilidad con arrecife", f"{ca['valor']} (según la fuente; sin verificación independiente)",
         ca["confianza"], ca["fuentes"])
    fila("Convivencia: condiciones", " · ".join(conv["condiciones"]), conv["confianza"], conv["fuentes"])
    fila("Convivencia: riesgos", " · ".join(conv["riesgos"]), conv["confianza"], conv["fuentes"])
    if e.get("conservacion"):
        c = e["conservacion"]
        c_txt = " ".join(x.rstrip(".") + "." for x in (c.get("uicn"), c.get("otros"), c.get("recomendacion_airi")) if x)
        fila("Conservación", c_txt, "alta" if len(c["fuentes"]) > 1 else "media", c["fuentes"])

    a("")
    a("**Regla AIRI:** compartir rangos de agua no implica compatibilidad entre especies. "
      "Los rangos de acuario provienen de una fuente comercial y no son límites veterinarios.")
    a("")
    a("## Fuentes")
    a("")
    citadas = list(e["fuentes_verificadas"])
    for fid in _ids_fuente(e):
        if fid not in citadas:
            citadas.append(fid)
    for fid in ["msd_capitulo"]:
        if fid not in citadas:
            citadas.append(fid)
    for fid in citadas:
        f = F[fid]
        a(f"- **{fid}** ({f['tipo']}): {f['titulo']}. <{f['url']}>. Consultada el {f.get('fecha_consulta', e['fecha_consulta'])}." + (f" {f['nota']}" if f.get("nota") else ""))
    a("")
    return "\n".join(L)


def nombre_archivo(e: dict) -> str:
    return e["id"].replace("_", "-") + ".md"


def datos_web_js(cat: dict) -> tuple[str, dict[str, Path]]:
    """Script con el catálogo para la interfaz (sirve también con file://) y las imágenes que necesita.

    Solo se publican imágenes con créditos completos; su ruta se reescribe relativa a interfaz/prototipo/.
    """
    web = json.loads(json.dumps(cat))  # copia profunda
    imagenes: dict[str, Path] = {}
    for e in web["especies"]:
        img = e.get("imagen")
        if img and imagen_lista(e):
            origen = RAIZ / img["archivo"]
            imagenes[origen.name] = origen
            img["ruta_web"] = f"fichas/imagenes/{origen.name}"
        elif img:
            img["ruta_web"] = None
    crudo = CATALOGO.read_bytes()
    cuerpo = json.dumps(web, ensure_ascii=False, indent=1)
    js = ("/* ═══ AIRI · Catálogo de fichas de especies (GENERADO, no editar) ═══\n"
          "   Origen: especies/datos/catalogo_inicial.json · generador: especies/herramientas/generar_fichas.py\n"
          f"   catalogo_inicial.json  sha256 {hashlib.sha256(crudo).hexdigest()} */\n"
          "(function (raiz) {\n"
          "  \"use strict\";\n"
          f"  var datos = {cuerpo};\n"
          "  if (typeof module === \"object\" && module.exports) module.exports = datos;\n"
          "  else raiz.AIRIFichasDatos = datos;\n"
          "})(typeof window !== \"undefined\" ? window : globalThis);\n")
    return js, imagenes


def sincronizar_web(cat: dict, comprobar: bool) -> list[str]:
    """Escribe (o comprueba) los datos y las imágenes de la interfaz. Devuelve lo que esté desactualizado."""
    js, imagenes = datos_web_js(cat)
    pendientes = []
    destino_js = DIR_WEB / "airi-fichas-datos.js"
    if comprobar:
        if not destino_js.exists() or destino_js.read_text(encoding="utf-8") != js:
            pendientes.append(str(destino_js.relative_to(RAIZ.parent)))
    else:
        DIR_WEB.mkdir(parents=True, exist_ok=True)
        destino_js.write_text(js, encoding="utf-8", newline="\n")
    dir_img = DIR_WEB / "imagenes"
    existentes = {p.name: p for p in dir_img.glob("*")} if dir_img.exists() else {}
    for nombre, origen in imagenes.items():
        destino = dir_img / nombre
        if comprobar:
            if not destino.exists() or destino.read_bytes() != origen.read_bytes():
                pendientes.append(str(destino.relative_to(RAIZ.parent)))
        else:
            dir_img.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(origen, destino)
    for nombre, ruta in existentes.items():
        if nombre not in imagenes:
            if comprobar:
                pendientes.append(f"{ruta.relative_to(RAIZ.parent)} (sobra)")
            else:
                ruta.unlink()
    return pendientes


def main(argv: list[str]) -> int:
    comprobar = "--comprobar" in argv
    cat = json.loads(CATALOGO.read_text(encoding="utf-8"))
    errores = validar(cat)
    avisos = []
    for e in cat.get("especies", []):
        err_img, av_img = revisar_imagen(e)
        errores += err_img
        avisos += av_img
    for av in avisos:
        print("Aviso:", av)
    if errores:
        print("Errores en el catálogo:")
        for err in errores:
            print(" -", err)
        return 1
    desactualizadas = []
    for e in cat["especies"]:
        ruta = DIR_FICHAS / nombre_archivo(e)
        contenido = ficha_md(e, cat)
        if comprobar:
            if not ruta.exists() or ruta.read_text(encoding="utf-8") != contenido:
                desactualizadas.append(ruta.name)
        else:
            ruta.write_text(contenido, encoding="utf-8", newline="\n")
    desactualizadas += sincronizar_web(cat, comprobar)
    if desactualizadas:
        print("Archivos desactualizados (ejecuta el script sin --comprobar):", ", ".join(desactualizadas))
        return 1
    print(f"OK: {len(cat['especies'])} fichas {'validadas' if comprobar else 'generadas'} "
          f"(Markdown e interfaz).")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
