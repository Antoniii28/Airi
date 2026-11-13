"""Genera motor/casos_conformidad.json: vectores de prueba que cualquier implementación del motor AIRI
(Python hoy, JavaScript en la futura integración web) debe reproducir exactamente.

    python motor/herramientas/generar_casos.py           # reescribe el archivo
    python motor/herramientas/generar_casos.py --check   # sale con 1 si el archivo no está al día

El resultado es determinista. Se comparan campos estructurales (estados, severidades, valores canónicos,
clasificación, traza); los textos explicativos no forman parte del contrato de conformidad.
"""
import copy
import json
import sys
from pathlib import Path

MOTOR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(MOTOR))
from airi_motor import datos, evaluar  # noqa: E402

DESTINO = MOTOR / "casos_conformidad.json"
U = {"temperatura": "°C", "ph": "pH", "salinidad": "ppt", "amoniaco": "mg/L (NH₃/NH₄⁺ total)",
     "nitritos": "mg/L (NO₂⁻)", "nitratos": "mg/L (NO₃⁻)"}
BASE = {"temperatura": "26", "ph": "8.1", "salinidad": "35", "amoniaco": "0", "nitritos": "0", "nitratos": "5"}


def m(**cambios):
    """Mediciones con unidades del prototipo; None elimina el parámetro, una tupla fija (valor, unidad[, método])."""
    v = {**BASE, **cambios}
    out = {}
    for p, x in v.items():
        if x is None:
            continue
        if isinstance(x, tuple):
            out[p] = {"valor": x[0], "unidad": x[1], **({"metodo": x[2]} if len(x) > 2 else {})}
        else:
            out[p] = {"valor": x, "unidad": U[p]}
    return out


def perfil_de_prueba():
    p = copy.deepcopy(datos.perfil())
    p["id"], p["nombre"] = "prueba", "Perfil de prueba (valores ficticios, no biológicos)"
    f = {"estado": "verificada", "tipo": "rango_con_tolerancia_documental", "fuentes": ["msd_tabla_referencia"]}
    p["referencias"]["temperatura"] = {**f, "minimo": 10, "maximo": 20, "maximo_tolerancia": 20}
    p["referencias"]["salinidad"] = {**f, "minimo": 10, "maximo": 20, "maximo_tolerancia": 20}
    p["referencias"]["nitratos"] = {**f, "minimo": 0, "maximo": 1, "maximo_tolerancia": 1}
    return p


