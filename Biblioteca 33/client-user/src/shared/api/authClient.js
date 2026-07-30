// client-user/src/shared/api/authClient.js
import axios from 'axios';
import { AUTH_URL } from '../constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

export const authClient = axios.create({
  baseURL: AUTH_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

authClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = String(error.config?.url || '');
    const isPublicAuth =
      url.includes('/Auth/login') ||
      url.includes('/Auth/register') ||
      url.includes('/Auth/forgot-password') ||
      url.includes('/Auth/resend-verification') ||
      url.includes('/Auth/verify-email') ||
      url.includes('/Auth/reset-password');

    // No cerrar sesión en fallos de login/registro (p. ej. correo sin verificar).
    if (error.response?.status === 401 && !isPublicAuth) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const loginRequest = async ({ emailOrUsername, password, captchaToken }) => {
  const { data } = await authClient.post('/Auth/login', {
    emailOrUsername,
    password,
    captchaToken: captchaToken || '',
  });
  return data;
};

export const getProfileRequest = async () => {
  const { data } = await authClient.get('/Auth/profile');
  return data?.data ?? data;
};

export const registerRequest = async (formData) => {
  const { data } = await authClient.post('/Auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const resendVerificationRequest = async (email) => {
  const { data } = await authClient.post('/Auth/resend-verification', {
    email: email.trim().toLowerCase(),
  });
  return data;
};
