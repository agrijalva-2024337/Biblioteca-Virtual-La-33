import { create } from 'zustand';
import {
  getAllUsers,
  createUser as createUserRequest,
  updateUserDetails as updateUserDetailsRequest,
  toggleUserStatus as toggleUserStatusRequest,
  updateUserRole as updateUserRoleRequest,
} from '../../../shared/api/auth';
import { parseApiError } from '../../../shared/utils/apiError.js';

const normalizeUsers = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const useStudentsStore = create((set, get) => ({
  users: [],
  loading: false,
  updatingUserId: null,
  error: null,

  fetchStudents: async (options = {}) => {
    const { force = false } = options;

    if (get().loading) return;
    if (!force && get().users.length > 0) return;

    set({ loading: true, error: null });

    try {
      const response = await getAllUsers();
      const users = normalizeUsers(response);

      set({
        users,
        loading: false,
        error: null,
      });
    } catch (err) {
      const message = parseApiError(err, 'Error al obtener los usuarios');

      set({
        users: [],
        error: message,
        loading: false,
      });
    }
  },

  refreshStudents: async () => {
    await get().fetchStudents({ force: true });
  },

  createUser: async (payload) => {
    set({ loading: true, error: null });

    try {
      await createUserRequest(payload);
      await get().fetchStudents({ force: true });
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const message = parseApiError(err, 'No se pudo crear el usuario');

      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  updateUserDetails: async (userId, payload) => {
    set({ updatingUserId: userId, error: null });

    try {
      await updateUserDetailsRequest(userId, payload);
      await get().fetchStudents({ force: true });
      set({ updatingUserId: null });
      return { success: true };
    } catch (err) {
      const message = parseApiError(err, 'No se pudo actualizar el usuario');

      set({ updatingUserId: null, error: message });
      return { success: false, error: message };
    }
  },

  toggleUserStatus: async (userId, activate) => {
    set({ updatingUserId: userId, error: null });

    try {
      await toggleUserStatusRequest(userId, activate);
      await get().fetchStudents({ force: true });
      set({ updatingUserId: null });
      return { success: true };
    } catch (err) {
      const message = parseApiError(err, 'No se pudo cambiar el estado del usuario');

      set({ updatingUserId: null, error: message });
      return { success: false, error: message };
    }
  },

  updateUserRole: async (userId, roleName) => {
    set({ updatingUserId: userId, error: null });

    try {
      await updateUserRoleRequest(userId, roleName);
      await get().fetchStudents({ force: true });
      set({ updatingUserId: null });
      return { success: true };
    } catch (err) {
      const message = parseApiError(err, 'No se pudo actualizar el rol');

      set({ updatingUserId: null, error: message });
      return { success: false, error: message };
    }
  },
}));
