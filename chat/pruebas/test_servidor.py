"""Pruebas del servidor local del chat (chat/servidor.py) con un Gemini SIMULADO en 127.0.0.1.

No usan internet ni una clave real: la «clave» es un valor ficticio y se comprueba que nunca aparezca en
respuestas ni en registros.

    python -m unittest discover -s chat/pruebas -v
"""
import http.client
import io
import json
import sys
import threading
import time
import unittest
from contextlib import redirect_stderr
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import servidor  # noqa: E402

CLAVE = "AIzaFICTICIA-solo-para-pruebas-0123456789"


class GeminiSimulado:
    """Servidor que imita generateContent. `respuesta` decide qué contesta la próxima llamada."""

    def __init__(self):
        self.recibidas = []
        self.respuesta = (200, {"candidates": [{"content": {"parts": [{"text": "Respuesta simulada"}]},
                                                 "finishReason": "STOP"}]})
        self.retraso = 0
        dueño = self

        class H(BaseHTTPRequestHandler):
            def log_message(self, *a):
                pass

            def _responder(self, estado, datos):
                cuerpo = json.dumps(datos).encode()
                self.send_response(estado)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(cuerpo)))
                self.end_headers()
                self.wfile.write(cuerpo)

            def do_POST(self):
                largo = int(self.headers["Content-Length"])
                dueño.recibidas.append({"ruta": self.path, "cabeceras": dict(self.headers),
                                        "cuerpo": json.loads(self.rfile.read(largo))})
                time.sleep(dueño.retraso)
                self._responder(*dueño.respuesta)

            def do_GET(self):
                dueño.recibidas.append({"ruta": self.path, "cabeceras": dict(self.headers)})
                self._responder(200, {"models": [
                    {"name": "models/gemini-3.1-flash-lite", "supportedGenerationMethods": ["generateContent"]},
                    {"name": "models/embedding-x", "supportedGenerationMethods": ["embedContent"]}]})

        self.srv = ThreadingHTTPServer(("127.0.0.1", 0), H)
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        self.base = f"http://127.0.0.1:{self.srv.server_address[1]}/v1beta"

    def cerrar(self):
        self.srv.shutdown()
        self.srv.server_close()


class Base(unittest.TestCase):
    clave = CLAVE

    def setUp(self):
        self.gemini = GeminiSimulado()
        self.registro = io.StringIO()
        self._err = redirect_stderr(self.registro)
        self._err.__enter__()
        self.cfg = servidor.Configuracion(self.clave, "gemini-3.1-flash-lite", base=self.gemini.base, puerto=0,
                                          max_por_minuto=1000, tiempo=3)
        self.srv = ThreadingHTTPServer(("127.0.0.1", 0), servidor.crear_manejador(self.cfg))
        self.cfg.puerto = self.srv.server_address[1]
        self.srv.RequestHandlerClass = servidor.crear_manejador(self.cfg)   # orígenes con el puerto real
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        self.puerto = self.cfg.puerto

    def tearDown(self):
        self.srv.shutdown()
        self.srv.server_close()
        self.gemini.cerrar()
        self._err.__exit__(None, None, None)
        self.assertNotIn(CLAVE, self.registro.getvalue(), "la clave apareció en el registro")

    def pedir(self, metodo, ruta, cuerpo=None, cabeceras=None, host=None):
        c = http.client.HTTPConnection("127.0.0.1", self.puerto, timeout=10)
        h = {"Host": host or f"127.0.0.1:{self.puerto}"}
        if isinstance(cuerpo, (dict, list)):
            cuerpo = json.dumps(cuerpo)
            h["Content-Type"] = "application/json"
        h.update(cabeceras or {})
        c.request(metodo, ruta, body=cuerpo, headers=h)
        r = c.getresponse()
        datos = r.read()
        c.close()
        self.assertNotIn(CLAVE.encode(), datos, "la clave apareció en una respuesta")
        return r.status, datos, dict(r.getheaders())

    def chat(self, mensajes, **kw):
        estado, datos, cab = self.pedir("POST", "/api/chat", {"messages": mensajes}, **kw)
        return estado, json.loads(datos), cab


