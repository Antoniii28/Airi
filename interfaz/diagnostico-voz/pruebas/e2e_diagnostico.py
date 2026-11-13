"""
Pruebas de la página de diagnóstico de voz (v0.6 E1) en Chrome, con las API de voz SIMULADAS.

Comprueba la lógica y, sobre todo, la privacidad: al cargar no se inicia el micrófono, no se descargan paquetes
de idioma y no hay peticiones de red. El micrófono solo arranca con consentimiento + clic.

    python interfaz/diagnostico-voz/pruebas/e2e_diagnostico.py [--chrome RUTA] [--capturas CARPETA]
"""
import argparse
import json
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parents[3]
URL = (RAIZ / "interfaz" / "diagnostico-voz" / "index.html").as_uri()
resultados = []

SIMULADOR = """
window.__registro = { start: [], install: 0, available: [], speak: [] };
const voces = %(voces)s;
if (%(sintesis)s) {
  const sintesis = { getVoices: () => voces.map(v => Object.assign({}, v)), speak: (u) => { window.__registro.speak.push(u.voice ? u.voice.name : null); },
    cancel: () => {}, addEventListener: () => {} };
  Object.defineProperty(window, 'speechSynthesis', { value: sintesis, configurable: true });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
} else {
  try { delete window.speechSynthesis; } catch (e) {}
  Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
  delete window.speechSynthesis;
}
const disp = %(disponibilidad)s;
if (disp === null) {
  Object.defineProperty(window, 'SpeechRecognition', { value: undefined, configurable: true });
  Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined, configurable: true });
  delete window.SpeechRecognition; delete window.webkitSpeechRecognition;
} else {
  class Rec {
    start() { window.__registro.start.push({ lang: this.lang, local: !!this.processLocally }); }
    abort() {} stop() {}
    static async available(o) { window.__registro.available.push(o); return disp[o.langs[0]][o.processLocally ? 0 : 1]; }
    static async install() { window.__registro.install++; return true; }
  }
  Object.defineProperty(window, 'SpeechRecognition', { value: Rec, configurable: true });
}
"""

VOCES_WINDOWS = [
    {"name": "Microsoft Helena - Spanish (Spain)", "lang": "es-ES", "localService": True, "default": True},
    {"name": "Microsoft Laura - Spanish (Spain)", "lang": "es-ES", "localService": True, "default": False},
    {"name": "Microsoft Dalia Online (Natural) - Spanish (Mexico)", "lang": "es-MX", "localService": False, "default": False},
    {"name": "Microsoft David - English (United States)", "lang": "en-US", "localService": True, "default": False},
]
DISP_CHROME = {"es-MX": ["downloadable", "available"], "es-ES": ["available", "available"], "es-US": ["unavailable", "available"]}


