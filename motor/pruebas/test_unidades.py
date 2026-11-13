import unittest
from apoyo import airi_motor  # noqa: F401  (configura la ruta)
from airi_motor import unidades as U


class PruebasUnidades(unittest.TestCase):
    def test_masas_molares_y_factores(self):
        self.assertAlmostEqual(U.A_N["NH3"], 0.8224, places=4)
        self.assertAlmostEqual(U.A_N["NH4"], 0.7765, places=4)
        self.assertAlmostEqual(1 / U.A_N["NO2"], 3.2845, places=3)
        self.assertAlmostEqual(1 / U.A_N["NO3"], 4.4266, places=3)

    def test_leer_numero(self):
        self.assertEqual(U.leer_numero("8,1"), 8.1)
        self.assertEqual(U.leer_numero(" 0.25 "), 0.25)
        self.assertEqual(U.leer_numero(7), 7.0)
        self.assertEqual(U.leer_numero("1e-2"), 0.01)
        for malo in ["٣", "８", "1٫5", "abc", "", "nan", "inf", "1e999", "8.1.2", "3x5", True, None, "-"]:
            self.assertIsNone(U.leer_numero(malo), malo)

    def test_unidades_del_prototipo_reconocidas(self):
        casos = {"temperatura": "°C", "ph": "pH", "salinidad": "ppt", "amoniaco": "mg/L (NH₃/NH₄⁺ total)",
                 "nitritos": "mg/L (NO₂⁻)", "nitratos": "mg/L (NO₃⁻)"}
        for p, u in casos.items():
            self.assertIsNotNone(U.reconocer_unidad(p, u), (p, u))
        self.assertIsNone(U.reconocer_unidad("amoniaco", "mg/L (NH₃/NH₄⁺ total)")["base"])

    def test_unidades_no_admitidas(self):
        self.assertIsNone(U.reconocer_unidad("salinidad", "densidad relativa"))
        self.assertIsNone(U.reconocer_unidad("nitratos", "mg/L"))   # sin forma química
        self.assertIsNone(U.reconocer_unidad("ph", "mg/L"))
        self.assertIsNone(U.reconocer_unidad("temperatura", "K"))

    def test_ppm_equivale_a_mg_l_con_aviso(self):
        u = U.reconocer_unidad("nitratos", "ppm NO3-")
        self.assertEqual(u["base"], "NO3"); self.assertTrue(u["uso_ppm"])

    def test_conversiones(self):
        f = U.reconocer_unidad("temperatura", "°F")
        self.assertAlmostEqual(U.a_canonica("temperatura", 77, f)[0], 25.0)
        nh3 = U.reconocer_unidad("amoniaco", "mg/L como NH3")
        self.assertAlmostEqual(U.a_canonica("amoniaco", 1, nh3)[0], 0.8224, places=4)
        sin = U.reconocer_unidad("amoniaco", "mg/L NH3/NH4+ total")
        lo, hi = U.a_canonica("amoniaco", 1, sin)
        self.assertAlmostEqual(lo, 0.7765, places=4); self.assertEqual(hi, 1.0)
        no3 = U.reconocer_unidad("nitratos", "mg/L NO3-")
        self.assertAlmostEqual(U.a_canonica("nitratos", 44.27, no3)[0], 10.0, places=2)


if __name__ == "__main__":
    unittest.main()
