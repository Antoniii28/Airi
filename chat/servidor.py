"""Servidor local del chat de AIRI v0.5 (solo biblioteca estándar).

Sirve la interfaz de AIRI y el endpoint POST /api/chat en http://127.0.0.1:8765/, y reenvía las preguntas
a la API de Gemini con la clave guardada SOLO en la memoria del proceso. El navegador nunca recibe la clave.

    python chat/servidor.py                     # pide la clave sin mostrarla si no existe GEMINI_API_KEY
    python chat/servidor.py --listar-modelos    # modelos de generación disponibles para tu clave
    python chat/servidor.py --modelo NOMBRE     # otro modelo (también: variable AIRI_GEMINI_MODEL)

Seguridad:
- Escucha solo en 127.0.0.1; no es accesible desde otros equipos.
- Mismo origen: no envía cabeceras CORS. Rechaza los orígenes ajenos, el origen «null» (iframes aislados de
  cualquier sitio) y las cabeceras Host distintas de 127.0.0.1/localhost (protección contra DNS rebinding).
- La clave no se escribe en disco, en respuestas ni en registros; los errores se muestran sin detalles internos.
- No es un servidor para publicar en internet.
"""
import argparse
import getpass
import json
import mimetypes
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
HOST = "127.0.0.1"
PUERTO = 8765
MODELO_PREDETERMINADO = "gemini-3.1-flash-lite"   # estable y con nivel gratuito según ai.google.dev (consulta 2026-11-12)
BASE_GEMINI = "https://generativelanguage.googleapis.com/v1beta"
RUTAS_PUBLICAS = ("/interfaz/", "/identidad-visual/")   # solo se sirve lo que necesita la interfaz
MAX_CUERPO = 64 * 1024
MAX_MENSAJES = 12
MAX_USUARIO = 2500
MAX_MODELO = 12000
MAX_TOTAL = 40000
MAX_SALIDA_TOKENS = 2048
MAX_POR_MINUTO = 10          # protección LOCAL contra bucles; no es un límite de Google
TIEMPO_GEMINI = 45
MODELO_VALIDO = re.compile(r"^[a-z0-9][a-z0-9.\-]{1,62}$")

SISTEMA = (
    "Eres AIRI, asistente educativo sobre acuarios marinos de un proyecto académico. Responde siempre en español.\n"
    "Estilo:\n"
    "- Responde directamente a lo que se pregunta, con una extensión proporcional: una o dos frases para preguntas "
    "simples; listas breves o secciones cortas solo cuando la pregunta lo requiera.\n"
    "- No saludes ni te presentes en cada respuesta; la conversación ya está en curso.\n"
    "- Puedes usar Markdown sencillo (negritas, listas, tablas pequeñas) cuando ayude a leer; no uses HTML.\n"
    "- No repitas advertencias generales en cada mensaje. Menciona un límite solo cuando sea pertinente a la pregunta.\n"
    "Prudencia científica:\n"
    "- Distingue lo bien establecido de lo incierto o variable entre especies y acuarios; si no lo sabes, dilo.\n"
    "- Si das valores o rangos orientativos, preséntalos como aproximados y variables, no como límites de AIRI. "
    "No inventes estudios, referencias ni enlaces. No tienes acceso a internet ni a fuentes actualizadas: si la "
    "pregunta lo requiere, dilo en una frase y sugiere consultar fuentes especializadas.\n"
    "- No diagnostiques enfermedades ni garantices que el agua o un organismo estén bien; ante síntomas, mortalidad "
    "o tratamientos, recomienda consultar a un veterinario o a una persona experta en acuarios marinos.\n"
    "- No ordenes ni ejecutes acciones físicas sobre el acuario.\n"
    "- Las evaluaciones de los parámetros del agua corresponden exclusivamente al motor de reglas de AIRI v0.4 "
    "(pestaña «Parámetros del agua»): no afirmes haberlas calculado ni propongas otros umbrales como si fueran de AIRI."
)


