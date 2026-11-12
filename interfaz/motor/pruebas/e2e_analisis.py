"""
Pruebas de integración de extremo a extremo del motor de análisis v0.4 en el prototipo (Chrome + Playwright).

Uso, desde la raíz del repositorio:
    python interfaz/motor/pruebas/e2e_analisis.py [--chrome RUTA] [--capturas CARPETA]

Cubre: carga del motor en el navegador, conformidad de los 34 casos DENTRO de la página, validación de
formato conservada, panel de análisis (R3, R4, inválidos), mensajes y estados de la mascota, voz (simulada
para medir tono y velocidad, y real para detectar errores), movimiento reducido, accesibilidad básica,
celular, respaldo sin motor y ausencia de peticiones externas.
"""
import argparse
import json
import re
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parents[3]
URL = (RAIZ / "interfaz" / "prototipo" / "index.html").as_uri()
SIMULADOR = RAIZ / "interfaz" / "mascota" / "pruebas" / "simulador_voz.js"
CASOS = json.loads((RAIZ / "motor" / "casos_conformidad.json").read_text(encoding="utf-8"))
PROHIBIDO = re.compile(r"(es seguro|está sano|saludable|agua segura|condiciones seguras garantizadas|diagnóstico:|"
                       r"enfermedad detectada|peligro|urgente|emergencia|¡alerta|mortal|tóxico para tus peces)", re.I)
FLOT = ".airi-m-flotante"
PEZ = f"{FLOT} .airi-m-pez"
resultados = []


def comprobar(cond, nombre):
    resultados.append((bool(cond), nombre))
    print(("OK    " if cond else "FALLA ") + nombre)


