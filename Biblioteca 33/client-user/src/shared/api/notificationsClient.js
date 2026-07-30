// client-user/src/shared/api/notificationsClient.js
import axios from 'axios';
import { NOTIFICATIONS_URL } from '../constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

export const notificationsClient = axios.create({
  baseURL: NOTIFICATIONS_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

notificationsClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

notificationsClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const getNotifications = async (params = {}) => {
  const { data } = await notificationsClient.get('/notifications', { params });
  return data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await notificationsClient.patch(`/notifications/${id}/read`);
  return data;
};
