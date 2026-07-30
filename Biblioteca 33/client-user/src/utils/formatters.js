// client-user/src/utils/formatters.js

export const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.files)) return payload.files;
  if (Array.isArray(payload?.subjects)) return payload.subjects;
  return [];
};

/** Clave estable para FlatList/map — nunca un objeto. */
export const toListKey = (item, index = 0, prefix = 'item') => {
  if (item == null) return `${prefix}-${index}`;
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  const raw = item._id ?? item.id ?? item.value ?? item.key;
  if (raw != null && typeof raw !== 'object') return String(raw);
  if (raw != null && typeof raw === 'object' && raw.toString && raw.toString() !== '[object Object]') {
    return String(raw);
  }
  return `${prefix}-${index}`;
};

export const unwrapData = (payload) => payload?.data ?? payload;

export const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const getFileTypeFromUrl = (fileUrl, originalName) => {
  const source = fileUrl || originalName || '';
  const clean = source.split('?')[0];
  const parts = clean.split('.');
  if (parts.length < 2) return '—';
  const ext = parts.pop()?.toLowerCase();
  if (!ext) return '—';
  const map = {
    pdf: 'PDF',
    doc: 'DOC',
    docx: 'DOC',
    mp4: 'MP4',
    jpg: 'IMG',
    jpeg: 'IMG',
    png: 'IMG',
  };
  return map[ext] || ext.toUpperCase();
};

export const getSubjectName = (item) => {
  if (!item?.subject) return '—';
  if (typeof item.subject === 'string') return '—';
  return item.subject.name || '—';
};

export const getSubjectId = (subject) => {
  if (!subject) return '';
  if (typeof subject === 'string') return subject;
  return subject._id || subject.id || '';
};

export const STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};
