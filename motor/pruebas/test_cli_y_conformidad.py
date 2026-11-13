import io
import itertools
import json
import subprocess
import sys
import unittest
from contextlib import redirect_stdout, redirect_stderr

from apoyo import MOTOR, airi_motor, aristas_del_grafo
from airi_motor import cli

sys.path.insert(0, str(MOTOR / "herramientas"))
import generar_casos  # noqa: E402

GRAFO = aristas_del_grafo()


def correr(*args):
    out, err = io.StringIO(), io.StringIO()
    with redirect_stdout(out), redirect_stderr(err):
        rc = cli.main(list(args))
    return rc, out.getvalue(), err.getvalue()


class CLI(unittest.TestCase):
    def test_evaluar_texto_y_json(self):
        ruta = MOTOR / "ejemplos" / "mediciones_prototipo.json"
        rc, out, _ = correr("evaluar", str(ruta))
        self.assertEqual(rc, 0)
        self.assertIn("Resultado R", out)
        self.assertIn("No diagnostica", out)
        rc, out, _ = correr("evaluar", str(ruta), "--json")
        self.assertEqual(json.loads(out)["version"], airi_motor.VERSION)

    def test_errores_con_codigo_2(self):
        self.assertEqual(correr("evaluar", str(MOTOR / "no_existe.json"))[0], 2)
        self.assertEqual(correr("evaluar", str(MOTOR / "ejemplos" / "mediciones_prototipo.json"), "--perfil", "x")[0], 2)

    def test_perfiles_y_fuentes(self):
        rc, out, _ = correr("perfiles")
        self.assertIn("nitratos     pendiente", out)
        rc, out, _ = correr("fuentes")
        self.assertIn("[A] msd_tabla_referencia", out)

    def test_ejecutable_como_modulo(self):
        r = subprocess.run([sys.executable, "-m", "airi_motor", "perfiles"], cwd=MOTOR, capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)


class CasosDeConformidad(unittest.TestCase):
    def test_archivo_al_dia(self):
        actual = (MOTOR / "casos_conformidad.json").read_text(encoding="utf-8")
        self.assertEqual(actual, generar_casos.generar(),
                         "Ejecuta motor/herramientas/generar_casos.py y revisa el cambio antes de confirmarlo")

    def test_cada_vector_se_reproduce_y_sigue_el_grafo(self):
        doc = json.loads((MOTOR / "casos_conformidad.json").read_text(encoding="utf-8"))
        self.assertGreaterEqual(len(doc["casos"]), 30)
        vistos = set()
        for c in doc["casos"]:
            obtenido = generar_casos.esperado(airi_motor.evaluar(c["mediciones"], c.get("perfil")))
            self.assertEqual(obtenido, c["esperado"], c["id"])
            for paso in c["esperado"]["traza"]:
                self.assertIn(tuple(paso[:3]), GRAFO, (c["id"], paso))
            vistos.add(c["esperado"]["clasificacion"])
        self.assertEqual(vistos, {"R1", "R2", "R3", "R4"})


# Siete entradas por parámetro: faltante, texto, unidad no admitida, fuera de captura y tres valores válidos.
ENTRADAS = {
    "temperatura": ["", "x", ("25", "K"), "150", "15", "26", ("77", "°F")],
    "ph": ["", "x", ("8", "mg/L"), "15", "8.1", "8.4", "9"],
    "salinidad": ["", "x", ("1.025", "densidad relativa"), "-1", "15", "35", ("35", "g/kg")],
    "amoniaco": ["", "x", ("0.1", "ppm"), "-1", "0", "0.6", ("0.2", "mg/L TAN-N")],
    "nitritos": ["", "x", ("0.1", "mg/L"), "-1", "0", "0.1", ("0.05", "mg/L NO2-N")],
    "nitratos": ["", "x", ("10", "mg/L"), "-1", "0.5", "10", ("2", "mg/L NO3-N")],
}
UNIDAD = generar_casos.U


class Exhaustiva(unittest.TestCase):
    """7^6 = 117 649 combinaciones con el perfil real y con el de prueba (que permite R1/R2)."""

    def _recorrer(self, perfil):
        cuenta = {}
        orden = airi_motor.ORDEN
        for combo in itertools.product(*(ENTRADAS[p] for p in orden)):
            med = {}
            for p, x in zip(orden, combo):
                v, u = x if isinstance(x, tuple) else (x, UNIDAD[p])
                med[p] = {"valor": v, "unidad": u}
            inf = airi_motor.evaluar(med, perfil)
            est = [r["estado"] for r in inf["resultados"]]
            A, I = "EP5" in est, any(e in ("EP1", "EP2", "EP3") for e in est)
            esperado = {(False, False): "R1", (True, False): "R2", (False, True): "R3", (True, True): "R4"}[(A, I)]
            assert [r["parametro"] for r in inf["resultados"]] == orden
            assert (inf["A"], inf["I"], inf["clasificacion"]) == (A, I, esperado), combo
            assert len(inf["alertas"]) == est.count("EP5"), combo
            assert len(inf["solicitudes"]) == sum(e in ("EP1", "EP2", "EP3") for e in est), combo
            assert all(r["severidad"] is None for r in inf["resultados"] if r["estado"] != "EP5"), combo
            assert inf["traza"][-1]["a"] == "FIN", combo
            cuenta[esperado] = cuenta.get(esperado, 0) + 1
        return cuenta

    def test_perfil_real(self):
        cuenta = self._recorrer(None)
        self.assertEqual(sum(cuenta.values()), 7 ** 6)
        self.assertNotIn("R1", cuenta, "con las referencias actuales nunca hay información completa")
        self.assertNotIn("R2", cuenta)

    def test_perfil_de_prueba(self):
        from apoyo import perfil_de_prueba
        cuenta = self._recorrer(perfil_de_prueba())
        self.assertEqual(sum(cuenta.values()), 7 ** 6)
        self.assertEqual(set(cuenta), {"R1", "R2", "R3", "R4"})


if __name__ == "__main__":
    unittest.main()
