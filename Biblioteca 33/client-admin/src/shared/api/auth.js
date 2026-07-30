import { axiosAuth } from './api';

export const login = async (data) => {
  return await axiosAuth.post('/Auth/login', data);
};

export const refreshToken = async (payload) => {
  const { data } = await axiosAuth.post('/Auth/refresh', payload);
  return data;
};

export const forgotPassword = async (email, captchaToken = '') => {
  const { data } = await axiosAuth.post('/Auth/forgot-password', {
    email,
    captchaToken,
  });
  return data;
};

export const verifyEmail = async (token) => {
  const { data } = await axiosAuth.post('/Auth/verify-email', { token });
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const { data } = await axiosAuth.post('/Auth/reset-password', {
    token,
    newPassword,
  });
  return data;
};

export const getProfile = async () => {
  const { data } = await axiosAuth.get('/Auth/profile');
  return data.data || data;
};

export const updateProfile = async (payload) => {
  const { data } = await axiosAuth.put('/Auth/profile', payload);
  return data.data || data;
};

export const getProfileById = async (userId) => {
  const { data } = await axiosAuth.post('/Auth/profile/by-id', { userId });
  return data.data || data;
};

// Solo ADMIN_ROLE. El backend expone GET /Users/by-role/{roleName}, no GET /Users.
export const getUsersByRole = async (roleName) => {
  const { data } = await axiosAuth.get(`/Users/by-role/${roleName}`);
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return { users: list };
};

export const getAllUsers = async () => {
  const { data } = await axiosAuth.get('/Users');
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return { users: list };
};

export const createUser = async (payload) => {
  const { data } = await axiosAuth.post('/Users', payload);
  return data;
};

export const updateUserDetails = async (userId, payload) => {
  const { data } = await axiosAuth.put(`/Users/${userId}`, payload);
  return data;
};

export const toggleUserStatus = async (userId, activate) => {
  const { data } = await axiosAuth.patch(`/Users/${userId}/status`, { activate });
  return data;
};

export const updateUserRole = async (userId, roleName) => {
  const { data } = await axiosAuth.put(`/Users/${userId}/role`, { roleName });
  return data;
};
