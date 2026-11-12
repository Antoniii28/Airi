"""
Pruebas de extremo a extremo de la mascota AIRI en Chrome real (Playwright).

Uso, desde la raíz del repositorio:
    python interfaz/mascota/pruebas/e2e_mascota.py [--chrome RUTA] [--capturas CARPETA]

Requisitos solo de desarrollo: Python 3, el paquete `playwright` y Chrome o Chromium.
Abre interfaz/prototipo/index.html directamente (file://), como lo haría una persona.

Para comprobar que nada se rompió, genera en una carpeta temporal una copia del
prototipo SIN las líneas de la mascota y compara su comportamiento con la versión
con mascota.
"""
import argparse, re, shutil, sys, tempfile, time
from pathlib import Path
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parents[3]
PROTOTIPO = RAIZ / "interfaz" / "prototipo" / "index.html"
LINEAS_MASCOTA = [
    '<link rel="stylesheet" href="../mascota/mascota.css">\n',
    '<script src="../mascota/mascota.js"></script>\n',
    '<script src="../mascota/voz.js"></script>\n',          # v0.2
    '<script src="../mascota/ayuda.js"></script>\n',        # v0.2
    '<script src="../mascota/ajustes-voz.js"></script>\n',  # v0.3
    '<script src="../mascota/interaccion.js"></script>\n',  # v0.2
    '<script src="../mascota/integracion-prototipo.js"></script>\n',
]
resultados = []


def comprobar(cond, nombre):
    resultados.append((bool(cond), nombre))
    print(("OK    " if cond else "FALLA ") + nombre)


def prototipo_sin_mascota(tmp):
    html = PROTOTIPO.read_text(encoding="utf-8")
    for linea in LINEAS_MASCOTA:
        assert linea in html, f"falta la línea de integración: {linea!r}"
        html = html.replace(linea, "")
    destino = Path(tmp) / "interfaz" / "prototipo" / "index.html"
    destino.parent.mkdir(parents=True)
    destino.write_text(html, encoding="utf-8")
    shutil.copytree(RAIZ / "identidad-visual", Path(tmp) / "identidad-visual")
    # v0.4: el motor de análisis forma parte del prototipo (no de la mascota): también se copia
    shutil.copytree(RAIZ / "interfaz" / "motor", Path(tmp) / "interfaz" / "motor")
    return destino.as_uri()