class Configuracion:
    def __init__(self, clave, modelo, base=BASE_GEMINI, puerto=PUERTO, max_por_minuto=MAX_POR_MINUTO,
                 tiempo=TIEMPO_GEMINI):
        if not MODELO_VALIDO.match(modelo):
            raise ValueError("Nombre de modelo no válido")
        p = urllib.parse.urlparse(base)
        if p.scheme != "https" and p.hostname not in ("127.0.0.1", "localhost"):
            raise ValueError("La API debe usar https (solo las pruebas locales pueden usar http)")
        self.clave = clave or None
        self.modelo = modelo
        self.base = base.rstrip("/")
        self.puerto = puerto
        self.max_por_minuto = max_por_minuto
        self.tiempo = tiempo
        self.ocupado = threading.Lock()
        self.marcas = []
        self.marcas_lock = threading.Lock()

    def ocultar(self, texto):
        """Elimina la clave de cualquier texto antes de mostrarlo (defensa en profundidad)."""
        texto = str(texto)
        return texto.replace(self.clave, "***") if self.clave else texto

    def permitir_consulta(self):
        ahora = time.monotonic()
        with self.marcas_lock:
            self.marcas = [t for t in self.marcas if ahora - t < 60]
            if len(self.marcas) >= self.max_por_minuto:
                return False
            self.marcas.append(ahora)
            return True


def _error_gemini(cuerpo):
    """Estado del error de Gemini (p. ej. «PERMISSION_DENIED»); «API_KEY_INVALID» si la clave no es válida."""
    try:
        error = json.loads(cuerpo).get("error") or {}
    except (ValueError, AttributeError):
        return ""
    if "API_KEY_INVALID" in json.dumps(error.get("details", [])):
        return "API_KEY_INVALID"
    return error.get("status", "")


def consultar_gemini(cfg, contenidos):
    """Devuelve (estado_http, datos). Nunca incluye la clave en el resultado."""
    carga = json.dumps({
        "systemInstruction": {"parts": [{"text": SISTEMA}]},
        "contents": contenidos,
        "generationConfig": {"maxOutputTokens": MAX_SALIDA_TOKENS, "temperature": 0.35},
    }).encode("utf-8")
    url = f"{cfg.base}/models/{cfg.modelo}:generateContent"
    req = urllib.request.Request(url, data=carga, method="POST",
                                 headers={"Content-Type": "application/json", "x-goog-api-key": cfg.clave})
    try:
        with urllib.request.urlopen(req, timeout=cfg.tiempo) as r:
            resultado = json.load(r)
    except urllib.error.HTTPError as exc:
        estado = _error_gemini(exc.read() or b"")
        print(f"[AIRI] Gemini respondió HTTP {exc.code} {estado}".rstrip(), file=sys.stderr)
        if exc.code == 429:
            return 429, {"error": "Se alcanzó el límite de consultas del nivel gratuito de Gemini para este proyecto. "
                                  "Espera e inténtalo más tarde; puedes ver tus límites en Google AI Studio."}
        if exc.code == 404:
            return 502, {"error": f"El modelo «{cfg.modelo}» no está disponible para tu clave. Ejecuta "
                                  "«python chat/servidor.py --listar-modelos» y elige otro con --modelo."}
        if exc.code in (401, 403) or estado in ("PERMISSION_DENIED", "UNAUTHENTICATED", "API_KEY_INVALID"):
            return 502, {"error": "Gemini rechazó la clave o el acceso al modelo. Revisa la clave en Google AI Studio."}
        if exc.code == 400 and estado == "FAILED_PRECONDITION":
            return 502, {"error": "Gemini no está disponible sin facturación en tu región o para este proyecto. "
                                  "No actives la facturación sin decidirlo: consulta la documentación de AIRI."}
        if exc.code >= 500:
            return 502, {"error": "Gemini no está disponible en este momento. Inténtalo más tarde."}
        return 502, {"error": "Gemini no pudo procesar la consulta."}
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        print(f"[AIRI] Sin conexión con Gemini ({type(exc).__name__})", file=sys.stderr)
        return 504, {"error": "No se pudo conectar con Gemini. Revisa tu conexión a internet."}
    except ValueError:
        return 502, {"error": "Gemini devolvió una respuesta que no se pudo leer."}

    if (resultado.get("promptFeedback") or {}).get("blockReason"):
        return 422, {"error": "Gemini bloqueó la pregunta con sus filtros de seguridad. Reformúlala."}
    candidatos = resultado.get("candidates") or []
    if not candidatos:
        return 502, {"error": "Gemini no devolvió ninguna respuesta."}
    c = candidatos[0]
    partes = (c.get("content") or {}).get("parts") or []
    texto = "".join(p.get("text", "") for p in partes if isinstance(p, dict) and not p.get("thought"))
    motivo = c.get("finishReason", "")
    if not texto.strip():
        if motivo in ("SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII", "RECITATION"):
            return 422, {"error": "Gemini no generó la respuesta por sus filtros de seguridad o de contenido."}
        if motivo == "MAX_TOKENS":
            return 502, {"error": "Gemini agotó el límite de longitud antes de responder. Haz una pregunta más concreta."}
        return 502, {"error": "Gemini no devolvió texto."}
    return 200, {"answer": texto[:MAX_MODELO], "truncada": motivo == "MAX_TOKENS" or len(texto) > MAX_MODELO,
                 "modelo": cfg.modelo}


