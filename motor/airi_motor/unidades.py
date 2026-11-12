"""Lectura de números y unidades, y conversiones químicas exactas.

Las conversiones se basan solo en masas molares (química), no en criterios biológicos:
  N = 14.007, H = 1.008, O = 15.999 g/mol
  NH3 = 17.031 · NH4+ = 18.039 · NO2- = 46.005 · NO3- = 62.004 g/mol
"""
from __future__ import annotations

import math
import re
import unicodedata

MASA = {"N": 14.007, "H": 1.008, "O": 15.999}
MASA["NH3"] = MASA["N"] + 3 * MASA["H"]
MASA["NH4"] = MASA["N"] + 4 * MASA["H"]
MASA["NO2"] = MASA["N"] + 2 * MASA["O"]
MASA["NO3"] = MASA["N"] + 3 * MASA["O"]

# Factores para pasar a «como N» (nitrógeno)
A_N = {
    "N": 1.0,
    "NH3": MASA["N"] / MASA["NH3"],   # ≈ 0.8224
    "NH4": MASA["N"] / MASA["NH4"],   # ≈ 0.7765
    "NO2": MASA["N"] / MASA["NO2"],   # ≈ 0.3045 (NO2- → NO2-N; inverso ≈ 3.284)
    "NO3": MASA["N"] / MASA["NO3"],   # ≈ 0.2259 (NO3- → NO3-N; inverso ≈ 4.427)
}

# Unidades admitidas por parámetro: clave normalizada → (descripción, base química o conversión)
#   base None en amoníaco = «base no indicada»: se trabaja con el intervalo de interpretaciones posibles.
UNIDADES = {
    "temperatura": {
        "°c": ("°C", "c"), "c": ("°C", "c"), "gradoscelsius": ("°C", "c"),
        "°f": ("°F", "f"), "f": ("°F", "f"),
    },
    "ph": {"ph": ("pH", "ph"), "unidadesdeph": ("pH", "ph"), "": ("pH", "ph")},
    "salinidad": {"ppt": ("ppt", "ppt"), "‰": ("ppt", "ppt"), "g/kg": ("ppt", "ppt")},
    "amoniaco": {
        "mg/ltan-n": ("mg/L TAN-N (como N)", "N"), "mg/ltancomon": ("mg/L TAN-N (como N)", "N"),
        "mg/lnh3-n": ("mg/L TAN-N (como N)", "N"), "mg/ln-nh3/nh4+": ("mg/L TAN-N (como N)", "N"),
        "mg/lnh3/nh4+totalcomonh3": ("mg/L de amoníaco total expresado como NH3", "NH3"),
        "mg/lcomonh3": ("mg/L de amoníaco total expresado como NH3", "NH3"),
        "mg/lnh3/nh4+totalcomonh4+": ("mg/L de amoníaco total expresado como NH4+", "NH4"),
        "mg/lcomonh4+": ("mg/L de amoníaco total expresado como NH4+", "NH4"),
        "mg/l(nh3/nh4+total)": ("mg/L de amoníaco total, base no indicada", None),
        "mg/lnh3/nh4+total": ("mg/L de amoníaco total, base no indicada", None),
    },
    "nitritos": {
        "mg/lno2-": ("mg/L NO2−", "NO2"), "mg/l(no2-)": ("mg/L NO2−", "NO2"),
        "mg/lno2-n": ("mg/L NO2-N", "N"),
    },
    "nitratos": {
        "mg/lno3-": ("mg/L NO3−", "NO3"), "mg/l(no3-)": ("mg/L NO3−", "NO3"),
        "mg/lno3-n": ("mg/L NO3-N", "N"),
    },
}

_SUSTITUCIONES = str.maketrans({"₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
                                "⁺": "+", "⁻": "-", "−": "-", "–": "-", "⁰": "0"})


def normalizar_unidad(texto) -> tuple[str, bool]:
    """Devuelve (clave normalizada, se_uso_ppm). «ppm» se interpreta como mg/L."""
    t = unicodedata.normalize("NFC", str(texto or "")).translate(_SUSTITUCIONES).lower()
    t = re.sub(r"\s+", "", t)
    uso_ppm = "ppm" in t
    t = t.replace("ppm", "mg/l")
    return t, uso_ppm


def leer_numero(valor):
    """Número finito a partir de int, float o texto (acepta coma decimal). None si no es válido."""
    if isinstance(valor, bool):
        return None
    if isinstance(valor, (int, float)):
        n = float(valor)
    else:
        texto = str(valor).strip().replace(",", ".")
        if not re.fullmatch(r"[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?", texto):
            return None
        n = float(texto)
    return n if math.isfinite(n) else None


def reconocer_unidad(parametro: str, unidad):
    """Devuelve dict con la unidad reconocida, o None si no se admite para ese parámetro."""
    clave, uso_ppm = normalizar_unidad(unidad)
    tabla = UNIDADES.get(parametro, {})
    if clave not in tabla:
        return None
    descripcion, base = tabla[clave]
    return {"descripcion": descripcion, "base": base, "uso_ppm": uso_ppm}


def a_canonica(parametro: str, valor: float, unidad_reconocida: dict):
    """Convierte a la unidad canónica del parámetro.

    Devuelve (minimo, maximo): un intervalo, porque con «base no indicada» el valor real
    puede estar en cualquier punto entre la interpretación más baja y la más alta.
    Para el resto de unidades, minimo == maximo.
    """
    base = unidad_reconocida["base"]
    if parametro == "temperatura":
        c = (valor - 32) * 5 / 9 if base == "f" else valor
        return c, c
    if parametro in ("ph", "salinidad"):
        return valor, valor
    if base is None:  # amoníaco total sin base: como N (×1) o como NH4+ (×0.7765) o NH3 (×0.8224)
        posibles = [valor * A_N[b] for b in ("N", "NH3", "NH4")]
        return min(posibles), max(posibles)
    n = valor * A_N[base]
    return n, n
