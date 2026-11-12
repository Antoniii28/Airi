import json
import re
import unittest
from apoyo import airi_motor, aristas_del_grafo, mediciones, perfil_de_prueba

evaluar = airi_motor.evaluar
GRAFO = aristas_del_grafo()
VALIDAS = dict(temperatura="26", ph="8.1", salinidad="35", amoniaco="0", nitritos="0", nitratos="5")


def clase(inf):
    return inf["clasificacion"], inf["A"], inf["I"]


class ConformidadConElGrafo(unittest.TestCase):
    def test_el_grafo_oficial_tiene_30_aristas(self):
        self.assertEqual(len(GRAFO), 30)

    def test_cada_paso_de_la_traza_es_una_arista_del_grafo(self):
        casos = [mediciones(**VALIDAS), mediciones(), mediciones(ph="9", amoniaco="1"),
                 mediciones(**{**VALIDAS, "ph": "abc", "salinidad": ("1.025", "densidad relativa"), "nitritos": "-1"})]
        for m in casos:
            for perfil in (None, perfil_de_prueba()):
                for t in evaluar(m, perfil)["traza"]:
                    self.assertIn((t["de"], t["a"], t["etiqueta"]), GRAFO, t)

    def test_traza_termina_en_fin_y_recorre_seis_parametros(self):
        inf = evaluar(mediciones(**VALIDAS))
        self.assertEqual(inf["traza"][-1]["a"], "FIN")
        inicios = [t for t in inf["traza"] if t["de"] == "E0"]
        self.assertEqual([t["parametro"] for t in inicios], airi_motor.ORDEN)


class Clasificacion(unittest.TestCase):
    def test_perfil_real_completo_nunca_da_r1(self):
        inf = evaluar(mediciones(**VALIDAS))
        self.assertEqual(clase(inf), ("R3", False, True))
        sin_ref = {s["parametro"] for s in inf["solicitudes"] if s["tipo"] == "sin_referencia"}
        self.assertEqual(sin_ref, {"temperatura", "salinidad", "nitratos"})
        self.assertNotIn("dentro de las referencias documentadas para este perfil", inf["resumen"])

    def test_r1_r2_r3_r4_con_perfil_de_prueba(self):
        p = perfil_de_prueba()
        ok = dict(temperatura="15", ph="8.1", salinidad="15", amoniaco="0", nitritos="0", nitratos="0.5")
        self.assertEqual(clase(evaluar(mediciones(**ok), p)), ("R1", False, False))
        self.assertEqual(clase(evaluar(mediciones(**{**ok, "ph": "9"}), p)), ("R2", True, False))
        self.assertEqual(clase(evaluar(mediciones(**{**ok, "ph": ""}), p)), ("R3", False, True))
        self.assertEqual(clase(evaluar(mediciones(**{**ok, "ph": "9", "nitritos": ""}), p)), ("R4", True, True))
        self.assertIn("no garantiza", evaluar(mediciones(**ok), p)["resumen"])

    def test_r4_conserva_alertas_y_solicitudes(self):
        inf = evaluar(mediciones(ph="7", amoniaco="0.8", nitritos="0.2"))   # faltan temperatura, salinidad y nitratos
        self.assertEqual(inf["clasificacion"], "R4")
        self.assertEqual({a["parametro"] for a in inf["alertas"]}, {"ph", "amoniaco", "nitritos"})
        self.assertEqual({s["parametro"] for s in inf["solicitudes"] if s["tipo"] == "faltante"},
                         {"temperatura", "salinidad", "nitratos"})
        destinos = {(t["de"], t["a"]) for t in inf["traza"]}
        self.assertTrue({("R4", "O1"), ("R4", "O2"), ("O1", "FIN"), ("O2", "FIN")} <= destinos)

    def test_alertas_ordenadas_por_severidad(self):
        inf = evaluar(mediciones(ph="8.4", amoniaco="0.8", nitritos="0.1"))
        self.assertEqual([a["severidad"] for a in inf["alertas"]],
                         ["alerta_alta", "revision_recomendada", "presencia_detectable"])
        self.assertEqual(len(inf["recomendaciones"]), 3)

    def test_valores_invalidos_cuentan_como_informacion_insuficiente(self):
        inf = evaluar(mediciones(**{**VALIDAS, "amoniaco": "abc"}))
        self.assertTrue(inf["I"])
        self.assertTrue(any(s["tipo"] == "invalido" and s["parametro"] == "amoniaco" for s in inf["solicitudes"]))


class Mensajes(unittest.TestCase):
    PROHIBIDO = re.compile(r"\b(es seguro|está sano|condiciones seguras garantizadas|diagnóstico:|diagnosticamos|"
                           r"es peligroso|enfermedad detectada|libre de riesgo)\b", re.I)

    def test_ningun_texto_afirma_seguridad_ni_diagnostica(self):
        casos = [mediciones(**VALIDAS), mediciones(), mediciones(ph="9", amoniaco="2", nitritos="1")]
        for m in casos:
            texto = json.dumps(evaluar(m), ensure_ascii=False)
            self.assertIsNone(self.PROHIBIDO.search(texto), self.PROHIBIDO.search(texto))
            self.assertIn("No diagnostica", evaluar(m)["aviso"])

    def test_recomendaciones_informativas_sin_acciones_automaticas(self):
        inf = evaluar(mediciones(amoniaco="1", ph="9", nitritos="1"))
        for r in inf["recomendaciones"]:
            self.assertRegex(r["texto"], r"Repite la medición")
            self.assertNotRegex(r["texto"], r"(?i)\b(dosifica|añade|agrega \d|activa la bomba|cambia el \d+ ?%)")

    def test_salida_serializable_y_determinista(self):
        m = mediciones(ph="8.4", amoniaco="0.6", nitratos="30")
        self.assertEqual(json.dumps(evaluar(m), sort_keys=True), json.dumps(evaluar(m), sort_keys=True))


if __name__ == "__main__":
    unittest.main()
