import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginRequest } from '../../../shared/api/auth';
import { showError } from '../../../shared/utils/toast.js';
import {
  ADMIN_ROLE,
  TEACHER_ROLE,
  USER_ROLE,
  normalizeRole,
} from '../../../shared/utils/roles.js';

const PANEL_ROLES = new Set([ADMIN_ROLE, TEACHER_ROLE]);

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      loading: false,
      error: null,
      isLoadingAuth: true,
      isAuthenticated: false,

      getRole: () => normalizeRole(get().user?.role),

      isAdmin: () => get().getRole() === ADMIN_ROLE,

      isTeacher: () => get().getRole() === TEACHER_ROLE,

      checkAuth: () => {
        const { token, expiresAt, user } = get();

        if (token && expiresAt && new Date(expiresAt) < new Date()) {
          set({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            isAuthenticated: false,
            isLoadingAuth: false,
            error: 'Sesión expirada',
          });
          return;
        }

        set({
          isLoadingAuth: false,
          isAuthenticated: Boolean(token && user),
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoadingAuth: false,
          error: null,
        });
      },

      login: async ({ emailOrUsername, password, captchaToken }) => {
        try {
          set({ loading: true, error: null });
          const { data } = await loginRequest({
            emailOrUsername,
            password,
            captchaToken,
          });

          const userDetails = data?.userDetails;
          const role = normalizeRole(userDetails?.role);

          if (role === USER_ROLE) {
            const message = 'Esta app es para administradores y docentes. Usa la app móvil.';
            set({ loading: false, error: message, isLoadingAuth: false });
            showError(message);
            return { success: false, error: message };
          }

          if (!PANEL_ROLES.has(role)) {
            const message = 'Rol no permitido en este panel';
            set({ loading: false, error: message, isLoadingAuth: false });
            showError(message);
            return { success: false, error: message };
          }

          set({
            user: userDetails,
            token: data.token,
            refreshToken: data.refreshToken || null,
            expiresAt: data.expiresAt || null,
            isAuthenticated: true,
            isLoadingAuth: false,
            loading: false,
          });
          return { success: true, role };
        } catch (err) {
          const message = err.response?.data?.message || 'Error al iniciar sesión';
          set({ error: message, loading: false, isLoadingAuth: false });
          return { success: false, error: message };
        }
      },
    }),
    {
      name: 'auth-biblioteca33',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          state?.checkAuth();
        }
      },
    }
  )
);
