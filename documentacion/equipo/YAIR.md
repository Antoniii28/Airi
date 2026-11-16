# Yair — Evaluador orientativo de compatibilidad

**Rama asignada:** `equipo/yair-compatibilidad` (comprobar que existe).  
**Objetivo exclusivo:** implementar una evaluación explicable de compatibilidad entre especies, sin editar las fichas que mantiene Brayan ni el motor del agua de José.

## Revisar primero
`especies/` y su esquema real, documentación del motor y estructura de módulos JS. Verificar si ya hay funciones de compatibilidad antes de crear archivos nuevos.

## Tareas concretas
1. Proponer contrato de entrada (IDs de fichas y condiciones conocidas) y salida (estado orientativo, razones, fuentes y datos faltantes). Coordinar IDs/campos con Brayan y presentación con Paola.
2. Implementar un módulo independiente usando datos de prueba separados mientras Brayan revisa las fichas.
3. Evaluar solo criterios sustentados (por ejemplo, comportamiento, tamaño y necesidades ambientales) y documentar límites; no inferir compatibilidad solo por pertenecer al mismo ambiente.
4. Producir estados claros como `compatible`, `precaucion`, `incompatible`, `sin_datos` **solo si el equipo aprueba estos nombres**; si no hay evidencia, usar `sin_datos`.
5. Crear pruebas para coincidencia sustentada, incompatibilidad sustentada, contradicciones y datos insuficientes. Entregar ejemplos de salida para Paola.

## Archivos permitidos
Módulo y pruebas propios de compatibilidad, en ruta nueva acordada tras inspeccionar la estructura. No editar `especies/`, `interfaz/`, `motor/` ni `publico/` sin acuerdo.

## Entregables verificables
- Módulo reutilizable con contrato documentado.
- Pruebas y ejemplos JSON con fuentes y estados.
- PR sin cambios en datos de fichas ni UI.

**Contrato propuesto:** 15 nov. **PR revisable:** 22 nov. **Integración:** 23–29 nov, según cronograma oficial.

**No hacer:** crear fichas, elegir fotografías, rediseñar la interfaz o alterar reglas del agua. La ausencia de información nunca equivale a compatibilidad confirmada.
