"""Genera interfaz/motor/airi-motor-datos.js a partir de los MISMOS JSON que usa el motor Python.

La web se abre también con doble clic (file://), donde fetch() de archivos locales está bloqueado;
por eso los datos se incrustan en un script. No se edita a mano: se regenera.

    python motor/herramientas/generar_datos_js.py           # reescribe el archivo
    python motor/herramientas/generar_datos_js.py --check   # sale con 1 si no está al día
"""
import hashlib
import json
import sys
from pathlib import Path

MOTOR = Path(__file__).resolve().parents[1]
DATOS = MOTOR / "airi_motor" / "datos"
DESTINO = MOTOR.parent / "interfaz" / "motor" / "airi-motor-datos.js"


def generar() -> str:
    partes, huellas = {}, []
    for nombre in ("referencias", "fuentes"):
        crudo = (DATOS / f"{nombre}.json").read_bytes()
        partes[nombre] = json.loads(crudo)
        huellas.append(f"   {nombre}.json  sha256 {hashlib.sha256(crudo).hexdigest()}")
    cuerpo = json.dumps(partes, ensure_ascii=False, indent=1)
    return ("/* ═══ AIRI · Datos de referencia del motor de análisis (GENERADO, no editar) ═══\n"
            "   Origen: motor/airi_motor/datos/*.json · generador: motor/herramientas/generar_datos_js.py\n"
            + "\n".join(huellas) + " */\n"
            "(function (raiz) {\n"
            "  \"use strict\";\n"
            f"  var datos = {cuerpo};\n"
            "  if (typeof module === \"object\" && module.exports) module.exports = datos;\n"
            "  else raiz.AIRIMotorDatos = datos;\n"
            "})(typeof window !== \"undefined\" ? window : globalThis);\n")


if __name__ == "__main__":
    nuevo = generar()
    if "--check" in sys.argv:
        ok = DESTINO.exists() and DESTINO.read_text(encoding="utf-8") == nuevo
        print("airi-motor-datos.js al día" if ok else "airi-motor-datos.js NO está al día: ejecuta generar_datos_js.py")
        sys.exit(0 if ok else 1)
    DESTINO.write_text(nuevo, encoding="utf-8")
    print(f"escrito {DESTINO.relative_to(MOTOR.parent)}")
