export const STATUS_LABELS = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

export const AI_CLASSIFICATION_CONFIG = {
  material_apoyo: {
    label: 'Material de apoyo',
    variant: 'success',
    hint: 'La IA cree que es útil para estudiar (apuntes, guías, teoría).',
    action: 'Suele aprobarse si el contenido es correcto.',
  },
  tarea_resuelta: {
    label: 'Tarea resuelta',
    variant: 'danger',
    hint: 'La IA cree que trae respuestas o un examen ya contestado.',
    action: 'Suele rechazarse según las reglas de la biblioteca.',
  },
  incierto: {
    label: 'Necesita revisión',
    variant: 'warning',
    hint: 'La IA no pudo decidir con seguridad.',
    action: 'Revisa el documento y decide aprobar o rechazar.',
  },
};

/** Traduce textos técnicos viejos a lenguaje claro para el docente. */
export const humanizeAiReason = (raw, classification) => {
  const text = String(raw || '').trim();
  if (!text) {
    return AI_CLASSIFICATION_CONFIG[classification]?.hint || 'Sin detalle adicional.';
  }

  if (/conflicto:|heur[ií]stica\s*=|modelo\s*=|fuente\s*=conflict/i.test(text)) {
    return (
      'La revisión automática no coincide: unas señales parecen de tarea resuelta ' +
      'y otras de material de estudio. Por eso necesita que lo revises tú.'
    );
  }

  if (/confianza\s*=|fuente\s*=/i.test(text)) {
    return (
      text
        .replace(/\s*\(confianza=[^)]+\)\s*/gi, '')
        .replace(/\s*\(fuente=[^)]+\)\s*/gi, '')
        .replace(/Conflicto:[^.]+?\./gi, 'Hay dudas en la clasificación automática.')
        .replace(/heur[ií]stica=\w+/gi, '')
        .replace(/modelo=\w+/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim() || AI_CLASSIFICATION_CONFIG[classification]?.hint
    );
  }

  return text;
};

export const confidenceLabel = (score) => {
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  if (n >= 0.78) return { text: 'Alta', pct: Math.round(n * 100) };
  if (n >= 0.55) return { text: 'Media', pct: Math.round(n * 100) };
  return { text: 'Baja', pct: Math.round(n * 100) };
};

export const getDisplayName = (moderation) =>
  moderation?.title || moderation?.originalName || 'Documento sin título';

export const getFileUrl = (moderation) => moderation?.fileURL || moderation?.fileUrl;
