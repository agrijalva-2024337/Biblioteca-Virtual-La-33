import { useAuthStore } from '../store/authStore.js';

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const isTeacher = useAuthStore((s) => s.isTeacher());
  const role = useAuthStore((s) => s.getRole());

  return { user, isAuthenticated, loading, error, login, logout, isAdmin, isTeacher, role };
};
