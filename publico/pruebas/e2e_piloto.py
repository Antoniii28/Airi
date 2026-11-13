"""
v0.7 E3–E5 · Vista previa del piloto en Chrome (escritorio y celular) con TODO lo externo simulado.

Arranca publico/dev/servidor-dev.mjs (Worker real + Durable Object simulado + Turnstile y Gemini simulados) y
comprueba: CSP sin violaciones, motor v0.4 y mascota, acceso con código, Turnstile, respuestas, voz (Sabina
simulada), dictado (reconocimiento simulado), límites, apagado, pausa por 429, celular y ausencia de secretos.
No usa Cloudflare, Google ni dispositivos reales.

    python publico/pruebas/e2e_piloto.py [--chrome RUTA] [--capturas CARPETA]
"""
import argparse
import json
import os
import re
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parents[2]
SIM_VOZ = RAIZ / "interfaz" / "mascota" / "pruebas" / "simulador_voz.js"
SIM_REC = RAIZ / "interfaz" / "chat" / "pruebas" / "simulador_reconocimiento.js"
SABINA = {"name": "Microsoft Sabina - Spanish (Mexico)", "lang": "es-MX", "localService": True, "voiceURI": "sabina"}
CODIGO = "PRUEB-AFICT-ICIA0-00001"
# Turnstile simulado: se sirve en lugar de https://challenges.cloudflare.com/turnstile/v0/api.js
TURNSTILE_FALSO = """
window.__ts = { renders: 0, resets: 0 };
window.turnstile = {
  render(el, o) { window.__ts.renders++; this._o = o; const d = document.createElement('div');
    d.className = 'ts-falso'; d.textContent = 'Verificación simulada'; el.appendChild(d);
    setTimeout(() => o.callback(window.__TS_TOKEN || 'token-valido'), 30); return 1; },
  getResponse() { return null; },
  reset() { window.__ts.resets++; setTimeout(() => this._o.callback(window.__TS_TOKEN || 'token-valido'), 30); }
};"""
resultados = []


def comprobar(cond, nombre):
    resultados.append((bool(cond), nombre))
    print(("OK    " if cond else "FALLA ") + nombre)


