export const ADMIN_ROLE = 'ADMIN_ROLE';
export const TEACHER_ROLE = 'TEACHER_ROLE';
export const USER_ROLE = 'USER_ROLE';

export const normalizeRole = (role) => {
  if (role === 'ADMIN') return ADMIN_ROLE;
  return role;
};

export const ROLE_LABELS = {
  [ADMIN_ROLE]: 'Administrador',
  [TEACHER_ROLE]: 'Docente',
  [USER_ROLE]: 'Estudiante',
};

export const getRoleLabel = (role) => ROLE_LABELS[normalizeRole(role)] || role || '—';

export const getDefaultRouteForRole = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === ADMIN_ROLE) return '/admin/inicio';
  if (normalized === TEACHER_ROLE) return '/teacher/inicio';
  return '/';
};
