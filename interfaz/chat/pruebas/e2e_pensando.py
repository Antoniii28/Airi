"""
v0.6 E4 · Animación de «pensando» de la mascota mientras Gemini responde (Chrome, escritorio y celular).

Servidor REAL + Gemini SIMULADO (con retraso) + voz SIMULADA. Comprueba transiciones, que la animación sea
discreta (todas las animaciones activas ≥ 1,4 s, sin anillos de escaneo), movimiento reducido y que no
interfiera con la voz ni con los controles de E2–E3. Guarda capturas de la mascota pensando.

    python interfaz/chat/pruebas/e2e_pensando.py [--chrome RUTA] [--capturas CARPETA]
"""
import argparse
import io
import json
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
PEZ = ".airi-m-flotante .airi-m-pez"
resultados = []


def comprobar(cond, nombre):
    resultados.append((bool(cond), nombre))
    print(("OK    " if cond else "FALLA ") + nombre)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chrome", default="/usr/bin/google-chrome")
    ap.add_argument("--capturas", default=str(Path(tempfile.gettempdir()) / "airi-pensando"))
    args = ap.parse_args()
    cap = Path(args.capturas); cap.mkdir(parents=True, exist_ok=True)
    registro = io.StringIO()
    sys.stderr, stderr_original = registro, sys.stderr
    gemini = GeminiSimulado()
    srv, url = arrancar(CLAVE, gemini)
    errores = []

    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=args.chrome, args=["--no-sandbox"])

        def nueva(**kw):
            ctx = nav.new_context(viewport=kw.pop("viewport", {"width": 1366, "height": 900}), **kw)
            ctx.add_init_script("window.__CFG_VOZ = " + json.dumps({"voces": [SABINA], "duracion": 900}) + ";")
            ctx.add_init_script(path=str(SIMULADOR))
            pg = ctx.new_page()
            pg.on("pageerror", lambda e: errores.append(str(e)))
            pg.on("console", lambda m: m.type == "error" and errores.append(m.text))
            pg.goto(url); pg.wait_for_timeout(700)
            pg.click('[data-tab="chat"]'); pg.wait_for_timeout(300)
            pg.check("#airi-chat-consentimiento")
            return ctx, pg

        def enviar(pg, texto, retraso=1.5, resp=None):
            gemini.retraso = retraso
            gemini.respuesta = resp or respuesta("Los juveniles comen **varias veces** al día.")
            pg.fill("#airi-chat-input", texto); pg.click("#airi-chat-send"); pg.wait_for_timeout(300)

        estado = lambda pg: pg.evaluate("window.airiMascota.estado")
        clase = lambda pg, c: pg.evaluate(f"document.querySelector('{PEZ}').classList.contains('{c}')")
        animaciones = lambda pg: pg.evaluate(f"""[...document.querySelectorAll('{PEZ} *')].map(e => getComputedStyle(e))
            .filter(s => s.animationName !== 'none' && s.display !== 'none')
            .map(s => [s.animationName, parseFloat(s.animationDuration)])""")
        puntos = lambda pg: pg.evaluate(f"""(() => {{ const s = document.querySelector('{PEZ} .airi-m-senal');
            return [getComputedStyle(s).display, s.querySelectorAll('.airi-m-punto').length]; }})()""")

        # ── Escritorio: pensando → reposo (lectura desactivada) ──────────────
        ctx, pg = nueva()
        globo = pg.inner_text(".airi-m-flotante .airi-m-texto")
        enviar(pg, "¿Qué comen los juveniles?")
        anim = animaciones(pg)
        comprobar(estado(pg) == "pensando" and clase(pg, "airi-m-estado-pensando") and not clase(pg, "airi-m-estado-analisis"),
                  "mientras Gemini responde, la mascota está en «pensando» (ya no usa «analisis»)")
        comprobar(puntos(pg) == ["flex", 3], "aparece la burbuja de pensamiento con tres puntos")
        comprobar(anim and all(d >= 1.4 for _, d in anim) and not any(n == "airi-m-escaneo" for n, _ in anim),
                  f"animación discreta: todas ≥ 1,4 s y sin anillos de escaneo {sorted(set(map(tuple, anim)))}")
        comprobar(pg.inner_text(".airi-m-flotante .airi-m-texto") == globo and pg.evaluate("window.__voz.habladas") == [],
                  "pensar no cambia el mensaje del globo ni habla")
        pg.locator(".airi-m-flotante").screenshot(path=str(cap / "01_pensando_escritorio.png"))
        pg.wait_for_timeout(1500)
        comprobar(estado(pg) == "espera" and puntos(pg)[0] == "none" and not clase(pg, "airi-m-hablando"),
                  "llega la respuesta con lectura desactivada: vuelve a reposo y la burbuja desaparece")

        # ── pensando → habla (lectura activada) → reposo ─────────────────────
        pg.click("#airi-chat-voz-leer")
        enviar(pg, "¿Y los adultos?", retraso=1.0)
        comprobar(estado(pg) == "pensando" and not clase(pg, "airi-m-hablando"), "con la lectura activada, primero piensa")
        pg.wait_for_timeout(1050)
        comprobar(estado(pg) == "espera" and clase(pg, "airi-m-hablando") and puntos(pg)[0] == "none" and
                  pg.evaluate("window.__voz.habladas")[-1]["voice"] == SABINA["name"],
                  "al llegar la respuesta pasa a hablar con Sabina (sin burbuja de pensamiento)")
        pg.locator(".airi-m-flotante").screenshot(path=str(cap / "02_hablando_escritorio.png"))
        pg.wait_for_timeout(1500)
        comprobar(estado(pg) == "espera" and not clase(pg, "airi-m-hablando"), "al terminar de hablar vuelve a reposo")

        # Una pregunta nueva mientras habla: deja de hablar y piensa
        enviar(pg, "Larga", retraso=0, resp=respuesta("Respuesta larga para leer. " * 8)); pg.wait_for_timeout(200)
        enviar(pg, "Otra", retraso=1.0)
        comprobar(estado(pg) == "pensando" and not clase(pg, "airi-m-hablando"),
                  "pregunta nueva mientras habla: se calla y vuelve a pensar")
        pg.wait_for_timeout(1300)

        # Errores y «Nueva conversación»
        pg.click("#airi-chat-voz-leer")
        enviar(pg, "Error", retraso=0.8, resp=(429, {"error": {"status": "RESOURCE_EXHAUSTED"}}))
        pg.wait_for_timeout(900)
        comprobar(estado(pg) == "espera", "si Gemini devuelve un error, la mascota vuelve a reposo")
        enviar(pg, "Lenta", retraso=2.0)
        pg.click("#airi-chat-clear"); pg.wait_for_timeout(150)
        comprobar(estado(pg) == "espera" and puntos(pg)[0] == "none", "«Nueva conversación» durante la espera: vuelve a reposo")
        pg.wait_for_timeout(2000)

        # El análisis del agua sigue usando «analisis» (sin cambios)
        pg.click('[data-tab="agua"]'); pg.click("#evaluar"); pg.wait_for_timeout(150)
        comprobar(estado(pg) == "analisis", "el análisis del agua conserva su animación demostrativa «analisis»")
        pg.wait_for_timeout(1200)
        ctx.close()

        # ── Movimiento reducido ──────────────────────────────────────────────
        ctx, pg = nueva(reduced_motion="reduce")
        enviar(pg, "Hola", retraso=1.2)
        anim = animaciones(pg)
        opac = pg.eval_on_selector_all(f"{PEZ} .airi-m-punto", "l => l.map(e => getComputedStyle(e).opacity)")
        comprobar(estado(pg) == "pensando" and anim == [] and puntos(pg) == ["flex", 3] and all(o == "0.9" for o in opac),
                  f"movimiento reducido: sin animaciones, con tres puntos fijos visibles {opac}")
        pg.locator(".airi-m-flotante").screenshot(path=str(cap / "03_pensando_reducido.png"))
        pg.wait_for_timeout(1300)
        ctx.close()

        # ── Celular ──────────────────────────────────────────────────────────
        ctx, pg = nueva(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
        enviar(pg, "¿Qué comen?", retraso=1.5)
        caja = pg.evaluate(f"(() => {{ const r = document.querySelector('{PEZ} .airi-m-senal').getBoundingClientRect(); return [r.left, r.right, r.top, innerWidth]; }})()")
        comprobar(estado(pg) == "pensando" and caja[0] >= 0 and caja[1] <= caja[3] and caja[2] >= 0,
                  f"celular: la burbuja de pensamiento cabe en la pantalla {[round(x) for x in caja]}")
        pg.screenshot(path=str(cap / "04_pensando_celular.png"))
        pg.wait_for_timeout(1500)
        comprobar(estado(pg) == "espera", "celular: vuelve a reposo al llegar la respuesta")
        ctx.close()
        nav.close()

    sys.stderr = stderr_original
    # El 429 provocado a propósito aparece como «Failed to load resource» en la consola: no es un error de JS.
    errores[:] = [e for e in errores if "Failed to load resource" not in e]
    comprobar(not errores, f"sin errores de JavaScript {errores[:3]}")
    comprobar(CLAVE not in registro.getvalue(), "la clave no aparece en el registro")
    srv.shutdown(); gemini.cerrar()
    fallas = [n for ok, n in resultados if not ok]
    print(f"\n{len(resultados) - len(fallas)} de {len(resultados)} comprobaciones superadas. Capturas en {cap}")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    _err = sys.stderr
    try:
        main()
    finally:
        sys.stderr = _err
