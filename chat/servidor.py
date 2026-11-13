"""Servidor local de AIRI v0.5. Solo biblioteca estándar; no publicar en hosting estático."""
import json
import os
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = "127.0.0.1"
PORT = 8765
MODEL = os.environ.get("AIRI_GEMINI_MODEL", "gemini-2.5-flash")
SYSTEM = (
    "Eres AIRI, asistente educativo sobre acuarios marinos. Responde en español claro, "
    "distingue hechos de incertidumbre y no inventes referencias. No diagnostiques "
    "enfermedades ni garantices seguridad del agua. No ejecutes acciones físicas. "
    "Las evaluaciones científicas de parámetros pertenecen exclusivamente al motor "
    "de reglas de AIRI v0.4; nunca afirmes haberlas recalculado. "
    "Cuando no tengas fuentes recientes, dilo. Si usas búsqueda, cita enlaces verificables."
)

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "null")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.end_headers()

    def reply(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "null")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/api/chat":
            return self.reply(404, {"error": "Ruta inexistente"})
        if self.headers.get("Origin") not in (None, "null", "http://127.0.0.1:8765", "http://localhost:8765"):
            return self.reply(403, {"error": "Origen no permitido"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > 30000:
                return self.reply(413, {"error": "Solicitud demasiado grande"})
            request = json.loads(self.rfile.read(length))
            messages = request.get("messages", [])
            if not isinstance(messages, list) or not 1 <= len(messages) <= 12:
                return self.reply(400, {"error": "Conversación inválida"})
            contents = []
            for m in messages:
                if not isinstance(m, dict) or m.get("role") not in ("user", "model") or not isinstance(m.get("text"), str) or not 1 <= len(m["text"]) <= 2500:
                    return self.reply(400, {"error": "Mensaje inválido"})
                contents.append({"role": m["role"], "parts": [{"text": m["text"]}]})
            if contents[-1]["role"] != "user":
                return self.reply(400, {"error": "El último mensaje debe ser del usuario"})
            key = os.environ.get("GEMINI_API_KEY")
            if not key:
                return self.reply(503, {"error": "Falta configurar GEMINI_API_KEY en el servidor local"})
            payload = json.dumps({
                "systemInstruction": {"parts": [{"text": SYSTEM}]},
                "contents": contents,
                "generationConfig": {"maxOutputTokens": 700, "temperature": 0.35}
            }).encode("utf-8")
            endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent"
            req = urllib.request.Request(endpoint, data=payload, headers={
                "Content-Type": "application/json", "x-goog-api-key": key
            }, method="POST")
            with urllib.request.urlopen(req, timeout=35) as response:
                result = json.load(response)
            answer = "".join(p.get("text", "") for c in result.get("candidates", []) for p in c.get("content", {}).get("parts", []) if isinstance(p, dict))
            if not answer.strip():
                return self.reply(502, {"error": "El proveedor no devolvió texto"})
            self.reply(200, {"answer": answer[:12000]})
        except urllib.error.HTTPError as exc:
            if exc.code == 429:
                self.reply(429, {"error": "Se alcanzó el límite de consultas del proveedor. Intenta más tarde."})
            elif exc.code in (401, 403):
                self.reply(502, {"error": "La clave o el acceso al modelo no están autorizados."})
            else:
                self.reply(502, {"error": "No se pudo completar la consulta con Gemini."})
        except (ValueError, json.JSONDecodeError):
            self.reply(400, {"error": "JSON inválido"})
        except Exception:
            self.reply(502, {"error": "No se pudo conectar con el proveedor"})

if __name__ == "__main__":
    print(f"AIRI API local: http://{HOST}:{PORT} (solo escucha en este equipo)")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
