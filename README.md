# AIRI — Agente Inteligente para Acuarios Marinos

**Versión actual: v0.4** · proyecto académico · prototipo web funcional con motor de reglas para el agua.

AIRI (Agente Inteligente para la Supervisión y Gestión de un Acuario Marino) ayuda a registrar mediciones del agua,
las valida y las compara con **referencias científicas documentadas**, y explica el resultado con sus fuentes. Las
decisiones y cualquier acción sobre el acuario permanecen bajo **supervisión humana**.

> **Límites.** AIRI **no diagnostica** enfermedades, **no garantiza** que el agua sea segura, **no ejecuta
> acciones físicas** (bombas, dosificadores, calentadores) y **no está conectado a sensores**. Sus sugerencias son
> informativas.

## Funciones implementadas (v0.4)

| Función | Qué hace | Dónde |
|---|---|---|
| **Interfaz web** | Cuatro pestañas: Inicio, Parámetros del agua, Fichas de especies, Próximas versiones. Funciona sin servidor ni instalación (abriendo el HTML) | [`interfaz/prototipo/`](interfaz/prototipo/index.html) |
| **Registro y validación de mediciones** | Seis parámetros (temperatura °C, pH, salinidad ppt, amoníaco total, nitritos y nitratos en mg/L), origen MANUAL o SIMULADO. **Paso 1 · Validación de formato:** dato presente, numérico, no negativo y pH ≤ 14. No juzga si el valor es adecuado | `interfaz/prototipo/` |
| **Motor de reglas para el agua** | **Paso 2 · Evaluación con referencias científicas.** Aplica el grafo de decisiones: valida unidad y límites de captura, compara con referencias del Manual Veterinario MSD y UF/IFAS y clasifica en **R1–R4**. Muestra alertas por severidad, sugerencias, fuentes y datos que faltan | [`motor/`](motor/README.md) (Python, referencia) · [`interfaz/motor/`](interfaz/motor/README.md) (JavaScript, misma salida) |
| **Mascota AIRI** | Pecera animada en Inicio y asistente flotante en las demás pestañas. Refleja el resultado real (alerta, información insuficiente, error); el mensaje se cierra con «×» y se reabre tocando a AIRI. Admite movimiento reducido y ocultar la mascota | [`interfaz/mascota/`](interfaz/mascota/README.md) |
| **Voz y ayuda** | Lee mensajes breves con la síntesis de voz del navegador (desactivada por defecto, sin micrófono ni servicios externos). Menú de ayuda por pantalla; perfiles y ajustes de voz guardados en el navegador; tono serio sin alarmismo ante alertas | `interfaz/mascota/` |
| **Fichas de especies** | Seis fichas **preliminares** con buscador por nombre común o científico. No indican compatibilidad | `interfaz/prototipo/`, [`especies/`](especies/fichas/README.md) |
| **Chat con AIRI (v0.5–v0.6, experimental)** | Conversación orientativa con Gemini a través de un servidor local que guarda la clave (`python chat/servidor.py` y abrir http://127.0.0.1:8765/). Pide consentimiento, no analiza mediciones ni busca en internet. No funciona en GitHub Pages ni con doble clic. **v0.6:** lectura de respuestas en voz alta (voz preferida Microsoft Sabina), mascota que «piensa» y habla, y dictado por micrófono opcional con revisión antes de enviar ([`documentacion/MICROFONO_v0.6.md`](documentacion/MICROFONO_v0.6.md)) | [`chat/`](chat/README.md), [`interfaz/chat/`](interfaz/chat/chat.js) |
| **Grafo de decisiones** | Grafo estático (PNG/SVG/PDF) y simulación interactiva en Google Colab | [`grafo/`](grafo/README.md) |
| **Documentación** | Descripción y alcance, normativa funcional y de seguridad, fundamentación, referencias e identidad visual | [`documentacion/`](documentacion/), [`entregables/`](entregables/), [`identidad-visual/`](identidad-visual/README.md) |

### Qué evalúa hoy el motor

| Parámetro | Estado de la referencia | Comportamiento |
|---|---|---|
| pH | Verificada (MSD) | 7.8–8.3 dentro de la referencia; de 8.3 a 8.5, revisión recomendada (las fuentes discrepan); fuera de ese intervalo, fuera de la referencia |
| Amoníaco total | Verificada (MSD, UF/IFAS) | 0 dentro de la referencia; detectable por debajo de 0.5 mg/L TAN-N; alerta de mayor severidad desde 0.5. Si la unidad no indica la base química y por eso no se sabe si alcanza 0.5, o si se usó el método de Nessler: revisión recomendada. No calcula NH₃ no ionizado |
| Nitritos | Verificada (MSD) | 0 dentro de la referencia; mayor que 0, presencia detectable |
| Temperatura, salinidad | **Sin referencia para evaluación** | No se evalúan; se muestra contexto científico que no decide nada |
| Nitratos | **Pendiente** | No se evalúan (la forma química del valor documentado no está confirmada) |

Por diseño, con las referencias actuales un juego de mediciones completo da **R3 o R4**, nunca R1 ni R2: AIRI indica qué
no pudo evaluar en lugar de declarar que todo está bien. Detalle y fuentes en [`motor/REFERENCIAS.md`](motor/REFERENCIAS.md).

## Funciones previstas (no implementadas)

- Referencias verificadas para temperatura, salinidad y nitratos (requieren decisión del equipo y fuentes adecuadas).
- Fichas de especies con datos biológicos verificados y fuentes por afirmación.
- Evaluación de compatibilidad entre especies.
- Identificación probable de peces por fotografía, con permiso del usuario y confirmación humana.
- Almacenamiento e historial de mediciones con tendencias.
- Posible aplicación móvil.

**Excluido por la normativa del proyecto:** acciones físicas automáticas, vigilancia continua y uso del micrófono o de
servicios externos sin autorización explícita.

## Uso

**Interfaz web.** Abre [`interfaz/prototipo/index.html`](interfaz/prototipo/index.html) en un navegador actual (también
con doble clic). El [`index.html`](index.html) de la raíz redirige a la interfaz. En «Parámetros del agua» escribe las
mediciones y pulsa «Validar entradas».

**Motor desde la terminal** (Python ≥ 3.10, solo biblioteca estándar):

```bash
cd motor
python -m airi_motor evaluar ejemplos/mediciones_prototipo.json         # informe legible
python -m airi_motor evaluar ejemplos/mediciones_prototipo.json --json  # informe completo con traza
python -m airi_motor perfiles                                           # referencias y su estado
python -m airi_motor fuentes                                            # fuentes con nivel de evidencia
```

**Grafo interactivo.** Abre [`grafo/AIRI_Grafo_Interactivo.ipynb`](grafo/AIRI_Grafo_Interactivo.ipynb) en Google Colab y
ejecuta todas las celdas (usa valores simulados).

## Estructura del proyecto

```
README.md                  este documento
index.html                 redirección a la interfaz web
chat/                      servidor local del chat con Gemini (v0.5) y sus pruebas
documentacion/             descripción, normativa básica y de seguridad, fundamentación, referencias
entregables/               entregas académicas (normativa integrada, interfaz inicial v0.1, fichas)
especies/                  catálogo preliminar (JSON), plantilla de fichas y fuentes
grafo/                     grafo de decisiones (DOT, PNG, SVG, PDF) y notebook de Colab
identidad-visual/          logotipo, mascota original, paletas y manual de identidad
interfaz/prototipo/        interfaz web (HTML único)
interfaz/mascota/          mascota animada, voz, ayuda y ajustes de voz (+ pruebas)
interfaz/chat/             pestaña «Chat con AIRI» (v0.5) y su prueba en navegador
interfaz/motor/            motor en JavaScript, integración con la interfaz y panel de análisis (+ pruebas)
motor/                     motor de referencia en Python: datos, reglas, CLI, casos de conformidad (+ pruebas)
```

## Pruebas

Requisitos: Python ≥ 3.10 (probado con 3.13); Node.js ≥ 18 para las pruebas de JavaScript (probado con 22); Playwright para Python y Google Chrome para las
pruebas en navegador. Desde la raíz del repositorio:

```bash
(cd motor && python -m unittest discover -s pruebas)        # motor Python + paridad con JavaScript
python motor/herramientas/generar_casos.py --check          # casos de conformidad al día
python motor/herramientas/generar_datos_js.py --check       # datos web generados de los mismos JSON
node --test interfaz/motor/pruebas/motor.test.js
node --test interfaz/mascota/pruebas/mascota.test.js
node --test interfaz/mascota/pruebas/voz.test.js
node --test interfaz/mascota/pruebas/voz_personalidad.test.js
python interfaz/mascota/pruebas/e2e_mascota.py              # navegador (opción --chrome RUTA)
python interfaz/mascota/pruebas/e2e_voz.py
python interfaz/mascota/pruebas/e2e_ajustes_voz.py
python interfaz/motor/pruebas/e2e_analisis.py               # escritorio y celular
python -m unittest discover -s chat/pruebas                 # servidor del chat (Gemini simulado)
node --test interfaz/chat/pruebas/markdown.test.js           # Markdown seguro del chat
python interfaz/chat/pruebas/e2e_chat.py                    # chat en escritorio y celular
node --test interfaz/chat/pruebas/habla.test.js interfaz/mascota/pruebas/pensando.test.js   # v0.6
python interfaz/chat/pruebas/e2e_voz_chat.py                # v0.6: lectura en voz alta
python interfaz/chat/pruebas/e2e_pensando.py                # v0.6: mascota «pensando»
python interfaz/chat/pruebas/e2e_microfono.py               # v0.6: dictado (reconocimiento simulado)
python interfaz/diagnostico-voz/pruebas/e2e_diagnostico.py  # v0.6: página de diagnóstico de voz
```

| Suite | Resultado (13-11-2026) |
|---|---|
| Motor Python, con 117 649 combinaciones exhaustivas y paridad total con JavaScript | 52/52 |
| Motor JavaScript (incluye los 34 casos de conformidad) | 5/5 |
| Mascota · voz · personalidad de voz (Node) | 12/12 · 16/16 · 11/11 |
| Navegador: mascota · voz · ajustes de voz · análisis (escritorio y celular) | 76/76 · 50/50 · 43/43 · 57/57 |
| Chat v0.5: servidor · Markdown seguro · navegador (escritorio y celular), con Gemini simulado | 29/29 · 8/8 · 35/35 |
| Voz v0.6: texto para hablar · «pensando» (Node) · lectura en voz alta · pensando · dictado · diagnóstico (navegador) | 8/8 · 3/3 · 24/24 · 17/17 · 41/41 · 17/17 |

Historial de pruebas, errores encontrados y su corrección: [`motor/PRUEBAS_v0.4.md`](motor/PRUEBAS_v0.4.md).

## Limitaciones pendientes

- Solo hay un perfil de referencia: peces marinos en general (MSD). No es específico de corales, invertebrados ni
  especies.
- Temperatura, salinidad y nitratos no se evalúan todavía.
- Sin historial: cada evaluación es independiente. No convierte densidad relativa a salinidad ni calcula NH₃ no
  ionizado.
- Las fichas de especies son preliminares y están escritas en la interfaz; el catálogo JSON aún no es su fuente.
- Probado en Chrome automatizado (escritorio y celular emulado). Falta probar en un teléfono físico, en Safari o Firefox,
  y escuchar la voz en el equipo del usuario.
- Los archivos de normativa y las entregas anteriores se conservan como documentos de su etapa. El estado actual del
  proyecto es el que describe este README.

## Documentación del proyecto

1. [Descripción y alcance](documentacion/01_descripcion_agente.md): objetivo, entradas, funciones y etapas.
2. [Normativa básica o funcional](documentacion/02_normativa_basica.md): reglas, permisos, prohibiciones y responsabilidades.
3. [Investigación y normativa de seguridad](documentacion/03_normativa_seguridad.md): ISO/IEC, NIST, legislación y medidas propuestas.
4. [Fundamentación](documentacion/04_fundamentacion.md): relación entre riesgos, reglas y fuentes.
5. [Referencias](documentacion/referencias.md): fuentes institucionales y límites de consulta.
6. [Documento integrado de la actividad](entregables/normativa_AIRI.md): versión de lectura y entrega.

Documentación técnica: [motor](motor/README.md), [referencias del motor](motor/REFERENCIAS.md),
[motor en la web](interfaz/motor/README.md), [mascota y voz](interfaz/mascota/README.md), [grafo](grafo/README.md).

## Normativa y criterio

- **Principal:** ISO/IEC 27001:2022 e ISO/IEC 42001:2023.
- **Complementaria:** ISO/IEC 23894:2023 y NIST AI RMF.
- **Condicional:** ISO/IEC 27701:2025 y la legislación de protección de datos que corresponda.

Consultar las fichas públicas de ISO no equivale a estudiar sus textos completos, ni acredita cumplimiento o
certificación.

## Identidad visual

El significado del logotipo, la paleta cromática, las tipografías propuestas, las variantes, las reglas de uso y el
proceso de creación están en el [manual de identidad visual de AIRI](identidad-visual/README.md). El boceto fue
seleccionado; su vectorización y la subida del archivo gráfico original permanecen pendientes.
