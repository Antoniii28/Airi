"""v0.4.1 · El informe cumple el contrato documentado en motor/CONTRATO_SALIDA.md (consumido por la interfaz).

Si se añade, quita o renombra un campo, esta prueba falla: hay que actualizar el contrato y avisar a la interfaz.
La paridad Python ↔ JavaScript (test_paridad_js.py) garantiza que el informe JavaScript tiene la misma forma.
"""
import json
import unittest

from apoyo import MOTOR, RAIZ, airi_motor, datos, perfil_de_prueba
from test_paridad_js import lote_aleatorio

INFORME = {"version", "perfil", "origen", "resultados", "A", "I", "clasificacion", "resumen", "alertas",
           "recomendaciones", "solicitudes", "aviso", "traza"}
PERFIL = {"id", "nombre", "aplica_a"}
RESULTADO = {"parametro", "nombre", "valor_original", "unidad_original", "valor_canonico", "unidad_canonica",
             "estado", "nombre_estado", "severidad", "motivo", "fuentes", "contexto", "notas"}
ALERTA = {"parametro", "nombre", "severidad", "severidad_nombre", "motivo", "fuentes"}
RECOMENDACION = {"parametro", "texto"}
SOLICITUD = {"parametro", "tipo", "texto"}
PASO = {"de", "a", "etiqueta", "parametro"}
SEVERIDADES = {"alerta_alta", "fuera_de_referencia", "revision_recomendada", "presencia_detectable"}


class Contrato(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        doc = json.loads((MOTOR / "casos_conformidad.json").read_text(encoding="utf-8"))
        lote = [(c["mediciones"], c.get("perfil")) for c in doc["casos"]]
        lote += [(c["mediciones"], None) for c in lote_aleatorio(800, semilla=4103)]
        lote += [(c["mediciones"], perfil_de_prueba()) for c in lote_aleatorio(300, semilla=4104)]
        cls.informes = [airi_motor.evaluar(m, p, origen="prueba") for m, p in lote]

    def test_campos_y_tipos(self):
        fuentes = datos.fuentes()["fuentes"]
        for inf in self.informes:
            self.assertEqual(set(inf), INFORME)
            self.assertEqual(set(inf["perfil"]), PERFIL)
            self.assertEqual(inf["version"], airi_motor.VERSION)
            self.assertIn(inf["clasificacion"], {"R1", "R2", "R3", "R4"})
            self.assertIsInstance(inf["A"], bool)
            self.assertIsInstance(inf["I"], bool)
            self.assertEqual([r["parametro"] for r in inf["resultados"]], airi_motor.ORDEN)
            for r in inf["resultados"]:
                self.assertEqual(set(r), RESULTADO)
                v = r["valor_canonico"]
                self.assertTrue(v is None or isinstance(v, float) or
                                (isinstance(v, list) and len(v) == 2 and v[0] <= v[1]), v)   # redondeo a 6 decimales
                self.assertEqual(v is None, r["estado"] in ("EP1", "EP2"))
                self.assertIn(r["severidad"], SEVERIDADES | {None})
                for f in r["fuentes"]:
                    self.assertIn(f, fuentes)
                for c in r["contexto"]:
                    self.assertEqual(set(c), {"texto", "fuente"})
            for a in inf["alertas"]:
                self.assertEqual(set(a), ALERTA)
            for x in inf["recomendaciones"]:
                self.assertEqual(set(x), RECOMENDACION)
            for s in inf["solicitudes"]:
                self.assertEqual(set(s), SOLICITUD)
                self.assertIn(s["tipo"], {"faltante", "invalido", "sin_referencia"})
            for t in inf["traza"]:
                self.assertEqual(set(t), PASO)
            self.assertEqual(json.loads(json.dumps(inf)), inf)   # serializable a JSON sin pérdidas

    def test_el_documento_menciona_cada_campo(self):
        texto = (MOTOR / "CONTRATO_SALIDA.md").read_text(encoding="utf-8")
        import re
        codigo = " ".join(re.findall(r"`([^`]+)`", texto))   # solo lo escrito como código en el documento
        for campo in INFORME | PERFIL | RESULTADO | ALERTA | SOLICITUD | PASO | SEVERIDADES:
            self.assertRegex(codigo, rf"(?<![\w]){campo}(?![\w])", f"el contrato no documenta «{campo}»")
        self.assertIn(f'"{airi_motor.VERSION}"', texto)

    def test_la_interfaz_solo_usa_campos_del_contrato(self):
        """Los campos que lee interfaz/motor/analisis-prototipo.js existen en el contrato."""
        import re
        js = (RAIZ / "interfaz" / "motor" / "analisis-prototipo.js").read_text(encoding="utf-8")
        usados = set(re.findall(r"\binf\.([A-Za-z_]+)", js))
        self.assertTrue(usados, "no se encontraron accesos a `inf.` en la interfaz")
        self.assertLessEqual(usados, INFORME)


if __name__ == "__main__":
    unittest.main()
