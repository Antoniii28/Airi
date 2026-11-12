"""
Pruebas de extremo a extremo de los ajustes de voz de AIRI v0.3 en Chrome (Playwright).

Uso, desde la raíz del repositorio:
    python interfaz/mascota/pruebas/e2e_ajustes_voz.py [--chrome RUTA] [--capturas CARPETA]

Usa `simulador_voz.js` con dos juegos de voces:
- EQUIPO_ACTUAL: las voces en español que tenía el equipo Windows del proyecto
  (Helena, Laura y Pablo, de España) más una voz en línea, como la que añade Chrome.
- CON_MEXICO: además, una voz de español de México instalada (Sabina).
"""
import argparse, json, sys, tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parents[3]
URL = (RAIZ / "interfaz" / "prototipo" / "index.html").as_uri()
SIMULADOR = Path(__file__).with_name("simulador_voz.js")
H = "Microsoft Helena - Spanish (Spain)"; L = "Microsoft Laura - Spanish (Spain)"; P = "Microsoft Pablo - Spanish (Spain)"
G = "Google español de Estados Unidos"; S = "Microsoft Sabina - Spanish (Mexico)"
EQUIPO_ACTUAL = [{"name": H, "lang": "es-ES", "localService": True, "default": True, "voiceURI": H},
                 {"name": L, "lang": "es-ES", "localService": True, "voiceURI": L},
                 {"name": P, "lang": "es-ES", "localService": True, "voiceURI": P},
                 {"name": "Microsoft David - English (United States)", "lang": "en-US", "localService": True, "voiceURI": "David"},
                 {"name": G, "lang": "es-US", "localService": False, "voiceURI": G}]
CON_MEXICO = EQUIPO_ACTUAL + [{"name": S, "lang": "es-MX", "localService": True, "voiceURI": S}]
resultados = []