def validar_conversacion(datos):
    """Devuelve (contenidos_para_gemini, None) o (None, mensaje_de_error)."""
    if not isinstance(datos, dict) or not isinstance(datos.get("messages"), list):
        return None, "Conversación inválida"
    mensajes = datos["messages"]
    if not 1 <= len(mensajes) <= MAX_MENSAJES:
        return None, "Conversación inválida"
    total, contenidos = 0, []
    for m in mensajes:
        if not isinstance(m, dict) or m.get("role") not in ("user", "model") or not isinstance(m.get("text"), str):
            return None, "Mensaje inválido"
        limite = MAX_USUARIO if m["role"] == "user" else MAX_MODELO
        if not 1 <= len(m["text"]) <= limite:
            return None, "Mensaje inválido"
        total += len(m["text"])
        contenidos.append({"role": m["role"], "parts": [{"text": m["text"]}]})
    if total > MAX_TOTAL:
        return None, "La conversación es demasiado larga; empieza una nueva"
    while contenidos and contenidos[0]["role"] != "user":   # el contexto debe empezar con una pregunta
        contenidos.pop(0)
    if not contenidos or contenidos[-1]["role"] != "user":
        return None, "El último mensaje debe ser del usuario"
    return contenidos, None


def crear_manejador(cfg):
    origenes = {f"http://127.0.0.1:{cfg.puerto}", f"http://localhost:{cfg.puerto}"}
    hosts = {f"127.0.0.1:{cfg.puerto}", f"localhost:{cfg.puerto}"}

    class Manejador(BaseHTTPRequestHandler):
        server_version = "AIRI"
        sys_version = ""
        timeout = 20   # una conexión lenta o incompleta no bloquea el hilo indefinidamente

        def log_message(self, formato, *args):   # sin cabeceras ni cuerpos: solo método, ruta y estado
            sys.stderr.write("[AIRI] " + cfg.ocultar(formato % args) + "\n")

        def _enviar(self, estado, cuerpo, tipo, extra=None):
            self.send_response(estado)
            self.send_header("Content-Type", tipo)
            self.send_header("Content-Length", str(len(cuerpo)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("X-Frame-Options", "DENY")
            self.send_header("Referrer-Policy", "no-referrer")
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(cuerpo)

        def json(self, estado, datos):
            self._enviar(estado, json.dumps(datos, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")

        def _host_valido(self):
            if self.headers.get("Host") not in hosts:
                self.json(421, {"error": "Host no permitido"})
                return False
            return True

        # ── Archivos de la interfaz ─────────────────────────────────────────
        def do_GET(self):
            if not self._host_valido():
                return
            ruta = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
            if ruta in ("/", "/index.html"):
                return self._enviar(302, b"", "text/plain", {"Location": "/interfaz/prototipo/index.html"})
            if ruta == "/api/estado":
                return self.json(200, {"clave_configurada": bool(cfg.clave), "modelo": cfg.modelo})
            if not ruta.startswith(RUTAS_PUBLICAS) or any(s.startswith(".") for s in ruta.split("/") if s):
                return self.json(404, {"error": "No encontrado"})
            archivo = (RAIZ / ruta.lstrip("/")).resolve()
            try:
                archivo.relative_to(RAIZ)
            except ValueError:
                return self.json(404, {"error": "No encontrado"})
            if not archivo.is_file():
                return self.json(404, {"error": "No encontrado"})
            tipo = mimetypes.guess_type(archivo.name)[0] or "application/octet-stream"
            if tipo.startswith("text/") or tipo in ("application/javascript", "image/svg+xml"):
                tipo += "; charset=utf-8"
            self._enviar(200, archivo.read_bytes(), tipo)

        do_HEAD = do_GET

        def do_OPTIONS(self):   # mismo origen: no se necesita ni se ofrece CORS
            self.json(405, {"error": "Método no permitido"})

        # ── API del chat ────────────────────────────────────────────────────
        def do_POST(self):
            if not self._host_valido():
                return
            if urllib.parse.urlsplit(self.path).path != "/api/chat":
                return self.json(404, {"error": "Ruta inexistente"})
            origen = self.headers.get("Origin")
            if origen is not None and origen not in origenes:   # incluye «null»
                return self.json(403, {"error": "Origen no permitido"})
            if (self.headers.get("Content-Type") or "").split(";")[0].strip().lower() != "application/json":
                return self.json(415, {"error": "Se esperaba JSON"})
            try:
                largo = int(self.headers.get("Content-Length", ""))
            except ValueError:
                return self.json(411, {"error": "Falta Content-Length"})
            if not 1 <= largo <= MAX_CUERPO:
                return self.json(413, {"error": "Solicitud demasiado grande"})
            try:
                datos = json.loads(self.rfile.read(largo).decode("utf-8"))
            except (ValueError, UnicodeDecodeError):
                return self.json(400, {"error": "JSON inválido"})
            except OSError:
                return
            contenidos, error = validar_conversacion(datos)
            if error:
                return self.json(400, {"error": error})
            if not cfg.clave:
                return self.json(503, {"error": "Falta configurar la clave de Gemini en el servidor local."})
            if not cfg.permitir_consulta():
                return self.json(429, {"error": "Demasiadas preguntas seguidas. Espera un minuto (protección local de AIRI)."})
            if not cfg.ocupado.acquire(blocking=False):
                return self.json(429, {"error": "AIRI todavía está respondiendo otra pregunta."})
            try:
                estado, respuesta = consultar_gemini(cfg, contenidos)
            except Exception as exc:   # nunca se devuelve el detalle: podría contener datos internos
                print(f"[AIRI] Error interno ({type(exc).__name__})", file=sys.stderr)
                estado, respuesta = 500, {"error": "Error interno del servidor local."}
            finally:
                cfg.ocupado.release()
            self.json(estado, respuesta)

    return Manejador


def listar_modelos(cfg):
    req = urllib.request.Request(f"{cfg.base}/models?pageSize=200", headers={"x-goog-api-key": cfg.clave})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            modelos = json.load(r).get("models", [])
    except urllib.error.HTTPError as exc:
        print(f"Gemini respondió HTTP {exc.code} {_error_gemini(exc.read() or b'')}".rstrip())
        return 1
    except (urllib.error.URLError, OSError) as exc:
        print(f"No se pudo conectar con Gemini ({type(exc).__name__}).")
        return 1
    utiles = sorted(m["name"].split("/", 1)[-1] for m in modelos
                    if "generateContent" in m.get("supportedGenerationMethods", []))
    print("Modelos con generateContent disponibles para tu clave:")
    for nombre in utiles:
        print("  " + nombre + ("   ← predeterminado de AIRI" if nombre == MODELO_PREDETERMINADO else ""))
    print("Que un modelo aparezca aquí no garantiza que tenga nivel gratuito: compruébalo en Google AI Studio.")
    return 0


def obtener_clave():
    clave = os.environ.get("GEMINI_API_KEY", "").strip()
    if clave or not sys.stdin.isatty():
        return clave
    print("No hay GEMINI_API_KEY. Pega tu clave de Gemini (no se mostrará ni se guardará en disco).")
    print("Pulsa Enter sin escribir nada para iniciar sin clave (el chat mostrará un aviso).")
    return getpass.getpass("Clave: ").strip()


def main(argv=None):
    ap = argparse.ArgumentParser(description="Servidor local del chat de AIRI v0.5")
    ap.add_argument("--modelo", default=os.environ.get("AIRI_GEMINI_MODEL", MODELO_PREDETERMINADO))
    ap.add_argument("--puerto", type=int, default=PUERTO)
    ap.add_argument("--listar-modelos", action="store_true", help="muestra los modelos disponibles y termina")
    args = ap.parse_args(argv)
    cfg = Configuracion(obtener_clave(), args.modelo, base=os.environ.get("AIRI_GEMINI_BASE", BASE_GEMINI),
                        puerto=args.puerto)
    if args.listar_modelos:
        if not cfg.clave:
            print("Se necesita una clave para listar los modelos.")
            return 1
        return listar_modelos(cfg)
    servidor = ThreadingHTTPServer((HOST, cfg.puerto), crear_manejador(cfg))
    print(f"AIRI v0.5 · abre http://127.0.0.1:{cfg.puerto}/ en este equipo (Ctrl+C para detener).")
    print(f"Modelo: {cfg.modelo} · clave: {'configurada' if cfg.clave else 'NO configurada'}")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    finally:
        servidor.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
