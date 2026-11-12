import unittest
from apoyo import datos, perfil_de_prueba
from airi_motor import reglas

P = datos.perfil()


def ev(parametro, valor, unidad=None, metodo=None, perfil=P):
    unidad = unidad or {"temperatura": "°C", "ph": "pH", "salinidad": "ppt", "amoniaco": "mg/L TAN-N",
                        "nitritos": "mg/L NO2-", "nitratos": "mg/L NO3-"}[parametro]
    m = {"valor": valor, "unidad": unidad}
    if metodo:
        m["metodo"] = metodo
    return reglas.evaluar_parametro(parametro, m, perfil)


class Validacion(unittest.TestCase):
    def test_q1_faltante(self):
        for vacio in [None, "", "   "]:
            r = reglas.evaluar_parametro("ph", {"valor": vacio, "unidad": "pH"}, P)
            self.assertEqual(r["estado"], "EP1")
            self.assertEqual(r["decisiones"], [("Q1", "F")])
        self.assertEqual(reglas.evaluar_parametro("ph", None, P)["estado"], "EP1")

    def test_q2_numero_invalido(self):
        r = ev("ph", "ocho")
        self.assertEqual((r["estado"], r["decisiones"][-1]), ("EP2", ("Q2", "F")))

    def test_q3_unidad_no_admitida(self):
        r = ev("salinidad", "1.025", "densidad relativa")
        self.assertEqual((r["estado"], r["decisiones"][-1]), ("EP2", ("Q3", "F")))
        self.assertIn("no se admite", r["motivo"])

    def test_q4_limites_de_captura(self):
        for p, v in [("amoniaco", "-0.1"), ("nitritos", "-1"), ("salinidad", "-3"), ("ph", "15"), ("temperatura", "150")]:
            r = ev(p, v)
            self.assertEqual((r["estado"], r["decisiones"][-1]), ("EP2", ("Q4", "F")), p)
        self.assertEqual(ev("temperatura", "213", "°F")["estado"], "EP2")   # 100.6 °C > límite
        self.assertEqual(ev("temperatura", "212", "°F")["estado"], "EP3")   # 100 °C: límite inclusivo
        self.assertEqual(ev("ph", "14")["estado"], "EP5")                   # en la escala, fuera de referencia


class PH(unittest.TestCase):
    def test_en_rango_con_limites_inclusivos(self):
        for v in ["7.8", "8.1", "8.3", "8,0"]:
            r = ev("ph", v)
            self.assertEqual(r["estado"], "EP4", v)
            self.assertEqual(r["decisiones"][-1], ("Q6", "V"))

    def test_tolerancia_documental_8_3_a_8_5(self):
        for v in ["8.31", "8.4", "8.5"]:
            r = ev("ph", v)
            self.assertEqual((r["estado"], r["severidad"]), ("EP5", "revision_recomendada"), v)
            self.assertIn("discrepan", r["motivo"])

    def test_fuera_de_referencia(self):
        for v in ["7.79", "7.0", "8.51", "9"]:
            self.assertEqual(ev("ph", v)["severidad"], "fuera_de_referencia", v)
        self.assertIn("por debajo", ev("ph", "7.5")["motivo"])

    def test_fuentes_y_contexto(self):
        r = ev("ph", "8.1")
        self.assertIn("msd_tabla_referencia", r["fuentes"])
        self.assertTrue(r["contexto"])


