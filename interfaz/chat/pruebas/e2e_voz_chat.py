"""
v0.6 E2–E3 · Lectura en voz alta de las respuestas del chat, en Chrome (escritorio y celular).

Servidor REAL (chat/servidor.py) + Gemini SIMULADO + speechSynthesis SIMULADO (simulador_voz.js), con voces como
las de Windows (Sabina, Raúl, Helena y una en línea). Sin internet, sin clave real, sin micrófono.

    python interfaz/chat/pruebas/e2e_voz_chat.py [--chrome RUTA] [--capturas CARPETA]
"""
import argparse
import io
import json
import re
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(RAIZ / "chat")); sys.path.insert(0, str(RAIZ / "chat" / "pruebas"))
sys.path.insert(0, str(RAIZ / "interfaz" / "chat" / "pruebas"))
from test_servidor import CLAVE, GeminiSimulado  # noqa: E402
from e2e_chat import arrancar, respuesta  # noqa: E402

SIMULADOR = RAIZ / "interfaz" / "mascota" / "pruebas" / "simulador_voz.js"
SABINA = {"name": "Microsoft Sabina - Spanish (Mexico)", "lang": "es-MX", "localService": True, "voiceURI": "sabina"}
RAUL = {"name": "Microsoft Raul - Spanish (Mexico)", "lang": "es-MX", "localService": True, "voiceURI": "raul"}
HELENA = {"name": "Microsoft Helena - Spanish (Spain)", "lang": "es-ES", "localService": True, "voiceURI": "helena", "default": True}
DALIA = {"name": "Microsoft Dalia Online (Natural) - Spanish (Mexico)", "lang": "es-MX", "localService": False, "voiceURI": "dalia"}
TABLA = ("Para juveniles:\n\n| Alimento | Frecuencia |\n|---|---|\n| **Pellets** pequeños | 2–3 veces al día |\n"
         "| Artemia | 1 vez al día |\n\n- Observa su apetito\n- Consulta a un *especialista* si deja de comer")
resultados = []


