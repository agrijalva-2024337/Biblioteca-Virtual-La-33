// client-user/src/features/notifications/hooks/useNotifications.js
import { useCallback, useState } from 'react';
import {
  getNotifications,
  markNotificationAsRead,
} from '../../../shared/api/notificationsClient.js';
import { normalizeList } from '../../../utils/formatters.js';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getNotifications();
      const list = response?.notifications ?? normalizeList(response);
      setNotifications(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar notificaciones');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    setError(null);

    try {
      const response = await markNotificationAsRead(id);
      const updated = response?.notification ?? response?.data?.notification;

      setNotifications((prev) =>
        prev.map((item) => {
          const itemId = item._id || item.id;
          if (itemId !== id) return item;
          return updated ? { ...item, ...updated, read: true } : { ...item, read: true };
        })
      );

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al marcar como leída';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
  };
};
