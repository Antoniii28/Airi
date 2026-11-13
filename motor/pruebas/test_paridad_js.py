"""Paridad Python ↔ JavaScript: el informe COMPLETO (textos, notas, contexto, traza) debe ser idéntico.

Requiere Node.js; si no está instalado, la prueba se omite (y lo indica)."""
import json
import random
import shutil
import subprocess
import unittest

from apoyo import MOTOR, RAIZ, airi_motor, perfil_de_prueba

NODE = shutil.which("node")
LOTE_JS = RAIZ / "interfaz" / "motor" / "herramientas" / "evaluar_lote.js"

UNIDADES = {
    "temperatura": ["°C", "°F", "C", "K", "", None],
    "ph": ["pH", "", "mg/L", None],
    "salinidad": ["ppt", "‰", "g/kg", "densidad relativa", ""],
    "amoniaco": ["mg/L (NH₃/NH₄⁺ total)", "mg/L TAN-N", "mg/L como NH3", "mg/L como NH4+", "ppm TAN-N", "ppm", ""],
    "nitritos": ["mg/L (NO₂⁻)", "mg/L NO2-N", "ppm NO2-", "mg/L"],
    "nitratos": ["mg/L (NO₃⁻)", "mg/L NO3-N", "mg/L", "ppm NO3-"],
}
ESPECIALES = ["", " ", None, "abc", "8,1", "1e3", "-0", "0", "0.0", "1024.5", "8.125", "0.4999", "0.5", "-1", "15",
              "1e999", "٣", "+.5", "7.", ".5", 0, 8.4, 1e-7, 99.995, "100", "212", "213"]


def lote_aleatorio(n, semilla):
    rnd = random.Random(semilla)
    lote = []
    for _ in range(n):
        med = {}
        for p, unidades in UNIDADES.items():
            if rnd.random() < 0.08:
                continue
            if rnd.random() < 0.3:
                v = rnd.choice(ESPECIALES)
            else:
                v = f"{rnd.uniform(-1, 40) * rnd.choice([0.01, 0.1, 1, 1]):.{rnd.randint(0, 5)}f}"
                if rnd.random() < 0.2:
                    v = v.replace(".", ",")
            m = {"valor": v, "unidad": rnd.choice(unidades)}
            if p == "amoniaco" and rnd.random() < 0.1:
                m["metodo"] = rnd.choice(["Nessler", "salicilato", " nessler "])
            med[p] = m
        lote.append({"mediciones": med})
    return lote


@unittest.skipUnless(NODE, "Node.js no está instalado: no se puede comprobar la paridad con JavaScript")
class ParidadJavaScript(unittest.TestCase):
    def comparar(self, lote):
        r = subprocess.run([NODE, str(LOTE_JS)], input=json.dumps(lote, ensure_ascii=False), capture_output=True,
                           text=True, encoding="utf-8", check=True)
        js = json.loads(r.stdout)
        self.assertEqual(len(js), len(lote))
        for caso, informe_js in zip(lote, js):
            informe_py = json.loads(json.dumps(airi_motor.evaluar(caso["mediciones"], caso.get("perfil"))))
            self.assertEqual(informe_js, informe_py, json.dumps(caso, ensure_ascii=False))

    def test_34_casos_de_conformidad_informe_completo(self):
        doc = json.loads((MOTOR / "casos_conformidad.json").read_text(encoding="utf-8"))
        self.comparar([{"mediciones": c["mediciones"], **({"perfil": c["perfil"]} if "perfil" in c else {})}
                       for c in doc["casos"]])

    def test_entradas_aleatorias_perfil_real(self):
        self.comparar(lote_aleatorio(4000, semilla=2026))

    def test_entradas_aleatorias_perfil_de_prueba(self):
        p = perfil_de_prueba()
        self.comparar([{**c, "perfil": p} for c in lote_aleatorio(1500, semilla=11)])


if __name__ == "__main__":
    unittest.main()


class DatosCompartidos(unittest.TestCase):
    def test_airi_motor_datos_js_generado_de_los_mismos_json(self):
        import sys
        sys.path.insert(0, str(MOTOR / "herramientas"))
        import generar_datos_js
        actual = generar_datos_js.DESTINO.read_text(encoding="utf-8")
        self.assertEqual(actual, generar_datos_js.generar(),
                         "Ejecuta motor/herramientas/generar_datos_js.py: los datos web no coinciden con los JSON")
