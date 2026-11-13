# Yair — Compatibilidad de especies

**Rama:** `equipo/yair-compatibilidad`  
**Objetivo:** construir un módulo orientativo y explicable de compatibilidad entre especies para AIRI.

## Punto de partida
Leer `especies/`, `motor/`, `interfaz/motor/` y las reglas existentes. Revisar los IDs de fichas con Brayan.

## Actividades
1. Proponer contrato de entrada/salida: IDs de especies, condiciones conocidas y resultado `compatible`, `precaucion`, `incompatible` o `sin_datos`, con motivos y fuentes.
2. Trabajar con datos simulados mientras Brayan completa fichas.
3. Documentar criterios (comportamiento, tamaño, hábitat, alimentación y otras variables sustentadas), límites y conflictos.
4. Crear pruebas de casos compatibles, incompatibles y de información insuficiente.
5. Coordinar con José cómo se incorporan las advertencias y con Paola cómo se muestran.

## Entrega
Módulo reutilizable, datos de prueba, explicación de reglas y fuentes. PR revisable **22 nov**; integración **23–29 nov**.

## Restricciones
Nunca convertir ausencia de evidencia en «compatible». Evitar reglas universales no justificadas.
