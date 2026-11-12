"""
Extrae el pez de AIRI del PNG oficial y lo separa en capas animables.

Uso (desde la raíz del repositorio):
    python interfaz/mascota/herramientas/extraer_pez.py

Requiere Pillow, NumPy y SciPy solo en el entorno de desarrollo. La página web
no los necesita: usa los PNG generados en interfaz/mascota/assets/.

Método (no redibuja el personaje):
1. Recorta la zona del pez del archivo original
   identidad-visual/AIRI_ Pez Mascota Marino Tecnológico.png (que no se modifica).
2. El personaje tiene un contorno azul profundo continuo. Se considera "pez" todo
   lo que queda encerrado por ese contorno; así se descartan el fondo blanco, las
   olas, las burbujas y el texto sin tocar los colores del personaje.
3. La esfera de la antena (contorno más claro) se añade con una máscara circular.
4. El borde se suaviza con un canal alfa proporcional a la oscuridad del contorno.
5. Se generan capas del mismo tamaño, alineadas píxel a píxel, para animar por
   separado la cola, la aleta dorsal y la antena:
     airi-pez.png          personaje completo (avatar y respaldo)
     airi-pez-cuerpo.png   personaje sin cola, aleta dorsal ni antena
     airi-pez-cola.png     cola (se dibuja detrás del cuerpo)
     airi-pez-dorsal.png   aleta dorsal (detrás del cuerpo)
     airi-pez-antena.png   antena con su esfera (delante)
   La cola y la aleta incluyen una franja de solapamiento que queda oculta tras el
   cuerpo, para que al girar unos grados no aparezcan huecos en la unión.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

RAIZ = Path(__file__).resolve().parents[3]
ORIGEN = RAIZ / "identidad-visual" / "AIRI_ Pez Mascota Marino Tecnológico.png"
DESTINO = RAIZ / "interfaz" / "mascota" / "assets"

RECORTE = (300, 20, 1240, 600)        # zona del pez en el original (x0, y0, x1, y1)
ESCALA = 0.5                          # tamaño final: 470 × 290 px
ESFERA = (301, 41, 50)                # antena: centro x, y y radio (coordenadas del recorte)

# Polígonos de las partes (coordenadas del recorte, antes de escalar)
COLA = [(0, 245), (198, 245), (206, 300), (196, 360), (200, 420), (205, 470), (150, 545), (0, 545)]
COLA_SOLAPE = [(0, 245), (235, 245), (245, 300), (240, 470), (150, 545), (0, 545)]
DORSAL = [(108, 98), (268, 98), (303, 148), (298, 212), (262, 244), (215, 268), (150, 264), (108, 205)]
DORSAL_SOLAPE = [(108, 98), (278, 98), (318, 160), (312, 228), (270, 262), (215, 280), (150, 264), (108, 205)]
ANTENA = [(245, 0), (355, 0), (355, 110), (348, 186), (314, 186), (292, 92), (245, 92)]

# Puntos de giro (fracción del lienzo) para las animaciones CSS
PIVOTES = {"cola": (212, 380), "dorsal": (270, 235), "antena": (338, 186)}


def mascara_poligono(tam, puntos):
    m = Image.new("L", tam, 0)
    ImageDraw.Draw(m).polygon(puntos, fill=255)
    return np.array(m) > 0


def extraer():
    rgb = np.array(Image.open(ORIGEN).convert("RGB").crop(RECORTE)).astype(np.int32)
    alto, ancho, _ = rgb.shape
    lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]

    contorno = lum < 95                                   # trazo azul profundo
    contorno = ndimage.binary_closing(contorno, iterations=2)
    interior = ndimage.binary_fill_holes(contorno)        # lo encerrado por el contorno
    etiquetas, n = ndimage.label(interior)
    tamanos = ndimage.sum(interior, etiquetas, range(1, n + 1))
    pez = etiquetas == (1 + int(np.argmax(tamanos)))      # componente principal: el pez

    yy, xx = np.mgrid[0:alto, 0:ancho]
    cx, cy, r = ESFERA
    esfera = (xx - cx) ** 2 + (yy - cy) ** 2 <= r ** 2
    no_blanco = lum < 235
    pez |= esfera & no_blanco
    pez |= mascara_poligono((ancho, alto), ANTENA) & (lum < 120)   # varilla de la antena

    # Alfa suave: dentro = 255; franja exterior de 3 px según la oscuridad del píxel
    franja = ndimage.binary_dilation(pez, iterations=3) & ~pez
    alfa = np.where(pez, 255, 0).astype(np.float32)
    alfa[franja] = np.clip((235 - lum[franja]) / 140 * 255, 0, 255)
    rgba = np.dstack([rgb, alfa]).astype(np.uint8)
    rgba[alfa == 0] = 0

    def capa(m):
        out = rgba.copy()
        out[~m] = 0
        return out

    todo = np.ones((alto, ancho), bool)
    cola = mascara_poligono((ancho, alto), COLA)
    dorsal = mascara_poligono((ancho, alto), DORSAL)
    # Antena: solo la varilla y la esfera (no el cuerpo que queda dentro del polígono).
    # Cerca de la base (y > 160) la varilla también queda en el cuerpo: ahí el giro
    # es casi nulo y así no aparece un hueco en la unión.
    varilla = mascara_poligono((ancho, alto), ANTENA) & ((lum < 150) | (rgb[..., 2] > rgb[..., 0] + 40))
    antena = (varilla | esfera) & (alfa > 0)
    base = antena & (yy > 160)
    capas = {
        "airi-pez": todo,
        "airi-pez-cuerpo": (todo & ~cola & ~dorsal & ~antena) | base,
        "airi-pez-cola": mascara_poligono((ancho, alto), COLA_SOLAPE) & ~antena,
        "airi-pez-dorsal": mascara_poligono((ancho, alto), DORSAL_SOLAPE) & ~antena,
        "airi-pez-antena": antena,
    }
    DESTINO.mkdir(parents=True, exist_ok=True)
    final = (round(ancho * ESCALA), round(alto * ESCALA))
    for nombre, m in capas.items():
        img = Image.fromarray(capa(m), "RGBA").resize(final, Image.LANCZOS)
        img.save(DESTINO / f"{nombre}.png", optimize=True)
        print(f"{nombre}.png  {final[0]}×{final[1]}  {(DESTINO / f'{nombre}.png').stat().st_size // 1024} KB")
    pivotes = {k: {"x": round(100 * x / ancho, 2), "y": round(100 * y / alto, 2)} for k, (x, y) in PIVOTES.items()}
    print("Pivotes (% del lienzo):", json.dumps(pivotes, ensure_ascii=False))


if __name__ == "__main__":
    extraer()