def comprobar(cond, nombre):
    resultados.append((bool(cond), nombre))
    print(("OK    " if cond else "FALLA ") + nombre)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chrome", default="/usr/bin/google-chrome")
    ap.add_argument("--capturas", default=str(Path(tempfile.gettempdir()) / "airi-ajustes-voz-capturas"))
    args = ap.parse_args()
    cap = Path(args.capturas); cap.mkdir(parents=True, exist_ok=True)
    errores, peticiones = [], []

    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=args.chrome, args=["--no-sandbox"])

        def nueva(voces=EQUIPO_ACTUAL, simular=True, config=None, **extra):
            ctx = nav.new_context(viewport=extra.pop("viewport", {"width": 1366, "height": 900}), **extra)
            if simular:
                ctx.add_init_script("window.__CFG_VOZ = " + json.dumps(config or {"voces": voces, "duracion": 400}) + ";")
                ctx.add_init_script(path=str(SIMULADOR))
            pg = ctx.new_page()
            pg.on("pageerror", lambda e: errores.append(f"pageerror: {e}"))
            pg.on("console", lambda m: m.type in ("error", "warning") and errores.append(f"{m.type}: {m.text}"))
            pg.on("request", lambda r: peticiones.append(r.url))
            return ctx, pg

        habladas = lambda pg: pg.evaluate("window.__voz.habladas")
        config_guardada = lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('airi.voz.config'))")
        D = ".airi-m-dialogo"
        prosodia = lambda pg, cfg, estado: pg.evaluate("([c, e]) => AIRIVoz.prosodia(c, e)", [cfg, estado])

        def abrir_ajustes(pg):
            pg.click(".airi-m-pecera .airi-m-pez", force=True)
            pg.click('#airi-m-menu-pecera [data-accion="ajustes"]')
            pg.wait_for_timeout(150)

        # ── 1. Equipo actual (solo voces de España) ──────────────────────────
        ctx, pg = nueva()
        pg.goto(URL); pg.wait_for_timeout(800)
        comprobar(habladas(pg) == [], "no habla al abrir la página")
        abrir_ajustes(pg)
        comprobar(pg.is_visible(D) and pg.get_attribute(D, "role") == "dialog" and pg.get_attribute(D, "aria-modal") == "true",
                  "«Ajustes de voz» del menú abre un diálogo accesible")
        comprobar(pg.evaluate("document.activeElement.value") == "airi" and pg.is_checked('input[value="airi"]'),
                  "el foco va al perfil activo: «AIRI juvenil» (predeterminado)")
        comprobar("No hay voces de español de México" in pg.inner_text(".airi-m-aviso-voces"),
                  "avisa que no hay voces de español de México instaladas")
        opciones = pg.eval_on_selector_all("#airi-m-select-voz option", "os => os.map(o => o.textContent)")
        grupos = pg.eval_on_selector_all("#airi-m-select-voz optgroup", "gs => gs.map(g => g.label)")
        comprobar(opciones[0] == f"Automática ({H})" and len(opciones) == 5 and not any("English" in o or "David" in o for o in opciones),
                  f"selector: automática + 3 voces del dispositivo + 1 en línea, solo en español {opciones}")
        comprobar(grupos == ["En este dispositivo", "En línea: envían el texto al proveedor"], "las voces en línea van en un grupo aparte y avisado")
        comprobar(pg.input_value("#airi-m-tono") == "1.15" and pg.input_value("#airi-m-velocidad") == "1.04",
                  "valores predeterminados: tono 1.15 y velocidad 1.04")
        pg.screenshot(path=str(cap / "01_ajustes_escritorio.png"))

        pg.click(".airi-m-btn-escuchar"); pg.wait_for_timeout(100)
        h = habladas(pg)[-1]
        esperado = prosodia(pg, {"tono": 1.15, "velocidad": 1.04}, "bienvenida")
        comprobar(h["voice"] == H and h["pitch"] == esperado["tono"] and h["rate"] == esperado["velocidad"] and "Hola" in h["text"],
                  f"demostración con la voz desactivada: Helena, tono {h['pitch']} y velocidad {h['rate']} (saludo alegre)")
        comprobar(config_guardada(pg) is None, "escuchar no guarda nada")
        comprobar(pg.evaluate("document.querySelector('.airi-m-pecera .airi-m-pez').classList.contains('airi-m-hablando')"),
                  "la mascota se anima (movimiento y antena) durante la demostración")
        pg.click(".airi-m-btn-detener-demo"); pg.wait_for_timeout(100)
        comprobar(not pg.evaluate("speechSynthesis.speaking") and "detenida" in pg.inner_text(".airi-m-estado-demo"), "«Detener» corta la demostración")

        pg.check('input[value="energica"]'); pg.wait_for_timeout(50)
        comprobar(pg.input_value("#airi-m-tono") == "1.25" and pg.input_value("#airi-m-velocidad") == "1.1", "elegir «Enérgica» ajusta tono y velocidad")
        pg.select_option("#airi-m-frase", "advertencia")
        pg.click(".airi-m-btn-escuchar"); pg.wait_for_timeout(100)
        h = habladas(pg)[-1]; e = prosodia(pg, {"tono": 1.25, "velocidad": 1.1}, "error")
        comprobar(h["pitch"] == e["tono"] and h["pitch"] < 1.25 and "inválido" in h["text"],
                  f"frase de advertencia: más seria (tono {h['pitch']} < 1.25)")
        pg.fill("#airi-m-tono", "1.3"); pg.dispatch_event("#airi-m-tono", "input")
        comprobar(pg.is_checked('input[value="personalizada"]') and pg.inner_text('output[for="airi-m-tono"]') == "1.30",
                  "mover el tono pasa a «Personalizada» y muestra el valor")

        # Comparar perfiles y voces
        pg.select_option("#airi-m-frase", "saludo")
        n = len(habladas(pg)); pg.click(".airi-m-btn-comparar-perfiles"); pg.wait_for_timeout(100)
        nuevas = habladas(pg)[n:]
        perfiles = [t["text"].split(".")[0] for t in nuevas if t["text"].startswith("Perfil")]
        comprobar(perfiles == ["Perfil Airi juvenil", "Perfil Clásica", "Perfil Tranquila", "Perfil Enérgica"],
                  f"«Comparar perfiles» reproduce los 4 perfiles en orden {perfiles}")
        tonos = [t["pitch"] for t in nuevas if t["text"].startswith("Perfil")]
        comprobar(len(set(tonos)) >= 3, f"cada perfil suena con su propio tono {tonos}")
        pg.wait_for_timeout(500)
        comprobar("ahora:" in pg.inner_text(".airi-m-estado-demo"), "indica qué perfil se está escuchando")
        pg.click(".airi-m-btn-detener-demo")
        n = len(habladas(pg)); pg.click(".airi-m-btn-comparar-voces"); pg.wait_for_timeout(100)
        voces = [t["voice"] for t in habladas(pg)[n:] if t["text"].startswith("Voz")]
        comprobar(voces == [H, L, P], f"«Comparar voces» reproduce las voces del dispositivo, no las en línea {voces}")
        pg.click(".airi-m-btn-detener-demo")

        # Voz en línea: requiere autorización
        pg.select_option("#airi-m-select-voz", G); pg.wait_for_timeout(50)
        comprobar(pg.is_visible(".airi-m-aviso-enlinea") and pg.is_disabled(".airi-m-btn-escuchar") and pg.is_disabled(".airi-m-btn-guardar"),
                  "una voz en línea muestra el aviso y bloquea escuchar y guardar")
        pg.check("#airi-m-autorizar-enlinea")
        comprobar(not pg.is_disabled(".airi-m-btn-escuchar") and not pg.is_disabled(".airi-m-btn-guardar"), "al autorizarla se puede escuchar y guardar")
        pg.screenshot(path=str(cap / "02_voz_en_linea.png"))

        # Cancelar: nada cambia
        pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
        comprobar(pg.is_hidden(D) and config_guardada(pg) is None and
                  pg.evaluate("document.activeElement.classList.contains('airi-m-pez')"),
                  "Escape cancela sin guardar y devuelve el foco a la mascota")
        abrir_ajustes(pg)
        comprobar(pg.is_checked('input[value="airi"]') and pg.input_value("#airi-m-select-voz") == "",
                  "al reabrir conserva la configuración guardada (no la cancelada)")

        # Foco atrapado
        for _ in range(40): pg.keyboard.press("Tab")
        comprobar(pg.evaluate("document.querySelector('.airi-m-dialogo').contains(document.activeElement)"), "el foco del teclado no sale del diálogo")

        # Guardar Laura + Tranquila
        pg.select_option("#airi-m-select-voz", L); pg.check('input[value="tranquila"]')
        pg.click(".airi-m-btn-guardar"); pg.wait_for_timeout(150)
        c = config_guardada(pg)
        comprobar(c["voz"] == L and c["perfil"] == "tranquila" and c["tono"] == 1.05 and c["velocidad"] == 0.94,
                  "«Guardar» conserva voz, perfil, tono y velocidad en el navegador")
        comprobar("Guardé los ajustes" in pg.inner_text(".airi-m-pecera .airi-m-texto") and pg.is_hidden(D),
                  "con la voz desactivada, confirma por escrito sin hablar")
        n = len(habladas(pg))
        pg.click(".airi-m-pecera .airi-m-btn-voz"); pg.wait_for_timeout(100)
        h = habladas(pg)[n]
        comprobar(h["voice"] == L, "al activar la voz, AIRI usa la voz guardada (Laura)")
        pg.click('[data-tab="agua"]'); pg.click("#evaluar"); pg.wait_for_timeout(1300)
        ins = [t for t in habladas(pg) if "Información insuficiente" in t["text"]][-1]
        e = prosodia(pg, c, "insuficiente")
        comprobar(ins["pitch"] == e["tono"] and ins["rate"] == e["velocidad"] and ins["rate"] < c["velocidad"],
                  f"datos faltantes: tono tranquilo ({ins['pitch']}, velocidad {ins['rate']})")
        pg.click(".airi-m-avatar", force=True); pg.click('#airi-m-menu-flotante [data-accion="repetir"]'); pg.wait_for_timeout(100)
        rep = [t for t in habladas(pg) if "Información insuficiente" in t["text"]][-1]
        comprobar(rep["pitch"] == ins["pitch"] and rep["voice"] == L, "«Repetir» conserva voz y matiz")
        pg.click(".airi-m-avatar", force=True); pg.click('#airi-m-menu-flotante [data-accion="silenciar"]'); pg.wait_for_timeout(100)
        comprobar(pg.get_attribute(".airi-m-flotante .airi-m-btn-voz", "aria-pressed") == "false", "«Silenciar AIRI» sigue funcionando")
        pg.reload(); pg.wait_for_timeout(800)
        comprobar(habladas(pg) == [] and config_guardada(pg)["voz"] == L, "tras recargar: ajustes conservados y no habla sola")
        abrir_ajustes(pg)
        comprobar(pg.input_value("#airi-m-select-voz") == L and pg.is_checked('input[value="tranquila"]'), "el diálogo muestra lo guardado")
        pg.click(".airi-m-btn-restablecer")
        comprobar(pg.is_checked('input[value="airi"]') and pg.input_value("#airi-m-select-voz") == "" and config_guardada(pg)["voz"] == L,
                  "«Restablecer recomendada» prepara AIRI juvenil y voz automática sin guardar todavía")
        pg.click(".airi-m-btn-guardar"); pg.wait_for_timeout(100)
        comprobar(config_guardada(pg)["perfil"] == "airi" and config_guardada(pg)["voz"] is None, "y al guardar vuelve a la recomendada")
        ctx.close()

        # ── 2. Con una voz de México instalada ───────────────────────────────
        ctx, pg = nueva(voces=CON_MEXICO)
        pg.goto(URL); abrir_ajustes(pg)
        comprobar(pg.eval_on_selector("#airi-m-select-voz option", "o => o.textContent") == f"Automática ({S})" and
                  "las de México aparecen primero" in pg.inner_text(".airi-m-aviso-voces"),
                  "con voz de México instalada, la automática es español de México")
        primera = pg.eval_on_selector("#airi-m-select-voz optgroup option", "o => o.textContent")
        comprobar(primera.startswith("Microsoft Sabina") and "México" in primera, "y aparece primero en la lista")
        ctx.close()

        # ── 3. Sin síntesis de voz ───────────────────────────────────────────
        ctx, pg = nueva(config={"sinSoporte": True})
        pg.goto(URL); abrir_ajustes(pg)
        comprobar(pg.is_visible(D) and pg.is_disabled(".airi-m-btn-escuchar") and pg.is_disabled(".airi-m-btn-guardar") and
                  "no permite la síntesis" in pg.inner_text(".airi-m-estado-demo"),
                  "navegador sin síntesis: el diálogo lo explica y deshabilita escuchar y guardar")
        pg.click(".airi-m-btn-cancelar")
        comprobar(pg.is_hidden(D), "y se puede cerrar")
        ctx.close()

        # ── 4. Movimiento reducido y celular ─────────────────────────────────
        ctx, pg = nueva(reduced_motion="reduce")
        pg.goto(URL); abrir_ajustes(pg); pg.click(".airi-m-btn-escuchar"); pg.wait_for_timeout(100)
        anim = pg.evaluate("getComputedStyle(document.querySelector('.airi-m-pecera .airi-m-capas')).animationName")
        comprobar(anim == "none", "movimiento reducido: la demostración no anima el cuerpo")
        ctx.close()
        ctx, pg = nueva(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
        pg.goto(URL); pg.wait_for_timeout(300)
        pg.evaluate("window.airiInteraccion.ejecutar('ajustes')"); pg.wait_for_timeout(200)
        caja = pg.evaluate("(() => { const r = document.querySelector('.airi-m-dialogo').getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, innerWidth, innerHeight]; })()")
        comprobar(caja[0] >= 0 and caja[1] >= 0 and caja[2] <= caja[4] and caja[3] <= caja[5], f"celular: el diálogo cabe en la pantalla {caja}")
        pg.screenshot(path=str(cap / "03_ajustes_celular.png"))
        pg.locator('input[value="energica"]').tap()
        pg.locator(".airi-m-btn-guardar").scroll_into_view_if_needed(); pg.screenshot(path=str(cap / "04_ajustes_celular_pie.png"))
        pg.locator(".airi-m-btn-guardar").tap(); pg.wait_for_timeout(100)
        comprobar(config_guardada(pg)["perfil"] == "energica", "celular: se puede elegir y guardar con toque")
        ctx.close()

        # ── 5. Chrome real (sin simulador) ───────────────────────────────────
        ctx, pg = nueva(simular=False)
        pg.goto(URL); pg.wait_for_timeout(400); abrir_ajustes(pg)
        pg.click(".airi-m-btn-escuchar"); pg.wait_for_timeout(300)
        pg.click(".airi-m-btn-comparar-perfiles"); pg.wait_for_timeout(300); pg.click(".airi-m-btn-detener-demo")
        pg.click(".airi-m-btn-guardar")
        comprobar(pg.is_hidden(D), "Chrome real: demostración, comparación y guardado sin errores")
        ctx.close()

        externas = sorted({u for u in peticiones if not u.startswith(("file:", "data:"))})
        comprobar(not externas, f"no hay peticiones de red externas {externas[:3]}")
        nav.close()

    comprobar(not errores, f"sin errores ni advertencias de JavaScript {errores[:4]}")
    fallas = [n for ok, n in resultados if not ok]
    print(f"\n{len(resultados) - len(fallas)} de {len(resultados)} comprobaciones superadas. Capturas en {cap}")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
