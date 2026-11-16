"""AIRI · motor de análisis de parámetros del agua (v0.4).

Uso:
    from airi_motor import evaluar
    informe = evaluar({"ph": {"valor": "8.1", "unidad": "pH"}, ...})
"""
from .condiciones import condiciones_medidas
from .motor import AVISO, VERSION, evaluar
from .datos import ORDEN, fuentes, perfil, referencias, validar_datos

__all__ = ["evaluar", "condiciones_medidas", "VERSION", "AVISO", "ORDEN", "fuentes", "perfil", "referencias", "validar_datos"]