def recorrido_funcional(pagina):
    """Ejecuta las pruebas manuales de entregables/interfaz_inicial.md y devuelve lo observado."""
    obs = {}
    obs["logo"] = pagina.evaluate("document.querySelector('header img').naturalWidth > 0")
    for tab in ["agua", "especies", "futuro", "inicio"]:
        pagina.click(f'[data-tab="{tab}"]')
        obs[f"pestana_{tab}"] = pagina.evaluate(
            "t => [...document.querySelectorAll('main section')].filter(s => !s.classList.contains('hidden')).map(s => s.id)", tab)
    pagina.click('[data-tab="agua"]')
    casos = {"vacio": ["", "", "", "", "", ""],
             "invalido": ["abc", "-1", "35", "0,1", "15", ""],
             "validos": ["25", "8.1", "35", "0.02", "0,05", "10"]}
    for nombre, valores in casos.items():
        for i, v in enumerate(valores):
            pagina.fill(f"#p{i}", v)
        pagina.click("#evaluar")
        obs[f"validar_{nombre}"] = pagina.inner_text("#resultado")
    pagina.click("#limpiar")
    obs["limpiar"] = (pagina.inner_text("#resultado"), [pagina.input_value(f"#p{i}") for i in range(6)])
    pagina.click('[data-tab="especies"]')
    for q in ["", "payaso", "Zebrasoma", "zzz"]:
        pagina.fill("#buscar", q)
        obs[f"buscar_{q or 'todo'}"] = pagina.inner_text("#catalogo")
    pagina.click('[data-tab="inicio"]')
    return obs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chrome", default="/usr/bin/google-chrome")
    ap.add_argument("--capturas", default=str(Path(tempfile.gettempdir()) / "airi-mascota-capturas"))
    args = ap.parse_args()
    capturas = Path(args.capturas); capturas.mkdir(parents=True, exist_ok=True)
    url = PROTOTIPO.as_uri()
    tmp = tempfile.mkdtemp()
    url_original = prototipo_sin_mascota(tmp)

    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=args.chrome, args=["--no-sandbox"])
        errores = []

        def nueva(viewport, **extra):
            ctx = nav.new_context(viewport=viewport, **extra)
            pg = ctx.new_page()
            pg.on("pageerror", lambda e: errores.append(f"pageerror: {e}"))
            pg.on("console", lambda m: m.type == "error" and errores.append(f"console: {m.text}"))
            pg.on("requestfailed", lambda r: errores.append(f"recurso no cargado: {r.url}"))
            return ctx, pg

        # ── 1. Regresión: mismo comportamiento con y sin mascota ─────────────
        ctx0, pg0 = nueva({"width": 1366, "height": 900})
        pg0.goto(url_original); antes = recorrido_funcional(pg0); ctx0.close()
        ctx, pg = nueva({"width": 1366, "height": 900})
        pg.goto(url); despues = recorrido_funcional(pg)
        for clave in antes:
            comprobar(antes[clave] == despues[clave], f"regresión · {clave}: igual con y sin mascota")
        comprobar(antes["buscar_payaso"].count("Ficha preliminar") == 1 and "No hay coincidencias" in antes["buscar_zzz"],
                  "regresión · el buscador filtra (1 resultado para «payaso», ninguno para «zzz»)")
        comprobar(antes["validar_vacio"].count("INFORMACIÓN INSUFICIENTE") == 6 and "VALOR INVÁLIDO" in antes["validar_invalido"],
                  "regresión · el formulario valida como antes")
        ctx.close()

        # ── 2. Pecera, animaciones y estados (escritorio) ────────────────────
        ctx, pg = nueva({"width": 1366, "height": 900})
        pg.goto(url)
        comprobar(pg.is_visible(".airi-m-pecera .airi-m-agua"), "pecera visible en Inicio")
        comprobar(pg.is_hidden(".airi-m-flotante"), "en Inicio no aparece el asistente flotante")
        capas = pg.evaluate("[...document.querySelectorAll('.airi-m-pecera .airi-m-capa img')].map(i => i.complete && i.naturalWidth)")
        comprobar(len(capas) == 4 and all(capas), f"las 4 capas del personaje cargan ({capas})")
        comprobar(pg.evaluate("document.querySelector('.airi-m-pecera .airi-m-pez').classList.contains('airi-m-estado-bienvenida')"),
                  "estado de bienvenida al iniciar (saludo)")
        anim = pg.evaluate("""[...document.querySelectorAll('.airi-m-pecera .airi-m-cola, .airi-m-pecera .airi-m-dorsal, .airi-m-pecera .airi-m-antena')]
                              .map(e => getComputedStyle(e).animationName)""")
        comprobar(anim == ["airi-m-aleteo", "airi-m-dorsal", "airi-m-antena"], f"cola, aleta dorsal y antena animadas por separado {anim}")
        comprobar(pg.evaluate("document.querySelectorAll('.airi-m-burbuja').length") == 8 and
                  pg.evaluate("getComputedStyle(document.querySelector('.airi-m-burbuja')).animationName") == "airi-m-subir",
                  "burbujas animadas")
        comprobar(pg.evaluate("getComputedStyle(document.querySelector('.airi-m-rayos')).animationName") == "airi-m-rayos" and
                  pg.evaluate("getComputedStyle(document.querySelector('.airi-m-superficie')).animationName") == "airi-m-ola",
                  "iluminación submarina y movimiento del agua animados")
        pg.wait_for_timeout(1200)
        pg.screenshot(path=str(capturas / "01_pecera_escritorio.png"))
        def posicion():
            return pg.evaluate("(() => { const r = document.querySelector('.airi-m-pecera .airi-m-pez').getBoundingClientRect(); return [r.x, r.y]; })()")
        p1 = posicion(); pg.wait_for_timeout(800); p2 = posicion()
        comprobar(abs(p2[0] - p1[0]) > 15, f"AIRI nada horizontalmente ({p1[0]:.0f} → {p2[0]:.0f} px)")
        comprobar(abs(p2[1] - p1[1]) > 0.5, "flotación vertical suave")
        pg.wait_for_timeout(2600)
        comprobar(pg.evaluate("document.querySelector('.airi-m-pecera .airi-m-pez').classList.contains('airi-m-estado-espera')"),
                  "tras el saludo pasa al estado de espera")
        inicio = time.time(); giro = False
        dentro = True
        while time.time() - inicio < 40 and not giro:
            giro = pg.evaluate("document.querySelector('.airi-m-pecera .airi-m-giro').classList.contains('airi-m-izquierda')")
            d = pg.evaluate("""(() => { const a = document.querySelector('.airi-m-agua').getBoundingClientRect(),
                                         p = document.querySelector('.airi-m-pecera .airi-m-pez').getBoundingClientRect();
                                 return p.left >= a.left - 1 && p.right <= a.right + 1 && p.top >= a.top - 1 && p.bottom <= a.bottom + 1; })()""")
            dentro = dentro and d
            pg.wait_for_timeout(250)
        comprobar(giro, f"cambia de dirección de forma natural (en {time.time() - inicio:.0f} s)")
        comprobar(dentro, "AIRI permanece siempre dentro de la pecera")
        pg.wait_for_timeout(500)
        pg.screenshot(path=str(capturas / "02_pecera_giro.png"))

        # ── 3. Asistente flotante y estados de validación ────────────────────
        for tab in ["agua", "especies", "futuro"]:
            pg.click(f'[data-tab="{tab}"]')
            comprobar(pg.is_visible(".airi-m-flotante") and pg.is_visible(".airi-m-flotante .airi-m-globo"),
                      f"pestaña {tab}: asistente flotante visible con mensaje")
        comprobar("planeadas para próximas versiones" in pg.inner_text(".airi-m-flotante .airi-m-texto"), "mensaje contextual de Próximas versiones")
        pg.click('[data-tab="inicio"]')
        comprobar(pg.is_visible(".airi-m-pecera .airi-m-agua") and pg.is_hidden(".airi-m-flotante"),
                  "al volver a Inicio reaparece la pecera y se oculta el flotante")
        pg.click('[data-tab="futuro"]')
        pg.click('[data-tab="agua"]')
        comprobar("Validar entradas" in pg.inner_text(".airi-m-flotante .airi-m-texto"), "mensaje contextual de Parámetros del agua")
        pez = ".airi-m-flotante .airi-m-pez"
        pg.click("#evaluar")
        comprobar(pg.evaluate(f"document.querySelector('{pez}').classList.contains('airi-m-estado-analisis')") and
                  "Animación demostrativa" in pg.inner_text(".airi-m-flotante .airi-m-etiqueta"),
                  "al validar: reacción de análisis marcada como animación demostrativa")
        pg.wait_for_timeout(1100)
        comprobar(pg.evaluate(f"document.querySelector('{pez}').classList.contains('airi-m-estado-insuficiente')") and
                  pg.inner_text(f"{pez} .airi-m-senal") == "?", "datos faltantes → estado de información insuficiente con señal «?»")
        texto = pg.inner_text(".airi-m-flotante .airi-m-texto")
        comprobar("Temperatura, pH, Salinidad, Amoníaco total, Nitritos y Nitratos" in texto and "no es una alerta del acuario" in texto,
                  "mensaje de información insuficiente lista los campos reales y no es alerta biológica")
        comprobar(pg.inner_text(".airi-m-flotante .airi-m-etiqueta") == "Advertencia informativa", "etiqueta: advertencia informativa")
        pg.wait_for_timeout(300)
        pg.screenshot(path=str(capturas / "03_flotante_insuficiente.png"))
        for i, v in enumerate(["abc", "8.1", "35", "", "0.1", "-3"]):
            pg.fill(f"#p{i}", v)
        comprobar(pg.is_hidden(".airi-m-flotante .airi-m-globo"), "el globo se contrae al usar el formulario (no tapa los campos)")
        pg.click("#evaluar"); pg.wait_for_timeout(1100)
        texto = pg.inner_text(".airi-m-flotante .airi-m-texto")
        # v0.4: los nitritos (0.1) son detectables → el motor marca anomalía; la alerta prevalece (R4) y el
        # mensaje conserva también los inválidos y el faltante.
        comprobar(pg.evaluate(f"document.querySelector('{pez}').classList.contains('airi-m-estado-alerta')") and
                  pg.inner_text(f"{pez} .airi-m-senal") == "!", "valores inválidos + nitritos detectables → alerta con señal «!» (R4)")
        comprobar("Temperatura y Nitratos" in texto and "falta el dato de Amoníaco total" in texto and "Nitritos" in texto,
                  f"el mensaje conserva anomalía, inválidos y faltante: {texto!r}")
        pg.screenshot(path=str(capturas / "04_flotante_error.png"))
        for i, v in enumerate(["25", "8.1", "35", "0.02", "0,05", "10"]):
            pg.fill(f"#p{i}", v)
        pg.click("#evaluar"); pg.wait_for_timeout(1100)
        texto = pg.inner_text(".airi-m-flotante .airi-m-texto")
        # v0.4: amoníaco 0.02 y nitritos 0.05 son detectables → alerta; temperatura, salinidad y nitratos sin referencia
        comprobar("conviene revisar" in texto and "No evalúo Temperatura, Salinidad y Nitratos" in texto and
                  not re.search(r"(?i)\b(normal|seguro|saludable)\b", texto) and
                  pg.evaluate(f"document.querySelector('{pez}').classList.contains('airi-m-estado-alerta')"),
                  "datos válidos → compara con referencias, explica lo no evaluado y no declara normalidad")
        pg.click("#limpiar"); pg.wait_for_timeout(200)
        comprobar("Formulario limpio" in pg.inner_text(".airi-m-flotante .airi-m-texto"), "«Limpiar» actualiza el mensaje")
        comprobar(not pg.evaluate("document.querySelector('.airi-m-pez.airi-m-estado-alerta')"),
                  "tras «Limpiar» no queda ninguna alerta activa")
        pg.click('[data-tab="especies"]'); pg.fill("#buscar", "payaso"); pg.wait_for_timeout(900)
        comprobar("1 ficha para «payaso»" in pg.inner_text(".airi-m-flotante .airi-m-texto"), "buscador: mensaje con el resultado real (1 ficha)")
        pg.fill("#buscar", "zzz"); pg.wait_for_timeout(900)
        comprobar("No encontré fichas" in pg.inner_text(".airi-m-flotante .airi-m-texto"), "buscador: mensaje cuando no hay coincidencias")
        pg.fill("#buscar", ""); pg.wait_for_timeout(900)
        pg.screenshot(path=str(capturas / "05_flotante_especies.png"))

        # ── 4. No tapa botones, formularios ni fichas ────────────────────────
        def sin_obstruccion(pagina, etiqueta):
            for tab, selector in [("agua", "#agua input, #agua select, #agua button"), ("especies", "#especies input, #catalogo article")]:
                pagina.click(f'[data-tab="{tab}"]')
                for globo_abierto in (True, False):
                    if globo_abierto:
                        pagina.evaluate("window.airiMascota.decir(AIRIMascota.MENSAJES_PESTANA.agua)")
                    else:
                        # v0.2: pulsar el avatar abre el menú; el globo se cierra con la API
                        pagina.evaluate("window.airiInteraccion && window.airiInteraccion.cerrarMenus(false); window.airiMascota.elementos.abrirGlobo(false)")
                    tapados = pagina.evaluate("""sel => [...document.querySelectorAll(sel)].filter(e => {
                        e.scrollIntoView({block: 'center'});
                        const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
                        const arriba = document.elementFromPoint(x, y);
                        return !(arriba === e || e.contains(arriba));
                    }).map(e => e.id || e.textContent.trim().slice(0, 25))""", selector)
                    comprobar(not tapados, f"{etiqueta} · {tab} · globo {'abierto' if globo_abierto else 'cerrado'}: ningún control ni ficha queda tapado {tapados}")
                pagina.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
                pagina.wait_for_timeout(100)
                ultimo = pagina.evaluate("""sel => { const l = [...document.querySelectorAll(sel)].pop().getBoundingClientRect();
                                             const a = document.querySelector('.airi-m-avatar').getBoundingClientRect();
                                             return l.bottom <= a.top || l.right <= a.left; }""", selector)
                comprobar(ultimo, f"{etiqueta} · {tab}: al final de la página el último elemento queda libre del avatar")
        sin_obstruccion(pg, "escritorio")

        # ── 5. Ocultar y mostrar ─────────────────────────────────────────────
        pg.click('[data-tab="agua"]')
        pg.evaluate("window.airiMascota.decir(AIRIMascota.MENSAJES_PESTANA.agua)")
        pg.click(".airi-m-flotante .airi-m-btn-ocultar")
        comprobar(pg.is_hidden(".airi-m-flotante") and pg.is_visible(".airi-m-mostrar"), "«Ocultar mascota» oculta el asistente y deja «Mostrar AIRI»")
        comprobar(pg.evaluate("document.activeElement.classList.contains('airi-m-mostrar')"), "el foco pasa a «Mostrar AIRI» (teclado)")
        pg.reload(); pg.click('[data-tab="agua"]')
        comprobar(pg.is_hidden(".airi-m-flotante"), "la preferencia de ocultar se conserva al recargar")
        pg.click('[data-tab="inicio"]')
        comprobar(pg.is_hidden(".airi-m-agua") and pg.inner_text(".airi-m-pecera .airi-m-btn-ocultar") == "Mostrar AIRI",
                  "oculta también en Inicio; la pecera ofrece «Mostrar AIRI»")
        pg.screenshot(path=str(capturas / "06_inicio_oculta.png"))
        pg.click(".airi-m-pecera .airi-m-btn-ocultar")
        comprobar(pg.is_visible(".airi-m-agua"), "«Mostrar AIRI» vuelve a mostrar la pecera")
        pg.click('[data-tab="agua"]')
        comprobar(pg.is_visible(".airi-m-flotante"), "y el asistente flotante")
        pg.evaluate("window.airiMascota.decir(AIRIMascota.MENSAJES_PESTANA.agua)")
        pg.focus(".airi-m-flotante .airi-m-btn-ocultar")
        pg.keyboard.press("Enter")
        comprobar(pg.is_hidden(".airi-m-flotante"), "los controles funcionan con teclado (Enter)")
        pg.keyboard.press("Enter")
        comprobar(pg.is_visible(".airi-m-flotante"), "«Mostrar AIRI» con teclado")
        ctx.close()

        # ── 6. Movimiento reducido ───────────────────────────────────────────
        ctx, pg = nueva({"width": 1366, "height": 900}, reduced_motion="reduce")
        pg.goto(url); pg.wait_for_timeout(300)
        comprobar(pg.evaluate("document.querySelector('.airi-m-pecera').classList.contains('airi-m-reducido')") and
                  pg.get_attribute(".airi-m-pecera .airi-m-btn-reducir", "aria-pressed") == "true",
                  "respeta prefers-reduced-motion del sistema")
        anim = pg.evaluate("[...document.querySelectorAll('.airi-m-pecera *')].map(e => getComputedStyle(e).animationName).filter(n => n !== 'none')")
        comprobar(anim == [], f"con movimiento reducido no hay animaciones CSS activas {anim[:3]}")
        a = posicion(); pg.wait_for_timeout(1000); b = posicion()
        comprobar(a == b, "con movimiento reducido AIRI queda quieto")
        comprobar(pg.is_hidden(".airi-m-burbuja"), "sin burbujas en movimiento")
        pg.screenshot(path=str(capturas / "07_movimiento_reducido.png"))
        pg.click('[data-tab="agua"]'); pg.click("#evaluar"); pg.wait_for_timeout(150)
        comprobar(pg.evaluate("document.querySelector('.airi-m-flotante .airi-m-pez').classList.contains('airi-m-estado-insuficiente')"),
                  "con movimiento reducido el resultado se muestra sin pausa y las señales de estado siguen visibles")
        pg.click('[data-tab="inicio"]')
        pg.click(".airi-m-pecera .airi-m-btn-reducir")
        pg.wait_for_timeout(600); a = posicion(); pg.wait_for_timeout(800); b = posicion()
        comprobar(a != b and pg.get_attribute(".airi-m-pecera .airi-m-btn-reducir", "aria-pressed") == "false",
                  "la persona puede volver a activar las animaciones")
        pg.click(".airi-m-pecera .airi-m-btn-reducir"); pg.wait_for_timeout(200)
        a = posicion(); pg.wait_for_timeout(600); b = posicion()
        comprobar(a == b, "«Reducir animaciones» detiene el nado")
        ctx.close()

        # ── 7. Celular ───────────────────────────────────────────────────────
        ctx, pg = nueva({"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
        pg.goto(url); pg.wait_for_timeout(1500)
        comprobar(pg.is_visible(".airi-m-agua"), "celular: pecera visible")
        ancho = pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
        comprobar(ancho[0] <= ancho[1], f"celular: sin desplazamiento horizontal {ancho}")
        pg.screenshot(path=str(capturas / "08_celular_inicio.png"))
        pg.click('[data-tab="especies"]'); pg.wait_for_timeout(500)
        pg.screenshot(path=str(capturas / "09_celular_especies.png"))
        caja = pg.evaluate("(() => { const r = document.querySelector('.airi-m-flotante').getBoundingClientRect(); return [r.left, r.right, window.innerWidth]; })()")
        comprobar(caja[0] >= 0 and caja[1] <= caja[2], f"celular: el asistente cabe en la pantalla {caja}")
        sin_obstruccion(pg, "celular")
        pg.click('[data-tab="agua"]'); pg.tap("#evaluar"); pg.wait_for_timeout(1200)
        pg.screenshot(path=str(capturas / "10_celular_agua.png"))
        ctx.close()

        comprobar(not errores, f"sin errores de JavaScript ni recursos faltantes {errores[:5]}")
        nav.close()
    shutil.rmtree(tmp, ignore_errors=True)
    fallas = [n for ok, n in resultados if not ok]
    print(f"\n{len(resultados) - len(fallas)} de {len(resultados)} comprobaciones superadas. Capturas en {capturas}")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