PREGUNTA = [{"role": "user", "text": "¿Qué come un pez payaso?"}]


class ArchivosEstaticos(Base):
    def test_raiz_redirige_a_la_interfaz(self):
        estado, _, cab = self.pedir("GET", "/")
        self.assertEqual((estado, cab["Location"]), (302, "/interfaz/prototipo/index.html"))

    def test_sirve_la_interfaz_con_cabeceras_seguras(self):
        estado, datos, cab = self.pedir("GET", "/interfaz/prototipo/index.html")
        self.assertEqual(estado, 200)
        self.assertIn(b"Chat con AIRI", datos)
        self.assertEqual(cab["X-Content-Type-Options"], "nosniff")
        self.assertEqual(cab["X-Frame-Options"], "DENY")
        self.assertNotIn("Access-Control-Allow-Origin", cab)

    def test_no_sirve_fuera_de_la_interfaz(self):
        for ruta in ["/chat/servidor.py", "/.git/config", "/interfaz/../chat/servidor.py", "/interfaz/%2e%2e/chat/servidor.py",
                     "/motor/airi_motor/motor.py", "/README.md", "/interfaz/.env", "/interfaz/no-existe.js", "/.gitignore"]:
            self.assertEqual(self.pedir("GET", ruta)[0], 404, ruta)

    def test_host_ajeno_rechazado_dns_rebinding(self):
        self.assertEqual(self.pedir("GET", "/interfaz/prototipo/index.html", host="evil.example:80")[0], 421)
        self.assertEqual(self.chat(PREGUNTA, host="evil.example")[0], 421)
        self.assertEqual(self.gemini.recibidas, [])

    def test_estado_no_revela_la_clave(self):
        estado, datos, _ = self.pedir("GET", "/api/estado")
        self.assertEqual(json.loads(datos), {"clave_configurada": True, "modelo": "gemini-3.1-flash-lite"})


class Seguridad(Base):
    def test_origenes_ajenos_y_null_rechazados(self):
        for origen in ["null", "https://evil.example", "http://127.0.0.1:1", "https://antoniii28.github.io"]:
            self.assertEqual(self.chat(PREGUNTA, cabeceras={"Origin": origen})[0], 403, origen)
        self.assertEqual(self.gemini.recibidas, [], "ninguna petición ajena debe llegar a Gemini")

    def test_mismo_origen_aceptado(self):
        self.assertEqual(self.chat(PREGUNTA, cabeceras={"Origin": f"http://127.0.0.1:{self.puerto}"})[0], 200)
        self.assertEqual(self.chat(PREGUNTA, cabeceras={"Origin": f"http://localhost:{self.puerto}"})[0], 200)

    def test_sin_cors(self):
        estado, _, cab = self.pedir("OPTIONS", "/api/chat", cabeceras={"Origin": "null"})
        self.assertEqual(estado, 405)
        self.assertNotIn("Access-Control-Allow-Origin", cab)

    def test_solo_json(self):
        estado, _, _ = self.pedir("POST", "/api/chat", json.dumps({"messages": PREGUNTA}), {"Content-Type": "text/plain"})
        self.assertEqual(estado, 415)

    def test_tamano_y_json_invalidos(self):
        self.assertEqual(self.pedir("POST", "/api/chat", "x" * (servidor.MAX_CUERPO + 1), {"Content-Type": "application/json"})[0], 413)
        self.assertEqual(self.pedir("POST", "/api/chat", "{no json", {"Content-Type": "application/json"})[0], 400)
        self.assertEqual(self.pedir("POST", "/api/chat", [1, 2])[0], 400)          # JSON que no es un objeto
        self.assertEqual(self.pedir("POST", "/otra", {"messages": PREGUNTA})[0], 404)

    def test_clave_enviada_solo_por_cabecera(self):
        self.chat(PREGUNTA)
        r = self.gemini.recibidas[0]
        cabeceras = {k.lower(): v for k, v in r["cabeceras"].items()}
        self.assertEqual(cabeceras["x-goog-api-key"], CLAVE)
        self.assertNotIn(CLAVE, r["ruta"], "la clave no debe ir en la URL")
        self.assertEqual(r["ruta"], "/v1beta/models/gemini-3.1-flash-lite:generateContent")

    def test_modelo_y_base_validados(self):
        with self.assertRaises(ValueError):
            servidor.Configuracion(CLAVE, "../../otro", base=self.gemini.base)
        with self.assertRaises(ValueError):
            servidor.Configuracion(CLAVE, "gemini-x", base="http://servidor-ajeno.example/v1beta")


