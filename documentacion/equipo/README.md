# AIRI — Guía de trabajo colaborativo

Proyecto: [Antoniii28/Airi](https://github.com/Antoniii28/Airi). Entrega final prevista: **2 de diciembre de 2026**.

## Primero: leer y entender el proyecto
1. Leer el README principal, `documentacion/PILOTO_v0.7.md` y la guía individual de este directorio.
2. No reconstruir AIRI desde cero: ya hay interfaz, motor, fichas preliminares y piloto público v0.7.3. Confirmar el estado actual en el código; el README principal puede tener una versión histórica.
3. Trabajar **solo en tu rama asignada**. Las cuatro ramas se crearon desde `main`.
4. Antes de implementar, identificar archivos existentes, contratos de datos y pruebas. Coordinar los cambios compartidos mediante una propuesta/issue o PR; no sobrescribir trabajo de otros.
5. Cada cambio debe incluir explicación, pruebas y fuentes cuando aplique. Abrir un Pull Request hacia `main` y solicitar revisión. No fusionar cambios propios sin revisión.

## Responsabilidades y ramas
| Integrante | Rama | Guía |
|---|---|---|
| José Antonio | `equipo/jose-motor-agente` | [JOSE.md](JOSE.md) |
| Brayan | `equipo/brayan-fichas-especies` | [BRAYAN.md](BRAYAN.md) |
| Yair | `equipo/yair-compatibilidad` | [YAIR.md](YAIR.md) |
| Paola | `equipo/paola-interfaz-documentacion` | [PAOLA.md](PAOLA.md) |

## Fechas de coordinación propuestas
- **15 nov:** Brayan publica esquema de ficha y primeras fichas; los demás usan datos simulados compatibles.
- **22 nov:** primera versión revisable de los cuatro módulos.
- **23–29 nov:** integración, revisión cruzada, corrección de fallos y documentación.
- **30 nov–2 dic:** validación final y entrega. Verificar estas fechas contra el cronograma académico original; no sustituirlo silenciosamente.

## Trabajo en paralelo
Nadie debe esperar a que otra persona termine: usar ejemplos simulados y acordar contratos de datos. Cuando una dependencia cambie, avisar en el PR. No modificar directamente `main`.

## Reglas esenciales
- No exponer ni copiar claves de Gemini, Turnstile, códigos de acceso, sales, tokens ni archivos `.dev.vars`.
- No ejecutar `wrangler deploy`, cambiar secretos ni modificar producción sin autorización explícita del responsable.
- Mantener avisos, controles de acceso, restricciones de edad/región y protección de datos del piloto.
- No declarar un acuario «seguro» sin referencias suficientes; preservar estados de alerta y falta de referencia.
- Las fichas biológicas deben distinguir hechos comprobados de información pendiente y citar fuentes y derechos de imágenes.
- No añadir diagnósticos veterinarios ni acciones físicas automáticas.

## Cómo trabajar con ChatGPT o Claude
Compartir el enlace del repositorio, **tu rama** y **tu guía individual**. Solicitar al asistente que lea los archivos reales antes de generar código. Si no puede acceder al repositorio, facilitar los archivos necesarios; nunca inventar su contenido. No compartir credenciales.

**Mensaje base para copiar al asistente:**

> Voy a colaborar en AIRI, repositorio https://github.com/Antoniii28/Airi. Mi rama es [RAMA]. Lee primero README.md, documentacion/equipo/README.md y documentacion/equipo/[GUIA].md desde GitHub. Revisa el código existente antes de proponer cambios. Respeta mi responsabilidad, el calendario, los límites de seguridad y los contratos de datos. Dame primero un plan corto con archivos concretos y pruebas; después ayúdame a implementar por pasos en mi rama y preparar un Pull Request. No hagas cambios en main ni despliegues. Si no tienes acceso a GitHub, pídeme los archivos necesarios; no supongas su contenido.

## Entrega de cada integrante
PR a `main` con resumen, archivos modificados, capturas si aplica, pruebas ejecutadas, pendientes y fuentes. El responsable revisa antes de integrar.
