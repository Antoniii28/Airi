"""Pruebas aisladas de cuotas v0.7; no hacen peticiones a Gemini."""
import unittest
from chat.control_uso import ControlUso


class TestControlUso(unittest.TestCase):
    def setUp(self):
        self.segundos = [0.0]
        self.fecha = ["2026-11-13"]
        self.c = ControlUso(2, 3, 4, reloj=lambda: self.segundos[0],
                            fecha=lambda: self.fecha[0])

    def test_minuto_por_cliente(self):
        self.assertTrue(self.c.admitir("a")[0])
        self.assertTrue(self.c.admitir("a")[0])
        self.assertFalse(self.c.admitir("a")[0])
        self.assertTrue(self.c.admitir("b")[0])
        self.segundos[0] = 61
        self.assertTrue(self.c.admitir("a")[0])

    def test_tope_diario_cliente(self):
        self.c.admitir("a")
        self.c.admitir("a")
        self.segundos[0] = 61
        self.c.admitir("a")
        self.segundos[0] = 122
        self.assertFalse(self.c.admitir("a")[0])

    def test_tope_global(self):
        for ip in ("a", "b", "c", "d"):
            self.assertTrue(self.c.admitir(ip)[0])
        self.assertFalse(self.c.admitir("e")[0])

    def test_reinicio_diario(self):
        for ip in ("a", "b", "c", "d"):
            self.c.admitir(ip)
        self.fecha[0] = "2026-11-14"
        self.assertTrue(self.c.admitir("e")[0])

    def test_apagado(self):
        self.c.apagado = True
        ok, msg = self.c.admitir("a")
        self.assertFalse(ok)
        self.assertIn("desactivado", msg)

    def test_limites_invalidos(self):
        with self.assertRaises(ValueError):
            ControlUso(0, 1, 1)


if __name__ == "__main__":
    unittest.main()
