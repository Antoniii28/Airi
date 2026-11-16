"""v0.4.1 · Trazabilidad de cada resultado: regla aplicada, motivo, fuente e incertidumbre.

Se comprueban invariantes sobre los casos de conformidad y miles de entradas aleatorias (semilla fija), con el
perfil real y con el de prueba. Ninguna prueba fija umbrales nuevos: los límites se leen de referencias.json.
"""
import json
import unittest

from apoyo import MOTOR, airi_motor, aristas_del_grafo, datos, perfil_de_prueba
from airi_motor import reglas, unidades
from test_paridad_js import lote_aleatorio

GRAFO = aristas_del_grafo()
FUENTES = datos.fuentes()["fuentes"]
CLASE = {(False, False): "R1", (True, False): "R2", (False, True): "R3", (True, True): "R4"}
TIPO_SOLICITUD = {"EP1": "faltante", "EP2": "invalido", "EP3": "sin_referencia"}
# Última decisión antes de cada estado, según el grafo oficial
ULTIMA_DECISION = {"EP1": {("Q1", "F")}, "EP2": {("Q2", "F"), ("Q3", "F"), ("Q4", "F")}, "EP3": {("Q5", "F")},
                   "EP4": {("Q6", "V")}, "EP5": {("Q6", "F")}}


def casos():
    doc = json.loads((MOTOR / "casos_conformidad.json").read_text(encoding="utf-8"))
    lote = [{"mediciones": c["mediciones"], "perfil": c.get("perfil")} for c in doc["casos"]]
    lote += lote_aleatorio(2500, semilla=4101)
    p = perfil_de_prueba()
    lote += [{**c, "perfil": p} for c in lote_aleatorio(1500, semilla=4102)]
    return lote


class Trazabilidad(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.informes = [(c, airi_motor.evaluar(c["mediciones"], c.get("perfil"))) for c in casos()]

    def _perfil(self, caso):
        return caso.get("perfil") or datos.perfil()

    def test_cada_resultado_tiene_estado_y_motivo(self):
        for caso, inf in self.informes:
            for r in inf["resultados"]:
                self.assertIn(r["estado"], reglas.ESTADOS)
                self.assertEqual(r["nombre_estado"], reglas.ESTADOS[r["estado"]])
                self.assertTrue(r["motivo"].strip(), r)
                self.assertEqual(r["severidad"] is not None, r["estado"] == "EP5", r)

    def test_recorrido_por_parametro_coherente_con_el_estado(self):
        """La regla aplicada se reconstruye de la traza: E0 → Q1 → … → última decisión → estado → C1."""
        for caso, inf in self.informes:
            for r in inf["resultados"]:
                pasos = [t for t in inf["traza"] if t["parametro"] == r["parametro"]]
                self.assertEqual((pasos[0]["de"], pasos[0]["a"]), ("E0", "Q1"))
                self.assertEqual((pasos[-1]["de"], pasos[-1]["a"]), (r["estado"], "C1"))
                for x, y in zip(pasos, pasos[1:]):
                    self.assertEqual(x["a"], y["de"], pasos)
                self.assertIn((pasos[-2]["de"], pasos[-2]["etiqueta"]), ULTIMA_DECISION[r["estado"]], pasos)
                self.assertEqual(pasos[-2]["a"], r["estado"])
                for t in pasos:
                    self.assertIn((t["de"], t["a"], t["etiqueta"]), GRAFO, t)

    def test_evaluados_citan_fuentes_de_nivel_a_y_los_demas_no_inventan(self):
        for caso, inf in self.informes:
            perfil = self._perfil(caso)
            for r in inf["resultados"]:
                ref = perfil["referencias"][r["parametro"]]
                if r["estado"] in ("EP4", "EP5"):
                    self.assertEqual(ref["estado"], "verificada")
                    self.assertTrue(r["fuentes"], r)
                    self.assertTrue(all(FUENTES[f]["nivel"] == "A" for f in r["fuentes"]), r)
                    self.assertEqual(r["fuentes"], ref["fuentes"])
                elif r["estado"] == "EP3":
                    self.assertNotEqual(ref["estado"], "verificada")
                    self.assertIn(ref["motivo"], r["motivo"])
                else:   # EP1 / EP2: no se llegó a consultar la referencia
                    self.assertEqual((r["fuentes"], r["contexto"], r["valor_canonico"]), ([], [], None), r)
                for c in r["contexto"]:
                    ids = c["fuente"] if isinstance(c["fuente"], list) else [c["fuente"]]
                    self.assertTrue(all(FUENTES[f]["nivel"] == "B" for f in ids), c)

    def test_alertas_recomendaciones_y_solicitudes_no_pierden_informacion(self):
        for caso, inf in self.informes:
            res = inf["resultados"]
            anomalias = [r for r in res if r["estado"] == "EP5"]
            esperadas = sorted(anomalias, key=lambda r: -reglas.SEVERIDADES[r["severidad"]]["prioridad"])
            self.assertEqual([(a["parametro"], a["severidad"], a["motivo"], a["fuentes"]) for a in inf["alertas"]],
                             [(r["parametro"], r["severidad"], r["motivo"], r["fuentes"]) for r in esperadas])
            self.assertEqual([x["parametro"] for x in inf["recomendaciones"]], [a["parametro"] for a in inf["alertas"]])
            self.assertEqual([(s["parametro"], s["tipo"]) for s in inf["solicitudes"]],
                             [(r["parametro"], TIPO_SOLICITUD[r["estado"]]) for r in res if r["estado"] in TIPO_SOLICITUD])
            A, I = bool(anomalias), any(r["estado"] in TIPO_SOLICITUD for r in res)
            self.assertEqual((inf["A"], inf["I"], inf["clasificacion"]), (A, I, CLASE[(A, I)]))

    def test_incertidumbre_del_amoniaco_sin_base_quimica(self):
        """Si el valor canónico es un intervalo, la severidad depende de los dos extremos (nunca de uno solo)."""
        umbral = datos.perfil()["referencias"]["amoniaco"]["umbral_severidad"]
        vistos = set()
        for caso, inf in self.informes:
            if caso.get("perfil"):
                continue
            r = inf["resultados"][datos.ORDEN.index("amoniaco")]
            if not isinstance(r["valor_canonico"], list):
                continue
            self.assertIn("intervalo", " ".join(r["notas"]))
            if r["estado"] != "EP5":
                continue
            metodo = caso["mediciones"]["amoniaco"].get("metodo")
            if isinstance(metodo, str) and unidades.recortar(metodo).lower() == "nessler":
                self.assertEqual(r["severidad"], "revision_recomendada")
                continue
            valor = unidades.leer_numero(r["valor_original"])
            lo, hi = unidades.a_canonica("amoniaco", valor, unidades.reconocer_unidad("amoniaco", r["unidad_original"]))
            esperado = ("alerta_alta" if lo >= umbral else "presencia_detectable" if hi < umbral
                        else "revision_recomendada")
            self.assertEqual(r["severidad"], esperado, (lo, hi))
            vistos.add(esperado)
        self.assertEqual(vistos, {"alerta_alta", "presencia_detectable", "revision_recomendada"})

    def test_perfil_real_nunca_evalua_parametros_sin_referencia_verificada(self):
        for caso, inf in self.informes:
            if caso.get("perfil"):
                continue
            for r in inf["resultados"]:
                if r["parametro"] in ("temperatura", "salinidad", "nitratos"):
                    self.assertIn(r["estado"], ("EP1", "EP2", "EP3"), r)
            self.assertNotIn(inf["clasificacion"], ("R1", "R2"))


if __name__ == "__main__":
    unittest.main()
