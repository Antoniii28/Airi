# AIRI v0.4 · Referencias para el análisis del agua

Este documento explica **qué fuentes usa el motor, cómo las usa y qué no puede afirmar**. Los datos que
lee el motor están en [`airi_motor/datos/referencias.json`](airi_motor/datos/referencias.json) y
[`airi_motor/datos/fuentes.json`](airi_motor/datos/fuentes.json). La futura versión web usará esos mismos
archivos.

Fecha de consulta de todas las fuentes: **12 de noviembre de 2026**.

> AIRI compara mediciones con referencias documentadas. **No diagnostica enfermedades, no garantiza
> condiciones seguras y no ejecuta acciones.** Las decisiones sobre el acuario las toma una persona.

## 1. Niveles de evidencia

| Nivel | Qué es | Uso en el motor |
|---|---|---|
| **A** | Referencia veterinaria o institucional para sistemas con peces | Única que permite evaluar (nodo Q5 = V) |
| **B** | Dato del medio natural o de una especie | Solo **contexto** informativo; nunca es un límite de seguridad |
| — | Guías comerciales (fabricantes de kits, tiendas) | Excluidas, aunque coincidan con otras fuentes |

## 2. Fuentes

**Nivel A**
- **MSD Veterinary Manual: tabla «“Normal” Reference Ranges for Routine Water Quality Analysis»**, en el
  capítulo *Environmental Diseases of Aquatic Animals in Aquatic Systems* de R. Francis-Floyd, R. P. E.
  Yanong y B. D. Petty (University of Florida), con revisión por pares, revisión completa en mayo de 2023 y
  actualización en junio de 2026. La tabla no muestra autores ni fecha propios.
  https://www.msdvetmanual.com/multimedia/table/normal-reference-ranges-for-routine-water-quality-analysis
- **MSD Veterinary Manual: capítulo completo** (texto y tabla de riesgos).
  https://www.msdvetmanual.com/exotic-and-laboratory-animals/aquatic-systems/environmental-diseases-of-aquatic-animals-in-aquatic-systems
- **MSD Veterinary Manual: tabla «A Summary of Water Quality Tests and Recommended Use»**.
  https://www.msdvetmanual.com/multimedia/table/a-summary-of-water-quality-tests-and-recommended-use
- **UF/IFAS Extension FA031, «Ammonia in Aquatic Systems»** (Francis-Floyd, Watson, Petty y Pouder).
  https://ask.ifas.ufl.edu/publication/FA031

**Nivel B (solo contexto)**
- NIST, *How Do You Measure the Acidity (pH) of the Ocean?*: pH medio del océano superficial, 8.1.
- UF/IFAS, hoja *pH, Salinity and Temperature*: salinidad media del agua de mar, 35 ppt.
- NOAA National Ocean Service, *In what types of water do corals live?*: corales en el medio natural.
- FishBase y Reef Life Survey: ficha de *Amphiprion ocellaris* (temperatura del medio natural).

## 3. Perfil «Peces marinos · referencia veterinaria general (MSD)»

Se aplica a **sistemas de agua salada con peces**. No es específico de corales, invertebrados ni de una
especie concreta.

| Parámetro | Estado | Referencia usada | Cómo se aplica |
|---|---|---|---|
| **pH** | Verificada | Tabla MSD, agua salada: **7.8–8.3** | 7.8–8.3: en rango · más de 8.3 y hasta 8.5: anomalía de **revisión recomendada**, porque el texto del mismo capítulo considera habitual 7.8–8.5 en tanques marinos · menos de 7.8 o más de 8.5: **fuera de la referencia** |
| **Amoníaco total (TAN)** | Verificada | Tabla MSD: **TAN 0 mg/L**; nota b: los peces de agua salada suelen tolerar **TAN < 0.5 mg/L** | 0: en rango · más de 0 y menos de 0.5 mg/L TAN-N: **presencia detectable** · 0.5 o más: **alerta de mayor severidad** · si no se puede saber de qué lado de 0.5 está, o se usó el método de Nessler: **revisión recomendada** |
| **Nitritos** | Verificada | Tabla MSD: **0 mg/L** | 0: en rango · más de 0: **presencia detectable**. No hay umbral de severidad para agua salada; el 0.10 mg/L de UF/IFAS es general y no se usa |
| **Nitratos** | **Pendiente** | Tabla MSD: < 70 mg/L, **forma química sin confirmar** | **No se evalúa** (SIN REFERENCIA). Ver sección 5 |
| **Temperatura** | Sin referencia | No hay una de nivel A para acuarios marinos en general | **No se evalúa.** Solo se muestra contexto: NOAA (corales, 23–29 °C), FishBase y Reef Life Survey (*A. ocellaris*) |
| **Salinidad** | Sin referencia | No hay una de nivel A | **No se evalúa.** Contexto: agua de mar de 35 ppt de media (UF/IFAS); corales de 32–42 ppt (NOAA) |

Toda anomalía es **«fuera de la referencia documentada»**, nunca «peligrosa» ni «diagnóstico». La severidad
solo ordena la importancia de las observaciones.