def llenar(pg, valores):
    for i, v in enumerate(valores):
        pg.fill(f"#p{i}", v)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chrome", default="/usr/bin/google-chrome")
    ap.add_argument("--capturas", default=str(Path(tempfile.gettempdir()) / "airi-analisis-capturas"))
    args = ap.parse_args()
    cap = Path(args.capturas); cap.mkdir(parents=True, exist_ok=True)
    errores, peticiones = [], []

    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=args.chrome, args=["--no-sandbox"])

        def nueva(viewport=None, simular=True, bloquear_motor=False, **extra):
            ctx = nav.new_context(viewport=viewport or {"width": 1366, "height": 900}, **extra)
            if simular:
                ctx.add_init_script("window.__CFG_VOZ = {};")
                ctx.add_init_script(path=str(SIMULADOR))
            if bloquear_motor:
                ctx.route(re.compile(r".*/interfaz/motor/.*"), lambda r: r.abort())
            pg = ctx.new_page()
            if not bloquear_motor:
                pg.on("pageerror", lambda e: errores.append(f"pageerror: {e}"))
                pg.on("console", lambda m: m.type in ("error", "warning") and errores.append(f"{m.type}: {m.text}"))
            pg.on("request", lambda r: peticiones.append(r.url))
            return ctx, pg

        habladas = lambda pg: pg.evaluate("window.__voz.habladas")
        texto = lambda pg: pg.inner_text(f"{FLOT} .airi-m-texto")
        estado = lambda pg, e: pg.evaluate(f"document.querySelector('{PEZ}').classList.contains('airi-m-estado-{e}')")

        # ── 1. Carga y conformidad dentro del navegador ──────────────────────
        ctx, pg = nueva()
        pg.goto(URL); pg.wait_for_timeout(1200)
        comprobar(pg.evaluate("window.AIRIMotor && window.AIRIMotor.VERSION") == "0.4.0", "el motor JavaScript v0.4.0 se carga en la página")
        fallos = pg.evaluate("""(casos) => {
            const r6 = (v) => typeof v === "number" ? Math.round(v * 1e6) / 1e6 : Array.isArray(v) ? v.map(r6) : v;
            const proy = (inf) => { const res = {}; inf.resultados.forEach((r) => res[r.parametro] = {estado: r.estado,
                severidad: r.severidad, valor_canonico: r6(r.valor_canonico), unidad_canonica: r.unidad_canonica});
              return {clasificacion: inf.clasificacion, A: inf.A, I: inf.I, resultados: res,
                alertas: inf.alertas.map((a) => [a.parametro, a.severidad]), solicitudes: inf.solicitudes.map((s) => [s.parametro, s.tipo]),
                traza: inf.traza.map((t) => [t.de, t.a, t.etiqueta].concat(t.parametro ? [t.parametro] : []))}; };
            return casos.filter((c) => JSON.stringify(proy(AIRIMotor.evaluar(c.mediciones, c.perfil || null))) !== JSON.stringify(c.esperado)).map((c) => c.id);
        }""", CASOS["casos"])
        comprobar(fallos == [], f"los 34 casos de conformidad se reproducen dentro del navegador {fallos}")
        comprobar("referencias documentadas" in pg.inner_text(".airi-m-pecera .airi-m-texto") and
                  "no observo un acuario real ni hago diagnósticos" in pg.inner_text(".airi-m-pecera .airi-m-texto"),
                  "el saludo de Inicio describe la v0.4 sin prometer diagnósticos")
        pg.click(".airi-m-pecera .airi-m-btn-voz"); pg.wait_for_timeout(150)   # la persona activa la voz
        n_inicio = len(habladas(pg))

        # ── 2. Valores típicos del prototipo → R3 (sin alerta) ───────────────
        pg.click('[data-tab="agua"]'); pg.wait_for_timeout(200)
        comprobar("Validar entradas" in texto(pg) and "referencias documentadas" in texto(pg), "mensaje de Parámetros del agua actualizado")
        llenar(pg, ["25", "8.1", "35", "0", "0", "10"])
        pg.click("#evaluar")
        comprobar(estado(pg, "analisis") and "Animación demostrativa" in pg.inner_text(f"{FLOT} .airi-m-etiqueta"),
                  "la pausa de análisis sigue marcada como animación demostrativa")
        pg.wait_for_timeout(1100)
        res = pg.inner_text("#resultado")
        comprobar(res.count("dato con formato válido") == 6 and "Validación de formato" in res,
                  "la validación de formato del prototipo se conserva (6 líneas)")
        comprobar(pg.get_attribute(".airi-a", "data-clasificacion") == "R3", "panel: resultado R3 (información insuficiente)")
        comprobar([pg.get_attribute(f'.airi-a-param[data-parametro="{x}"]', "data-estado") for x in
                   ["temperatura", "ph", "salinidad", "amoniaco", "nitritos", "nitratos"]] == ["EP3", "EP4", "EP3", "EP4", "EP4", "EP3"],
                  "panel: pH, amoníaco y nitritos en rango; temperatura, salinidad y nitratos sin referencia")
        t = texto(pg)
        comprobar(estado(pg, "insuficiente") and pg.inner_text(f"{PEZ} .airi-m-senal") == "?" and not estado(pg, "alerta"),
                  "mascota: estado de información insuficiente («?»), sin alerta")
        comprobar(t.startswith("pH, Amoníaco total y Nitritos están dentro de la referencia") and
                  "Temperatura, Salinidad y Nitratos no se evalúan por falta de referencia" in t and "no garantiza" in t,
                  f"mascota explica, en breve, qué evaluó y qué no: {t!r}")
        h = habladas(pg)[n_inicio:]
        ins = [x for x in h if "no se evalúan" in x["text"]]
        e_ins = pg.evaluate("AIRIVoz.prosodia(null, 'insuficiente')")
        comprobar(ins and ins[-1]["pitch"] == e_ins["tono"] and ins[-1]["rate"] == e_ins["velocidad"],
                  "voz: lee el resultado con el tono tranquilo de «insuficiente»")
        pasos = pg.eval_on_selector_all("#resultado .airi-paso", "l => l.map(e => [e.classList.contains('airi-paso-formato') ? 'formato' : 'referencias', e.querySelector('h3').innerText])")
        comprobar([x[0] for x in pasos] == ["formato", "referencias"] and pasos[0][1].startswith("1") and
                  "Validación de formato" in pasos[0][1] and pasos[1][1].startswith("2") and "referencias científicas" in pasos[1][1],
                  f"resultado en dos pasos numerados: formato y referencias {pasos}")
        comprobar("No indica si el valor es adecuado" in pg.inner_text(".airi-paso-formato .airi-paso-que"),
                  "el paso 1 aclara que validar el formato no juzga el valor")
        verde = pg.eval_on_selector(".airi-paso-formato .status.ok", "e => getComputedStyle(e).backgroundColor")
        comprobar(verde != "rgb(225, 246, 232)", f"«formato válido» ya no usa el verde de «valor adecuado» ({verde})")
        comprobar(pg.locator("#agua .airi-pasos-guia .airi-pasos-tarjeta").count() == 2, "guía de los dos pasos visible antes de validar")
        pg.screenshot(path=str(cap / "01_escritorio_R3.png"), full_page=True)

        # ── 3. Anomalías + datos faltantes → R4, alerta seria sin alarmismo ──
        n = len(habladas(pg))
        llenar(pg, ["26", "8.4", "", "0.8", "0.1", "10"])
        pg.click("#evaluar"); pg.wait_for_timeout(1100)
        comprobar(pg.get_attribute(".airi-a", "data-clasificacion") == "R4", "panel: resultado R4")
        orden = pg.eval_on_selector_all(".airi-a-alerta", "l => l.map(e => e.dataset.parametro)")
        comprobar(orden == ["amoniaco", "ph", "nitritos"], f"alertas ordenadas por severidad {orden}")
        chips = pg.eval_on_selector_all(".airi-a-alerta .airi-a-chip", "l => l.map(e => e.textContent)")
        comprobar(chips == ["Alerta de mayor severidad", "Revisión recomendada", "Presencia detectable"],
                  f"cada alerta muestra su severidad con texto (no solo color) {chips}")
        sol = pg.eval_on_selector_all(".airi-a-solicitud", "l => l.map(e => e.dataset.parametro + ':' + e.className.split('airi-a-sol-')[1])")
        comprobar(sorted(sol) == sorted(["temperatura:sin_referencia", "salinidad:faltante", "nitratos:sin_referencia"]),
                  f"R4 conserva también las solicitudes de datos {sol}")
        comprobar(pg.locator(".airi-a-alerta a[href^='https://www.msdvetmanual.com']").count() >= 3 and
                  pg.eval_on_selector_all(".airi-a a", "l => l.every(a => a.target === '_blank' && a.rel.includes('noopener'))"),
                  "cada alerta enlaza su fuente (MSD) en una pestaña nueva y segura")
        t = texto(pg)
        comprobar(estado(pg, "alerta") and pg.inner_text(f"{PEZ} .airi-m-senal") == "!", "mascota: estado de alerta con señal «!»")
        comprobar(pg.inner_text(f"{FLOT} .airi-m-etiqueta") == "Advertencia informativa", "etiqueta: advertencia informativa (no alarma)")
        comprobar("Conviene revisar 3 valores: Amoníaco total, pH y Nitritos" in t and "falta el dato de Salinidad" in t and
                  "Temperatura y Nitratos no se evalúan" in t and "No es un diagnóstico" in t,
                  f"mensaje R4: anomalías y datos insuficientes a la vez: {t!r}")
        comprobar(len(t.split()) <= 45, f"mensaje breve para el globo y la voz ({len(t.split())} palabras; antes de E5, 75)")
        detalle = pg.inner_text(".airi-a")
        comprobar(all(f in detalle for f in ["TAN ≥ 0.5 mg/L como N", "Las fuentes discrepan", "Presencia detectable (0.1 mg/L NO2−)",
                                                 "Sugerencia (informativa)", "Proporciona la medición de salinidad"]),
                  "la explicación completa (motivos, sugerencias, solicitudes) sigue en el panel")
        comprobar("Repite" in t and not PROHIBIDO.search(t), "tono serio sin alarmismo: sugiere repetir, sin «peligro», «urgente»…")
        h = habladas(pg)[n:]
        al = [x for x in h if "Conviene revisar" in x["text"]]
        e_al, e_esp = pg.evaluate("[AIRIVoz.prosodia(null, 'alerta'), AIRIVoz.prosodia(null, 'espera')]")
        comprobar(al and al[0]["pitch"] == e_al["tono"] and al[0]["rate"] == e_al["velocidad"] and
                  e_al["tono"] < e_esp["tono"] and e_al["velocidad"] < e_esp["velocidad"],
                  f"voz: tono serio de «alerta» (tono {al[0]['pitch'] if al else '?'}, velocidad {al[0]['rate'] if al else '?'})")
        comprobar(not any("Revisando" in x["text"] for x in h), "voz: no lee la pausa demostrativa")
        pg.screenshot(path=str(cap / "02_escritorio_R4_alerta.png"))
        pg.click(f"{FLOT} .airi-m-cerrar-globo"); pg.wait_for_timeout(100)
        comprobar(pg.is_hidden(f"{FLOT} .airi-m-globo") and pg.evaluate("document.activeElement.classList.contains('airi-m-avatar')"),
                  "botón «×»: cierra el mensaje y el foco pasa a AIRI")
        pg.click(".airi-m-avatar", force=True); pg.wait_for_timeout(100)
        comprobar(pg.is_visible(f"{FLOT} .airi-m-globo") and "Conviene revisar" in texto(pg), "al tocar a AIRI el mensaje vuelve a abrirse")
        pg.locator(".airi-a").screenshot(path=str(cap / "03_panel_R4.png"))

        # ── 4. Valores inválidos sin anomalías y nueva comprobación de captura ─
        llenar(pg, ["150", "8.1", "35", "", "0", "-3"])
        pg.click("#evaluar"); pg.wait_for_timeout(1100)
        res = pg.inner_text("#resultado")
        comprobar("Temperatura: 150 °C · dato con formato válido" in res and "Nitratos: VALOR INVÁLIDO" in res and
                  "Amoníaco total: INFORMACIÓN INSUFICIENTE" in res, "la validación de formato del prototipo no cambia")
        comprobar(pg.get_attribute('.airi-a-param[data-parametro="temperatura"]', "data-estado") == "EP2",
                  "el motor añade el límite de captura: 150 °C es inválido (agua líquida)")
        t = texto(pg)
        comprobar(estado(pg, "error") and "Temperatura y Nitratos" in t and "También falta el dato de Amoníaco total" in t,
                  f"mascota: estado de error con los campos reales: {t!r}")

        # ── 5. Todo vacío y «Limpiar» ────────────────────────────────────────
        llenar(pg, [""] * 6)
        pg.click("#evaluar"); pg.wait_for_timeout(1100)
        t = texto(pg)
        comprobar(estado(pg, "insuficiente") and "Temperatura, pH, Salinidad, Amoníaco total, Nitritos y Nitratos" in t and
                  "no es una alerta del acuario" in t, "todo vacío: información insuficiente, no alerta")
        pg.click("#limpiar"); pg.wait_for_timeout(200)
        comprobar(pg.inner_text("#resultado") == "" and pg.evaluate("window.airiAnalisis.ultimo") is None and
                  "Formulario limpio" in texto(pg), "«Limpiar» borra validación, análisis y mensaje")

        # ── 6. Accesibilidad básica del panel ────────────────────────────────
        llenar(pg, ["26", "8.6", "35", "0.3", "0", "5"])
        pg.click("#evaluar"); pg.wait_for_timeout(1100)
        comprobar(pg.get_attribute("#resultado", "aria-live") == "polite" and pg.locator("#resultado .airi-a h3").count() == 1,
                  "el panel está dentro de la región aria-live y tiene encabezado")
        pg.focus(".airi-a-contexto summary"); pg.keyboard.press("Enter")
        comprobar(pg.evaluate("document.querySelector('.airi-a-contexto').open"), "el contexto científico se abre con el teclado")
        comprobar("no se usa para evaluar" in pg.inner_text(".airi-a-contexto summary"), "el contexto se rotula como no evaluativo")
        txt_panel = pg.inner_text(".airi-a")
        comprobar(not PROHIBIDO.search(txt_panel) and "No diagnostica" in txt_panel, "el panel no afirma seguridad ni diagnostica")
        comprobar(not pg.evaluate("document.body.innerHTML.includes('SIN REFERENCIA BIOLÓGICA VERIFICADA')"),
                  "ya no aparece la frase de v0.1 que contradecía el análisis del pH")
        pg.click('[data-tab="especies"]'); pg.fill("#buscar", "payaso"); pg.wait_for_timeout(900)
        comprobar(pg.locator("#catalogo article.card").count() == 1 and "1 ficha" in texto(pg), "fichas de especies: sin cambios")
        pg.click(".airi-m-avatar", force=True); pg.click('#airi-m-menu-flotante [data-accion="agua"]'); pg.wait_for_timeout(150)
        comprobar("temperatura en °C" in texto(pg) and "Manual Veterinario MSD" in texto(pg), "ayuda del agua actualizada a v0.4")
        ctx.close()

        # ── 7. Movimiento reducido ───────────────────────────────────────────
        ctx, pg = nueva(reduced_motion="reduce")
        pg.goto(URL); pg.wait_for_timeout(600)
        pg.click('[data-tab="agua"]'); llenar(pg, ["26", "8.1", "35", "1", "0", "5"])
        pg.click("#evaluar"); pg.wait_for_timeout(150)
        comprobar(estado(pg, "alerta"), "con movimiento reducido la alerta aparece sin pausa")
        ctx.close()

        # ── 8. Celular ───────────────────────────────────────────────────────
        ctx, pg = nueva({"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
        pg.goto(URL); pg.wait_for_timeout(1000)
        pg.tap('[data-tab="agua"]'); llenar(pg, ["26", "8.4", "", "0.8", "0.1", "10"])
        pg.tap("#evaluar"); pg.wait_for_timeout(1300)
        comprobar(estado(pg, "alerta") and pg.get_attribute(".airi-a", "data-clasificacion") == "R4", "celular: R4 con mascota en alerta")
        alto = pg.evaluate("(() => { const g = document.querySelector('.airi-m-flotante .airi-m-globo').getBoundingClientRect(); return [g.height, innerHeight]; })()")
        comprobar(alto[0] <= alto[1] * 0.38 + 1, f"celular: el globo ocupa como máximo el 38 % de la altura ({alto[0]:.0f} de {alto[1]} px)")
        caja_x = pg.evaluate("(() => { const r = document.querySelector('.airi-m-flotante .airi-m-cerrar-globo').getBoundingClientRect(); return [r.width, r.height]; })()")
        comprobar(min(caja_x) >= 36, f"celular: el botón «×» tiene un área táctil suficiente {caja_x}")
        ancho = pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
        comprobar(ancho[0] <= ancho[1], f"celular: sin desplazamiento horizontal {ancho}")
        caja = pg.evaluate("(() => { const r = document.querySelector('.airi-m-flotante').getBoundingClientRect(); return [r.left, r.right, window.innerWidth]; })()")
        comprobar(caja[0] >= 0 and caja[1] <= caja[2], f"celular: el asistente cabe en la pantalla {caja}")
        anchos = pg.eval_on_selector_all(".airi-a-param", "l => l.map(e => e.getBoundingClientRect().right <= window.innerWidth)")
        comprobar(anchos and all(anchos), "celular: las tarjetas de parámetros caben en el ancho")
        comprobar("Equivale a 0.6212–0.8 mg/L TAN-N" in pg.inner_text('.airi-a-param[data-parametro="amoniaco"]') and
                  "intervalo de equivalencias" in pg.inner_text('.airi-a-param[data-parametro="amoniaco"]') and
                  pg.inner_text('.airi-a-param[data-parametro="nitratos"] .airi-a-valor') == "10 mg/L (NO₃⁻)",
                  "se muestra el valor capturado, su equivalencia canónica y por qué el amoníaco es un intervalo")
        pg.screenshot(path=str(cap / "04_celular_R4_mascota.png"))
        pg.tap(f"{FLOT} .airi-m-cerrar-globo"); pg.wait_for_timeout(150)
        comprobar(pg.is_hidden(f"{FLOT} .airi-m-globo") and pg.is_visible(PEZ), "celular: «×» cierra el mensaje y AIRI queda visible")
        pg.screenshot(path=str(cap / "04b_celular_globo_cerrado.png"))
        pg.tap(".airi-m-avatar", force=True); pg.wait_for_timeout(150)   # el avatar flota animado
        comprobar(pg.is_visible(f"{FLOT} .airi-m-globo"), "celular: tocar a AIRI vuelve a abrir el mensaje")
        destino = pg.evaluate("document.querySelector('.airi-a').getBoundingClientRect().top + scrollY - 10")
        while pg.evaluate("scrollY") < destino - 5:          # desplazamiento gradual, como con el dedo
            pg.evaluate(f"window.scrollBy(0, Math.min(120, {destino} - scrollY))"); pg.wait_for_timeout(40)
        pg.wait_for_timeout(300)
        comprobar(pg.is_hidden(f"{FLOT} .airi-m-globo") and pg.is_visible(PEZ),
                  "celular: al desplazarse hacia el análisis el globo se contrae y no tapa el panel (AIRI sigue visible)")
        pg.screenshot(path=str(cap / "05_celular_panel.png"))
        pg.locator('.airi-a-param[data-parametro="amoniaco"]').scroll_into_view_if_needed(); pg.wait_for_timeout(200)
        pg.screenshot(path=str(cap / "06_celular_detalle.png"))
        ctx.close()

        # ── 9. Respaldo: si el motor no carga, todo sigue como en v0.3 ────────
        ctx, pg = nueva(bloquear_motor=True)
        pg.goto(URL); pg.wait_for_timeout(800)
        pg.click('[data-tab="agua"]'); llenar(pg, ["26", "8.4", "35", "0.8", "0.1", "10"]); pg.click("#evaluar"); pg.wait_for_timeout(1100)
        comprobar(pg.evaluate("typeof window.AIRIMotor") == "undefined" and pg.locator(".airi-a").count() == 0 and
                  "formato válido" in texto(pg) and estado(pg, "espera"),
                  "sin motor: validación y mascota funcionan como en v0.3 (sin alerta inventada)")
        ctx.close()

        # ── 10. Voz real de Chrome (sin simulador) ───────────────────────────
        ctx, pg = nueva(simular=False)
        pg.goto(URL); pg.wait_for_timeout(800)
        pg.click(".airi-m-pecera .airi-m-btn-voz")
        pg.click('[data-tab="agua"]'); llenar(pg, ["26", "8.4", "", "0.8", "0.1", "10"]); pg.click("#evaluar"); pg.wait_for_timeout(1500)
        comprobar(estado(pg, "alerta"), "con la síntesis real de Chrome el flujo de alerta funciona sin errores")
        ctx.close()

        externas = sorted({u for u in peticiones if not u.startswith(("file://", "data:"))})
        comprobar(not externas, f"sin peticiones a servicios externos {externas[:3]}")
        comprobar(not errores, f"sin errores de JavaScript {errores[:4]}")
        nav.close()

    fallas = [n for ok, n in resultados if not ok]
    print(f"\n{len(resultados) - len(fallas)} de {len(resultados)} comprobaciones superadas. Capturas en {cap}")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
