// AIRI v0.7 E4 — Genera códigos de acceso personales para el piloto (en TU equipo; no usa red).
//   node publico/herramientas/generar-codigos.mjs p01 p02 p03
// Muestra cada código UNA vez (entrégalo en privado a esa persona) y la línea para el secreto AIRI_CODIGOS,
// que solo contiene huellas SHA-256. No guardes los códigos en el repositorio.
// Revocar: quita «id:huella» de AIRI_CODIGOS y vuelve a cargar el secreto (npx wrangler secret put AIRI_CODIGOS).
import { createHash, randomBytes } from "node:crypto";

const ids = process.argv.slice(2);
if (!ids.length || ids.some((id) => !/^[a-z0-9-]{1,32}$/.test(id)) || new Set(ids).size !== ids.length) {
  console.error("Uso: node publico/herramientas/generar-codigos.mjs p01 p02 …  (ids en minúsculas, números o guiones, sin repetir)");
  process.exit(1);
}
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // sin 0/O ni 1/I para dictarlos sin errores
const nuevoCodigo = () => {
  const b = randomBytes(20);
  const c = [...b].map((x) => ALFABETO[x % 32]).join("");   // 20 símbolos de 32 = 100 bits
  return c.match(/.{5}/g).join("-");
};
const lineas = [];
console.log("Códigos (entrégalos en privado; no se vuelven a mostrar):");
for (const id of ids) {
  const codigo = nuevoCodigo();
  lineas.push(`${id}:${createHash("sha256").update(codigo).digest("hex")}`);
  console.log(`  ${id}  ${codigo}`);
}
console.log("\nValor para el secreto AIRI_CODIGOS (añádelo a los ya existentes, separado por comas):");
console.log(lineas.join(","));
console.log("\nSal aleatoria sugerida para AIRI_SAL (solo la primera vez):");
console.log(randomBytes(24).toString("base64url"));
