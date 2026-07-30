/** Helpers — la fuente de verdad es GET /grades del files-service. */

export const getGradeLabel = (grade) => {
  if (grade == null || grade === '') return '—';
  const raw = String(grade).trim();
  if (!raw) return '—';
  if (raw === '4to') return '4to grado';
  if (raw === '5to') return '5to grado';
  return raw;
};

/** Compat suave con códigos semilla; grados nuevos se usan tal cual. */
export const normalizeGrade = (value) => {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower === '4to' || lower.startsWith('4to ')) return '4to';
  if (lower === '5to' || lower.startsWith('5to ')) return '5to';
  return raw;
};

/** Compara grados tolerando "6to" vs "6to grado". */
export const sameGrade = (a, b) => {
  const na = normalizeGrade(a);
  const nb = normalizeGrade(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const strip = (g) => g.toLowerCase().replace(/\s+grado$/i, '').trim();
  return strip(na) === strip(nb);
};

export const gradesToOptions = (grades = []) =>
  (Array.isArray(grades) ? grades : [])
    .map((g, index) => {
      const name = g?.name != null ? String(g.name).trim() : '';
      if (!name) return null;
      return {
        value: name,
        label: getGradeLabel(name),
        description: `Carpetas de ${getGradeLabel(name)}`,
        order: g.order ?? index,
        id: g._id != null ? String(g._id) : undefined,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const currentPromotionYear = () => new Date().getFullYear();

export const PROMOTION_YEAR_OPTIONS = (() => {
  const year = currentPromotionYear();
  return [year, year - 1, year - 2].map((y) => ({ value: String(y), label: String(y) }));
})();
