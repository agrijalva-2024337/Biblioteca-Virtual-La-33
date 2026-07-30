import { axiosNotifications } from './api';

// El backend NO expone un endpoint de "unread count": el conteo se deriva
// de la lista (campo read === false). Params reales: page, limit, type.
export const getNotifications = async (params = {}) => {
  const { data } = await axiosNotifications.get('/notifications', { params });
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await axiosNotifications.patch(`/notifications/${id}/read`);
  return data;
};
