"""
v0.6 E5–E6 · Dictado por micrófono en el chat (Chrome, escritorio y celular).

Servidor REAL + Gemini SIMULADO + voz SIMULADA (Sabina) + SpeechRecognition SIMULADO: no se usa el micrófono
real ni la clave real. Comprueba los tres niveles (en el equipo, descarga con autorización, en línea con
consentimiento), la transcripción editable, los errores, el navegador sin soporte, los turnos
(escuchando → pensando → hablando → reposo), que AIRI no se escuche a sí misma, teclado, movimiento reducido
y diseño de celular.

    python interfaz/chat/pruebas/e2e_microfono.py [--chrome RUTA] [--capturas CARPETA]
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

SIM_VOZ = RAIZ / "interfaz" / "mascota" / "pruebas" / "simulador_voz.js"
SIM_REC = RAIZ / "interfaz" / "chat" / "pruebas" / "simulador_reconocimiento.js"
SABINA = {"name": "Microsoft Sabina - Spanish (Mexico)", "lang": "es-MX", "localService": True, "voiceURI": "sabina"}
FRASE = "¿Qué comen los peces payaso?"
resultados = []


def comprobar(cond, nombre):
    resultados.append((bool(cond), nombre))
    print(("OK    " if cond else "FALLA ") + nombre)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chrome", default="/usr/bin/google-chrome")
    ap.add_argument("--capturas", default=str(Path(tempfile.gettempdir()) / "airi-microfono"))
    args = ap.parse_args()
    cap = Path(args.capturas); cap.mkdir(parents=True, exist_ok=True)
    registro = io.StringIO()
    sys.stderr, stderr_original = registro, sys.stderr
    gemini = GeminiSimulado()
    srv, url = arrancar(CLAVE, gemini)
    errores = []

    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=args.chrome, args=["--no-sandbox"])

        def nueva(rec=None, consentir=True, **kw):
            ctx = nav.new_context(viewport=kw.pop("viewport", {"width": 1366, "height": 900}), **kw)
            ctx.add_init_script("window.__CFG_VOZ = " + json.dumps({"voces": [SABINA], "duracion": 900}) + ";")
            ctx.add_init_script("window.__CFG_REC = " + json.dumps(rec or {}) + ";")
            ctx.add_init_script(path=str(SIM_VOZ)); ctx.add_init_script(path=str(SIM_REC))
            pg = ctx.new_page()
            pg.on("pageerror", lambda e: errores.append(str(e)))
            pg.on("console", lambda m: m.type == "error" and errores.append(m.text))
            pg.goto(url); pg.wait_for_timeout(700)
            pg.click('[data-tab="chat"]'); pg.wait_for_timeout(300)
            if consentir: pg.check("#airi-chat-consentimiento")
            return ctx, pg

        R = lambda pg, k: pg.evaluate(f"window.__rec.{k}")
        turno = lambda pg: pg.get_attribute("#airi-chat-turno", "data-turno")
        aviso = lambda pg: pg.inner_text("#airi-chat-micro-aviso")
        visible = lambda pg, s: pg.is_visible(s)
        usuarios = lambda pg: pg.evaluate("[...document.querySelectorAll('.airi-chat-user .airi-chat-cuerpo')].map(e => e.textContent)")
        a_gemini = lambda: len([r for r in gemini.recibidas if "generateContent" in r["ruta"]])

        # ── 1. Reconocimiento en el equipo (nivel preferido) ─────────────────
        ctx, pg = nueva()
        comprobar(R(pg, "creados") == 0 and pg.evaluate("window.__voz.micro") == 0 and turno(pg) == "reposo",
                  "al abrir: el micrófono no se activa solo (sin reconocimiento ni getUserMedia) y AIRI está en reposo")
        comprobar(R(pg, "consultas") == [{"langs": ["es-MX"], "processLocally": True}] and
                  pg.is_enabled("#airi-chat-micro-hablar") and "no sale de tu computadora" in aviso(pg),
                  "consulta el reconocimiento en el equipo para es-MX y lo prioriza")
        comprobar(not visible(pg, "#airi-chat-micro-remoto") and not visible(pg, "#airi-chat-micro-descargar"),
                  "en el equipo: no pide consentimiento en línea ni descarga")
        ctx.close()
        ctx, pg = nueva({"retraso": 2500})   # escucha larga para observarla
        pg.fill("#airi-chat-input", "texto previo")
        pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(200)
        ini = R(pg, "inicios")
        comprobar(ini == [{"lang": "es-MX", "local": True, "continuo": False, "parciales": True}],
                  f"escucha una sola frase en es-MX y en el equipo {ini}")
        comprobar(turno(pg) == "escuchando" and pg.get_attribute("#airi-chat-micro-hablar", "aria-pressed") == "true"
                  and visible(pg, "#airi-chat-micro-cancelar") and "Escuchando" in pg.inner_text("#airi-chat-turno"),
                  "estado visible «Escuchando», botón presionado y «Cancelar dictado»")
        pg.screenshot(path=str(cap / "01_escuchando_escritorio.png"))
        pg.click("#airi-chat-micro-cancelar"); pg.wait_for_timeout(200)
        comprobar(R(pg, "abortos") == 1 and turno(pg) == "reposo" and pg.input_value("#airi-chat-input") == "texto previo",
                  "«Cancelar dictado» detiene la escucha y restaura el texto previo")
        pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(150); pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
        comprobar(R(pg, "abortos") == 2 and not R(pg, "activo"), "Escape cancela el dictado")
        pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(150); pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(250)
        comprobar(R(pg, "paradas") == 1 and pg.input_value("#airi-chat-input") == FRASE and visible(pg, "#airi-chat-micro-revision"),
                  "«Terminar de hablar» conserva lo reconocido para revisarlo")
        pg.click("#airi-chat-micro-descartar"); pg.wait_for_timeout(100)
        comprobar(pg.input_value("#airi-chat-input") == "texto previo" and not visible(pg, "#airi-chat-micro-revision"),
                  "«Descartar» borra la transcripción y deja el texto previo")
        pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(150)
        pg.evaluate("Object.defineProperty(document, 'hidden', {value: true, configurable: true}); document.dispatchEvent(new Event('visibilitychange'))")
        pg.wait_for_timeout(150)
        comprobar(R(pg, "abortos") == 3 and turno(pg) == "reposo", "al ocultar la pestaña deja de escuchar")
        ctx.close()

        # ── 2. Flujo completo: Sabina hablando → micrófono → revisar → enviar → pensar → hablar → reposo ──
        ctx, pg = nueva({"retraso": 400})
        pg.click("#airi-chat-voz-leer")
        gemini.retraso = 0.2; gemini.respuesta = respuesta("Hola, soy AIRI.")
        pg.fill("#airi-chat-input", "Hola"); pg.click("#airi-chat-send"); pg.wait_for_timeout(600)
        hablando_antes = pg.evaluate("window.airiInteraccion.voz.hablando")
        canc = pg.evaluate("window.__voz.cancelaciones")
        comprobar(hablando_antes and turno(pg) == "hablando", "estado visible «Hablando» mientras lee Sabina")
        n_gem = a_gemini()
        pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(100)
        comprobar(pg.evaluate("window.__voz.cancelaciones") > canc and not pg.evaluate("window.airiInteraccion.voz.hablando")
                  and R(pg, "activo"), "al pulsar «Hablar» primero se calla Sabina y después escucha")
        pg.wait_for_timeout(700)
        comprobar(pg.input_value("#airi-chat-input") == FRASE and visible(pg, "#airi-chat-micro-revision") and a_gemini() == n_gem
                  and usuarios(pg) == ["Hola"],
                  "la transcripción aparece en el campo de pregunta y NO se envía sola")
        pg.screenshot(path=str(cap / "02_revision_escritorio.png"))
        pg.fill("#airi-chat-input", "¿Qué comen los peces payaso juveniles?")
        gemini.retraso = 1.2; gemini.respuesta = respuesta("Comen **varias veces** al día.")
        pg.click("#airi-chat-micro-enviar"); pg.wait_for_timeout(300)
        comprobar(usuarios(pg)[-1] == "¿Qué comen los peces payaso juveniles?" and turno(pg) == "pensando"
                  and pg.is_disabled("#airi-chat-micro-hablar") and pg.evaluate("window.airiMascota.estado") == "pensando",
                  "se envía la transcripción corregida; «Pensando» con la mascota pensando y el micrófono bloqueado")
        comprobar("Transcripción lista" not in aviso(pg) and "no sale de tu computadora" in aviso(pg),
                  f"al enviar, el aviso «Transcripción lista» desaparece y vuelve el aviso de reposo ({aviso(pg)!r})")
        enviado = gemini.recibidas[-1]["cuerpo"]
        comprobar("peces payaso juveniles" in json.dumps(enviado, ensure_ascii=False) and "audio" not in json.dumps(enviado).lower()
                  and "inlineData" not in json.dumps(enviado),
                  "a Gemini solo llega texto (sin audio)")
        pg.wait_for_timeout(1200)
        comprobar(turno(pg) == "hablando" and (pg.evaluate("window.__voz.habladas.slice(-1)[0].voice") or "").startswith("Microsoft Sabina"),
                  "al llegar la respuesta habla con Sabina")
        pg.wait_for_timeout(1500)
        comprobar(turno(pg) == "reposo" and pg.is_enabled("#airi-chat-micro-hablar"), "al terminar vuelve a «En reposo»")
        # Enviar la transcripción con Enter (sin el botón) también limpia el aviso
        pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(700)
        gemini.retraso = 0; gemini.respuesta = respuesta("Vale.")
        pg.focus("#airi-chat-input"); pg.keyboard.press("Enter"); pg.wait_for_timeout(300)
        comprobar("Transcripción lista" not in aviso(pg) and not visible(pg, "#airi-chat-micro-revision"),
                  "al enviar con Enter, la revisión y su aviso también desaparecen")
        pg.click("#airi-chat-voz-detener") if visible(pg, "#airi-chat-voz-detener") else None
        # Versiones visibles: chat v0.6 y motor de análisis v0.4, sin confundirlas
        pie = pg.inner_text("footer"); inicio = pg.evaluate("document.querySelector('#inicio p').textContent")
        comprobar("AIRI v0.6" in pie and "Motor de análisis v0.4" in pie and "Chat con voz v0.6" in pie
                  and "motor de análisis del agua v0.4" in inicio and pg.title() == "AIRI · Prototipo v0.6"
                  and "v0.6" in pg.inner_text("#chat h2"),
                  "textos de versión: prototipo y chat v0.6, motor de análisis v0.4")
        # AIRI empieza a hablar mientras escucha: deja de escuchar (no se oye a sí misma)
        ctx.close(); ctx, pg = nueva({"retraso": 3000})
        gemini.retraso = 0; gemini.respuesta = respuesta("Respuesta para escuchar.")
        pg.fill("#airi-chat-input", "Hola"); pg.click("#airi-chat-send"); pg.wait_for_timeout(500)
        pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(150)
        pg.click(".airi-chat-escuchar"); pg.wait_for_timeout(300)
        comprobar(R(pg, "abortos") == 1 and not R(pg, "activo"), "si AIRI empieza a hablar, el dictado se detiene")
        pg.click("#airi-chat-voz-detener") if visible(pg, "#airi-chat-voz-detener") else None
        # «Nueva conversación» durante la escucha
        pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(150); pg.click("#airi-chat-clear"); pg.wait_for_timeout(200)
        comprobar(R(pg, "abortos") == 2 and turno(pg) == "reposo", "«Nueva conversación» cancela el dictado")
        ctx.close()

        # ── 3. Consentimiento de Gemini sigue siendo obligatorio ─────────────
        ctx, pg = nueva(consentir=False)
        n_gem = a_gemini()
        pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(700); pg.click("#airi-chat-micro-enviar"); pg.wait_for_timeout(300)
        comprobar(a_gemini() == n_gem and "marca la casilla" in pg.inner_text("#airi-chat-log"),
                  "sin el consentimiento de Gemini, la transcripción no se envía")
        ctx.close()

        # ── 4. Paquete de idioma descargable: solo con autorización ──────────
        ctx, pg = nueva({"disponible": "downloadable"})
        comprobar(visible(pg, "#airi-chat-micro-descargar") and pg.is_disabled("#airi-chat-micro-hablar")
                  and R(pg, "instalaciones") == 0 and "60 MB" in aviso(pg),
                  "paquete descargable: ofrece el botón y no descarga nada por su cuenta")
        pg.click("#airi-chat-micro-descargar"); pg.wait_for_timeout(500)
        comprobar(R(pg, "instalaciones") == 1 and R(pg, "instalacion") == {"langs": ["es-MX"], "processLocally": True}
                  and pg.is_enabled("#airi-chat-micro-hablar") and not visible(pg, "#airi-chat-micro-descargar"),
                  "tras autorizar la descarga, el dictado queda en el equipo")
        ctx.close()
        ctx, pg = nueva({"disponible": "downloadable", "instalar": False})
        pg.click("#airi-chat-micro-descargar"); pg.wait_for_timeout(500)
        comprobar("No se pudo descargar" in aviso(pg) and pg.is_disabled("#airi-chat-micro-hablar"),
                  "si la descarga falla, lo explica y no activa el micrófono")
        ctx.close()

        # ── 5. Solo reconocimiento en línea: consentimiento explícito ────────
        ctx, pg = nueva({"disponible": "unavailable", "retraso": 2500})
        texto_rem = pg.inner_text(".airi-chat-micro-remoto")
        comprobar(pg.is_disabled("#airi-chat-micro-hablar") and visible(pg, "#airi-chat-micro-remoto")
                  and "Google" in texto_rem and "no graba" in texto_rem and not pg.is_checked("#airi-chat-micro-remoto"),
                  "solo en línea: explica que el audio va a Google y exige marcar la autorización")
        pg.check("#airi-chat-micro-remoto"); pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(150)
        comprobar(R(pg, "inicios")[-1]["local"] is False and "en línea" in aviso(pg),
                  "con la autorización, escucha en línea y lo indica")
        pg.click("#airi-chat-micro-cancelar"); pg.wait_for_timeout(100)
        pg.uncheck("#airi-chat-micro-remoto")
        comprobar(pg.is_disabled("#airi-chat-micro-hablar"), "al retirar la autorización, el micrófono vuelve a bloquearse")
        ctx.close()

        # ── 6. Errores ───────────────────────────────────────────────────────
        for codigo, texto in [("not-allowed", "permiso del micrófono está bloqueado"), ("no-speech", "No escuché nada"),
                              ("audio-capture", "No se encontró un micrófono"), ("network", "no tiene conexión")]:
            ctx, pg = nueva({"error": codigo, "retraso": 100})
            pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(400)
            comprobar(texto in aviso(pg) and turno(pg) == "reposo" and not visible(pg, "#airi-chat-micro-revision")
                      and pg.is_enabled("#airi-chat-send"),
                      f"error «{codigo}»: mensaje comprensible y el chat escrito sigue disponible")
            ctx.close()

        # ── 7. Navegador sin reconocimiento de voz ───────────────────────────
        ctx, pg = nueva({"sinApi": True})
        gemini.retraso = 0; gemini.respuesta = respuesta("Respuesta escrita.")
        pg.fill("#airi-chat-input", "Hola"); pg.click("#airi-chat-send"); pg.wait_for_timeout(500)
        comprobar(pg.is_disabled("#airi-chat-micro-hablar") and "no está disponible en este navegador" in aviso(pg)
                  and "Respuesta escrita." in pg.inner_text("#airi-chat-log"),
                  "sin SpeechRecognition: botón desactivado con explicación y el chat escrito funciona")
        ctx.close()

        # ── 8. Teclado, movimiento reducido y celular ────────────────────────
        ctx, pg = nueva({"retraso": 2500}, reduced_motion="reduce")
        pg.focus("#airi-chat-micro-hablar"); pg.keyboard.press("Enter"); pg.wait_for_timeout(150)
        comprobar(R(pg, "activo"), "teclado: Enter sobre «Hablar» inicia el dictado")
        anim = pg.evaluate("getComputedStyle(document.querySelector('#airi-chat-turno'), '::before').animationName")
        comprobar(anim == "none", f"movimiento reducido: el indicador de escucha no parpadea ({anim})")
        pg.keyboard.press("Escape"); ctx.close()
        ctx, pg = nueva({"retraso": 2500})
        pg.evaluate("window.airiMascota.reducirMovimiento(true)")
        pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(150)
        anim = pg.evaluate("getComputedStyle(document.querySelector('#airi-chat-turno'), '::before').animationName")
        comprobar(anim == "none", "«Reducir animaciones» de la mascota también detiene el indicador")
        pg.evaluate("window.airiMascota.reducirMovimiento(false)"); ctx.close()

        ctx, pg = nueva({"retraso": 2500}, viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        pg.tap("#airi-chat-micro-hablar"); pg.wait_for_timeout(150)
        cajas = pg.evaluate("""['#airi-chat-micro-hablar', '#airi-chat-micro-cancelar', '#airi-chat-turno'].map(s => {
            const r = document.querySelector(s).getBoundingClientRect(); return [r.left, r.right, r.height]; })""")
        comprobar(all(c[0] >= 0 and c[1] <= 390 for c in cajas) and cajas[0][2] >= 44 and cajas[1][2] >= 44,
                  f"celular: los controles caben y miden al menos 44 px de alto {cajas}")
        pg.locator("#airi-chat-micro").scroll_into_view_if_needed()
        pg.screenshot(path=str(cap / "03_escuchando_celular.png"))
        pg.wait_for_timeout(2700)
        comprobar(visible(pg, "#airi-chat-micro-revision") and pg.input_value("#airi-chat-input") == FRASE,
                  "celular: la transcripción se puede revisar")
        ctx.close()
        nav.close()

    srv.shutdown()
    sys.stderr = stderr_original
    errores[:] = [e for e in errores if "Failed to load resource" not in e]
    comprobar(not errores, f"sin errores de JavaScript {errores[:3]}")
    comprobar(CLAVE not in registro.getvalue(), "la clave no aparece en el registro")
    ok = sum(1 for r in resultados if r[0])
    print(f"{ok} de {len(resultados)} comprobaciones superadas. Capturas en {cap}")
    sys.exit(0 if ok == len(resultados) else 1)


if __name__ == "__main__":
    _err = sys.stderr
    try:
        main()
    finally:
        sys.stderr = _err