def comprobar(cond, nombre):
    resultados.append((bool(cond), nombre))
    print(("OK    " if cond else "FALLA ") + nombre)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chrome", default="/usr/bin/google-chrome")
    ap.add_argument("--capturas", default=str(Path(tempfile.gettempdir()) / "airi-voz-chat"))
    args = ap.parse_args()
    cap = Path(args.capturas); cap.mkdir(parents=True, exist_ok=True)
    registro = io.StringIO()
    sys.stderr, stderr_original = registro, sys.stderr
    gemini = GeminiSimulado()
    srv, url = arrancar(CLAVE, gemini)
    errores, externas = [], []

    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=args.chrome, args=["--no-sandbox"])

        def nueva(voces=(SABINA, RAUL, HELENA, DALIA), duracion=900, sin_soporte=False, **kw):
            ctx = nav.new_context(viewport=kw.pop("viewport", {"width": 1366, "height": 900}), **kw)
            ctx.add_init_script("window.__CFG_VOZ = " + json.dumps({"voces": list(voces), "duracion": duracion, "sinSoporte": sin_soporte}) + ";")
            ctx.add_init_script(path=str(SIMULADOR))
            ctx.add_init_script("window.__reconocimientos = 0; window.SpeechRecognition = window.webkitSpeechRecognition ="
                                " function () { window.__reconocimientos++; this.start = function () {}; };")
            pg = ctx.new_page()
            pg.on("pageerror", lambda e: errores.append(f"pageerror: {e}"))
            pg.on("console", lambda m: m.type == "error" and errores.append(f"console: {m.text}"))
            pg.on("request", lambda r: not r.url.startswith(("http://127.0.0.1", "data:")) and externas.append(r.url))
            pg.goto(url); pg.wait_for_timeout(700)
            pg.click('[data-tab="chat"]'); pg.wait_for_timeout(300)
            pg.check("#airi-chat-consentimiento")
            return ctx, pg

        def preguntar(pg, texto, resp=TABLA, espera=600):
            gemini.respuesta = respuesta(resp)
            pg.fill("#airi-chat-input", texto); pg.click("#airi-chat-send"); pg.wait_for_timeout(espera)

        habladas = lambda pg: pg.evaluate("window.__voz.habladas")
        hablando = lambda pg: pg.evaluate("document.querySelector('.airi-m-flotante .airi-m-pez').classList.contains('airi-m-hablando')")

        # ── Escritorio ────────────────────────────────────────────────────────
        ctx, pg = nueva()
        comprobar(pg.inner_text("#airi-chat-voz-leer") == "Leer respuestas: desactivado" and
                  pg.get_attribute("#airi-chat-voz-leer", "aria-pressed") == "false",
                  "la lectura empieza DESACTIVADA (navegador sin preferencia guardada)")
        comprobar(pg.inner_text("#airi-chat-voz-estado") == "Voz: Sabina (es-MX, en este equipo)",
                  "voz predeterminada: Microsoft Sabina (es-MX, local), aunque Raúl también es es-MX")
        preguntar(pg, "¿Qué comen los juveniles?")
        comprobar(habladas(pg) == [] and pg.locator(".airi-chat-model .airi-chat-escuchar").count() == 1,
                  "con la lectura desactivada no habla; cada respuesta ofrece «Escuchar»")

        pg.click(".airi-chat-model .airi-chat-escuchar"); pg.wait_for_timeout(150)
        h = habladas(pg)
        texto = " ".join(x["text"] for x in h)
        esperado = pg.evaluate("AIRIVoz.prosodia(window.airiInteraccion.voz.config, 'conversacion')")
        comprobar(h and all(x["voice"] == SABINA["name"] and x["lang"] == "es-MX" for x in h),
                  "«Escuchar» lee la respuesta con la voz de Sabina")
        comprobar(not re.search(r"[*#|`_]", texto) and "Tabla con 2 filas" in texto and "Alimento, Pellets pequeños" in texto and
                  "2 a 3 veces al día" in texto and "Observa su apetito." in texto,
                  f"lee tablas y listas como frases, sin símbolos: {texto[:140]!r}")
        comprobar(h[0]["rate"] == esperado["velocidad"] and h[0]["pitch"] == esperado["tono"],
                  f"entonación de conversación (tono {h[0]['pitch']}, velocidad {h[0]['rate']})")
        comprobar(hablando(pg) and pg.is_visible("#airi-chat-voz-detener"), "mientras habla: la mascota anima el habla y aparece «Detener voz»")
        pg.screenshot(path=str(cap / "01_escritorio_hablando.png"))
        pg.click("#airi-chat-voz-detener"); pg.wait_for_timeout(150)
        comprobar(not hablando(pg) and pg.is_hidden("#airi-chat-voz-detener") and
                  pg.evaluate("window.airiMascota.estado") == "espera", "«Detener voz» corta la lectura y la mascota vuelve a reposo")

        pg.click("#airi-chat-voz-leer"); pg.wait_for_timeout(100)
        comprobar(pg.get_attribute("#airi-chat-voz-leer", "aria-pressed") == "true" and
                  pg.inner_text(".airi-m-flotante .airi-m-btn-voz") == "Voz activada",
                  "«Leer respuestas» y el botón de voz de la mascota son el mismo interruptor")
        n = len(habladas(pg))
        preguntar(pg, "¿Y los adultos?", "Los adultos comen **dos veces** al día.", espera=300)
        nuevas = habladas(pg)[n:]
        comprobar([x["text"] for x in nuevas] == ["Los adultos comen dos veces al día."],
                  "con la lectura activada, cada respuesta nueva se lee automáticamente")
        pg.wait_for_timeout(1200)
        comprobar(not hablando(pg), "al terminar la lectura la mascota deja de hablar (reposo)")

        # Una sola lectura a la vez
        preguntar(pg, "Primera", "Primera respuesta larga. " * 6, espera=300)
        canc = pg.evaluate("window.__voz.cancelaciones")
        preguntar(pg, "Segunda", "Segunda respuesta.", espera=300)
        cola = pg.evaluate("window.__vozCola()")
        comprobar(pg.evaluate("window.__voz.cancelaciones") > canc and cola == ["Segunda respuesta."],
                  f"una pregunta nueva corta la lectura anterior: nunca hay dos respuestas sonando {cola}")
        pg.wait_for_timeout(300)
        preguntar(pg, "Larga", "Texto largo para leer. " * 6, espera=300)
        pg.click("#airi-chat-clear"); pg.wait_for_timeout(150)
        comprobar(pg.evaluate("window.__vozCola()") == [] and not hablando(pg), "«Nueva conversación» detiene la voz")

        pg.click("#airi-chat-voz-leer"); pg.wait_for_timeout(100)
        n = len(habladas(pg))
        preguntar(pg, "Otra", "Respuesta sin leer.")
        comprobar(len(habladas(pg)) == n and pg.get_attribute("#airi-chat-voz-leer", "aria-pressed") == "false",
                  "al desactivar la lectura, las respuestas ya no se leen")
        comprobar(pg.evaluate("window.__voz.micro") == 0 and pg.evaluate("window.__reconocimientos") == 0,
                  "nunca se pide el micrófono ni se crea un reconocimiento de voz")
        ctx.close()

        # ── Preferencia recordada y alternativas de voz ──────────────────────
        ctx, pg = nueva(voces=(RAUL, HELENA, DALIA))
        comprobar(pg.inner_text("#airi-chat-voz-estado") == "Voz: Raul (es-MX, en este equipo)",
                  "sin Sabina: otra voz LOCAL de México (Raúl)")
        ctx.close()
        ctx, pg = nueva(voces=(HELENA,))
        comprobar(pg.inner_text("#airi-chat-voz-estado") == "Voz: Helena (es-ES, en este equipo)", "sin voces de México: la local de España")
        ctx.close()
        ctx, pg = nueva(voces=(DALIA,))
        comprobar("Solo hay voces en español en línea" in pg.inner_text("#airi-chat-voz-estado"),
                  "una voz en línea NO se usa sin autorizarla (privacidad)")
        ctx.close()
        ctx, pg = nueva(sin_soporte=True)
        comprobar(pg.is_disabled("#airi-chat-voz-leer") and "no puede leer en voz alta" in pg.inner_text("#airi-chat-voz-estado"),
                  "navegador sin síntesis de voz: lo indica y el chat sigue por escrito")
        ctx.close()

        # ── Movimiento reducido ──────────────────────────────────────────────
        ctx, pg = nueva(reduced_motion="reduce")
        preguntar(pg, "Hola", "Hola.")
        pg.click(".airi-chat-model .airi-chat-escuchar"); pg.wait_for_timeout(150)
        anim = pg.eval_on_selector(".airi-m-flotante .airi-m-pez .airi-m-capas", "e => getComputedStyle(e).animationName")
        comprobar(hablando(pg) and anim == "none", f"movimiento reducido: indica que habla sin animación de movimiento ({anim})")
        ctx.close()

        # ── Celular ──────────────────────────────────────────────────────────
        ctx, pg = nueva(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
        pg.tap("#airi-chat-voz-leer")
        preguntar(pg, "¿Qué comen?", TABLA, espera=300)
        ancho = pg.evaluate("[document.documentElement.scrollWidth, innerWidth]")
        alturas = pg.eval_on_selector_all(".airi-chat-voz button:not([hidden])", "l => l.map(b => b.getBoundingClientRect().height)")
        comprobar(ancho[0] <= ancho[1] and all(a >= 44 for a in alturas) and hablando(pg),
                  f"celular: controles táctiles, sin desplazamiento horizontal y lectura activa {ancho} {alturas}")
        pg.locator(".airi-chat-voz").scroll_into_view_if_needed()
        pg.screenshot(path=str(cap / "02_celular_voz.png"))
        ctx.close()
        nav.close()

    sys.stderr = stderr_original
    comprobar(CLAVE not in registro.getvalue(), "la clave nunca aparece en el registro del servidor")
    comprobar(not externas, f"sin peticiones externas {externas[:3]}")
    comprobar(not errores, f"sin errores de JavaScript {errores[:3]}")
    srv.shutdown(); gemini.cerrar()
    fallas = [n for ok, n in resultados if not ok]
    print(f"\n{len(resultados) - len(fallas)} de {len(resultados)} comprobaciones superadas. Capturas en {cap}")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
