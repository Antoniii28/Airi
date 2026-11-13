"""Pruebas de integración HTTP locales: sin red externa ni Gemini real."""
import http.client
import json
import socket
import threading
import unittest
from unittest.mock import patch
from http.server import ThreadingHTTPServer

from chat import servidor


class TestServidorLimites(unittest.TestCase):
    def setUp(self):
        self.cfg = servidor.Configuracion("clave-ficticia", servidor.MODELO_PREDETERMINADO, puerto=0)
        self.cfg.control_uso = servidor.ControlUso(por_minuto=2, por_dia=3, global_diario=4)
        # El handler necesita conocer el puerto para validar Host y Origin.
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            self.cfg.puerto = sock.getsockname()[1]
        self.http = ThreadingHTTPServer(("127.0.0.1", self.cfg.puerto),
                                        servidor.crear_manejador(self.cfg))
        self.hilo = threading.Thread(target=self.http.serve_forever, daemon=True)
        self.hilo.start()

    def tearDown(self):
        self.http.shutdown()
        self.http.server_close()
        self.hilo.join(timeout=3)

    def post(self):
        conn = http.client.HTTPConnection("127.0.0.1", self.cfg.puerto, timeout=3)
        cuerpo = json.dumps({"messages": [{"role": "user", "text": "Hola"}]})
        conn.request("POST", "/api/chat", body=cuerpo, headers={
            "Host": "127.0.0.1:" + str(self.cfg.puerto),
            "Origin": "http://127.0.0.1:" + str(self.cfg.puerto),
            "Content-Type": "application/json",
        })
        r = conn.getresponse()
        estado, datos = r.status, json.loads(r.read())
        conn.close()
        return estado, datos

    def test_limite_http(self):
        with patch.object(servidor, "consultar_gemini",
                          return_value=(200, {"answer": "Respuesta simulada"})) as gemini:
            self.assertEqual(self.post()[0], 200)
            self.assertEqual(self.post()[0], 200)
            codigo, datos = self.post()
            self.assertEqual(codigo, 429)
            self.assertIn("límite", datos["error"])
            self.assertEqual(gemini.call_count, 2)

    def test_apagado_http(self):
        self.cfg.control_uso.apagado = True
        with patch.object(servidor, "consultar_gemini") as gemini:
            codigo, datos = self.post()
            self.assertEqual(codigo, 503)
            self.assertIn("desactivado", datos["error"])
            gemini.assert_not_called()


if __name__ == "__main__":
    unittest.main()
