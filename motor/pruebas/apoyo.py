"""Utilidades comunes de las pruebas del motor (solo biblioteca estándar)."""
import copy, re, sys
from pathlib import Path

MOTOR = Path(__file__).resolve().parents[1]
RAIZ = MOTOR.parent
sys.path.insert(0, str(MOTOR))

import airi_motor  # noqa: E402
from airi_motor import datos  # noqa: E402

UNIDADES_PROTOTIPO = {  # las unidades que muestra hoy interfaz/prototipo/index.html
    "temperatura": "°C", "ph": "pH", "salinidad": "ppt",
    "amoniaco": "mg/L (NH₃/NH₄⁺ total)", "nitritos": "mg/L (NO₂⁻)", "nitratos": "mg/L (NO₃⁻)",
}


def mediciones(**valores):
    """Mediciones con las unidades del prototipo; un valor puede ser (valor, unidad[, metodo])."""
    m = {}
    for p, v in valores.items():
        if isinstance(v, tuple):
            m[p] = {"valor": v[0], "unidad": v[1], **({"metodo": v[2]} if len(v) > 2 else {})}
        else:
            m[p] = {"valor": v, "unidad": UNIDADES_PROTOTIPO[p]}
    return m


def perfil_de_prueba():
    """Perfil SOLO PARA PRUEBAS: copia del real con referencias ficticias para temperatura, salinidad y
    nitratos, de modo que se puedan recorrer R1 y R2. No es una referencia biológica."""
    p = copy.deepcopy(datos.perfil())
    p["id"], p["nombre"] = "prueba", "Perfil de prueba (valores ficticios, no biológicos)"
    ficticio = {"estado": "verificada", "tipo": "rango_con_tolerancia_documental", "fuentes": ["msd_tabla_referencia"]}
    p["referencias"]["temperatura"] = {**ficticio, "minimo": 10, "maximo": 20, "maximo_tolerancia": 20}
    p["referencias"]["salinidad"] = {**ficticio, "minimo": 10, "maximo": 20, "maximo_tolerancia": 20}
    p["referencias"]["nitratos"] = {**ficticio, "minimo": 0, "maximo": 1, "maximo_tolerancia": 1}
    return p


def aristas_del_grafo():
    """Aristas (origen, destino, etiqueta) del grafo oficial grafo/grafo_decisiones_airi.dot."""
    texto = (RAIZ / "grafo" / "grafo_decisiones_airi.dot").read_text(encoding="utf-8")
    aristas = set()
    for a, b, atributos in re.findall(r"^\s*(\w+)\s*->\s*(\w+)\s*\[([^\]]*)\]", texto, re.M):
        if "invis" in atributos:
            continue
        etiqueta = re.search(r'label=(?:"([^"]*)"|<(.*)>)', atributos)
        etiqueta = (etiqueta.group(1) if etiqueta.group(1) is not None else etiqueta.group(2))
        etiqueta = re.sub(r"<[^>]+>", "", etiqueta).strip()
        aristas.add((a, b, etiqueta))
    return aristas