class Amoniaco(unittest.TestCase):
    def test_cero_en_rango_en_cualquier_unidad(self):
        for u in ["mg/L TAN-N", "mg/L como NH3", "mg/L (NH₃/NH₄⁺ total)"]:
            self.assertEqual(ev("amoniaco", "0", u)["estado"], "EP4", u)

    def test_presencia_detectable_no_es_alerta_alta(self):
        for v in ["0.01", "0.25", "0.49"]:
            r = ev("amoniaco", v)
            self.assertEqual((r["estado"], r["severidad"]), ("EP5", "presencia_detectable"), v)
            self.assertNotIn("peligro", r["motivo"].lower())

    def test_umbral_0_5_tan_n(self):
        self.assertEqual(ev("amoniaco", "0.5")["severidad"], "alerta_alta")
        self.assertEqual(ev("amoniaco", "2")["severidad"], "alerta_alta")

    def test_conversion_antes_del_umbral(self):
        # 0.6 mg/L como NH3 = 0.4934 TAN-N → detectable; 0.61 como NH3 = 0.5017 → alta
        self.assertEqual(ev("amoniaco", "0.6", "mg/L como NH3")["severidad"], "presencia_detectable")
        self.assertEqual(ev("amoniaco", "0.61", "mg/L como NH3")["severidad"], "alerta_alta")
        self.assertEqual(ev("amoniaco", "0.64", "mg/L como NH4+")["severidad"], "presencia_detectable")  # 0.497
        self.assertEqual(ev("amoniaco", "0.65", "mg/L como NH4+")["severidad"], "alerta_alta")          # 0.505

    def test_base_no_indicada_usa_intervalo(self):
        u = "mg/L (NH₃/NH₄⁺ total)"
        self.assertEqual(ev("amoniaco", "0.45", u)["severidad"], "presencia_detectable")  # máx 0.45 < 0.5
        r = ev("amoniaco", "0.6", u)                                                        # 0.466–0.6
        self.assertEqual(r["severidad"], "revision_recomendada")
        self.assertIn("base química", r["motivo"])
        self.assertEqual(ev("amoniaco", "0.7", u)["severidad"], "alerta_alta")              # mín 0.544 ≥ 0.5
        self.assertEqual(ev("amoniaco", "0.6", u)["valor_canonico"], [0.465891, 0.6])

    def test_metodo_nessler_no_se_compara_con_el_umbral(self):
        r = ev("amoniaco", "3", metodo="Nessler")
        self.assertEqual(r["severidad"], "revision_recomendada")
        self.assertIn("salicilato", r["motivo"])
        self.assertEqual(ev("amoniaco", "0", metodo="nessler")["estado"], "EP4")

    def test_no_calcula_nh3_libre(self):
        r = ev("amoniaco", "0.3")
        self.assertNotIn("no ionizado", r["motivo"].lower())
        self.assertEqual(r["unidad_canonica"], "mg/L TAN-N")


class NitritosNitratosTemperaturaSalinidad(unittest.TestCase):
    def test_nitritos(self):
        self.assertEqual(ev("nitritos", "0")["estado"], "EP4")
        r = ev("nitritos", "0.05", "mg/L NO2-N")
        self.assertEqual((r["estado"], r["severidad"]), ("EP5", "presencia_detectable"))
        self.assertEqual(ev("nitritos", "5")["severidad"], "presencia_detectable", "sin umbral de severidad documentado")

    def test_nitratos_pendiente_nunca_alerta(self):
        for v in ["0", "10", "70", "500"]:
            r = ev("nitratos", v)
            self.assertEqual(r["estado"], "EP3", v)
            self.assertIn("pendiente", r["motivo"])
        self.assertAlmostEqual(ev("nitratos", "44.27")["valor_canonico"], 10.0, places=2)

    def test_temperatura_y_salinidad_sin_referencia_con_contexto(self):
        for p, v in [("temperatura", "26"), ("temperatura", "40"), ("salinidad", "35"), ("salinidad", "10")]:
            r = ev(p, v)
            self.assertEqual(r["estado"], "EP3")
            self.assertIn("sin referencia para evaluación biológica", r["motivo"])
            self.assertTrue(r["contexto"], "debe mostrar contexto científico")

    def test_contexto_solo_nivel_b_y_nunca_decide(self):
        from apoyo import datos as d
        fu = d.fuentes()["fuentes"]
        for p in ["temperatura", "salinidad"]:
            for c in P["referencias"][p]["contexto"]:
                ids = c["fuente"] if isinstance(c["fuente"], list) else [c["fuente"]]
                self.assertTrue(all(fu[i]["nivel"] == "B" for i in ids))


class PerfilDePrueba(unittest.TestCase):
    def test_rango_generico(self):
        p = perfil_de_prueba()
        self.assertEqual(ev("temperatura", "15", perfil=p)["estado"], "EP4")
        self.assertEqual(ev("temperatura", "25", perfil=p)["estado"], "EP5")


class Datos(unittest.TestCase):
    def test_datos_coherentes(self):
        self.assertEqual(datos.validar_datos(), [])

    def test_verificadas_solo_con_nivel_a(self):
        fu = datos.fuentes()["fuentes"]
        for nombre, r in P["referencias"].items():
            if r["estado"] == "verificada":
                self.assertTrue(all(fu[f]["nivel"] == "A" for f in r["fuentes"]), nombre)
        self.assertEqual(P["referencias"]["nitratos"]["estado"], "pendiente")
        self.assertEqual(P["referencias"]["temperatura"]["estado"], "sin_referencia")
        self.assertEqual(P["referencias"]["salinidad"]["estado"], "sin_referencia")


if __name__ == "__main__":
    unittest.main()
