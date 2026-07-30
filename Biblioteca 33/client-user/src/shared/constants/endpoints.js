// client-user/src/shared/constants/endpoints.js
import { Platform } from 'react-native';

const RAW_AUTH_URL =
  process.env.EXPO_PUBLIC_AUTH_URL || 'http://localhost:5074/api/v1';
const RAW_FILES_URL =
  process.env.EXPO_PUBLIC_FILES_URL || 'http://localhost:3003';
const RAW_NOTIFICATIONS_URL =
  process.env.EXPO_PUBLIC_NOTIFICATIONS_URL ||
  'http://localhost:3005/Biblioteca/v1';

/**
 * En Android emulador, localhost apunta al emulador; 10.0.2.2 es el host de la máquina.
 * En iOS simulator, localhost funciona. En dispositivo físico, configura la IP de tu PC en .env.
 */
export const resolveDevHost = (url) => {
  if (!url || !__DEV__) return url;

  const isLocalhost = /localhost|127\.0\.0\.1/.test(url);
  if (!isLocalhost) return url;

  if (Platform.OS === 'android') {
    return url.replace(/localhost|127\.0\.0\.1/g, '10.0.2.2');
  }

  return url;
};

export const AUTH_URL = resolveDevHost(RAW_AUTH_URL);
export const FILES_URL = resolveDevHost(RAW_FILES_URL);
export const NOTIFICATIONS_URL = resolveDevHost(RAW_NOTIFICATIONS_URL);
