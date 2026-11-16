"""Condiciones medidas (motor/CONTRATO_SALIDA.md §8): vista de solo lectura del informe para otros módulos.

Comprueba que la vista es una proyección fiel del informe (nunca otro cálculo), que no expone valores de mediciones
FALTANTES o INVÁLIDAS, que conserva el intervalo de incertidumbre, que el documento la describe y que Python y
JavaScript producen exactamente lo mismo.
"""
import copy
import json
import re
import subprocess
import unittest

from apoyo import MOTOR, airi_motor, mediciones, perfil_de_prueba
from test_paridad_js import LOTE_JS, NODE, lote_aleatorio

VISTA = {"version", "perfil", "clasificacion", "condiciones", "no_disponibles", "aviso"}
CONDICION = {"nombre", "valor", "unidad", "intervalo", "disponible", "estado", "severidad"}


def lote_completo():
    doc = json.loads((MOTOR / "casos_conformidad.json").read_text(encoding="utf-8"))
    lote = [{"mediciones": c["mediciones"], **({"perfil": c["perfil"]} if "perfil" in c else {})} for c in doc["casos"]]
    lote += lote_aleatorio(600, semilla=5201)
    lote += [{**c, "perfil": perfil_de_prueba()} for c in lote_aleatorio(200, semilla=5202)]
    return lote


class CondicionesMedidas(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.lote = lote_completo()
        cls.informes = [airi_motor.evaluar(c["mediciones"], c.get("perfil")) for c in cls.lote]

    def test_proyeccion_fiel_del_informe(self):
        for inf in self.informes:
            vista = airi_motor.condiciones_medidas(inf)
            self.assertEqual(set(vista), VISTA)
            self.assertEqual((vista["version"], vista["perfil"], vista["clasificacion"]),
                             (inf["version"], inf["perfil"]["id"], inf["clasificacion"]))
            self.assertEqual(list(vista["condiciones"]), airi_motor.ORDEN)
            for r in inf["resultados"]:
                c = vista["condiciones"][r["parametro"]]
                self.assertEqual(set(c), CONDICION)
                self.assertEqual((c["nombre"], c["unidad"], c["estado"], c["severidad"]),
                                 (r["nombre"], r["unidad_canonica"], r["estado"], r["severidad"]))
                self.assertEqual(c["disponible"], r["estado"] in ("EP3", "EP4", "EP5"))
                self.assertEqual(c["valor"], r["valor_canonico"] if c["disponible"] else None)
                self.assertEqual(c["intervalo"], isinstance(c["valor"], list))
            self.assertEqual(vista["no_disponibles"],
                             [r["parametro"] for r in inf["resultados"] if r["estado"] in ("EP1", "EP2")])
            self.assertEqual(json.loads(json.dumps(vista)), vista)

    def test_nunca_aporta_valor_de_una_medicion_faltante_o_invalida(self):
        inf = airi_motor.evaluar(mediciones(ph="abc", amoniaco="-1", nitritos=("0.1", "mg/L como cobre")))
        vista = airi_motor.condiciones_medidas(inf)
        for p in airi_motor.ORDEN:
            self.assertFalse(vista["condiciones"][p]["disponible"], p)
            self.assertIsNone(vista["condiciones"][p]["valor"], p)
        self.assertEqual(vista["no_disponibles"], airi_motor.ORDEN)

    def test_sin_referencia_es_disponible_pero_no_evaluada(self):
        """Temperatura sin referencia (EP3): el valor medido sirve a otro módulo, pero el motor no lo evaluó."""
        vista = airi_motor.condiciones_medidas(airi_motor.evaluar(mediciones(temperatura="78",
                                                                             salinidad=("35", "g/kg"))))
        self.assertEqual(vista["condiciones"]["temperatura"]["estado"], "EP3")
        self.assertTrue(vista["condiciones"]["temperatura"]["disponible"])
        self.assertEqual(vista["condiciones"]["salinidad"]["valor"], 35.0)
        self.assertEqual(vista["condiciones"]["salinidad"]["unidad"], "ppt")
        self.assertIsNone(vista["condiciones"]["temperatura"]["severidad"])

    def test_conversion_de_unidades_la_hace_el_motor(self):
        vista = airi_motor.condiciones_medidas(airi_motor.evaluar(mediciones(temperatura=("77", "°F"))))
        self.assertEqual(vista["condiciones"]["temperatura"]["valor"], 25.0)
        self.assertEqual(vista["condiciones"]["temperatura"]["unidad"], "°C")

    def test_conserva_el_intervalo_de_incertidumbre(self):
        vista = airi_motor.condiciones_medidas(airi_motor.evaluar(mediciones(amoniaco="0.6")))
        a = vista["condiciones"]["amoniaco"]
        self.assertTrue(a["intervalo"])
        self.assertEqual(a["valor"], [0.465891, 0.6])
        self.assertEqual(a["severidad"], "revision_recomendada")

    def test_no_modifica_el_informe(self):
        inf = airi_motor.evaluar(mediciones(amoniaco="0.6", ph="8.4"))
        antes = copy.deepcopy(inf)
        vista = airi_motor.condiciones_medidas(inf)
        vista["condiciones"]["amoniaco"]["valor"].append(99)
        self.assertEqual(inf, antes)

    def test_entrada_que_no_es_informe(self):
        for x in (None, [], "R4", {}, {"resultados": []}, {"perfil": {"id": "x"}}, {"resultados": {}, "perfil": {}}):
            with self.assertRaises(TypeError, msg=repr(x)):
                airi_motor.condiciones_medidas(x)

    def test_el_contrato_documenta_la_vista(self):
        texto = (MOTOR / "CONTRATO_SALIDA.md").read_text(encoding="utf-8")
        self.assertIn("## 8. Condiciones medidas", texto)
        seccion = texto.split("## 8. Condiciones medidas", 1)[1]
        codigo = " ".join(re.findall(r"`([^`]+)`", seccion))
        for campo in VISTA | CONDICION | {"condiciones_medidas", "condicionesMedidas"}:
            self.assertRegex(codigo, rf"(?<![\w]){campo}(?![\w])", f"§8 no documenta «{campo}»")
        # El ejemplo del §8 es la salida real para la entrada del §6
        ejemplo = json.loads(re.findall(r"```json\s*\n(.*?)```", seccion, re.S)[-1])
        entrada = mediciones(ph="8.4", amoniaco="0.6", temperatura="26", nitritos="abc")
        self.assertEqual(ejemplo, airi_motor.condiciones_medidas(airi_motor.evaluar(entrada)))


@unittest.skipUnless(NODE, "Node.js no está instalado: no se puede comprobar la paridad con JavaScript")
class ParidadCondiciones(unittest.TestCase):
    def test_python_y_javascript_dan_la_misma_vista(self):
        lote = lote_completo()
        r = subprocess.run([NODE, str(LOTE_JS), "--condiciones"], input=json.dumps(lote, ensure_ascii=False),
                           capture_output=True, text=True, encoding="utf-8", check=True)
        js = json.loads(r.stdout)
        self.assertEqual(len(js), len(lote))
        for caso, salida in zip(lote, js):
            # La vista JS se calcula sobre el informe JS; la de Python, sobre el de Python.
            py = json.loads(json.dumps(airi_motor.condiciones_medidas(
                airi_motor.evaluar(caso["mediciones"], caso.get("perfil")))))
            self.assertEqual(salida["condiciones"], py, json.dumps(caso, ensure_ascii=False)[:400])


if __name__ == "__main__":
    unittest.main()
