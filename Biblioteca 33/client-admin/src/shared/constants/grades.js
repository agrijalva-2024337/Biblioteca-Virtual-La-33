/** Helpers de presentación — la fuente de verdad es GET /grades del files-service. */

export const getGradeLabel = (grade) => {
  if (grade == null || grade === '') return '—';
  const raw = String(grade).trim();
  if (!raw) return '—';
  // Compat: códigos cortos semilla
  if (raw === '4to') return '4to grado';
  if (raw === '5to') return '5to grado';
  return raw;
};

export const currentPromotionYear = () => new Date().getFullYear();

/** Mapea documentos Grade del API a opciones de select. */
export const gradesToOptions = (grades = []) =>
  (Array.isArray(grades) ? grades : []).map((g) => ({
    value: g.name,
    label: getGradeLabel(g.name),
    order: g.order ?? 0,
    id: g._id,
  }));
