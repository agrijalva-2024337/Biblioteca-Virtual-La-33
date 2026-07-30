import { axiosFiles } from './api';

// Subir archivo (multipart): file, title, description, subject, promotionYear
export const uploadFile = async ({ file, title, description, subject, promotionYear }) => {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);
  if (description) formData.append('description', description);
  if (subject) formData.append('subject', subject);
  if (promotionYear != null && promotionYear !== '') {
    formData.append('promotionYear', String(promotionYear));
  }

  const { data } = await axiosFiles.post('/files/upload', formData, {
    // No fijar Content-Type: axios debe enviar multipart con boundary
    transformRequest: [(payload) => payload],
  });
  return data;
};

// Listado con filtros opcionales: status, subject, q, promotionYear
export const getFiles = async (params = {}) => {
  const { data } = await axiosFiles.get('/files', { params });
  return data;
};

export const searchFiles = async (q) => {
  const { data } = await axiosFiles.get('/files/search', { params: { q } });
  return data;
};

export const getMyFiles = async () => {
  const { data } = await axiosFiles.get('/files/mine');
  return data;
};

export const getFileById = async (id) => {
  const { data } = await axiosFiles.get(`/files/${id}`);
  return data;
};

export const addComment = async ({ fileId, text }) => {
  const { data } = await axiosFiles.post('/comments', { fileId, text });
  return data;
};

export const getComments = async (fileId) => {
  const { data } = await axiosFiles.get(`/comments/${fileId}`);
  return data;
};

export const getSubjects = async (params = {}) => {
  const { data } = await axiosFiles.get('/subjects', { params });
  return data;
};

export const createSubject = async ({ name, grade }) => {
  const { data } = await axiosFiles.post('/subjects', { name, grade });
  return data;
};

export const updateSubject = async (subjectId, payload) => {
  const { data } = await axiosFiles.put(`/subjects/${subjectId}`, payload);
  return data;
};

/** Reemplaza assignedTeachers de una asignatura. Solo ADMIN_ROLE. */
export const assignSubjectTeachers = async (subjectId, teacherIds) => {
  const { data } = await axiosFiles.patch(`/subjects/${subjectId}/teachers`, {
    teacherIds,
  });
  return data;
};

export const getGrades = async () => {
  const { data } = await axiosFiles.get('/grades');
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
};

export const createGrade = async ({ name, order }) => {
  const { data } = await axiosFiles.post('/grades', { name, order });
  return data;
};
