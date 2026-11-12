"""Evaluación de un parámetro: nodos Q1–Q6 del grafo de decisiones → estado EP1–EP5.

Q1 ¿Dato presente?            F → EP1 FALTANTE
Q2 ¿Número válido?            F → EP2 INVÁLIDO
Q3 ¿Unidad reconocida?        F → EP2 INVÁLIDO
Q4 ¿Valor plausible?          F → EP2 INVÁLIDO   (límites de captura, no biológicos)
Q5 ¿Referencia con fuente?    F → EP3 SIN REFERENCIA
Q6 ¿Dentro de la referencia?  V → EP4 EN RANGO · F → EP5 ANOMALÍA (con severidad)
"""
from __future__ import annotations

from . import datos, unidades

ESTADOS = {"EP1": "FALTANTE", "EP2": "INVÁLIDO", "EP3": "SIN REFERENCIA", "EP4": "EN RANGO", "EP5": "ANOMALÍA"}

# Severidad de una anomalía (mayor prioridad = más importante). Ninguna equivale a «peligro confirmado».
SEVERIDADES = {
    "alerta_alta": {"prioridad": 4, "nombre": "Alerta de mayor severidad"},
    "fuera_de_referencia": {"prioridad": 3, "nombre": "Fuera de la referencia"},
    "revision_recomendada": {"prioridad": 2, "nombre": "Revisión recomendada"},
    "presencia_detectable": {"prioridad": 1, "nombre": "Presencia detectable"},
}


def _fmt(n: float) -> str:
    return f"{n:.4g}"


