import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useModerationStore } from '../store/useModerationStore.js';
import { Card } from '../../../shared/components/ui/Card.jsx';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { ErrorBanner } from '../../../shared/components/ui/ErrorBanner.jsx';
import { formatDate, formatFileSize, getPreviewKind } from '../../../shared/utils/formatter.js';
import { truncateUserId } from '../../../shared/utils/uploaderResolver.js';
import { showError } from '../../../shared/utils/toast.js';
import { AiAnalysisSection } from './AiAnalysisSection.jsx';
import {
  STATUS_LABELS,
  getDisplayName,
  getFileUrl,
} from '../utils/moderationHelpers.js';

const ApprovedSuccessCard = ({ item, onViewLibrary, onBack }) => (
  <Card className="border border-[var(--success)] bg-[var(--success-bg)]">
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success)]/20">
        <CheckCircleIcon className="h-12 w-12 text-[var(--success)]" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-h)]">
        Documento aceptado con éxito
      </h2>
      <p className="mt-3 max-w-md text-sm text-[var(--text-muted)] break-words">
        {getDisplayName(item)}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="success" onClick={onViewLibrary}>
          Ver en la Biblioteca
        </Button>
        <Button type="button" variant="secondary" onClick={onBack}>
          Volver al panel
        </Button>
      </div>
    </div>
  </Card>
);

const HistoryCard = ({ moderation, variant, onViewDetails }) => {
  const label = variant === 'APPROVED' ? 'Aprobado' : 'Rechazado';
  const name = getDisplayName(moderation);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {variant === 'APPROVED' ? (
            <CheckCircleIcon className="h-6 w-6 shrink-0 text-[var(--success)]" />
          ) : (
            <XCircleIcon className="h-6 w-6 shrink-0 text-[var(--danger)]" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-h)] truncate">
              {label}: {name}
            </p>
            {variant === 'REJECTED' && moderation?.reason && (
              <p className="text-xs text-[var(--text-muted)] truncate">
                {moderation.reason}
              </p>
            )}
          </div>
        </div>
        <Badge status={variant}>{label}</Badge>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full text-sm"
        onClick={() => onViewDetails(moderation)}
      >
        Ver detalles
      </Button>
    </Card>
  );
};

const DocumentPreview = ({ moderation, fileUrl }) => {
  const previewKind = getPreviewKind(
    fileUrl,
    moderation?.originalName,
    moderation?.mimeType
  );
  const displayName = getDisplayName(moderation);

  const openInNewTab = () => {
    if (!fileUrl) {
      showError('URL del archivo no disponible');
      return;
    }
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  if (!fileUrl) {
    return (
      <p className="mt-6 text-sm text-[var(--text-muted)]">Sin URL de archivo para vista previa</p>
    );
  }

  if (previewKind === 'pdf') {
    return (
      <div className="mt-6 w-full space-y-3 text-left">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-alt)] shadow-inner">
          <iframe
            src={fileUrl}
            title={`Vista previa: ${displayName}`}
            className="min-h-[400px] w-full bg-white"
          />
        </div>
        <button
          type="button"
          onClick={openInNewTab}
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Abrir en pestaña nueva
        </button>
      </div>
    );
  }

  if (previewKind === 'image') {
    return (
      <div className="mt-6 w-full space-y-3">
        <div className="flex max-h-[480px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-alt)] p-3">
          <img
            src={fileUrl}
            alt={displayName}
            className="max-h-[460px] w-full object-contain"
          />
        </div>
        <button
          type="button"
          onClick={openInNewTab}
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Abrir en pestaña nueva
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-alt)] px-4 py-8 text-center">
      <p className="text-sm text-[var(--text-muted)]">Vista previa no disponible</p>
      <Button type="button" variant="secondary" className="mt-4" onClick={openInNewTab}>
        Abrir / descargar archivo
      </Button>
    </div>
  );
};

