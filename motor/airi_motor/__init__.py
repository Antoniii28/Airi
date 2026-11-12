"""AIRI · motor de análisis de parámetros del agua (v0.4).

Uso:
    from airi_motor import evaluar
    informe = evaluar({"ph": {"valor": "8.1", "unidad": "pH"}, ...})
"""
from .motor import AVISO, VERSION, evaluar
from .datos import ORDEN, fuentes, perfil, referencias, validar_datos

__all__ = ["evaluar", "VERSION", "AVISO", "ORDEN", "fuentes", "perfil", "referencias", "validar_datos"]
