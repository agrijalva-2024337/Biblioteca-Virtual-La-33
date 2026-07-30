// client-user/src/features/home/hooks/useHome.js
import { useCallback, useState } from 'react';
import { getFiles, getSubjects } from '../../../shared/api/filesClient.js';
import { useAuthStore } from '../../../shared/store/authStore.js';
import { normalizeGrade, sameGrade } from '../../../shared/constants/grades.js';
import { normalizeList } from '../../../utils/formatters.js';

const RECENT_LIMIT = 6;

export const useHome = () => {
  const userGrade = useAuthStore((s) => s.user?.grade || s.user?.Grade || '');
  const lockedGrade = normalizeGrade(userGrade) || userGrade;

  const [subjects, setSubjects] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState(null);

  const loadRecentFiles = useCallback(async (subjectId = '') => {
    const params = { status: 'approved' };
    if (subjectId) params.subject = subjectId;

    const filesResponse = await getFiles(params);
    let list = normalizeList(filesResponse);

    // Si no hay subject concreto, restringir por grado del estudiante.
    if (!subjectId && lockedGrade) {
      list = list.filter((file) => {
        const grade =
          typeof file.subject === 'object' ? file.subject?.grade : null;
        if (!grade) return false;
        return sameGrade(grade, lockedGrade);
      });
    }

    return list
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, RECENT_LIMIT);
  }, [lockedGrade]);

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const subjectsParams = lockedGrade ? { grade: lockedGrade } : {};
      const [subjectsResponse, filesList] = await Promise.all([
        getSubjects(subjectsParams),
        loadRecentFiles(selectedSubjectId),
      ]);

      let subjectList = normalizeList(subjectsResponse);
      if (lockedGrade) {
        subjectList = subjectList.filter((s) => sameGrade(s.grade, lockedGrade));
      }

      setSubjects(subjectList);
      setRecentFiles(filesList);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el inicio');
      setSubjects([]);
      setRecentFiles([]);
    } finally {
      setLoading(false);
    }
  }, [loadRecentFiles, selectedSubjectId, lockedGrade]);

  const selectSubject = useCallback(
    async (subjectId) => {
      const nextId = selectedSubjectId === subjectId ? '' : subjectId;
      setSelectedSubjectId(nextId);
      setFiltering(true);
      setError(null);

      try {
        const filesList = await loadRecentFiles(nextId);
        setRecentFiles(filesList);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al filtrar materiales');
        setRecentFiles([]);
      } finally {
        setFiltering(false);
      }
    },
    [loadRecentFiles, selectedSubjectId]
  );

  const clearSubjectFilter = useCallback(async () => {
    if (!selectedSubjectId) return;
    await selectSubject(selectedSubjectId);
  }, [selectSubject, selectedSubjectId]);

  return {
    subjects,
    recentFiles,
    selectedSubjectId,
    loading,
    filtering,
    error,
    fetchHomeData,
    selectSubject,
    clearSubjectFilter,
  };
};
