import { create } from 'zustand';
import { getFiles as getFilesRequest, getSubjects as getSubjectsRequest } from '../../../shared/api/files';
import { parseApiError } from '../../../shared/utils/apiError.js';

const normalizeFiles = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.files)) return payload.files;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeSubjects = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.subjects)) return payload.subjects;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const useMaterialsStore = create((set, get) => ({
  files: [],
  subjects: [],
  loading: false,
  subjectsLoading: false,
  error: null,
  filters: {
    q: '',
    subject: '',
    status: '',
  },

  setFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
    })),

  fetchSubjects: async (force = false) => {
    if (!force && get().subjectsLoading) return;

    set({ subjectsLoading: true });

    try {
      const response = await getSubjectsRequest();
      set({
        subjects: normalizeSubjects(response),
        subjectsLoading: false,
      });
    } catch {
      set({ subjects: [], subjectsLoading: false });
    }
  },

  fetchFiles: async () => {
    const { filters } = get();

    if (get().loading) return;

    set({ loading: true, error: null });

    try {
      const params = {};
      if (filters.q?.trim()) params.q = filters.q.trim();
      if (filters.subject) params.subject = filters.subject;
      if (filters.status) params.status = filters.status;

      const response = await getFilesRequest(params);
      const files = normalizeFiles(response);

      set({
        files,
        loading: false,
        error: null,
      });
    } catch (err) {
      const message = parseApiError(err, 'Error al obtener los materiales');

      set({
        files: [],
        error: message,
        loading: false,
      });
    }
  },

  refreshFiles: async () => {
    await get().fetchFiles();
  },
}));
