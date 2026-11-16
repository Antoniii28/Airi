"""v0.4.1 · Validación de la estructura de entrada (nodos Q1–Q3 del grafo).

Una entrada mal formada nunca debe provocar una excepción dentro del motor ni un «EN RANGO»: siempre
termina como INVÁLIDO (EP2) con un motivo legible. Antes de v0.4.1, Python lanzaba AttributeError u
OverflowError con estas entradas y JavaScript llegaba a dar «EN RANGO» con un valor dentro de una lista.
"""
import io
import json
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path

from apoyo import airi_motor, datos
from airi_motor import cli, reglas, unidades

P = datos.perfil()


def ev(parametro, medicion):
    return reglas.evaluar_parametro(parametro, medicion, P)


class EstructuraDeLaMedicion(unittest.TestCase):
    def test_medicion_que_no_es_objeto_es_invalida_en_q2(self):
        for malo in ["8.1", 8.1, 0, "", ["8.1", "pH"], [], True]:
            r = ev("ph", malo)
            self.assertEqual(r["estado"], "EP2", repr(malo))
            self.assertEqual(r["decisiones"], [("Q1", "V"), ("Q2", "F")], repr(malo))
            self.assertEqual(r["motivo"], reglas.MOTIVO_ESTRUCTURA)
            self.assertEqual((r["valor_canonico"], r["fuentes"]), (None, []))

    def test_medicion_ausente_sigue_siendo_faltante(self):
        self.assertEqual(ev("ph", None)["estado"], "EP1")
        self.assertEqual(ev("ph", {})["estado"], "EP1")

    def test_mediciones_que_no_son_objeto_lanzan_type_error(self):
        for malo in [[1, 2], "ph=8", 8]:
            with self.assertRaises(TypeError):
                airi_motor.evaluar(malo)
        self.assertEqual(airi_motor.evaluar(None)["clasificacion"], "R3")


class TipoDelValor(unittest.TestCase):
    def test_valores_no_numericos_ni_texto_son_invalidos(self):
        for malo in [[8.1], [], {"v": 8.1}, True, False]:
            r = ev("ph", {"valor": malo, "unidad": "pH"})
            self.assertEqual((r["estado"], r["decisiones"][-1]), ("EP2", ("Q2", "F")), repr(malo))
            self.assertEqual(r["motivo"], reglas.MOTIVO_TIPO_VALOR)

    def test_lista_con_un_numero_nunca_queda_en_rango(self):
        self.assertNotEqual(ev("ph", {"valor": [8.1], "unidad": "pH"})["estado"], "EP4")

    def test_entero_enorme_no_desborda(self):
        self.assertIsNone(unidades.leer_numero(10 ** 400))
        self.assertEqual(ev("ph", {"valor": 10 ** 400, "unidad": "pH"})["estado"], "EP2")

    def test_numeros_no_finitos(self):
        for malo in [float("inf"), float("-inf"), float("nan")]:
            self.assertEqual(ev("ph", {"valor": malo, "unidad": "pH"})["motivo"], reglas.MOTIVO_TIPO_VALOR)
        self.assertEqual(ev("ph", {"valor": "inf", "unidad": "pH"})["motivo"], "«inf» no es un número válido.")


class TipoDeLaUnidadYDelMetodo(unittest.TestCase):
    def test_unidad_no_textual_es_invalida_en_q3(self):
        for malo in [["mg/L TAN-N"], 7, 0, False, {"u": "pH"}]:
            r = ev("amoniaco", {"valor": "0", "unidad": malo})
            self.assertEqual((r["estado"], r["decisiones"][-1]), ("EP2", ("Q3", "F")), repr(malo))
            self.assertTrue(r["motivo"].startswith("La unidad recibida no es un texto"), r["motivo"])

    def test_unidad_cero_ya_no_equivale_a_ph_sin_unidad(self):
        # Antes, `unidad or ""` convertía 0 o False en «sin unidad», que para el pH es válida.
        self.assertEqual(ev("ph", {"valor": "8.1", "unidad": 0})["estado"], "EP2")
        self.assertEqual(ev("ph", {"valor": "8.1", "unidad": None})["estado"], "EP4")
        self.assertEqual(ev("ph", {"valor": "8.1"})["estado"], "EP4")

    def test_metodo_no_textual_se_ignora_sin_error(self):
        r = ev("amoniaco", {"valor": "1", "unidad": "mg/L TAN-N", "metodo": 5})
        self.assertEqual((r["estado"], r["severidad"]), ("EP5", "alerta_alta"))
        r = ev("amoniaco", {"valor": "1", "unidad": "mg/L TAN-N", "metodo": ["nessler"]})
        self.assertEqual(r["severidad"], "alerta_alta")


class Espacios(unittest.TestCase):
    def test_conjunto_es_la_union_de_python_y_javascript(self):
        python = {chr(c) for c in range(0x110000) if chr(c).isspace()}
        self.assertEqual(set(unidades.ESPACIOS), python | {"\ufeff"})

    def test_bom_y_espacios_unicode_se_recortan(self):
        for e in ["\ufeff", "\u00a0", "\u3000", "\x1c", "\x85"]:
            self.assertEqual(ev("ph", {"valor": f"{e}8.1{e}", "unidad": f"{e}pH"})["estado"], "EP4", repr(e))
            self.assertEqual(ev("ph", {"valor": e, "unidad": "pH"})["estado"], "EP1", repr(e))
            r = ev("amoniaco", {"valor": "1", "unidad": "mg/L TAN-N", "metodo": f"{e}Nessler{e}"})
            self.assertEqual(r["severidad"], "revision_recomendada", repr(e))

    def test_espacio_de_ancho_cero_no_es_espacio(self):
        # U+200B no es espacio ni en Python ni en JavaScript: el dato no es un número.
        self.assertEqual(ev("ph", {"valor": "\u200b8.1", "unidad": "pH"})["estado"], "EP2")


class CLI(unittest.TestCase):
    def test_entrada_mal_formada_no_rompe_la_cli(self):
        mediciones = {"ph": "8.1", "amoniaco": {"valor": [0.2], "unidad": "mg/L TAN-N", "metodo": 3},
                      "nitritos": {"valor": "0", "unidad": ["mg/L NO2-"]}}
        with tempfile.TemporaryDirectory() as d:
            ruta = Path(d) / "m.json"
            ruta.write_text(json.dumps(mediciones), encoding="utf-8")
            salida, errores = io.StringIO(), io.StringIO()
            with redirect_stdout(salida), redirect_stderr(errores):
                codigo = cli.main(["evaluar", str(ruta), "--json"])
        self.assertEqual(codigo, 0, errores.getvalue())
        inf = json.loads(salida.getvalue())
        estados = {r["parametro"]: r["estado"] for r in inf["resultados"]}
        self.assertEqual((estados["ph"], estados["amoniaco"], estados["nitritos"]), ("EP2", "EP2", "EP2"))
        self.assertEqual(inf["clasificacion"], "R3")


if __name__ == "__main__":
    unittest.main()