def casos():
    P = perfil_de_prueba()
    ok = dict(temperatura="15", salinidad="15", nitratos="0.5")
    c = [
        ("prototipo_tipico", "Valores típicos con las unidades del prototipo", m(), None),
        ("todo_vacio", "Ningún dato", {}, None),
        ("ph_limite_inferior", "pH 7.8 (inclusivo)", m(ph="7.8"), None),
        ("ph_limite_superior", "pH 8.3 (inclusivo)", m(ph="8.3"), None),
        ("ph_tolerancia", "pH 8.4: tabla y texto del MSD discrepan", m(ph="8.4"), None),
        ("ph_tolerancia_maxima", "pH 8.5", m(ph="8.5"), None),
        ("ph_alto", "pH 8.6", m(ph="8.6"), None),
        ("ph_bajo", "pH 7.7", m(ph="7.7"), None),
        ("ph_coma_decimal", "pH con coma decimal", m(ph="8,0"), None),
        ("ph_fuera_escala", "pH 15: fuera de la escala del instrumento", m(ph="15"), None),
        ("ph_texto", "pH no numérico", m(ph="ocho"), None),
        ("amoniaco_tan_detectable", "0.2 mg/L TAN-N", m(amoniaco=("0.2", "mg/L TAN-N")), None),
        ("amoniaco_tan_umbral", "0.5 mg/L TAN-N", m(amoniaco=("0.5", "mg/L TAN-N")), None),
        ("amoniaco_nh3_bajo_umbral", "0.6 como NH3 = 0.493 TAN-N", m(amoniaco=("0.6", "mg/L como NH3")), None),
        ("amoniaco_nh3_sobre_umbral", "0.61 como NH3 = 0.502 TAN-N", m(amoniaco=("0.61", "mg/L como NH3")), None),
        ("amoniaco_nh4", "0.65 como NH4+ = 0.505 TAN-N", m(amoniaco=("0.65", "mg/L como NH4+")), None),
        ("amoniaco_base_desconocida_baja", "0.45 sin base: máx < 0.5", m(amoniaco="0.45"), None),
        ("amoniaco_base_desconocida_ambigua", "0.6 sin base: 0.466–0.6", m(amoniaco="0.6"), None),
        ("amoniaco_base_desconocida_alta", "0.7 sin base: mín ≥ 0.5", m(amoniaco="0.7"), None),
        ("amoniaco_nessler", "Método Nessler en agua salada", m(amoniaco=("1", "mg/L TAN-N", "Nessler")), None),
        ("amoniaco_negativo", "Valor negativo", m(amoniaco="-0.1"), None),
        ("nitritos_detectables", "0.1 mg/L NO2-", m(nitritos="0.1"), None),
        ("nitritos_como_n", "0.05 mg/L NO2-N", m(nitritos=("0.05", "mg/L NO2-N")), None),
        ("nitratos_altos", "Nitratos 100: referencia pendiente, sin alerta", m(nitratos="100"), None),
        ("nitratos_sin_forma", "Nitratos sin forma química", m(nitratos=("10", "mg/L")), None),
        ("temperatura_fahrenheit", "77 °F", m(temperatura=("77", "°F")), None),
        ("temperatura_extrema", "150 °C: fuera de captura", m(temperatura="150"), None),
        ("salinidad_densidad", "Densidad relativa: no se convierte", m(salinidad=("1.025", "densidad relativa")), None),
        ("salinidad_g_kg", "Salinidad en g/kg", m(salinidad=("35", "g/kg")), None),
        ("r4_mixto", "Anomalías y faltantes a la vez", m(temperatura=None, salinidad="", ph="7", amoniaco="0.8", nitritos="0.2"), None),
        ("prueba_r1", "Perfil de prueba: todo dentro", m(**ok), P),
        ("prueba_r2", "Perfil de prueba: anomalía sin faltantes", m(**ok, ph="9"), P),
        ("prueba_r3", "Perfil de prueba: faltante sin anomalía", m(**ok, ph=""), P),
        ("prueba_r4", "Perfil de prueba: anomalía y faltante", m(**ok, ph="9", nitritos=None), P),
    ]
    return c


def redondear(v):
    if isinstance(v, float):
        return round(v, 6)
    if isinstance(v, list):
        return [redondear(x) for x in v]
    return v


def esperado(inf):
    return {
        "clasificacion": inf["clasificacion"], "A": inf["A"], "I": inf["I"],
        "resultados": {r["parametro"]: {"estado": r["estado"], "severidad": r["severidad"],
                                        "valor_canonico": redondear(r["valor_canonico"]),
                                        "unidad_canonica": r["unidad_canonica"]} for r in inf["resultados"]},
        "alertas": [[a["parametro"], a["severidad"]] for a in inf["alertas"]],
        "solicitudes": [[s["parametro"], s["tipo"]] for s in inf["solicitudes"]],
        "traza": [[t["de"], t["a"], t["etiqueta"]] + ([t["parametro"]] if t.get("parametro") else []) for t in inf["traza"]],
    }


def generar():
    vectores = []
    for cid, desc, med, perfil in casos():
        v = {"id": cid, "descripcion": desc, "mediciones": med}
        if perfil is not None:
            v["perfil"] = perfil
        v["esperado"] = esperado(evaluar(med, perfil))
        vectores.append(v)
    doc = {"descripcion": __doc__.strip().splitlines()[0], "version_motor": evaluar({})["version"],
           "version_referencias": datos.referencias()["version"], "casos": vectores}
    return json.dumps(doc, ensure_ascii=False, indent=1, sort_keys=False) + "\n"


if __name__ == "__main__":
    nuevo = generar()
    if "--check" in sys.argv:
        actual = DESTINO.read_text(encoding="utf-8") if DESTINO.exists() else ""
        if actual != nuevo:
            print("casos_conformidad.json no está al día: ejecuta herramientas/generar_casos.py")
            sys.exit(1)
        print("casos_conformidad.json al día")
    else:
        DESTINO.write_text(nuevo, encoding="utf-8")
        print(f"{DESTINO.name}: {nuevo.count(chr(10) + '  \"id\"') or len(json.loads(nuevo)['casos'])} casos")