export const ModerationPanel = () => {
  const user = useAuthStore((s) => s.user);
  const mainPanelRef = useRef(null);

  const moderations = useModerationStore((s) => s.moderations);
  const selectedModeration = useModerationStore((s) => s.selectedModeration);
  const historyApproved = useModerationStore((s) => s.historyApproved);
  const historyRejected = useModerationStore((s) => s.historyRejected);
  const loading = useModerationStore((s) => s.loading);
  const actionLoading = useModerationStore((s) => s.actionLoading);
  const error = useModerationStore((s) => s.error);
  const pagination = useModerationStore((s) => s.pagination);

  const fetchModerations = useModerationStore((s) => s.fetchModerations);
  const setPage = useModerationStore((s) => s.setPage);
  const fetchHistory = useModerationStore((s) => s.fetchHistory);
  const selectModeration = useModerationStore((s) => s.selectModeration);
  const approveModeration = useModerationStore((s) => s.approveModeration);
  const rejectModeration = useModerationStore((s) => s.rejectModeration);

  const [comment, setComment] = useState('');
  const [lastApproved, setLastApproved] = useState(null);
  const [highlightMainPanel, setHighlightMainPanel] = useState(false);

  useEffect(() => {
    fetchModerations({ force: true });
    fetchHistory({ force: true });
  }, [fetchModerations, fetchHistory]);

  useEffect(() => {
    setComment('');
  }, [selectedModeration?._id]);

  const selectedIndex = useMemo(
    () => moderations.findIndex((m) => m._id === selectedModeration?._id),
    [moderations, selectedModeration?._id]
  );

  const isPendingSelection = selectedModeration?.status === 'PENDING';

  const recentHistory = useMemo(() => {
    const items = [
      ...historyApproved.map((m) => ({ ...m, _historyStatus: 'APPROVED' })),
      ...historyRejected.map((m) => ({ ...m, _historyStatus: 'REJECTED' })),
    ];

    return items
      .sort((a, b) => new Date(b.reviewedAt || b.updatedAt) - new Date(a.reviewedAt || a.updatedAt))
      .slice(0, 6);
  }, [historyApproved, historyRejected]);

  const handlePrev = () => {
    if (selectedIndex > 0) selectModeration(moderations[selectedIndex - 1]);
  };

  const handleNext = () => {
    if (selectedIndex < moderations.length - 1) {
      selectModeration(moderations[selectedIndex + 1]);
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) setPage(pagination.currentPage - 1);
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPage(pagination.currentPage + 1);
    }
  };

  const handleApprove = async () => {
    if (!selectedModeration?._id) return;

    const snapshot = {
      title: selectedModeration.title,
      originalName: selectedModeration.originalName,
      fileURL: getFileUrl(selectedModeration),
    };

    const res = await approveModeration(selectedModeration._id);
    if (res.success) {
      setLastApproved(snapshot);
      setComment('');
    } else {
      showError(res.error || 'No se pudo aprobar el documento');
    }
  };

  const handleReject = async () => {
    if (!selectedModeration?._id) return;

    if (!comment.trim()) {
      showError('Debes indicar una razón para rechazar el documento');
      return;
    }

    const res = await rejectModeration(selectedModeration._id, comment);
    if (res.success) {
      setComment('');
    } else {
      showError(res.error || 'No se pudo rechazar el documento');
    }
  };

  const handleViewInLibrary = () => {
    const url = getFileUrl(lastApproved);
    if (!url) {
      showError('URL del archivo no disponible');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBackToPanel = async () => {
    setLastApproved(null);
    await fetchModerations({ force: true });
    await fetchHistory({ force: true });
  };

  const handleViewHistoryDetails = async (item) => {
    setLastApproved(null);
    await selectModeration(item);
    setHighlightMainPanel(true);
    mainPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => setHighlightMainPanel(false), 2500);
  };

  const displayName = getDisplayName(selectedModeration);
  const fileUrl = getFileUrl(selectedModeration);
  const fileSize = formatFileSize(selectedModeration?.sizeBytes);
  const uploadedAt = formatDate(
    selectedModeration?.createdAt || selectedModeration?.fileCreatedAt
  );

  const showMainPanel =
    !lastApproved && (moderations.length > 0 || Boolean(selectedModeration));

  return (
    <div className="animate-fadeIn space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-h)]">
            Panel de Moderación de Documentos
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Revisa y aprueba materiales enviados por estudiantes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-[#2a1c0f] font-semibold">
            {user?.username?.[0]?.toUpperCase() || 'M'}
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Moderador</p>
            <p className="font-semibold text-[var(--text-h)]">
              {user?.username || user?.name || 'Administrador'}
            </p>
          </div>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {lastApproved && (
        <ApprovedSuccessCard
          item={lastApproved}
          onViewLibrary={handleViewInLibrary}
          onBack={handleBackToPanel}
        />
      )}

      {!lastApproved && loading && moderations.length === 0 && !selectedModeration ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
        </div>
      ) : !lastApproved && moderations.length === 0 && !selectedModeration ? (
        <Card>
          <p className="text-center text-[var(--text-muted)] py-8">
            No hay documentos pendientes de moderación.
          </p>
        </Card>
      ) : showMainPanel ? (
        <div
          ref={mainPanelRef}
          id="moderation-main-panel"
          className={`space-y-6 rounded-2xl transition-all duration-500 ${
            highlightMainPanel
              ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]'
              : ''
          }`}
        >
          {isPendingSelection && moderations.length > 1 && selectedIndex >= 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--text-muted)]">
                Documento {selectedIndex + 1} de {moderations.length} en esta página
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="!px-3 !py-2"
                  onClick={handlePrev}
                  disabled={selectedIndex <= 0}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="!px-3 !py-2"
                  onClick={handleNext}
                  disabled={selectedIndex >= moderations.length - 1}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {!isPendingSelection && selectedModeration && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[var(--text-muted)]">
                Detalle de moderación — {STATUS_LABELS[selectedModeration.status] || selectedModeration.status}
              </p>
              <Badge status={selectedModeration.status}>
                {STATUS_LABELS[selectedModeration.status] || selectedModeration.status}
              </Badge>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Panel izquierdo: documento */}
            <Card className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[rgba(232,132,43,0.15)] text-[var(--accent)]">
                <DocumentTextIcon className="h-12 w-12" />
              </div>

              <h2 className="text-lg font-semibold text-[var(--text-h)] break-all">
                {displayName}
              </h2>

              <div className="mt-4 w-full space-y-2 text-sm text-[var(--text-muted)]">
                {selectedModeration?.uploadedBy && (
                  <p>
                    Subido por:{' '}
                    <span className="text-[var(--text-h)]">
                      {selectedModeration.uploaderDisplayName ||
                        truncateUserId(selectedModeration.uploadedBy)}
                    </span>
                  </p>
                )}
                {uploadedAt && (
                  <p>
                    Fecha:{' '}
                    <span className="text-[var(--text-h)]">{uploadedAt}</span>
                  </p>
                )}
                {fileSize && (
                  <p>
                    Tamaño:{' '}
                    <span className="text-[var(--text-h)]">{fileSize}</span>
                  </p>
                )}
                {selectedModeration?.reviewedAt && (
                  <p>
                    Revisado:{' '}
                    <span className="text-[var(--text-h)]">
                      {formatDate(selectedModeration.reviewedAt)}
                    </span>
                  </p>
                )}
              </div>

              <DocumentPreview moderation={selectedModeration} fileUrl={fileUrl} />
            </Card>

            {/* Panel derecho: detalles y acciones */}
            <div className="space-y-5">
              <Card>
                <h3 className="mb-4 text-lg font-semibold text-[var(--text-h)]">
                  Detalles del Documento Subido
                </h3>

                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Título del Material
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedModeration?.title || ''}
                  placeholder="Sin título"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm text-[var(--text-h)] outline-none"
                />
              </Card>

              <AiAnalysisSection moderation={selectedModeration} />

              {isPendingSelection ? (
                <Card>
                  <h3 className="mb-4 text-lg font-semibold text-[var(--text-h)]">
                    Acciones de Moderación
                  </h3>

                  <label className="block text-sm text-[var(--text-muted)] mb-2">
                    Comentarios (requerido si se rechaza)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Agregar comentarios (requerido si se rechaza)"
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm text-[var(--text-h)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 placeholder:text-[var(--text-muted)] resize-none"
                  />

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="success"
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      Aprobar Documento
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      <XCircleIcon className="h-5 w-5" />
                      Rechazar Documento
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card>
                  <h3 className="mb-4 text-lg font-semibold text-[var(--text-h)]">
                    Resultado de la moderación
                  </h3>
                  <Badge status={selectedModeration?.status}>
                    {STATUS_LABELS[selectedModeration?.status] || selectedModeration?.status}
                  </Badge>
                  {selectedModeration?.status === 'REJECTED' && selectedModeration?.reason && (
                    <p className="mt-4 text-sm text-[var(--text-muted)]">
                      <span className="font-medium text-[var(--text-h)]">Razón: </span>
                      {selectedModeration.reason}
                    </p>
                  )}
                </Card>
              )}
            </div>
          </div>

          {isPendingSelection && moderations.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4 sm:flex-row">
              <p className="text-sm text-[var(--text-muted)]">
                Página {pagination.currentPage} de {pagination.totalPages}
                {pagination.totalRecords > 0 && (
                  <span className="ml-1 text-[var(--text-h)]">
                    ({pagination.totalRecords} pendiente
                    {pagination.totalRecords === 1 ? '' : 's'})
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage <= 1 || loading}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleNextPage}
                  disabled={
                    pagination.currentPage >= pagination.totalPages || loading
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Historial reciente */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-[var(--text-h)] border-b border-[var(--accent)] pb-2 inline-block">
          Historial de Moderación Reciente
        </h2>

        {recentHistory.length === 0 ? (
          <Card>
            <p className="text-sm text-[var(--text-muted)]">
              Aún no hay moderaciones recientes.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentHistory.map((item) => (
              <HistoryCard
                key={item._id}
                moderation={item}
                variant={item._historyStatus}
                onViewDetails={handleViewHistoryDetails}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
