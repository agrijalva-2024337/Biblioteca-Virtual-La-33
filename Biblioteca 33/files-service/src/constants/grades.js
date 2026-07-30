/** Helpers de grado — la fuente de verdad es la colección Grade en MongoDB. */

export const normalizeGradeName = (value) => {
  if (value == null) return null;
  const raw = String(value).trim();
  return raw || null;
};

/**
 * Compatibilidad con filtros legados ("4to grado" → "4to").
 * Para grados nuevos (ej. "6to grado") se usa el name tal cual.
 */
export const coerceLegacyGrade = (value) => {
  const normalized = normalizeGradeName(value);
  if (!normalized) return null;
  const lower = normalized.toLowerCase();
  if (lower === "4to" || lower.startsWith("4to ")) return "4to";
  if (lower === "5to" || lower.startsWith("5to ")) return "5to";
  return normalized;
};
