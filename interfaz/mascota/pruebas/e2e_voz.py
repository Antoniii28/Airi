"""
Pruebas de extremo a extremo de la voz y el menú de AIRI v0.2 en Chrome (Playwright).

Uso, desde la raíz del repositorio:
    python interfaz/mascota/pruebas/e2e_voz.py [--chrome RUTA] [--capturas CARPETA]

La síntesis de voz se sustituye por `simulador_voz.js`, que registra cada locución,
las cancelaciones y cualquier intento de usar el micrófono. Así la prueba es repetible
en cualquier equipo, incluso sin voces instaladas. Al final se repite una parte con la
síntesis REAL de Chrome para confirmar que no aparecen errores.
"""
import argparse, sys, tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parents[3]
URL = (RAIZ / "interfaz" / "prototipo" / "index.html").as_uri()
SIMULADOR = Path(__file__).with_name("simulador_voz.js")
resultados = []


def comprobar(cond, nombre):
    resultados.append((bool(cond), nombre))
    print(("OK    " if cond else "FALLA ") + nombre)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chrome", default="/usr/bin/google-chrome")
    ap.add_argument("--capturas", default=str(Path(tempfile.gettempdir()) / "airi-voz-capturas"))
    args = ap.parse_args()
    cap = Path(args.capturas); cap.mkdir(parents=True, exist_ok=True)
    errores, peticiones = [], []

    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=args.chrome, args=["--no-sandbox"])

        def nueva(viewport=None, config="{}", simular=True, **extra):
            ctx = nav.new_context(viewport=viewport or {"width": 1366, "height": 900}, **extra)
            if simular:
                ctx.add_init_script(f"window.__CFG_VOZ = {config};")
                ctx.add_init_script(path=str(SIMULADOR))
            pg = ctx.new_page()
            pg.on("pageerror", lambda e: errores.append(f"pageerror: {e}"))
            pg.on("console", lambda m: m.type in ("error", "warning") and errores.append(f"{m.type}: {m.text}"))
            pg.on("request", lambda r: peticiones.append(r.url))
            return ctx, pg

        voz = lambda pg: pg.evaluate("window.__voz")
        texto = lambda pg, d: pg.inner_text(f"{d} .airi-m-texto")
        FLOT, PEC = ".airi-m-flotante", ".airi-m-pecera"

        # ── 1. Sin reproducción automática ───────────────────────────────────
        ctx, pg = nueva()
        pg.goto(URL); pg.wait_for_timeout(1500)
        comprobar(voz(pg)["habladas"] == [], "no habla al abrir la página")
        comprobar(pg.get_attribute(f"{PEC} .airi-m-btn-voz", "aria-pressed") == "false" and
                  pg.inner_text(f"{PEC} .airi-m-btn-voz") == "Activar voz", "la voz empieza desactivada")
        pg.click('[data-tab="agua"]'); pg.wait_for_timeout(300)
        comprobar(voz(pg)["habladas"] == [] and "Validar entradas" in texto(pg, FLOT),
                  "con la voz desactivada los mensajes siguen por escrito y no se oyen")

        # ── 2. Activar, hablar, animación, detener ───────────────────────────
        pg.click('[data-tab="inicio"]')
        pg.click(f"{PEC} .airi-m-btn-voz"); pg.wait_for_timeout(200)
        v = voz(pg)
        comprobar(pg.get_attribute(f"{PEC} .airi-m-btn-voz", "aria-pressed") == "true", "«Activar voz» la activa (aria-pressed)")
        comprobar(v["habladas"] and v["habladas"][0]["text"].startswith("Voz activada") and "Soy Airi" in v["habladas"][0]["text"],
                  "al activarla lee el aviso y el mensaje en pantalla")
        comprobar(all(h["lang"] == "es-MX" and h["voice"] == "Paulina" for h in v["habladas"]),
                  "usa la voz en español disponible (es-MX), no la inglesa")
        comprobar(pg.evaluate(f"document.querySelector('{PEC} .airi-m-pez').classList.contains('airi-m-hablando')"),
                  "mientras habla, la mascota tiene la animación de habla")
        anim = pg.evaluate(f"getComputedStyle(document.querySelector('{PEC} .airi-m-capas')).animationName")
        luz = pg.evaluate(f"getComputedStyle(document.querySelector('{PEC} .airi-m-luz')).opacity")
        comprobar(anim == "airi-m-habla" and float(luz) > 0.3, f"movimiento suave ({anim}) y antena encendida")
        comprobar(pg.is_visible(f"{PEC} .airi-m-btn-detener"), "«Detener voz» aparece solo mientras habla")
        pg.screenshot(path=str(cap / "01_inicio_hablando.png"))
        pg.click(f"{PEC} .airi-m-btn-detener"); pg.wait_for_timeout(150)
        comprobar(not pg.evaluate(f"document.querySelector('{PEC} .airi-m-pez').classList.contains('airi-m-hablando')") and
                  pg.is_hidden(f"{PEC} .airi-m-btn-detener") and voz(pg)["cancelaciones"] >= 1,
                  "«Detener voz» cancela la locución y la mascota vuelve a su estado normal")
        comprobar(pg.evaluate(f"getComputedStyle(document.querySelector('{PEC} .airi-m-cola')).animationName") == "airi-m-aleteo",
                  "las animaciones originales siguen intactas")

        # ── 3. Menú en la pecera (ratón y teclado) ───────────────────────────
        pg.click(f"{PEC} .airi-m-pez", force=True); pg.wait_for_timeout(150)
        opciones = pg.eval_on_selector_all(f"{PEC} .airi-m-opcion", "bs => bs.map(b => b.getAttribute('data-accion'))")
        comprobar(pg.is_visible("#airi-m-menu-pecera") and opciones == ["proyecto", "agua", "especies", "futuro", "repetir", "silenciar"],
                  f"pulsar el pez abre el menú con las 6 acciones, la de Inicio primero {opciones}")
        comprobar(pg.get_attribute(f"{PEC} .airi-m-pez", "aria-expanded") == "true" and
                  pg.evaluate("document.activeElement.getAttribute('data-accion')") == "proyecto",
                  "el foco pasa a la primera opción (teclado) y aria-expanded=true")
        pg.screenshot(path=str(cap / "02_menu_pecera.png"))
        antes = len(voz(pg)["habladas"])
        pg.keyboard.press("Enter"); pg.wait_for_timeout(200)
        comprobar("Supervisión y Gestión de un Acuario Marino" in texto(pg, PEC) and pg.is_hidden("#airi-m-menu-pecera"),
                  "«¿Qué puedes hacer?» con Enter muestra la respuesta y cierra el menú")
        comprobar(len(voz(pg)["habladas"]) > antes and "Todavía no analizo el agua" in " ".join(h["text"] for h in voz(pg)["habladas"][antes:]),
                  "y la lee en voz alta, incluyendo sus límites")
        comprobar(pg.evaluate("document.activeElement.classList.contains('airi-m-pez')"), "el foco vuelve a la mascota")
        pg.focus(f"{PEC} .airi-m-pez"); pg.keyboard.press("Enter"); pg.wait_for_timeout(100)
        comprobar(pg.is_visible("#airi-m-menu-pecera"), "el pez se activa con Enter")
        pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
        comprobar(pg.is_hidden("#airi-m-menu-pecera") and pg.evaluate("document.activeElement.classList.contains('airi-m-pez')"),
                  "Escape cierra el menú y devuelve el foco")

        # ── 4. Asistente flotante: ayuda de cada pantalla ────────────────────
        esperados = {"agua": ("agua", "temperatura en °C"), "especies": ("especies", "no determinan compatibilidad"),
                     "futuro": ("futuro", "planeadas, pero todavía no disponibles")}
        for tab, (accion, frase) in esperados.items():
            pg.click(f'[data-tab="{tab}"]'); pg.wait_for_timeout(150)
            pg.click(".airi-m-avatar", force=True); pg.wait_for_timeout(150)
            primera = pg.eval_on_selector(f"{FLOT} .airi-m-opcion", "b => b.getAttribute('data-accion')")
            comprobar(pg.is_visible("#airi-m-menu-flotante") and primera == accion,
                      f"{tab}: el avatar abre el menú con la ayuda de esta pantalla primero")
            pg.click(f'#airi-m-menu-flotante [data-accion="{accion}"]'); pg.wait_for_timeout(150)
            comprobar(frase in texto(pg, FLOT) and pg.is_visible(f"{FLOT} .airi-m-globo"), f"{tab}: la respuesta correcta se muestra por escrito")
            if tab == "agua":
                pg.screenshot(path=str(cap / "03_agua_ayuda.png"))
        comprobar(not any("analizo el agua" in h["text"] and "no analizo" not in h["text"].lower() for h in voz(pg)["habladas"]),
                  "nunca afirma que analiza el agua")
        pg.click(".airi-m-avatar", force=True); pg.wait_for_timeout(100)
        pg.screenshot(path=str(cap / "04_menu_flotante.png"))
        tapados = pg.evaluate("""() => [...document.querySelectorAll('nav [data-tab]')].filter(e => {
                     const r = e.getBoundingClientRect(); const a = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
                     return !(a === e || e.contains(a)); }).map(e => e.textContent)""")
        comprobar(not tapados, "con el menú abierto las pestañas siguen accesibles")
        pg.click('[data-tab="agua"]'); pg.wait_for_timeout(150)
        comprobar(pg.is_hidden("#airi-m-menu-flotante"), "clic fuera del menú lo cierra y la navegación funciona")

        # ── 5. Sin cola acumulada, repetir y silenciar ───────────────────────
        n0 = voz(pg)["cancelaciones"]
        for accion in ["proyecto", "agua", "especies", "futuro", "proyecto"]:
            pg.evaluate(f"window.airiInteraccion.ejecutar('{accion}')")
        pg.wait_for_timeout(100)
        v = voz(pg)
        comprobar(v["cancelaciones"] - n0 >= 5, "cada mensaje nuevo cancela el anterior")
        cola = pg.evaluate("window.__vozCola()")
        comprobar(cola and all(t in v["habladas"][-len(cola):][i]["text"] for i, t in enumerate(cola)) and
                  "Supervisión y Gestión" in " ".join(cola) and not any("seis valores" in t for t in cola),
                  f"en la cola solo queda el último mensaje ({len(cola)} fragmentos), no los cinco")
        pg.click(".airi-m-avatar", force=True); pg.click('#airi-m-menu-flotante [data-accion="repetir"]'); pg.wait_for_timeout(150)
        ultimas = [h["text"] for h in voz(pg)["habladas"][-3:]]
        comprobar(any("Supervisión" in t for t in ultimas) and "Supervisión" in texto(pg, FLOT),
                  "«Repetir mensaje» lo muestra y lo lee de nuevo")
        pg.click(".airi-m-avatar", force=True); pg.click('#airi-m-menu-flotante [data-accion="silenciar"]'); pg.wait_for_timeout(150)
        comprobar("Voz desactivada" in texto(pg, FLOT) and pg.get_attribute(f"{FLOT} .airi-m-btn-voz", "aria-pressed") == "false",
                  "«Silenciar AIRI» desactiva la voz y lo indica por escrito")
        n = len(voz(pg)["habladas"])
        pg.click('[data-tab="especies"]'); pg.wait_for_timeout(150)
        pg.click(".airi-m-avatar", force=True); pg.click('#airi-m-menu-flotante [data-accion="repetir"]'); pg.wait_for_timeout(150)
        comprobar(len(voz(pg)["habladas"]) == n and "Busca por nombre" in texto(pg, FLOT),
                  "silenciada: «Repetir» solo muestra el texto")
        pg.click(f"{FLOT} .airi-m-btn-voz"); pg.wait_for_timeout(100)
        pg.fill("#buscar", "payaso"); pg.wait_for_timeout(900)
        comprobar("1 ficha" in texto(pg, FLOT) and not any("1 ficha" in h["text"] for h in voz(pg)["habladas"]),
                  "los resultados de búsqueda se muestran por escrito sin interrumpir con voz")
        pg.click('[data-tab="agua"]'); pg.click("#evaluar"); pg.wait_for_timeout(1300)
        ultimo = " ".join(h["text"] for h in voz(pg)["habladas"][-2:])
        comprobar("Información insuficiente" in ultimo and not any("Revisando" in h["text"] for h in voz(pg)["habladas"]),
                  "con voz activa lee el resultado real de la validación (no la pausa demostrativa)")
        pg.reload(); pg.wait_for_timeout(1200)
        comprobar(voz(pg)["habladas"] == [] and pg.get_attribute(f"{PEC} .airi-m-btn-voz", "aria-pressed") == "true",
                  "la preferencia de voz se recuerda, pero tras recargar no habla sola")
        pg.click(f"{PEC} .airi-m-btn-ocultar"); pg.wait_for_timeout(100)
        comprobar(not pg.evaluate("window.speechSynthesis.speaking"), "ocultar la mascota detiene la voz")
        pg.click(f"{PEC} .airi-m-btn-ocultar")
        comprobar(voz(pg)["micro"] == 0 and pg.evaluate("window.__voz.micro") == 0, "no se solicita el micrófono")
        ctx.close()

        # ── 6. Sin voz en español / sin voces / sin soporte ──────────────────
        ctx, pg = nueva(config='{"voces": [{"lang": "en-US", "name": "English"}]}')
        pg.goto(URL); pg.click(f"{PEC} .airi-m-btn-voz"); pg.wait_for_timeout(150)
        h = voz(pg)["habladas"]
        comprobar(h and h[0]["lang"] == "es-MX" and h[0]["voice"] is None and
                  "voz predeterminada" in pg.get_attribute(f"{PEC} .airi-m-btn-voz", "title"),
                  "sin voz en español: pide español al sistema y lo indica en el botón")
        ctx.close()
        ctx, pg = nueva(config='{"voces": []}')
        pg.goto(URL); pg.click(f"{PEC} .airi-m-btn-voz"); pg.wait_for_timeout(150)
        comprobar(voz(pg)["habladas"] and pg.get_attribute(f"{PEC} .airi-m-btn-voz", "aria-pressed") == "true",
                  "sin ninguna voz instalada: funciona sin errores")
        ctx.close()
        ctx, pg = nueva(config='{"sinSoporte": true}')
        pg.goto(URL); pg.wait_for_timeout(300)
        comprobar(pg.is_disabled(f"{PEC} .airi-m-btn-voz") and pg.inner_text(f"{PEC} .airi-m-btn-voz") == "Voz no disponible",
                  "navegador sin síntesis: botón deshabilitado «Voz no disponible»")
        pg.click('[data-tab="especies"]'); pg.click(".airi-m-avatar", force=True)
        pg.click('#airi-m-menu-flotante [data-accion="especies"]'); pg.wait_for_timeout(100)
        comprobar("no determinan compatibilidad" in texto(pg, FLOT), "sin síntesis: el menú y la ayuda funcionan por escrito")
        pg.click(".airi-m-avatar", force=True); pg.click('#airi-m-menu-flotante [data-accion="silenciar"]')
        comprobar("no permite la síntesis de voz" in texto(pg, FLOT), "sin síntesis: «Silenciar» explica que no hay voz")
        ctx.close()

        # ── 7. Movimiento reducido ───────────────────────────────────────────
        ctx, pg = nueva(reduced_motion="reduce")
        pg.goto(URL); pg.click(f"{PEC} .airi-m-btn-voz"); pg.wait_for_timeout(150)
        anim = pg.evaluate(f"getComputedStyle(document.querySelector('{PEC} .airi-m-capas')).animationName")
        luz = float(pg.evaluate(f"getComputedStyle(document.querySelector('{PEC} .airi-m-luz')).opacity"))
        comprobar(anim == "none" and luz == 1.0 and pg.evaluate(f"document.querySelector('{PEC} .airi-m-pez').classList.contains('airi-m-hablando')"),
                  "movimiento reducido: al hablar no hay movimiento, solo la antena encendida")
        pg.screenshot(path=str(cap / "05_movimiento_reducido_hablando.png"))
        ctx.close()

        # ── 8. Celular ───────────────────────────────────────────────────────
        ctx, pg = nueva(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
        pg.goto(URL); pg.wait_for_timeout(800)
        pg.tap(f"{PEC} .airi-m-btn-voz"); pg.wait_for_timeout(100)
        pg.evaluate("window.airiInteraccion.abrirMenu('pecera')"); pg.wait_for_timeout(200)
        pg.screenshot(path=str(cap / "06_celular_menu_pecera.png"))
        pg.click('[data-tab="agua"]'); pg.wait_for_timeout(200)
        pg.locator(".airi-m-avatar").tap(force=True); pg.wait_for_timeout(250)
        caja = pg.evaluate("(() => { const r = document.querySelector('.airi-m-flotante').getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, innerWidth, innerHeight]; })()")
        comprobar(caja[0] >= 0 and caja[1] >= 0 and caja[2] <= caja[4] and caja[3] <= caja[5], f"celular: el menú cabe en la pantalla {caja}")
        comprobar(pg.evaluate("document.documentElement.scrollWidth <= innerWidth"), "celular: sin desplazamiento horizontal")
        pg.screenshot(path=str(cap / "07_celular_menu_flotante.png"))
        pg.tap('#airi-m-menu-flotante [data-accion="agua"]'); pg.wait_for_timeout(200)
        comprobar("temperatura en °C" in texto(pg, FLOT), "celular: las opciones del menú funcionan con toque")
        pg.screenshot(path=str(cap / "08_celular_respuesta.png"))
        pg.tap('[data-tab="especies"]'); pg.wait_for_timeout(150)
        comprobar(pg.is_visible("#especies"), "celular: la navegación entre pestañas sigue funcionando")
        ctx.close()

        # ── 9. Síntesis REAL de Chrome (sin simulador) ───────────────────────
        ctx, pg = nueva(simular=False)
        pg.goto(URL); pg.wait_for_timeout(500)
        soporte = pg.evaluate("'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function'")
        voces = pg.evaluate("speechSynthesis.getVoices().map(v => v.lang)")
        pg.click(f"{PEC} .airi-m-btn-voz"); pg.wait_for_timeout(300)
        pg.click(f"{PEC} .airi-m-pez", force=True); pg.click('#airi-m-menu-pecera [data-accion="futuro"]'); pg.wait_for_timeout(500)
        respuesta = texto(pg, PEC)
        pg.click(f"{PEC} .airi-m-btn-voz"); pg.wait_for_timeout(200)
        comprobar(soporte and "planeadas" in respuesta and "Voz desactivada" in texto(pg, PEC),
                  f"Chrome real (síntesis disponible, {len(voces)} voces instaladas): activar, hablar y silenciar sin errores")
        ctx.close()

        # ── 10. Privacidad y errores ─────────────────────────────────────────
        externas = sorted({u for u in peticiones if not u.startswith(("file:", "data:"))})
        comprobar(not externas, f"no hay peticiones de red externas {externas[:3]}")
        nav.close()

    comprobar(not errores, f"sin errores ni advertencias de JavaScript {errores[:4]}")
    fallas = [n for ok, n in resultados if not ok]
    print(f"\n{len(resultados) - len(fallas)} de {len(resultados)} comprobaciones superadas. Capturas en {cap}")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
