// client-user/src/shared/api/filesClient.js
import axios from 'axios';
import { FILES_URL } from '../constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

export const filesClient = axios.create({
  baseURL: FILES_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

filesClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // FormData: NUNCA fijar Content-Type a mano. Sin boundary Multer responde 500
  // ("Multipart: Boundary not found") y la app muestra "Error interno del servidor".
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

filesClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const getFiles = async (params = {}) => {
  const { data } = await filesClient.get('/files', { params });
  return data;
};

export const searchFiles = async (q) => {
  const { data } = await filesClient.get('/files/search', { params: { q } });
  return data;
};

export const getMyFiles = async () => {
  const { data } = await filesClient.get('/files/mine');
  return data;
};

export const getFileById = async (id) => {
  const { data } = await filesClient.get(`/files/${id}`);
  return data;
};

export const getSubjects = async (params = {}) => {
  const query = {};
  if (params.grade) {
    query.grade = params.grade;
  }
  const { data } = await filesClient.get('/subjects', { params: query });
  return data;
};

export const getGrades = async () => {
  const { data } = await filesClient.get('/grades');
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
};

export const uploadFile = async ({ file, title, description, subject, promotionYear }) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'upload.bin',
    type: file.type || 'application/octet-stream',
  });
  if (title) formData.append('title', title);
  if (description) formData.append('description', description);
  if (subject) formData.append('subject', subject);
  if (promotionYear != null && promotionYear !== '') {
    formData.append('promotionYear', String(promotionYear));
  }

  if (__DEV__) {
    console.log('[upload] outgoing multipart fields', {
      title,
      subject,
      promotionYear,
      fileName: file.name,
      fileType: file.type,
      hasUri: Boolean(file.uri),
    });
  }

  const { data } = await filesClient.post('/files/upload', formData, {
    timeout: 60000,
    // Dejar Content-Type al runtime (con boundary). No usar 'multipart/form-data' a pelo.
    transformRequest: [(payload) => payload],
  });
  return data;
};

export const getComments = async (fileId) => {
  const { data } = await filesClient.get(`/comments/${fileId}`);
  return data;
};

export const addComment = async ({ fileId, text }) => {
  const { data } = await filesClient.post('/comments', { fileId, text });
  return data;
};
