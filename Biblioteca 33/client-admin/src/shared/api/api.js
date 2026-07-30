import axios from '../utils/axios.js';
import { useAuthStore } from '../../features/auth/store/authStore.js';

const attachAuth = (instance, clientName, { logoutOnUnauthorized = false } = {}) => {
  instance.interceptors.request.use((config) => {
    config._axiosClient = clientName;
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      // Solo auth-service debe invalidar la sesión. Un 401 de notifications/files/
      // (JWT mal configurado o servicio caído) no debe expulsar al login.
      // Tampoco cerrar sesión en endpoints públicos de auth (verify/reset/login).
      const url = String(error.config?.url || '');
      const isPublicAuth =
        url.includes('/Auth/login') ||
        url.includes('/Auth/register') ||
        url.includes('/Auth/forgot-password') ||
        url.includes('/Auth/resend-verification') ||
        url.includes('/Auth/verify-email') ||
        url.includes('/Auth/reset-password');

      if (
        logoutOnUnauthorized &&
        error.response?.status === 401 &&
        !isPublicAuth
      ) {
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }
  );
};

export const axiosAuth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosFiles = axios.create({
  baseURL: import.meta.env.VITE_FILES_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosModeration = axios.create({
  baseURL: import.meta.env.VITE_MODERATION_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosNotifications = axios.create({
  baseURL: import.meta.env.VITE_NOTIFICATIONS_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

attachAuth(axiosAuth, 'auth', { logoutOnUnauthorized: true });
attachAuth(axiosFiles, 'files');
attachAuth(axiosModeration, 'moderation');
attachAuth(axiosNotifications, 'notifications');

// FormData: quitar Content-Type por defecto (application/json) para no romper el boundary
axiosFiles.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    } else if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }
  return config;
});

export { axiosAuth as default };
