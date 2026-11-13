"""
Prueba de extremo a extremo del chat de AIRI v0.5 en Chrome (escritorio y celular).

Arranca el servidor REAL (chat/servidor.py) en un puerto libre, conectado a un Gemini SIMULADO local
(sin internet ni clave real), y comprueba la interfaz, la seguridad visible y que v0.4 siga funcionando.

    python interfaz/chat/pruebas/e2e_chat.py [--chrome RUTA] [--capturas CARPETA]
"""
import argparse
import io
import sys
import tempfile
import threading
from http.server import ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(RAIZ / "chat"))
sys.path.insert(0, str(RAIZ / "chat" / "pruebas"))
import servidor  # noqa: E402
from test_servidor import CLAVE, GeminiSimulado  # noqa: E402

resultados = []


def comprobar(cond, nombre):
    resultados.append((bool(cond), nombre))
    print(("OK    " if cond else "FALLA ") + nombre)


def arrancar(clave, gemini):
    cfg = servidor.Configuracion(clave, "gemini-3.1-flash-lite", base=gemini.base, puerto=0, max_por_minuto=1000, tiempo=5)
    srv = ThreadingHTTPServer(("127.0.0.1", 0), servidor.crear_manejador(cfg))
    cfg.puerto = srv.server_address[1]
    srv.RequestHandlerClass = servidor.crear_manejador(cfg)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{cfg.puerto}/"


