// Pruebas unitarias de la lógica de cuotas (v0.7 E2). Sin red.
import test from "node:test";
import assert from "node:assert/strict";
import { aplicar, estadoInicial, leerLimites, LIMITES_PREDETERMINADOS } from "./cuotas.js";

const lim = { ...LIMITES_PREDETERMINADOS, minuto: 2, dia: 3, globalDia: 5, fallosMax: 2, pausaMin: 15 };
const T0 = Date.UTC(2026, 10, 13, 23, 59, 0);
const op = (e, o, t = T0) => aplicar(e, o, t, lim).respuesta;

test("límites: valores predeterminados, válidos e inválidos", () => {
  assert.deepEqual(leerLimites({}), LIMITES_PREDETERMINADOS);
  assert.equal(leerLimites({ AIRI_LIMITE_MINUTO: "7" }).minuto, 7);
  for (const v of ["0", "abc", "1.5", "-1", "9999999"]) assert.equal(leerLimites({ AIRI_LIMITE_DIA: v }), null, v);
});
test("por minuto: se libera al pasar 60 s", () => {
  const e = estadoInicial();
  assert.ok(op(e, { op: "reservar", usuario: "p01" }).ok);
  assert.ok(op(e, { op: "reservar", usuario: "p01" }).ok);
  const r = op(e, { op: "reservar", usuario: "p01" });
  assert.equal(r.motivo, "minuto"); assert.ok(r.reintentar > 0 && r.reintentar <= 60);
  assert.ok(op(e, { op: "reservar", usuario: "p01" }, T0 + 30_000).ok === false);
  // T0+61 s ya es el día siguiente (UTC): se reinicia todo
  assert.ok(op(e, { op: "reservar", usuario: "p01" }, T0 + 61_000).ok);
});
test("cambio de día UTC reinicia contadores diarios y global", () => {
  const e = estadoInicial();
  const t = Date.UTC(2026, 10, 13, 10, 0, 0);
  for (let i = 0; i < 3; i++) assert.ok(op(e, { op: "reservar", usuario: "p01" }, t + i * 61_000).ok);
  assert.equal(op(e, { op: "reservar", usuario: "p01" }, t + 4 * 61_000).motivo, "dia");
  assert.ok(op(e, { op: "reservar", usuario: "p01" }, Date.UTC(2026, 10, 14, 0, 0, 1)).ok);
  assert.equal(e.global, 1);
});
test("global por día entre participantes", () => {
  const e = estadoInicial(); const t = Date.UTC(2026, 10, 13, 10);
  for (const u of ["a", "b", "c", "d", "e"]) assert.ok(op(e, { op: "reservar", usuario: u }, t).ok);
  assert.equal(op(e, { op: "reservar", usuario: "f" }, t).motivo, "global");
});
test("fallos: bloqueo tras el máximo y liberación a la hora", () => {
  const e = estadoInicial(); const t = Date.UTC(2026, 10, 13, 10);
  assert.ok(op(e, { op: "consultar", ip: "abc" }, t).ok);
  op(e, { op: "fallo", ip: "abc" }, t);
  assert.equal(op(e, { op: "fallo", ip: "abc" }, t).bloqueado, true);
  assert.equal(op(e, { op: "consultar", ip: "abc" }, t + 1000).motivo, "bloqueado");
  assert.ok(op(e, { op: "consultar", ip: "abc" }, t + 3600_000).ok);
});
test("pausa preventiva bloquea reservas hasta que vence", () => {
  const e = estadoInicial(); const t = Date.UTC(2026, 10, 13, 10);
  op(e, { op: "pausar" }, t);
  const r = op(e, { op: "reservar", usuario: "p01" }, t + 1000);
  assert.equal(r.motivo, "pausa"); assert.ok(r.reintentar > 800);
  assert.ok(op(e, { op: "reservar", usuario: "p01" }, t + 15 * 60_000 + 1).ok);
});
test("operaciones y claves inválidas se rechazan sin cambiar contadores", () => {
  const e = estadoInicial();
  for (const o of [null, {}, { op: "borrar" }, { op: "reservar", usuario: "../x" }, { op: "fallo", ip: "A B" }])
    assert.equal(op(e, o).ok, false);
  assert.equal(e.global, 0);
});
