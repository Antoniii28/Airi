"""Carga de los datos de referencia y fuentes (una sola fuente de verdad, compartida con la web)."""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

CARPETA = Path(__file__).with_name("datos")
ORDEN = ["temperatura", "ph", "salinidad", "amoniaco", "nitritos", "nitratos"]


@lru_cache(maxsize=None)
def referencias() -> dict:
    return json.loads((CARPETA / "referencias.json").read_text(encoding="utf-8"))


@lru_cache(maxsize=None)
def fuentes() -> dict:
    return json.loads((CARPETA / "fuentes.json").read_text(encoding="utf-8"))


def perfil(nombre: str | None = None) -> dict:
    datos = referencias()
    nombre = nombre or datos["perfil_predeterminado"]
    if nombre not in datos["perfiles"]:
        raise KeyError(f"Perfil desconocido: {nombre}")
    return {"id": nombre, **datos["perfiles"][nombre]}


def validar_datos() -> list[str]:
    """Comprueba la coherencia interna de los datos. Devuelve la lista de problemas (vacía si todo está bien)."""
    problemas = []
    ref, fue = referencias(), fuentes()["fuentes"]
    for pid, p in ref["perfiles"].items():
        for parametro in ORDEN:
            r = p["referencias"].get(parametro)
            if r is None:
                problemas.append(f"{pid}: falta la referencia de {parametro}")
                continue
            ids = list(r.get("fuentes", []))
            for c in r.get("contexto", []):
                ids += c["fuente"] if isinstance(c["fuente"], list) else [c["fuente"]]
            for f in ids:
                if f not in fue:
                    problemas.append(f"{pid}/{parametro}: fuente inexistente {f}")
            if r["estado"] == "verificada":
                if not r.get("fuentes"):
                    problemas.append(f"{pid}/{parametro}: referencia verificada sin fuentes")
                if any(fue[f]["nivel"] != "A" for f in r.get("fuentes", [])):
                    problemas.append(f"{pid}/{parametro}: una referencia verificada solo admite fuentes de nivel A")
            elif r["estado"] in ("pendiente", "sin_referencia"):
                if not r.get("motivo"):
                    problemas.append(f"{pid}/{parametro}: falta el motivo de «{r['estado']}»")
            else:
                problemas.append(f"{pid}/{parametro}: estado desconocido {r['estado']}")
    return problemas
