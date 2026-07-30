export const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '';
  return `${formatDate(isoString)} ${formatTime(isoString)}`;
};

export const formatFileSize = (bytes) => {
  if (bytes == null || Number.isNaN(Number(bytes))) return '';
  const size = Number(bytes);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

/** Tipo de archivo derivado de la extensión en fileUrl u originalName (no hay campo tipo en el backend). */
export const getFileTypeFromUrl = (fileUrl, originalName) => {
  const source = fileUrl || originalName || '';
  const clean = source.split('?')[0];
  const parts = clean.split('.');
  if (parts.length < 2) return '—';
  const ext = parts.pop()?.toLowerCase();
  if (!ext) return '—';
  const map = { pdf: 'PDF', doc: 'DOC', docx: 'DOC', mp4: 'MP4', jpg: 'IMG', jpeg: 'IMG', png: 'IMG' };
  return map[ext] || ext.toUpperCase();
};

/** pdf | image | other — para vista previa en el panel de moderación. */
export const getPreviewKind = (fileUrl, originalName, mimeType) => {
  const mime = (mimeType || '').toLowerCase();

  if (mime === 'application/pdf') return 'pdf';
  if (mime === 'image/jpeg' || mime === 'image/jpg' || mime === 'image/png') return 'image';

  const source = (fileUrl || originalName || '').split('?')[0];
  const ext = source.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') return 'pdf';
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return 'image';

  return 'other';
};