class Validacion(Base):
    def test_conversaciones_invalidas(self):
        casos = [[], [{"role": "system", "text": "hola"}], [{"role": "user", "text": ""}],
                 [{"role": "user", "text": "x" * 2501}], [{"role": "user", "text": 5}],
                 [{"role": "user", "text": "a"}, {"role": "model", "text": "b"}],
                 [{"role": "user", "text": "a"}] * 13]
        for c in casos:
            self.assertEqual(self.chat(c)[0], 400, str(c)[:60])

    def test_respuesta_larga_en_el_historial_es_aceptada(self):
        # antes de la corrección, una respuesta > 2500 caracteres en el historial rompía la siguiente pregunta
        hist = [{"role": "user", "text": "a"}, {"role": "model", "text": "r" * 6000}, {"role": "user", "text": "¿y?"}]
        self.assertEqual(self.chat(hist)[0], 200)

    def test_contexto_que_empieza_con_respuesta_se_recorta(self):
        self.chat([{"role": "model", "text": "hola"}, {"role": "user", "text": "pregunta"}])
        enviado = self.gemini.recibidas[0]["cuerpo"]
        self.assertEqual([c["role"] for c in enviado["contents"]], ["user"])
        self.assertIn("motor de reglas de AIRI v0.4", enviado["systemInstruction"]["parts"][0]["text"])
        self.assertEqual(enviado["generationConfig"]["maxOutputTokens"], servidor.MAX_SALIDA_TOKENS)


class RespuestasDeGemini(Base):
    def test_respuesta_correcta(self):
        estado, datos, _ = self.chat(PREGUNTA)
        self.assertEqual((estado, datos["answer"], datos["truncada"]), (200, "Respuesta simulada", False))

    def test_respuesta_cortada_por_longitud(self):
        self.gemini.respuesta = (200, {"candidates": [{"content": {"parts": [{"text": "Parcial"}]}, "finishReason": "MAX_TOKENS"}]})
        estado, datos, _ = self.chat(PREGUNTA)
        self.assertEqual((estado, datos["truncada"]), (200, True))

    def test_sin_texto_por_longitud_o_seguridad(self):
        self.gemini.respuesta = (200, {"candidates": [{"content": {"parts": []}, "finishReason": "MAX_TOKENS"}]})
        self.assertIn("límite de longitud", self.chat(PREGUNTA)[1]["error"])
        self.gemini.respuesta = (200, {"candidates": [{"finishReason": "SAFETY"}]})
        self.assertEqual(self.chat(PREGUNTA)[0], 422)
        self.gemini.respuesta = (200, {"promptFeedback": {"blockReason": "SAFETY"}})
        self.assertIn("filtros de seguridad", self.chat(PREGUNTA)[1]["error"])

    def test_partes_de_razonamiento_no_se_muestran(self):
        self.gemini.respuesta = (200, {"candidates": [{"content": {"parts": [{"text": "pensamiento", "thought": True},
                                                                              {"text": "Respuesta"}]}, "finishReason": "STOP"}]})
        self.assertEqual(self.chat(PREGUNTA)[1]["answer"], "Respuesta")

    def test_errores_http_traducidos_sin_detalles(self):
        clave_invalida = {"error": {"status": "INVALID_ARGUMENT", "message": "API key not valid.",
                                    "details": [{"reason": "API_KEY_INVALID"}]}}
        casos = [((429, {"error": {"status": "RESOURCE_EXHAUSTED"}}), 429, "nivel gratuito"),
                 ((404, {"error": {"status": "NOT_FOUND"}}), 502, "--listar-modelos"),
                 ((400, clave_invalida), 502, "rechazó la clave"),
                 ((403, {"error": {"status": "PERMISSION_DENIED"}}), 502, "rechazó la clave"),
                 ((400, {"error": {"status": "FAILED_PRECONDITION"}}), 502, "No actives la facturación"),
                 ((503, {"error": {"status": "UNAVAILABLE"}}), 502, "no está disponible"),
                 ((400, {"error": {"status": "INVALID_ARGUMENT"}}), 502, "no pudo procesar")]
        for respuesta, esperado, fragmento in casos:
            self.gemini.respuesta = respuesta
            estado, datos, _ = self.chat(PREGUNTA)
            self.assertEqual(estado, esperado, respuesta)
            self.assertIn(fragmento, datos["error"])
            self.assertNotIn("API key not valid", datos["error"])

    def test_tiempo_agotado(self):
        self.gemini.retraso = 4   # más que cfg.tiempo = 3
        estado, datos, _ = self.chat(PREGUNTA)
        self.assertEqual(estado, 504)