def comprobar(cond, nombre):
    resultados.append((bool(cond), nombre))
    print(("OK    " if cond else "FALLA ") + nombre)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chrome", default="/usr/bin/google-chrome")
    ap.add_argument("--capturas", default=str(Path(tempfile.gettempdir()) / "airi-diagnostico-voz"))
    args = ap.parse_args()
    cap = Path(args.capturas); cap.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=args.chrome, args=["--no-sandbox"])

        def abrir(voces=VOCES_WINDOWS, sintesis=True, disponibilidad=DISP_CHROME, **kw):
            ctx = nav.new_context(**kw)
            ctx.add_init_script(SIMULADOR % {"voces": json.dumps(voces), "sintesis": "true" if sintesis else "false",
                                             "disponibilidad": json.dumps(disponibilidad)})
            pg = ctx.new_page()
            errores, red = [], []
            pg.on("pageerror", lambda e: errores.append(str(e)))
            pg.on("request", lambda r: not r.url.startswith(("file://", "data:")) and red.append(r.url))
            pg.goto(URL)
            informe = pg.evaluate("window.AIRIDiagnosticoVoz.listo")
            return ctx, pg, informe, errores, red

        # ── Navegador tipo Chrome/Edge en Windows ────────────────────────────
        ctx, pg, inf, errores, red = abrir(viewport={"width": 1280, "height": 900})
        reg = pg.evaluate("window.__registro")
        comprobar(reg["start"] == [] and reg["install"] == 0, "al cargar NO se activa el micrófono ni se descargan paquetes")
        comprobar(not red, f"sin peticiones de red {red[:2]}")
        comprobar(inf["sintesis"]["espanolLocales"] == 2 and inf["sintesis"]["espanolRemotas"] == 1 and inf["sintesis"]["total"] == 4,
                  "cuenta voces en español locales y remotas")
        filas = pg.eval_on_selector_all("#voces tbody tr", "l => l.map(r => r.innerText)")
        comprobar(len(filas) == 3 and "Servicio remoto" in filas[2] and "En este equipo" in filas[0],
                  "tabla de voces en español con su procedencia (equipo o servicio remoto)")
        comprobar(len(reg["available"]) == 6 and {a["processLocally"] for a in reg["available"]} == {True, False},
                  "consulta available() en el dispositivo y en cualquier modo para es-MX, es-ES y es-US")
        comprobar(inf["reconocimiento"]["idiomas"]["es-MX"] == {"dispositivo": "downloadable", "cualquierModo": "available"} and
                  inf["reconocimiento"]["conclusion"] == "dictado en el dispositivo disponible", "interpreta la disponibilidad")
        comprobar(json.loads(pg.input_value("#informe"))["microfono"]["usado"] is False, "el informe indica que no se usó el micrófono")
        pg.click("#escuchar")
        comprobar(pg.evaluate("window.__registro.speak") == ["Microsoft Helena - Spanish (Spain)"], "«Escuchar ejemplo» habla solo al pulsarlo")
        pg.click("#mic-probar")
        comprobar(pg.evaluate("window.__registro.start") == [] and "Marca la casilla" in pg.inner_text("#mic-resultado"),
                  "sin consentimiento, el botón del micrófono NO lo activa")
        pg.check("#mic-consentimiento"); pg.check("#mic-local"); pg.select_option("#mic-idioma", "es-ES"); pg.click("#mic-probar")
        comprobar(pg.evaluate("window.__registro.start") == [{"lang": "es-ES", "local": True}],
                  "con consentimiento y clic: una sola escucha, en el idioma y modo elegidos")
        comprobar(not errores, f"sin errores de JavaScript {errores[:2]}")
        pg.screenshot(path=str(cap / "01_escritorio.png"), full_page=True)
        ctx.close()

        # ── Sin reconocimiento (como Firefox) ────────────────────────────────
        ctx, pg, inf, errores, red = abrir(disponibilidad=None)
        comprobar(inf["reconocimiento"]["api"] is None and pg.is_disabled("#mic-probar") and
                  "no ofrece dictado" in pg.inner_text("#reconocimiento-resumen"), "sin reconocimiento: lo explica y desactiva la prueba")
        comprobar(not errores, "sin errores de JavaScript (sin reconocimiento)")
        ctx.close()

        # ── Reconocimiento sin available() (Chrome antiguo, Safari) ──────────
        ctx = nav.new_context()
        ctx.add_init_script("window.webkitSpeechRecognition = class { start(){} abort(){} }; window.SpeechRecognition = undefined;")
        pg = ctx.new_page(); pg.goto(URL); inf = pg.evaluate("window.AIRIDiagnosticoVoz.listo")
        comprobar(inf["reconocimiento"]["api"] == "webkitSpeechRecognition (con prefijo)" and
                  inf["reconocimiento"]["idiomas"]["es-MX"]["dispositivo"] == "sin dato",
                  "con prefijo y sin available(): lo indica como «sin dato»")
        ctx.close()

        # ── Sin síntesis y sin voces ─────────────────────────────────────────
        ctx, pg, inf, errores, red = abrir(sintesis=False)
        comprobar(inf["sintesis"]["disponible"] is False and pg.is_disabled("#escuchar"), "sin speechSynthesis: lo indica")
        ctx.close()
        ctx, pg, inf, errores, red = abrir(voces=[])
        comprobar("Sin voces" in pg.inner_text("#sintesis-resumen"), "API sin voces: lo indica")
        ctx.close()

        # ── Celular ──────────────────────────────────────────────────────────
        ctx, pg, inf, errores, red = abrir(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
        ancho = pg.evaluate("[document.documentElement.scrollWidth, innerWidth]")
        comprobar(ancho[0] <= ancho[1], f"celular: sin desplazamiento horizontal {ancho}")
        pg.screenshot(path=str(cap / "02_celular.png"), full_page=True)
        ctx.close()
        nav.close()

    fallas = [n for ok, n in resultados if not ok]
    print(f"\n{len(resultados) - len(fallas)} de {len(resultados)} comprobaciones superadas. Capturas en {cap}")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