def evaluar_parametro(parametro: str, medicion: dict | None, perfil: dict) -> dict:
    """Evalúa una medición. `medicion` = {"valor": ..., "unidad": ..., "metodo": opcional}."""
    meta = datos.referencias()["parametros"][parametro]
    medicion = medicion or {}
    texto, unidad, metodo = medicion.get("valor"), medicion.get("unidad"), (medicion.get("metodo") or "").strip().lower()
    unidad_texto = "" if unidad is None else str(unidad).strip()
    r = {"parametro": parametro, "nombre": meta["nombre"], "valor_original": texto, "unidad_original": unidad,
         "valor_canonico": None, "unidad_canonica": meta["unidad_canonica"], "estado": None, "severidad": None,
         "motivo": "", "fuentes": [], "contexto": [], "notas": [], "decisiones": []}

    def decidir(nodo, condicion):
        etiqueta = "V" if condicion else "F"
        r["decisiones"].append((nodo, etiqueta))
        return condicion

    def terminar(estado, motivo, severidad=None):
        r["estado"], r["motivo"], r["severidad"] = estado, motivo, severidad
        return r

    # Q1
    if not decidir("Q1", texto is not None and str(texto).strip() != ""):
        return terminar("EP1", "No se recibió el dato.")
    # Q2
    valor = unidades.leer_numero(texto)
    if not decidir("Q2", valor is not None):
        return terminar("EP2", f"«{texto}» no es un número válido.")
    # Q3
    reconocida = unidades.reconocer_unidad(parametro, unidad)
    if not decidir("Q3", reconocida is not None):
        problema = (f"La unidad «{unidad_texto}» no se admite" if unidad_texto else "No se indicó la unidad")
        return terminar("EP2", f"{problema} para {meta['nombre'].lower()}. Unidad canónica: {meta['unidad_canonica']}.")
    if reconocida["uso_ppm"]:
        r["notas"].append("«ppm» se interpreta como mg/L; en agua de mar difieren ligeramente por la densidad del agua.")
    # Q4 (sobre el valor ya convertido a la unidad canónica, porque los límites están en esa unidad)
    lim = meta["limites_captura"]
    minimo, maximo = unidades.a_canonica(parametro, valor, reconocida)
    plausible = (lim["minimo"] is None or minimo >= lim["minimo"]) and (lim["maximo"] is None or maximo <= lim["maximo"])
    if not decidir("Q4", plausible):
        return terminar("EP2", f"{_fmt(valor)}{' ' + unidad_texto if unidad_texto else ''} está fuera de los límites de captura "
                               f"({lim['justificacion']})")
    r["valor_canonico"] = round(minimo, 6) if minimo == maximo else [round(minimo, 6), round(maximo, 6)]
    if reconocida["base"] not in ("c", "ph", "ppt", "N", "f") and minimo == maximo:
        r["notas"].append(f"Convertido de {reconocida['descripcion']} a {meta['unidad_canonica']} por masas molares.")
    if reconocida["base"] == "f":
        r["notas"].append("Convertido de °F a °C.")
    if reconocida["base"] is None and parametro == "amoniaco":
        r["notas"].append("La unidad no indica si el valor es como N, como NH3 o como NH4+: se muestra el intervalo de equivalencias posibles en mg/L TAN-N.")

    # Q5
    ref = perfil["referencias"][parametro]
    r["contexto"] = ref.get("contexto", [])
    if not decidir("Q5", ref["estado"] == "verificada"):
        estado_ref = "pendiente de verificar" if ref["estado"] == "pendiente" else "sin referencia para evaluación biológica"
        r["fuentes"] = ref.get("fuentes", [])
        return terminar("EP3", f"No se evalúa ({estado_ref}): {ref['motivo']}")
    r["fuentes"] = ref["fuentes"]

    # Q6
    tipo = ref["tipo"]
    if tipo == "rango_con_tolerancia_documental":
        dentro = ref["minimo"] <= minimo and maximo <= ref["maximo"]
        if decidir("Q6", dentro):
            return terminar("EP4", f"{_fmt(minimo)} está dentro de la referencia {ref['minimo']}–{ref['maximo']}.")
        if ref["minimo"] <= minimo and maximo <= ref["maximo_tolerancia"]:
            return terminar("EP5", f"{_fmt(minimo)} está por encima de la tabla de referencia ({ref['minimo']}–{ref['maximo']}), "
                                   f"pero dentro de lo que el mismo capítulo considera habitual en tanques marinos "
                                   f"(hasta {ref['maximo_tolerancia']}). Las fuentes discrepan: conviene revisar.",
                             "revision_recomendada")
        lado = "por debajo" if minimo < ref["minimo"] else "por encima"
        return terminar("EP5", f"{_fmt(minimo)} está {lado} de la referencia {ref['minimo']}–{ref['maximo']}.",
                        "fuera_de_referencia")

    if tipo == "cero":
        if decidir("Q6", maximo == 0):
            return terminar("EP4", "No detectable (0 mg/L), igual al valor de referencia.")
        return terminar("EP5", f"Presencia detectable ({_fmt(valor)} {reconocida['descripcion']}); "
                               f"la referencia es 0 mg/L. No hay un umbral de severidad documentado para agua salada.",
                        "presencia_detectable")

    if tipo == "cero_con_umbral":
        umbral = ref["umbral_severidad"]
        if decidir("Q6", maximo == 0):
            return terminar("EP4", "No detectable (0 mg/L), igual al valor de referencia.")
        if metodo == "nessler":
            return terminar("EP5", "Amoníaco detectable, pero medido con el método de Nessler, que da reacciones falsas en "
                                   "agua de mar. No se compara con el umbral; conviene repetir con el método de salicilato.",
                            "revision_recomendada")
        if minimo >= umbral:
            return terminar("EP5", f"TAN ≥ {umbral} mg/L como N ({_rango(minimo, maximo)}): por encima de la concentración que, "
                                   f"según el MSD, los peces de agua salada suelen tolerar.", "alerta_alta")
        if maximo < umbral:
            return terminar("EP5", f"Amoníaco detectable ({_rango(minimo, maximo)} mg/L TAN-N): por encima de la referencia "
                                   f"de 0 mg/L, pero por debajo de {umbral} mg/L, la concentración que según el MSD los "
                                   f"peces de agua salada suelen tolerar.", "presencia_detectable")
        return terminar("EP5", f"Amoníaco detectable. Como la unidad no indica si es «como N», «como NH3» o «como NH4+», "
                               f"el valor equivale a {_rango(minimo, maximo)} mg/L TAN-N y no se puede saber si alcanza "
                               f"{umbral} mg/L. Indica la base química del kit.", "revision_recomendada")

    raise ValueError(f"Tipo de referencia desconocido: {tipo}")


def _rango(a: float, b: float) -> str:
    return _fmt(a) if a == b else f"{_fmt(a)}–{_fmt(b)}"
