"""Motor de análisis de AIRI v0.4: aplica el grafo de decisiones completo.

E0 → (Q1…Q6 por parámetro) → EP1–EP5 → C1 (A, I) → Q7 → R1–R4 → O1/O2 → FIN

  A = V si algún parámetro está en ANOMALÍA (EP5).
  I = V si alguno está FALTANTE, INVÁLIDO o SIN REFERENCIA (EP1, EP2, EP3).
  R1 (A=F, I=F) · R2 (A=V, I=F) · R3 (A=F, I=V) · R4 (A=V, I=V)

Ninguna anomalía se pierde, nunca se informa «en rango» si falta información y R4 combina
alertas con solicitudes de datos. AIRI no diagnostica ni garantiza condiciones seguras.
"""
from __future__ import annotations

from . import datos, reglas

VERSION = "0.4.0"
AVISO = ("AIRI compara las mediciones con referencias documentadas. No diagnostica enfermedades, no garantiza "
         "condiciones seguras y no ejecuta acciones: las decisiones sobre el acuario las toma una persona.")
TEXTO_RESULTADO = {
    "R1": "Los parámetros evaluados están dentro de las referencias documentadas para este perfil. "
          "Esto no garantiza la salud del acuario ni de sus organismos.",
    "R2": "Hay mediciones fuera de las referencias documentadas. Revisa las observaciones.",
    "R3": "Información insuficiente: no se pudieron evaluar todos los parámetros. No se declara que el acuario "
          "esté dentro de las referencias.",
    "R4": "Hay mediciones fuera de las referencias documentadas y, además, parámetros que no se pudieron evaluar. "
          "Se muestran ambas cosas.",
}
SALIDAS = {"R1": ["FIN"], "R2": ["O1"], "R3": ["O2"], "R4": ["O1", "O2"]}
ETIQUETA_SALIDA = {("R2", "O1"): "explicar", ("R4", "O1"): "explicar", ("R4", "O2"): "pedir datos",
                   ("R3", "O2"): "pedir datos", ("R1", "FIN"): "entregar", ("O1", "FIN"): "entregar",
                   ("O2", "FIN"): "entregar"}

RECOMENDACION = {
    ("ph", "fuera_de_referencia"): "Repite la medición y verifica la calibración del instrumento. Si se confirma, "
                                   "consulta con una persona con experiencia en acuarios marinos: según el MSD, los "
                                   "peces marinos toleran mucho peor las fluctuaciones de pH.",
    ("ph", "revision_recomendada"): "Repite la medición y verifica la calibración. Las fuentes consultadas discrepan "
                                    "en este intervalo, así que conviene observar la tendencia.",
    ("amoniaco", "presencia_detectable"): "Repite la medición. Según el MSD, cuando el amoníaco es detectable conviene "
                                          "aumentar la frecuencia de monitoreo a diaria.",
    ("amoniaco", "revision_recomendada"): "Repite la medición indicando la base química del kit (como N, NH3 o NH4+) y, "
                                          "en agua de mar, preferiblemente con el método de salicilato.",
    ("amoniaco", "alerta_alta"): "Repite la medición cuanto antes y consulta pronto con una persona con experiencia o "
                                 "con un veterinario de peces. Mientras sea detectable, el MSD recomienda monitoreo diario.",
    ("nitritos", "presencia_detectable"): "Repite la medición. Según el MSD, cuando el nitrito es detectable conviene "
                                          "aumentar la frecuencia de monitoreo a diaria.",
}


def evaluar(mediciones: dict, perfil: str | dict | None = None, origen: str | None = None) -> dict:
    """Evalúa las seis mediciones. `mediciones` = {parametro: {"valor", "unidad", "metodo"?}}.

    `perfil` es el id de un perfil de referencias.json; también admite un diccionario con la misma
    estructura (se usa en las pruebas para ejercitar todas las ramas del grafo)."""
    p = perfil if isinstance(perfil, dict) else datos.perfil(perfil)
    traza = []

    def paso(a, b, etiqueta, parametro=None):
        traza.append({"de": a, "a": b, "etiqueta": etiqueta, "parametro": parametro})

    resultados = []
    for parametro in datos.ORDEN:
        r = reglas.evaluar_parametro(parametro, (mediciones or {}).get(parametro), p)
        paso("E0", "Q1", "para cada parámetro", parametro)
        nodo = "Q1"
        for i, (q, etiqueta) in enumerate(r["decisiones"]):
            siguiente = r["decisiones"][i + 1][0] if i + 1 < len(r["decisiones"]) else r["estado"]
            if etiqueta == "F":
                siguiente = r["estado"]
            paso(q, siguiente, etiqueta, parametro)
            nodo = siguiente
        paso(r["estado"], "C1", "registrar", parametro)
        r["nombre_estado"] = reglas.ESTADOS[r["estado"]]
        resultados.append(r)

    A = any(r["estado"] == "EP5" for r in resultados)
    I = any(r["estado"] in ("EP1", "EP2", "EP3") for r in resultados)
    vf = lambda x: "V" if x else "F"
    paso("C1", "Q7", "A, I")
    clasificacion = {(False, False): "R1", (True, False): "R2", (False, True): "R3", (True, True): "R4"}[(A, I)]
    paso("Q7", clasificacion, f"A = {vf(A)}, I = {vf(I)}")
    for salida in SALIDAS[clasificacion]:
        paso(clasificacion, salida, ETIQUETA_SALIDA[(clasificacion, salida)])
        if salida != "FIN":
            paso(salida, "FIN", "entregar")

    alertas = sorted((r for r in resultados if r["estado"] == "EP5"),
                     key=lambda r: -reglas.SEVERIDADES[r["severidad"]]["prioridad"])
    alertas = [{"parametro": r["parametro"], "nombre": r["nombre"], "severidad": r["severidad"],
                "severidad_nombre": reglas.SEVERIDADES[r["severidad"]]["nombre"], "motivo": r["motivo"],
                "fuentes": r["fuentes"]} for r in alertas]
    recomendaciones = [{"parametro": a["parametro"], "texto": RECOMENDACION.get((a["parametro"], a["severidad"]),
                        "Repite la medición y consulta con una persona con experiencia antes de decidir cualquier intervención.")}
                       for a in alertas]
    solicitudes = []
    for r in resultados:
        if r["estado"] == "EP1":
            solicitudes.append({"parametro": r["parametro"], "tipo": "faltante", "texto": f"Proporciona la medición de {r['nombre'].lower()}."})
        elif r["estado"] == "EP2":
            solicitudes.append({"parametro": r["parametro"], "tipo": "invalido", "texto": f"Corrige {r['nombre'].lower()}: {r['motivo']}"})
        elif r["estado"] == "EP3":
            solicitudes.append({"parametro": r["parametro"], "tipo": "sin_referencia",
                                "texto": f"{r['nombre']} no se evalúa: falta una referencia verificada para este perfil."})

    for r in resultados:
        del r["decisiones"]
    return {
        "version": VERSION, "perfil": {"id": p["id"], "nombre": p["nombre"], "aplica_a": p["aplica_a"]},
        "origen": origen, "resultados": resultados, "A": A, "I": I, "clasificacion": clasificacion,
        "resumen": TEXTO_RESULTADO[clasificacion], "alertas": alertas, "recomendaciones": recomendaciones,
        "solicitudes": solicitudes, "aviso": AVISO, "traza": traza,
    }
