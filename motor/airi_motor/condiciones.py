"""Condiciones medidas: vista de solo lectura del informe para otros módulos (p. ej. compatibilidad).

`condiciones_medidas(informe)` NO vuelve a evaluar nada: copia del informe del motor el valor ya convertido a la
unidad canónica de cada parámetro y su estado, para que otro módulo compare esas condiciones con los rangos de una
especie sin leer números ni convertir unidades por su cuenta (y sin reinterpretar valores INVÁLIDOS o FALTANTES).

Que una condición esté `disponible` solo significa que la medición es válida; NO que sea adecuada para el acuario ni
para una especie. Contrato: motor/CONTRATO_SALIDA.md §8. Paridad: `AIRIMotor.condicionesMedidas` (JavaScript).
"""
from __future__ import annotations

import copy

DISPONIBLE = ("EP3", "EP4", "EP5")   # medición válida (Q1–Q4 V); EP1/EP2 no aportan valor
AVISO_CONDICIONES = ("Valores medidos y convertidos por el motor de agua. Que un valor esté disponible no significa "
                     "que sea adecuado para el acuario ni para una especie; la ausencia de un valor nunca equivale a "
                     "una condición favorable.")
ERROR_INFORME = "condiciones_medidas espera el informe que devuelve evaluar()."


def condiciones_medidas(informe: dict) -> dict:
    """Proyección del informe: {version, perfil, clasificacion, condiciones, no_disponibles, aviso}."""
    if not isinstance(informe, dict) or not isinstance(informe.get("resultados"), list) \
            or not isinstance(informe.get("perfil"), dict):
        raise TypeError(ERROR_INFORME)
    condiciones = {}
    for r in informe["resultados"]:
        disponible = r["estado"] in DISPONIBLE
        condiciones[r["parametro"]] = {
            "nombre": r["nombre"],
            "valor": copy.deepcopy(r["valor_canonico"]) if disponible else None,
            "unidad": r["unidad_canonica"],
            "intervalo": disponible and isinstance(r["valor_canonico"], list),
            "disponible": disponible,
            "estado": r["estado"],
            "severidad": r["severidad"],
        }
    return {
        "version": informe["version"],
        "perfil": informe["perfil"]["id"],
        "clasificacion": informe["clasificacion"],
        "condiciones": condiciones,
        "no_disponibles": [p for p, c in condiciones.items() if not c["disponible"]],
        "aviso": AVISO_CONDICIONES,
    }