**Consecuencia importante.** Con las referencias verificadas actuales, una medición completa **nunca da R1
(«en rango»)**: la temperatura, la salinidad y los nitratos siempre quedan sin evaluar. El grafo exige que, si
hay parámetros sin evaluar, no se declare que todo está en rango. Es el comportamiento correcto mientras no
haya referencias verificadas para esos tres parámetros.

## 4. Amoníaco: TAN no es NH₃

- El **TAN** (nitrógeno amoniacal total) es la suma de NH₃ no ionizado y NH₄⁺. La referencia de 0.5 mg/L se
  refiere al **TAN**, no al NH₃.
- El motor **no calcula el NH₃ no ionizado**. Ese cálculo requiere pH, temperatura y salinidad medidos al
  mismo tiempo y un método validado (tablas de factores como las que cita UF/IFAS).
- **El umbral de 0.5 mg/L solo se aplica** si la medición se puede expresar como TAN-N:
  - Unidad «como N»: se compara directamente.
  - Unidad «como NH₃» o «como NH₄⁺»: se convierte a N por masas molares.
  - Unidad **sin base indicada**, como «mg/L NH₃/NH₄⁺ total», que es la que usa hoy el prototipo: el valor real
    está entre ×0.7765 (si era NH₄⁺) y ×1 (si era N). Si todo el intervalo queda por debajo o por encima de 0.5,
    la conclusión es segura; si 0.5 cae dentro del intervalo, el resultado es **revisión recomendada**.
  - **Método de Nessler:** da reacciones falsas en agua de mar (UF/IFAS), así que un valor detectable no se
    compara con el umbral (**revisión recomendada**).

## 5. Nitratos: referencia pendiente

La tabla del MSD da **< 70 mg/L** para agua salada sin indicar si se expresa como **nitrato (NO₃⁻)** o como
**nitrógeno de nitrato (NO₃-N)**, y la diferencia entre ambas es de 4.4 veces. En el mismo capítulo, la tabla
de riesgos y el texto usan explícitamente **NO₃-N ≥ 70 mg/L** como nivel de toxicidad, y el texto advierte que
hay que distinguir NO₃-N de NO₃ en la literatura. Eso sugiere, pero **no confirma**, la forma de la tabla de
referencia.

Decisión aprobada: **no se usa para evaluar ni para emitir alertas** hasta confirmarlo. El motor sí convierte y
muestra el valor en NO₃-N.

## 6. Conversiones (solo química)

Masas molares: N 14.007 · H 1.008 · O 15.999 g/mol.

| De | A | Factor |
|---|---|---|
| mg/L como NH₃ | mg/L TAN-N | × 14.007/17.031 ≈ **0.8224** |
| mg/L como NH₄⁺ | mg/L TAN-N | × 14.007/18.039 ≈ **0.7765** |
| mg/L NO₂⁻ | mg/L NO₂-N | × 14.007/46.005 ≈ **0.3045** (inverso ≈ 3.284) |
| mg/L NO₃⁻ | mg/L NO₃-N | × 14.007/62.004 ≈ **0.2259** (inverso ≈ 4.427; el MSD redondea a 4.4) |
| °F | °C | (°F − 32) × 5/9 |
| ppm | mg/L | Se toman como equivalentes; en agua de mar difieren ligeramente por su densidad, y se avisa |

**No se convierten:** la densidad relativa a salinidad (depende de la temperatura) ni otras unidades. En esos
casos el dato queda como **INVÁLIDO por unidad no admitida**, con indicación de la unidad esperada.

## 7. Límites de captura (nodo Q4)

Detectan errores al escribir los datos; **no son rangos biológicos**:
- **Concentraciones y salinidad:** no pueden ser negativas.
- **pH:** de 0 a 14, la escala de los instrumentos habituales; no es un límite físico universal.
- **Temperatura:** de −2 a 100 °C, el agua líquida a presión atmosférica.

## 8. Limitaciones

- El perfil se basa en una referencia veterinaria general para peces; no sirve para corales ni invertebrados.
- Un kit nunca mide «0» exacto: «0» significa por debajo de su límite de detección. El motor toma 0 como
  «no detectable».
- El pH cambia a lo largo del día; una medición aislada no muestra la tendencia.
- No se calculan la toxicidad del NH₃ ni efectos combinados entre parámetros.
- Los textos de recomendación son informativos y no sustituyen la opinión de una persona experta o de un
  veterinario de peces.
- Las referencias deben revisarse si las fuentes se actualizan.

## 9. Decisiones pendientes para el equipo

1. Confirmar la forma química del límite de nitratos (escribir a la editorial o buscar la fuente primaria de
   la tabla), o aprobar el uso explícito de «NO₃-N ≥ 70 mg/L» de la tabla de riesgos del MSD.
2. Decidir si se crean perfiles por especie con referencias de nivel A para temperatura y salinidad.
3. Agregar al formulario la base química del amoníaco y el método de medición, para evitar «revisión
   recomendada» por falta de información.
