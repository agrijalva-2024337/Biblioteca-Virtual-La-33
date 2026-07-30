import { create } from 'zustand';
import {
  getModerations as getModerationsRequest,
  approveModeration as approveModerationRequest,
  rejectModeration as rejectModerationRequest,
} from '../../../shared/api/moderation';
import { getFileById } from '../../../shared/api/files';
import { resolveUploaderDisplayName } from '../../../shared/utils/uploaderResolver';
import { parseApiError } from '../../../shared/utils/apiError.js';

const defaultPagination = {
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  limit: 10,
};

const normalizeList = (payload) => {
  if (Array.isArray(payload?.moderations)) return payload.moderations;
  if (Array.isArray(payload)) return payload;
  return [];
};

const mergeFileDetails = (moderation, file) => {
  if (!file || !moderation) return moderation;

  return {
    ...moderation,
    title: moderation.title || file.title,
    originalName: moderation.originalName || file.originalName,
    sizeBytes: moderation.sizeBytes ?? file.sizeBytes,
    mimeType: moderation.mimeType || file.mimeType,
    fileURL: moderation.fileURL || moderation.fileUrl || file.fileUrl,
    fileStatus: file.status,
    fileCreatedAt: file.createdAt,
  };
};

export const useModerationStore = create((set, get) => ({
  moderations: [],
  selectedModeration: null,
  historyApproved: [],
  historyRejected: [],
  loading: false,
  actionLoading: false,
  error: null,
  pagination: { ...defaultPagination },
  statusFilter: 'PENDING',

  setStatusFilter: (status) => set({ statusFilter: status }),

  setPage: (page) => {
    const { pagination } = get();
    const totalPages = Math.max(1, pagination.totalPages || 1);
    const nextPage = Math.max(1, Math.min(page, totalPages));

    set({
      pagination: { ...pagination, currentPage: nextPage },
    });

    return get().fetchModerations({ force: true, page: nextPage });
  },

  setSelectedModeration: (moderation) => set({ selectedModeration: moderation }),

  enrichWithFileDetails: async (moderation) => {
    if (!moderation) return moderation;

    let enriched = { ...moderation };

    if (moderation.fileId) {
      try {
        const file = await getFileById(moderation.fileId);
        enriched = mergeFileDetails(enriched, file);
      } catch {
        // Mantener datos de moderación si files-service falla.
      }
    }

    const uploaderId = enriched.uploadedBy;
    if (uploaderId && !enriched.uploaderDisplayName) {
      enriched.uploaderDisplayName = await resolveUploaderDisplayName(uploaderId);
    }

    set({ selectedModeration: enriched });
    return enriched;
  },

  fetchModerations: async (options = {}) => {
    const { force = false, page, limit } = options;
    const state = get();

    if (state.loading) return;
    if (!force && state.moderations.length > 0 && state.statusFilter === 'PENDING') {
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await getModerationsRequest({
        page: page ?? state.pagination.currentPage,
        limit: limit ?? state.pagination.limit,
        status: state.statusFilter,
      });

      const moderations = normalizeList(response);

      set({
        moderations,
        pagination: response.pagination ?? { ...defaultPagination },
        loading: false,
        error: null,
      });

      const current = get().selectedModeration;
      const stillExists = current && moderations.some((m) => m._id === current._id);

      if (!stillExists) {
        const first = moderations[0] ?? null;
        set({ selectedModeration: first });
        if (first) await get().enrichWithFileDetails(first);
      }

      return moderations;
    } catch (err) {
      const message = parseApiError(err, 'Error al obtener moderaciones');

      set({
        moderations: [],
        selectedModeration: null,
        error: message,
        loading: false,
      });
    }
  },

  fetchHistory: async (options = {}) => {
    const { force = false } = options;
    const state = get();

    if (!force && state.historyApproved.length > 0 && state.historyRejected.length > 0) {
      return;
    }

    try {
      const [approvedRes, rejectedRes] = await Promise.all([
        getModerationsRequest({ status: 'APPROVED', page: 1, limit: 5 }),
        getModerationsRequest({ status: 'REJECTED', page: 1, limit: 5 }),
      ]);

      set({
        historyApproved: normalizeList(approvedRes),
        historyRejected: normalizeList(rejectedRes),
      });
    } catch {
      // El historial es secundario; no bloquea el panel principal.
    }
  },

  selectModeration: async (moderation) => {
    set({ selectedModeration: moderation });
    await get().enrichWithFileDetails(moderation);
  },

  refreshAll: async () => {
    const { pagination } = get();
    await Promise.all([
      get().fetchModerations({
        force: true,
        page: pagination.currentPage,
      }),
      get().fetchHistory({ force: true }),
    ]);
  },

  approveModeration: async (id) => {
    set({ actionLoading: true, error: null });

    try {
      await approveModerationRequest(id);
      set({ actionLoading: false, selectedModeration: null });
      await get().refreshAll();
      return { success: true };
    } catch (err) {
      const message = parseApiError(err, 'Error al aprobar el documento');

      set({ actionLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  rejectModeration: async (id, reason) => {
    if (!reason?.trim()) {
      const message = 'La razón del rechazo es requerida';
      set({ error: message });
      return { success: false, error: message };
    }

    set({ actionLoading: true, error: null });

    try {
      await rejectModerationRequest(id, reason.trim());
      set({ actionLoading: false, selectedModeration: null });
      await get().refreshAll();
      return { success: true };
    } catch (err) {
      const message = parseApiError(err, 'Error al rechazar el documento');

      set({ actionLoading: false, error: message });
      return { success: false, error: message };
    }
  },
}));