def respuesta(texto, motivo="STOP"):
    return (200, {"candidates": [{"content": {"parts": [{"text": texto}]}, "finishReason": motivo}]})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chrome", default="/usr/bin/google-chrome")
    ap.add_argument("--capturas", default=str(Path(tempfile.gettempdir()) / "airi-chat-capturas"))
    args = ap.parse_args()
    cap = Path(args.capturas); cap.mkdir(parents=True, exist_ok=True)
    registro = io.StringIO()          # registro del servidor: se revisa que no contenga la clave
    sys.stderr, stderr_original = registro, sys.stderr
    gemini = GeminiSimulado()
    srv, url = arrancar(CLAVE, gemini)
    gemini_sin, = [GeminiSimulado()]
    srv_sin, url_sin = arrancar("", gemini_sin)
    errores, externas = [], []

    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=args.chrome, args=["--no-sandbox"])

        def nueva(**kw):
            ctx = nav.new_context(viewport=kw.pop("viewport", {"width": 1366, "height": 900}), **kw)
            pg = ctx.new_page()
            pg.on("pageerror", lambda e: errores.append(f"pageerror: {e}"))
            pg.on("console", lambda m: m.type == "error" and errores.append(f"console: {m.text}"))
            pg.on("request", lambda r: not r.url.startswith(("http://127.0.0.1", "file://", "data:")) and externas.append(r.url))
            return ctx, pg

        lineas = lambda pg: pg.eval_on_selector_all("#airi-chat-log .airi-chat-line", "l => l.map(e => e.innerText)")
        flot = ".airi-m-flotante .airi-m-texto"

        # ── Escritorio ────────────────────────────────────────────────────────
        ctx, pg = nueva()
        pg.goto(url); pg.wait_for_timeout(800)
        comprobar(pg.url.endswith("/interfaz/prototipo/index.html"), "el servidor sirve la interfaz (raíz → prototipo)")
        pg.click('[data-tab="chat"]'); pg.wait_for_timeout(400)
        comprobar("Servidor local activo · modelo gemini-3.1-flash-lite" in pg.inner_text("#airi-chat-estado"),
                  "muestra el estado del servidor y el modelo (sin la clave)")
        comprobar("preguntas sobre acuarios marinos" in pg.inner_text(flot), "la mascota tiene un mensaje propio en Chat")
        pg.fill("#airi-chat-input", "¿Qué come un pez payaso?"); pg.click("#airi-chat-send"); pg.wait_for_timeout(300)
        comprobar(len(gemini.recibidas) == 0 and "marca la casilla" in lineas(pg)[-1],
                  "sin consentimiento no se envía nada a Gemini")
        pg.check("#airi-chat-consentimiento")
        gemini.retraso = 1.0; gemini.respuesta = respuesta("Come pequeños crustáceos y alimento preparado.")
        pg.click("#airi-chat-send"); pg.wait_for_timeout(300)
        comprobar(pg.is_disabled("#airi-chat-send") and "pensando" in lineas(pg)[-1] and
                  pg.get_attribute("#airi-chat-log", "aria-busy") == "true", "mientras espera: «pensando…», botón desactivado")
        pg.wait_for_timeout(1300)
        comprobar(lineas(pg)[-1] == "AIRI: Come pequeños crustáceos y alimento preparado." and not pg.is_disabled("#airi-chat-send"),
                  "muestra la respuesta de Gemini")
        enviado = gemini.recibidas[-1]
        cab = {k.lower(): v for k, v in enviado["cabeceras"].items()}
        comprobar(cab.get("x-goog-api-key") == CLAVE and [c["role"] for c in enviado["cuerpo"]["contents"]] == ["user"],
                  "el servidor añade la clave (el navegador no la tiene) y envía solo la conversación")
        gemini.retraso = 0
        gemini.respuesta = respuesta('<img src=x onerror="window.__pwn=1"><b>negrita</b>')
        pg.fill("#airi-chat-input", "¿Y para juveniles?"); pg.press("#airi-chat-input", "Enter"); pg.wait_for_timeout(800)
        comprobar(pg.locator("#airi-chat-log img, #airi-chat-log b").count() == 0 and pg.evaluate("window.__pwn") is None and
                  "<img src=x" in lineas(pg)[-1], "una respuesta con HTML se muestra como texto (sin inyección)")
        comprobar([c["role"] for c in gemini.recibidas[-1]["cuerpo"]["contents"]] == ["user", "model", "user"],
                  "las preguntas de seguimiento incluyen el contexto (Enter también envía)")
        comprobar(CLAVE not in pg.content(), "la clave no está en la página")

        gemini.respuesta = respuesta("Parcial", "MAX_TOKENS")
        pg.fill("#airi-chat-input", "Explícalo todo"); pg.click("#airi-chat-send"); pg.wait_for_timeout(800)
        comprobar("[Respuesta recortada por longitud.]" in lineas(pg)[-1], "avisa cuando la respuesta se recortó")
        gemini.respuesta = (429, {"error": {"status": "RESOURCE_EXHAUSTED"}})
        n_hist = len(gemini.recibidas)
        pg.fill("#airi-chat-input", "Otra"); pg.click("#airi-chat-send"); pg.wait_for_timeout(800)
        comprobar("nivel gratuito" in lineas(pg)[-1] and "airi-chat-error" in pg.eval_on_selector("#airi-chat-log p:last-child", "e => e.className"),
                  "cuota agotada: mensaje claro y marcado como error")
        gemini.respuesta = respuesta("Respuesta tras el error")
        pg.fill("#airi-chat-input", "Reintento"); pg.click("#airi-chat-send"); pg.wait_for_timeout(800)
        roles = [c["role"] for c in gemini.recibidas[-1]["cuerpo"]["contents"]]
        comprobar(roles.count("user") == roles.count("model") + 1 and "Otra" not in str(gemini.recibidas[-1]["cuerpo"]),
                  "la pregunta fallida no queda en el contexto")
        estilo = pg.evaluate("""(() => { const c = getComputedStyle(document.querySelector('.airi-chat-consentimiento'));
            const e = document.querySelector('.airi-chat-etiqueta').getBoundingClientRect(), i = document.querySelector('#airi-chat-input').getBoundingClientRect();
            return [c.display, c.fontWeight, e.bottom <= i.top + 1]; })()""")
        comprobar(estilo == ["flex", "400", True], f"los estilos del chat se aplican (consentimiento en línea, etiqueta encima) {estilo}")
        pg.screenshot(path=str(cap / "01_escritorio_chat.png"))

        gemini.retraso = 2.0; gemini.respuesta = respuesta("RESPUESTA ATRASADA")
        pg.fill("#airi-chat-input", "Pregunta lenta"); pg.click("#airi-chat-send"); pg.wait_for_timeout(300)
        pg.click("#airi-chat-clear"); pg.wait_for_timeout(2400)
        comprobar(lineas(pg) == ["AIRI: Conversación nueva. ¿Qué te gustaría saber del acuario?"] and not pg.is_disabled("#airi-chat-send"),
                  "«Nueva conversación» durante una espera descarta la respuesta atrasada")
        gemini.retraso = 0

        # El motor v0.4 sigue funcionando servido por http
        pg.click('[data-tab="agua"]')
        for i, v in enumerate(["26", "8.4", "", "0.8", "0.1", "10"]):
            pg.fill(f"#p{i}", v)
        pg.click("#evaluar"); pg.wait_for_timeout(1200)
        comprobar(pg.get_attribute(".airi-a", "data-clasificacion") == "R4" and
                  pg.evaluate("document.querySelector('.airi-m-flotante .airi-m-pez').classList.contains('airi-m-estado-alerta')"),
                  "v0.4 intacto: análisis R4 y mascota en alerta con la página servida por el servidor local")
        ctx.close()

        # ── Celular ───────────────────────────────────────────────────────────
        ctx, pg = nueva(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
        pg.goto(url); pg.wait_for_timeout(800)
        pg.tap('[data-tab="chat"]'); pg.wait_for_timeout(400)
        pg.tap("#airi-chat-consentimiento")
        gemini.respuesta = respuesta("Necesita agua estable, rocas vivas y una dieta variada. " * 4)
        pg.tap("#airi-chat-input"); pg.fill("#airi-chat-input", "¿Qué necesita un pez payaso?"); pg.wait_for_timeout(300)
        solapa = pg.evaluate("""(() => { const a = document.querySelector('#airi-chat-input').getBoundingClientRect();
            const g = document.querySelector('.airi-m-flotante .airi-m-globo'); const v = g && !g.hidden && getComputedStyle(g).display !== 'none';
            if (!v) return false; const b = g.getBoundingClientRect();
            return !(b.right < a.left || b.left > a.right || b.bottom < a.top || b.top > a.bottom); })()""")
        comprobar(not solapa, "celular: al escribir, el globo de la mascota no tapa el campo de pregunta")
        pg.tap("#airi-chat-send"); pg.wait_for_timeout(900)
        comprobar("dieta variada" in lineas(pg)[-1], "celular: envía y muestra la respuesta")
        ancho = pg.evaluate("[document.documentElement.scrollWidth, innerWidth]")
        comprobar(ancho[0] <= ancho[1], f"celular: sin desplazamiento horizontal {ancho}")
        botones = pg.eval_on_selector_all("#airi-chat-form button", "l => l.map(b => b.getBoundingClientRect().height)")
        comprobar(all(h >= 40 for h in botones), f"celular: botones con altura táctil suficiente {botones}")
        pg.screenshot(path=str(cap / "02_celular_chat.png"))
        ctx.close()

        # ── Abierto con doble clic (file://): no intenta conectarse ───────────
        ctx, pg = nueva()
        peticiones = []
        pg.on("request", lambda r: peticiones.append(r.url))
        pg.goto((RAIZ / "interfaz" / "prototipo" / "index.html").as_uri()); pg.wait_for_timeout(600)
        pg.click('[data-tab="chat"]'); pg.wait_for_timeout(300)
        comprobar(pg.is_disabled("#airi-chat-input") and "python chat/servidor.py" in lineas(pg)[0] and
                  not any("127.0.0.1" in u for u in peticiones), "con file:// explica cómo usarlo y no intenta conectarse")
        pg.screenshot(path=str(cap / "03_file_sin_servidor.png"))
        ctx.close()

        # ── Servidor sin clave ────────────────────────────────────────────────
        ctx, pg = nueva()
        pg.goto(url_sin); pg.wait_for_timeout(600)
        pg.click('[data-tab="chat"]'); pg.wait_for_timeout(400)
        pg.check("#airi-chat-consentimiento"); pg.fill("#airi-chat-input", "hola"); pg.click("#airi-chat-send"); pg.wait_for_timeout(600)
        comprobar("sin clave de Gemini" in pg.inner_text("#airi-chat-estado") and "Falta configurar la clave" in lineas(pg)[-1] and
                  gemini_sin.recibidas == [], "sin clave: lo indica y no llama a Gemini")
        ctx.close()

        # ── Servidor apagado después de cargar ────────────────────────────────
        ctx, pg = nueva()
        pg.goto(url_sin); pg.wait_for_timeout(500)
        pg.click('[data-tab="chat"]'); pg.check("#airi-chat-consentimiento")
        srv_sin.shutdown(); srv_sin.server_close()
        pg.fill("#airi-chat-input", "hola"); pg.click("#airi-chat-send"); pg.wait_for_timeout(1500)
        comprobar("servidor local" in lineas(pg)[-1], "servidor apagado: mensaje de conexión, sin afectar a la página")
        errores[:] = [e for e in errores if "Failed to load resource" not in e and "ERR_CONNECTION_REFUSED" not in e]
        ctx.close()
        nav.close()

    sys.stderr = stderr_original
    comprobar(CLAVE not in registro.getvalue() and "POST /api/chat" in registro.getvalue(),
              "el registro del servidor anota las peticiones pero nunca la clave")
    comprobar(not externas, f"sin peticiones a servicios externos desde el navegador {externas[:3]}")
    comprobar(not errores, f"sin errores de JavaScript {errores[:3]}")
    srv.shutdown(); gemini.cerrar(); gemini_sin.cerrar()
    fallas = [n for ok, n in resultados if not ok]
    print(f"\n{len(resultados) - len(fallas)} de {len(resultados)} comprobaciones superadas. Capturas en {cap}")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