class Protecciones(Base):
    def test_una_consulta_a_la_vez(self):
        self.gemini.retraso = 1
        resultados = []
        hilos = [threading.Thread(target=lambda: resultados.append(self.chat(PREGUNTA)[0])) for _ in range(2)]
        for h in hilos:
            h.start(); time.sleep(0.2)
        for h in hilos:
            h.join()
        self.assertEqual(sorted(resultados), [200, 429])

    def test_limite_local_por_minuto(self):
        self.cfg.max_por_minuto = 2
        estados = [self.chat(PREGUNTA)[0] for _ in range(3)]
        self.assertEqual(estados, [200, 200, 429])

    def test_listar_modelos(self):
        salida = io.StringIO()
        from contextlib import redirect_stdout
        with redirect_stdout(salida):
            self.assertEqual(servidor.listar_modelos(self.cfg), 0)
        self.assertIn("gemini-3.1-flash-lite   ← predeterminado", salida.getvalue())
        self.assertNotIn("embedding-x", salida.getvalue())
        self.assertNotIn(CLAVE, salida.getvalue())


class SinClave(Base):
    clave = ""

    def test_sin_clave_avisa_y_no_llama_a_gemini(self):
        estado, datos, _ = self.chat(PREGUNTA)
        self.assertEqual(estado, 503)
        self.assertIn("Falta configurar la clave", datos["error"])
        self.assertEqual(self.gemini.recibidas, [])
        self.assertEqual(json.loads(self.pedir("GET", "/api/estado")[1])["clave_configurada"], False)


class Repositorio(unittest.TestCase):
    def test_no_hay_claves_en_archivos_versionados(self):
        import re
        import subprocess
        raiz = Path(__file__).resolve().parents[2]
        archivos = subprocess.run(["git", "ls-files"], cwd=raiz, capture_output=True, text=True).stdout.split()
        patron = re.compile(r"AIza[0-9A-Za-z_\-]{30,}")
        sospechosos = []
        for a in archivos:
            ruta = raiz / a
            if ruta.suffix in (".png", ".jpeg", ".jpg", ".pdf") or not ruta.is_file():
                continue
            texto = ruta.read_text(encoding="utf-8", errors="ignore")
            for m in patron.findall(texto):
                if "FICTICIA" not in m:
                    sospechosos.append(a)
        self.assertEqual(sospechosos, [], "posible clave de Google en el repositorio")

    def test_env_ignorado(self):
        import subprocess
        raiz = Path(__file__).resolve().parents[2]
        for ruta in [".env", "chat/.env", "interfaz/.env.local"]:
            r = subprocess.run(["git", "check-ignore", "-q", ruta], cwd=raiz)
            self.assertEqual(r.returncode, 0, ruta)


if __name__ == "__main__":
    unittest.main()
