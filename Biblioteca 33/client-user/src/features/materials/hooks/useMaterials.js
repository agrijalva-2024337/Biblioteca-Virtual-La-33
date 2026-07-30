// client-user/src/features/materials/hooks/useMaterials.js
import { useCallback, useState } from 'react';
import {
  addComment as addCommentRequest,
  getComments as getCommentsRequest,
  getFileById,
  getFiles,
  getSubjects,
} from '../../../shared/api/filesClient.js';
import { normalizeGrade, sameGrade } from '../../../shared/constants/grades.js';
import { normalizeList, unwrapData } from '../../../utils/formatters.js';

export const useMaterials = () => {
  const [files, setFiles] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubjects = useCallback(async (grade = '') => {
    setError(null);

    try {
      const gradeCode = normalizeGrade(grade) || grade;
      const params = gradeCode ? { grade: gradeCode } : {};
      const response = await getSubjects(params);
      let list = normalizeList(response);
      if (gradeCode) {
        list = list.filter((s) => sameGrade(s.grade, gradeCode));
      }
      setSubjects(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar asignaturas');
      setSubjects([]);
    }
  }, []);

  const fetchFiles = useCallback(async ({ subject = '', q = '' } = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = { status: 'approved' };
      if (subject) params.subject = subject;
      if (q?.trim()) params.q = q.trim();

      const response = await getFiles(params);
      setFiles(normalizeList(response));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar materiales');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFileById = useCallback(async (id) => {
    if (!id) return null;

    setDetailLoading(true);
    setError(null);

    try {
      const response = await getFileById(id);
      const data = unwrapData(response);
      setFile(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el material');
      setFile(null);
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const fetchComments = useCallback(async (fileId) => {
    if (!fileId) return;

    setCommentsLoading(true);
    setError(null);

    try {
      const response = await getCommentsRequest(fileId);
      setComments(normalizeList(response));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar comentarios');
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const postComment = useCallback(async ({ fileId, text }) => {
    setSubmittingComment(true);
    setError(null);

    try {
      await addCommentRequest({ fileId, text });
      const response = await getCommentsRequest(fileId);
      setComments(normalizeList(response));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al publicar comentario';
      setError(message);
      return { success: false, error: message };
    } finally {
      setSubmittingComment(false);
    }
  }, []);

  return {
    files,
    subjects,
    file,
    comments,
    loading,
    detailLoading,
    commentsLoading,
    submittingComment,
    error,
    fetchSubjects,
    fetchFiles,
    fetchFileById,
    fetchComments,
    postComment,
  };
};
