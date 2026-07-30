export const normalizeSubjects = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const formatApiError = (err, fallback) => {
  const errors = err.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.map((e) => e.message || e.msg).filter(Boolean).join('. ');
  }
  return err.response?.data?.message || fallback;
};

export const getTeacherId = (teacher) => teacher?.id || teacher?.Id || '';

export const getTeacherLabel = (teacher) => {
  const parts = [teacher?.name, teacher?.surname].filter(Boolean);
  if (parts.length > 0) return `${parts.join(' ')} (@${teacher.username || '—'})`;
  return teacher?.username || teacher?.email || getTeacherId(teacher) || 'Docente';
};