def puerto_libre():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def arrancar(dist=None, **variables):
    puerto = puerto_libre()
    if dist:
        variables["DEV_DIST"] = str(dist)
    entorno = {**os.environ, "DEV_PUERTO": str(puerto), **variables}
    proc = subprocess.Popen(["node", str(RAIZ / "publico" / "dev" / "servidor-dev.mjs")], env=entorno,
                            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    url = f"http://127.0.0.1:{puerto}"
    for _ in range(50):
        try:
            urllib.request.urlopen(url + "/api/estado", timeout=1)
            return proc, url
        except Exception:
            time.sleep(0.1)
    proc.kill()
    raise RuntimeError("No arrancó la vista previa: " + (proc.stdout.read() if proc.stdout else ""))


def copia_crlf(destino):
    """Copia interfaz/ e identidad-visual/ con saltos CRLF (como una copia de Git en Windows) y la prepara."""
    import shutil
    for d in ("interfaz", "identidad-visual"):
        shutil.copytree(RAIZ / d, destino / d)
    for f in (destino / "interfaz").rglob("*"):
        if f.suffix in (".html", ".js", ".css"):
            f.write_bytes(f.read_bytes().replace(b"\r\n", b"\n").replace(b"\n", b"\r\n"))
    dist = destino / "dist"
    subprocess.run(["node", str(RAIZ / "publico" / "preparar-estaticos.mjs")], check=True, capture_output=True,
                   env={**os.environ, "AIRI_ESTATICOS_ORIGEN": str(destino), "AIRI_ESTATICOS_DESTINO": str(dist)})
    return dist


SECCIONES = {"inicio": "Bienvenido a AIRI", "agua": None, "especies": None, "futuro": "Funciones previstas", "chat": "Chat con AIRI"}


def navegar_todo(pg, etiqueta):
    """Regresión: cada botón muestra SOLO su sección, la marca como seleccionada y la mascota no duplica el globo."""
    pg.goto(pg.url.split("/interfaz")[0] + "/interfaz/prototipo/index.html"); pg.wait_for_timeout(900)
    fallos = []
    for tab in ["agua", "especies", "futuro", "chat", "inicio"]:
        pg.click(f'[data-tab="{tab}"]'); pg.wait_for_timeout(350)
        visibles = pg.evaluate("[...document.querySelectorAll('main section.panel')].filter(s => !s.classList.contains('hidden')).map(s => s.id)")
        marcado = pg.get_attribute(f'[data-tab="{tab}"]', "aria-selected")
        globos = pg.evaluate("[...document.querySelectorAll('.airi-m-globo')].filter(e => e.offsetParent).length")
        if visibles != [tab] or marcado != "true" or globos > 1:
            fallos.append((tab, visibles, marcado, globos))
        if tab == "chat" and not pg.is_visible("#airi-chat-codigo"):
            fallos.append(("chat", "sin formulario del piloto"))
    comprobar(not fallos, f"navegación ({etiqueta}): los 5 botones muestran su sección, sin globos duplicados {fallos}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chrome", default="/usr/bin/google-chrome")
    ap.add_argument("--capturas", default=str(Path(tempfile.gettempdir()) / "airi-piloto"))
    args = ap.parse_args()
    cap = Path(args.capturas); cap.mkdir(parents=True, exist_ok=True)
    subprocess.run(["node", str(RAIZ / "publico" / "preparar-estaticos.mjs")], check=True, capture_output=True)
    procesos = []
    errores = []

    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=args.chrome, args=["--no-sandbox"])

        def nueva(url, consentir=True, token=None, rec=None, **kw):
            ctx = nav.new_context(viewport=kw.pop("viewport", {"width": 1366, "height": 900}), **kw)
            ctx.add_init_script("window.__CFG_VOZ = " + json.dumps({"voces": [SABINA], "duracion": 700}) + ";")
            ctx.add_init_script("window.__CFG_REC = " + json.dumps(rec or {"retraso": 300}) + ";")
            ctx.add_init_script(path=str(SIM_VOZ)); ctx.add_init_script(path=str(SIM_REC))
            if token: ctx.add_init_script(f"window.__TS_TOKEN = {json.dumps(token)};")
            ctx.route("https://challenges.cloudflare.com/**", lambda r: r.fulfill(
                status=200, content_type="text/javascript", body=TURNSTILE_FALSO))
            pg = ctx.new_page()
            pg.peticiones = []
            pg.on("request", lambda r: "/api/chat" in r.url and pg.peticiones.append(r))
            pg.on("pageerror", lambda e: errores.append(str(e)))
            pg.on("console", lambda m: m.type == "error" and errores.append(m.text))
            pg.goto(url + "/"); pg.wait_for_timeout(900)
            pg.click('[data-tab="chat"]'); pg.wait_for_timeout(300)
            if consentir:
                pg.check("#airi-chat-consentimiento")
            return ctx, pg

        def preguntar(pg, texto, codigo=CODIGO, espera=900):
            if codigo is not None:
                pg.fill("#airi-chat-codigo", codigo)
            pg.fill("#airi-chat-input", texto); pg.click("#airi-chat-send"); pg.wait_for_timeout(espera)
            return pg.inner_text("#airi-chat-log")

        ultimo = lambda pg: pg.evaluate("[...document.querySelectorAll('#airi-chat-log .airi-chat-msg')].at(-1).innerText")

        # ── 0. Regresión de navegación con LF y con CRLF (fallo del 13-11-2026 en Windows) ──
        with tempfile.TemporaryDirectory() as tmp:
            dist_crlf = copia_crlf(Path(tmp))
            for etiqueta, dist in (("archivos LF", None), ("archivos CRLF, como en Windows", dist_crlf)):
                proc, url = arrancar(dist=dist); procesos.append(proc)
                errores_previos = len(errores)
                ctx, pg = nueva(url, consentir=False)
                navegar_todo(pg, etiqueta)
                nuevos = [e for e in errores[errores_previos:] if "Content Security Policy" in e or "Refused" in e or "404" in e]
                comprobar(not nuevos, f"navegación ({etiqueta}): sin violaciones de CSP ni recursos 404 {nuevos[:1]}")
                ctx.close(); proc.terminate()

        # ── 1. Carga, CSP y versiones anteriores ─────────────────────────────
        # Límite por minuto amplio SOLO aquí (este bloque hace muchas consultas con el mismo participante ficticio);
        # el límite real de 5/min se prueba en el bloque 7 con su propio servidor.
        proc, url = arrancar(DEV_LIMITE_MINUTO="60"); procesos.append(proc)
        cab = urllib.request.urlopen(url + "/interfaz/prototipo/index.html").headers
        comprobar("script-src 'self' 'sha256-" in cab.get("Content-Security-Policy", "") and
                  "microphone=(self)" in cab.get("Permissions-Policy", "") and cab.get("X-Frame-Options") == "DENY",
                  "la página lleva CSP estricta, Permissions-Policy (micrófono solo propio) y X-Frame-Options")
        ctx, pg = nueva(url)
        comprobar(pg.evaluate("window.airiChat.publico && window.airiChat.publico.modo") == "publico" and
                  pg.is_visible("#airi-chat-codigo") and pg.is_visible(".ts-falso") and
                  "Piloto cerrado" in pg.inner_text("#airi-chat-estado") and "servidor local" not in pg.inner_text("#airi-chat-log"),
                  "modo piloto detectado: campo de código, verificación de Turnstile y sin el aviso del servidor local")
        comprobar("Google Gemini" in pg.inner_text("#airi-chat-piloto-privacidad") and "Cloudflare" in pg.inner_text("#airi-chat-piloto-privacidad")
                  and "18" in pg.inner_text("#airi-chat-piloto-privacidad"),
                  "aviso de privacidad del piloto: Cloudflare, Google Gemini y mayores de 18 años")
        textos = pg.inner_text("#chat")
        comprobar("servidor local" not in textos and "servidor del piloto" in textos,
                  "en el piloto no se mencionan el servidor local ni «python chat/servidor.py»")
        pg.click('[data-tab="agua"]')
        for i, v in enumerate(["26", "8.4", "", "0.8", "0.1", "10"]):
            pg.fill(f"#p{i}", v)
        pg.click("#evaluar"); pg.wait_for_timeout(1200)
        comprobar(pg.get_attribute(".airi-a", "data-clasificacion") == "R4" and
                  pg.evaluate("document.querySelector('.airi-m-flotante .airi-m-pez').classList.contains('airi-m-estado-alerta')"),
                  "motor v0.4 y mascota intactos bajo la CSP (análisis R4, mascota en alerta)")
        pg.click('[data-tab="chat"]'); pg.wait_for_timeout(200)

        # ── 2. Acceso: sin código, código incorrecto, Turnstile ─────────────
        n = len(pg.peticiones)
        pg.fill("#airi-chat-input", "Hola"); pg.click("#airi-chat-send"); pg.wait_for_timeout(300)
        comprobar("Escribe tu código" in ultimo(pg) and len(pg.peticiones) == n,
                  "sin código: mensaje claro y no se envía nada")
        preguntar(pg, "Hola", codigo="PRUEB-AFICT-ICIA0-99999")
        comprobar("Código de acceso no válido" in ultimo(pg) and pg.evaluate("window.__ts.resets") >= 1,
                  "código incorrecto: rechazado por el Worker y Turnstile se reinicia (token de un solo uso)")

        # ── 2b. Regresión del 13-11-2026: el mismo código escrito o pegado de otras formas ──
        for variante, nombre in ((CODIGO.replace("-", " "), "con espacios"), (CODIGO.replace("-", ""), "sin guiones"),
                                 (CODIGO.replace("-", "\u2011"), "con guiones tipográficos (U+2011)"),
                                 ("\u00a0" + CODIGO.lower() + "\u200b", "en minúsculas con espacio no separable e invisible")):
            preguntar(pg, "Hola", codigo=variante)
            enviado = pg.peticiones[-1].headers.get("x-airi-acceso") or ""
            comprobar("Respuesta simulada" in ultimo(pg) and all(ord(c) < 256 for c in enviado),
                      f"código válido {nombre}: se acepta (cabecera transmisible)")
        n = len(pg.peticiones)
        preguntar(pg, "Hola", codigo="PRUEB-AFICT-ICIA0-0000€", espera=300)
        comprobar("no se pueden enviar" in ultimo(pg) and len(pg.peticiones) == n,
                  "código con caracteres imposibles: mensaje claro y no se envía (antes: falso «No hay conexión»)")
        pg.fill("#airi-chat-codigo", CODIGO); pg.click("#airi-chat-codigo-mostrar")
        comprobar(pg.get_attribute("#airi-chat-codigo", "type") == "text" and pg.get_attribute("#airi-chat-codigo-mostrar", "aria-pressed") == "true",
                  "«Mostrar» permite revisar el código escrito")
        pg.click("#airi-chat-codigo-mostrar")
        comprobar(pg.get_attribute("#airi-chat-codigo", "type") == "password", "«Ocultar» vuelve a ocultarlo")

        # ── 3. Consulta correcta con mascota y voz ──────────────────────────
        pg.click("#airi-chat-voz-leer")
        pg.evaluate("""window.__estados = []; new MutationObserver(() => window.__estados.push(window.airiMascota.estado))
            .observe(document.querySelector('.airi-m-flotante .airi-m-pez'), {attributes: true, attributeFilter: ['class']})""")
        pg.fill("#airi-chat-codigo", CODIGO); pg.fill("#airi-chat-input", "¿Qué comen los peces payaso?"); pg.click("#airi-chat-send")
        pg.wait_for_timeout(1050)
        pensando = "pensando" if "pensando" in pg.evaluate("window.__estados") else pg.evaluate("window.__estados")
        texto = ultimo(pg)
        cuerpo_enviado = pg.peticiones[-1].post_data_json
        cab_enviadas = pg.peticiones[-1].headers
        comprobar("Respuesta simulada" in texto and pg.locator("#airi-chat-log .airi-chat-model strong").count() >= 1,
                  "con código y verificación: llega la respuesta (Gemini simulado) con Markdown seguro")
        comprobar(cab_enviadas.get("x-airi-acceso") == CODIGO and cuerpo_enviado.get("turnstile") == "token-valido"
                  and set(cuerpo_enviado) == {"messages", "turnstile"},
                  "el navegador envía solo la conversación, el token y el código (en cabecera); ninguna clave")
        habladas = pg.evaluate("window.__voz.habladas")
        comprobar(pensando == "pensando" and habladas and (habladas[-1].get("voice") or "").startswith("Microsoft Sabina"),
                  "la mascota piensa y Sabina (simulada) lee la respuesta en el modo piloto")
        pg.wait_for_timeout(1500)
        comprobar(pg.evaluate("window.airiMascota.estado") == "espera", "la mascota vuelve a reposo")
        guardado = pg.evaluate("JSON.stringify(localStorage) + JSON.stringify(sessionStorage) + document.cookie")
        comprobar(CODIGO not in guardado and CODIGO.lower() not in guardado, "el código no se guarda en el navegador")
        pg.screenshot(path=str(cap / "01_piloto_escritorio.png"), full_page=False)

        # ── 4. Dictado (reconocimiento simulado) en modo piloto ──────────────
        pg.click("#airi-chat-micro-hablar"); pg.wait_for_timeout(700)
        pg.click("#airi-chat-micro-enviar"); pg.wait_for_timeout(1000)
        comprobar("peces payaso" in pg.peticiones[-1].post_data_json["messages"][-1]["text"] and "Respuesta simulada" in ultimo(pg),
                  "el dictado funciona en el piloto: la transcripción se envía con el código y la verificación")
        if pg.is_visible("#airi-chat-voz-detener"):
            pg.click("#airi-chat-voz-detener")
        ctx.close()

        # ── 5. Turnstile rechazado y consentimiento de Gemini ────────────────
        ctx, pg = nueva(url, token="token-falso")
        preguntar(pg, "Hola")
        comprobar("No se pudo verificar que eres una persona" in ultimo(pg), "token de Turnstile inválido: rechazado en el servidor")
        ctx.close()
        ctx, pg = nueva(url, consentir=False)
        n = len(pg.peticiones)
        preguntar(pg, "Hola", espera=300)
        comprobar("marca la casilla" in ultimo(pg) and len(pg.peticiones) == n, "sin consentimiento de Gemini no se envía nada")
        ctx.close()

        # ── 6. Celular ───────────────────────────────────────────────────────
        ctx, pg = nueva(url, viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        pg.locator("#airi-chat-piloto").scroll_into_view_if_needed()
        caja = pg.evaluate("""(() => { const r = document.querySelector('#airi-chat-codigo').getBoundingClientRect();
            return [r.left, r.right, r.height, document.documentElement.scrollWidth, innerWidth]; })()""")
        comprobar(caja[0] >= 0 and caja[1] <= 390 and caja[2] >= 44 and caja[3] <= caja[4],
                  f"celular: el acceso cabe, el campo mide ≥ 44 px y no hay desplazamiento horizontal {caja}")
        pg.screenshot(path=str(cap / "02_piloto_celular.png"), full_page=False)
        preguntar(pg, "Hola desde el celular")
        comprobar("Respuesta simulada" in ultimo(pg), "celular: la consulta funciona")
        ctx.close()
        proc.terminate()

        # ── 7. Límite por minuto ─────────────────────────────────────────────
        proc, url = arrancar(DEV_LIMITE_MINUTO="2"); procesos.append(proc)
        ctx, pg = nueva(url)
        preguntar(pg, "Uno"); preguntar(pg, "Dos"); preguntar(pg, "Tres")
        comprobar("Espera un minuto" in ultimo(pg), "límite por minuto: mensaje comprensible al alcanzarlo")
        ctx.close(); proc.terminate()

        # ── 8. Chat apagado: el resto de AIRI sigue ─────────────────────────
        proc, url = arrancar(DEV_APAGADO="1"); procesos.append(proc)
        ctx, pg = nueva(url, consentir=False)
        comprobar("desactivado" in pg.inner_text("#airi-chat-estado") and pg.is_disabled("#airi-chat-input") and
                  not pg.is_visible("#airi-chat-codigo") and pg.evaluate("window.__ts === undefined"),
                  "apagado: aviso claro, chat deshabilitado y sin cargar Turnstile")
        pg.click('[data-tab="agua"]')
        comprobar(pg.is_visible("#evaluar"), "apagado: las demás secciones siguen disponibles")
        pg.screenshot(path=str(cap / "03_piloto_apagado.png"))
        ctx.close(); proc.terminate()

        # ── 9. Gemini devuelve 429: pausa preventiva ────────────────────────
        proc, url = arrancar(DEV_GEMINI="429"); procesos.append(proc)
        ctx, pg = nueva(url)
        preguntar(pg, "Uno")
        comprobar("pausó" in ultimo(pg), "Gemini 429: mensaje claro")
        preguntar(pg, "Dos")
        comprobar("pausa preventiva" in ultimo(pg), "tras el 429, el chat queda en pausa preventiva")
        ctx.close(); proc.terminate()
        nav.close()

    for proc in procesos:
        if proc.poll() is None:
            proc.kill()

    # ── 10. Sin secretos en los archivos que se publicarían ─────────────────
    patron = re.compile(r"AIza[0-9A-Za-z_\-]{20,}|1x0000000000000000000000000000000AA|GEMINI_API_KEY\s*[:=]\s*['\"][^'\"]")
    dist = RAIZ / "publico" / "dist"
    hallados = [str(f.relative_to(dist)) for f in dist.rglob("*") if f.is_file() and f.suffix in (".js", ".html", ".css", "")
                and patron.search(f.read_text(encoding="utf-8", errors="ignore"))]
    comprobar(not hallados, f"publico/dist no contiene claves ni secretos {hallados}")
    comprobar(not any(x for x in dist.rglob("*") if x.suffix in (".py", ".md") or "pruebas" in x.parts),
              "publico/dist no incluye pruebas, documentación ni código Python")

    csp = [e for e in errores if "Content Security Policy" in e or "Refused to" in e]
    comprobar(not csp, f"sin violaciones de la CSP {csp[:2]}")
    resto = [e for e in errores if e not in csp and "Failed to load resource" not in e]
    comprobar(not resto, f"sin errores de JavaScript {resto[:3]}")
    ok = sum(1 for r in resultados if r[0])
    print(f"{ok} de {len(resultados)} comprobaciones superadas. Capturas en {cap}")
    sys.exit(0 if ok == len(resultados) else 1)


if __name__ == "__main__":
    main()
