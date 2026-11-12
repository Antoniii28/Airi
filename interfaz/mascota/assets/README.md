# Recursos gráficos de la mascota AIRI

Todos los archivos de esta carpeta son **derivados** del personaje oficial y se generan con
[`../herramientas/extraer_pez.py`](../herramientas/extraer_pez.py) a partir de
[`identidad-visual/AIRI_ Pez Mascota Marino Tecnológico.png`](../../../identidad-visual/AIRI_%20Pez%20Mascota%20Marino%20Tecnol%C3%B3gico.png).
**El archivo original no se modifica.**

| Archivo | Contenido | Uso |
|---|---|---|
| `airi-pez.png` | Personaje completo, fondo transparente | Avatar flotante y respaldo |
| `airi-pez-cuerpo.png` | Personaje sin cola, aleta dorsal ni antena | Capa central animada |
| `airi-pez-cola.png` | Cola (con franja de solapamiento oculta tras el cuerpo) | Aleteo de la cola |
| `airi-pez-dorsal.png` | Aleta dorsal (con solapamiento) | Movimiento de la aleta |
| `airi-pez-antena.png` | Varilla y esfera de la antena | Balanceo y señal luminosa de estado |

Las cinco imágenes miden 470 × 290 px y están **alineadas píxel a píxel**: apiladas en el mismo
lugar reproducen el personaje original. La diferencia media entre las capas apiladas y el
personaje completo es de 0.03 niveles de color sobre 255.

## Cómo se obtuvieron

1. Se recorta la zona del pez del PNG oficial.
2. Se toma como "pez" todo lo que encierra su contorno azul profundo. Así se eliminan el fondo
   blanco, las olas, las burbujas y el texto **sin redibujar ni recolorear** el personaje.
3. Las partes se separan con polígonos que siguen los contornos del dibujo.
4. Se reduce a la mitad del tamaño del recorte. Cada capa se dibuja a un máximo de unos 240 px de
   ancho en pantalla, así que se ve nítida en pantallas de alta densidad.

## Limitaciones

- La imagen original es rasterizada; estas capas no son vectores.
- Los ojos y la sonrisa no se animan: hacerlo exigiría redibujarlos. Los estados se comunican con
  la antena, un halo de color y un indicador junto al personaje, sin alterar su cara.
- Los giros de la aleta dorsal y de la antena se limitan a unos pocos grados. Con ángulos mayores
  aparecen costuras en las uniones, porque no existe arte original de las zonas que cubren.
- La aleta pectoral y la inferior no se separan: están dibujadas encima del cuerpo y moverlas
  dejaría ver su copia original debajo.

Cuando el equipo apruebe un isotipo o un personaje vectorial por partes, solo habrá que sustituir
estos archivos, sin cambiar el código de la mascota.
