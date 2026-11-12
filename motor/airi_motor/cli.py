"""Interfaz de línea de comandos del motor AIRI (solo lectura: no modifica datos ni dispositivos).

    python -m airi_motor evaluar mediciones.json [--perfil ID] [--json]
    python -m airi_motor perfiles
    python -m airi_motor fuentes
"""
import argparse
import json
import sys

from . import datos
from .motor import AVISO, VERSION, evaluar

SEVERIDAD_TEXTO = {"alerta_alta": "ALERTA ALTA", "fuera_de_referencia": "FUERA DE REFERENCIA",
                   "revision_recomendada": "REVISIÓN RECOMENDADA", "presencia_detectable": "PRESENCIA DETECTABLE"}


def _texto(inf: dict) -> str:
    l = [f"AIRI · motor de análisis v{inf['version']} · perfil: {inf['perfil']['nombre']}", ""]
    for r in inf["resultados"]:
        v = r["valor_canonico"]
        v = "—" if v is None else (f"{v[0]:.4g}–{v[1]:.4g}" if isinstance(v, list) else f"{v:.4g}")
        sev = f" · {SEVERIDAD_TEXTO[r['severidad']]}" if r["severidad"] else ""
        l.append(f"  {r['nombre']:<12} {v:>12} {r['unidad_canonica']:<12} {r['nombre_estado']}{sev}")
        l.append(f"      {r['motivo']}")
    l += ["", f"Resultado {inf['clasificacion']}: {inf['resumen']}"]
    if inf["recomendaciones"]:
        l += ["", "Sugerencias (informativas, no son acciones automáticas):"]
        l += [f"  - {x['texto']}" for x in inf["recomendaciones"]]
    if inf["solicitudes"]:
        l += ["", "Datos que faltan o no pueden evaluarse:"]
        l += [f"  - {s['parametro']}: {s['texto']}" for s in inf["solicitudes"]]
    l += ["", AVISO]
    return "\n".join(l)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="python -m airi_motor", description=f"Motor de análisis AIRI v{VERSION}")
    sub = ap.add_subparsers(dest="orden", required=True)
    e = sub.add_parser("evaluar", help="evalúa un archivo JSON de mediciones ('-' = entrada estándar)")
    e.add_argument("archivo")
    e.add_argument("--perfil", default=None)
    e.add_argument("--json", action="store_true", help="salida JSON completa (incluye la traza)")
    sub.add_parser("perfiles", help="lista los perfiles de referencia")
    sub.add_parser("fuentes", help="lista las fuentes documentadas")
    a = ap.parse_args(argv)

    if a.orden == "perfiles":
        ref = datos.referencias()
        for pid, p in ref["perfiles"].items():
            marca = " (predeterminado)" if pid == ref["perfil_predeterminado"] else ""
            print(f"{pid}{marca}: {p['nombre']}")
            for par, r in p["referencias"].items():
                print(f"    {par:<12} {r['estado']}")
        return 0
    if a.orden == "fuentes":
        for fid, f in datos.fuentes()["fuentes"].items():
            print(f"[{f['nivel']}] {fid}: {f['titulo']}\n      {f['url']}")
        return 0

    try:
        texto = sys.stdin.read() if a.archivo == "-" else open(a.archivo, encoding="utf-8").read()
        mediciones = json.loads(texto)
        if not isinstance(mediciones, dict):
            raise ValueError("el JSON debe ser un objeto {parametro: {valor, unidad}}")
        inf = evaluar(mediciones, a.perfil, origen=a.archivo)
    except (OSError, ValueError, KeyError) as err:
        print(f"Error: {err}", file=sys.stderr)
        return 2
    print(json.dumps(inf, ensure_ascii=False, indent=2) if a.json else _texto(inf))
    return 0
