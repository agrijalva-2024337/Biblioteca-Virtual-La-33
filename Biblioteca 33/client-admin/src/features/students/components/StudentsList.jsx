import { useEffect, useState } from 'react';
import {
  ArrowPathIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  PlusIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useStudentsStore } from '../store/useStudentsStore.js';
import { UserFormModal } from './UserFormModal.jsx';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { PageHeader } from '../../../shared/components/ui/PageHeader.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Card } from '../../../shared/components/ui/Card.jsx';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { Select } from '../../../shared/components/ui/Select.jsx';
import { Modal } from '../../../shared/components/ui/Modal.jsx';
import { ErrorBanner } from '../../../shared/components/ui/ErrorBanner.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

const ROLE_OPTIONS = [
  { value: 'USER_ROLE', label: 'Estudiante' },
  { value: 'TEACHER_ROLE', label: 'Docente' },
  { value: 'ADMIN_ROLE', label: 'Administrador' },
];

const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS.map((o) => [o.value, o.label]));

const getFullName = (user) => {
  const parts = [user?.name, user?.surname].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : user?.username || 'Sin nombre';
};

const getStatusLabel = (status) => (status === false ? 'Inactivo' : 'Activo');

const getUserId = (user) => user?.id || user?.Id;

export const StudentsList = () => {
  const users = useStudentsStore((s) => s.users);
  const loading = useStudentsStore((s) => s.loading);
  const updatingUserId = useStudentsStore((s) => s.updatingUserId);
  const error = useStudentsStore((s) => s.error);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);
  const refreshStudents = useStudentsStore((s) => s.refreshStudents);
  const updateUserRole = useStudentsStore((s) => s.updateUserRole);
  const toggleUserStatus = useStudentsStore((s) => s.toggleUserStatus);

  const [selectReset, setSelectReset] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(() => {
    fetchStudents({ force: true });
  }, [fetchStudents]);

  const openCreateModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const closeConfirm = () => {
    if (confirmBusy) return;
    const pending = confirmDialog;
    setConfirmDialog(null);
    if (pending?.type === 'role' && pending.userId) {
      setSelectReset((prev) => ({
        ...prev,
        [pending.userId]: (prev[pending.userId] || 0) + 1,
      }));
    }
  };

  const handleRoleChange = (user, newRole) => {
    const userId = getUserId(user);
    const currentRole = user?.role;

    if (!userId || !newRole || newRole === currentRole) return;

    const roleLabel = ROLE_LABELS[newRole] || newRole;
    setConfirmDialog({
      type: 'role',
      userId,
      title: 'Cambiar rol',
      subtitle: getFullName(user),
      message: `Vas a asignar el rol de ${roleLabel} a esta cuenta. El cambio aplica de inmediato en el panel y en la app.`,
      confirmLabel: `Sí, hacer ${roleLabel.toLowerCase()}`,
      confirmVariant: 'primary',
      onConfirm: async () => {
        const result = await updateUserRole(userId, newRole);
        if (result.success) {
          showSuccess('Rol actualizado correctamente');
        } else {
          showError(result.error || 'No se pudo actualizar el rol');
          setSelectReset((prev) => ({
            ...prev,
            [userId]: (prev[userId] || 0) + 1,
          }));
        }
      },
    });
  };

  const handleToggleStatus = (user) => {
    const userId = getUserId(user);
    const isActive = user.status !== false;

    setConfirmDialog({
      type: 'status',
      userId,
      title: isActive ? 'Desactivar cuenta' : 'Activar cuenta',
      subtitle: getFullName(user),
      message: isActive
        ? 'La cuenta dejará de poder iniciar sesión hasta que la actives de nuevo.'
        : 'La cuenta volverá a poder iniciar sesión normalmente.',
      confirmLabel: isActive ? 'Sí, desactivar' : 'Sí, activar',
      confirmVariant: isActive ? 'danger' : 'success',
      onConfirm: async () => {
        const result = await toggleUserStatus(userId, !isActive);
        if (result.success) {
          showSuccess(isActive ? 'Usuario desactivado' : 'Usuario activado');
        } else {
          showError(result.error || 'No se pudo cambiar el estado');
        }
      },
    });
  };

  const runConfirm = async () => {
    if (!confirmDialog?.onConfirm || confirmBusy) return;
    setConfirmBusy(true);
    try {
      await confirmDialog.onConfirm();
      setConfirmDialog(null);
    } finally {
      setConfirmBusy(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de cuentas, roles y estado (solo administradores)"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={openCreateModal}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Nuevo usuario
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => refreshStudents()}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        }
      />

      <ErrorBanner message={error} />

      <Card className="mb-6 flex gap-3 border-[var(--accent)]/30 bg-[rgba(232,132,43,0.08)]">
        <InformationCircleIcon className="h-6 w-6 shrink-0 text-[var(--accent)]" />
        <p className="text-sm text-[var(--text-muted)]">
          Puedes crear cuentas de estudiante, docente o administrador, editar sus datos,
          cambiar roles y activar o desactivar usuarios. Los estudiantes también pueden
          registrarse desde la app móvil.
        </p>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => {
          const userId = getUserId(user);
          const isUpdating = updatingUserId === userId;
          const isActive = user.status !== false;

          return (
            <Card key={userId} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-[var(--text-h)]">
                      {getFullName(user)}
                    </h2>
                    <p className="truncate text-xs text-[var(--text-muted)]">@{user.username}</p>
                  </div>
                </div>
                <Badge variant={isActive ? 'success' : 'neutral'}>
                  {getStatusLabel(user.status)}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <EnvelopeIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{user.email || 'Sin correo'}</span>
              </div>

              <p className="text-xs text-[var(--text-muted)]">
                Rol actual:{' '}
                <span className="font-medium text-[var(--text-h)]">
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </p>

              <Select
                key={`${userId}-${user.role}-${selectReset[userId] || 0}`}
                label="Cambiar rol"
                defaultValue={user.role || 'USER_ROLE'}
                disabled={isUpdating}
                onChange={(e) => handleRoleChange(user, e.target.value)}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isUpdating}
                  onClick={() => openEditModal(user)}
                  className="flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant={isActive ? 'danger' : 'success'}
                  disabled={isUpdating}
                  onClick={() => handleToggleStatus(user)}
                  className="flex flex-1 items-center justify-center px-3 py-2 text-sm"
                >
                  {isActive ? 'Desactivar' : 'Activar'}
                </Button>
              </div>

              {isUpdating && (
                <p className="text-xs text-[var(--text-muted)]">Procesando...</p>
              )}
            </Card>
          );
        })}
      </div>

      {!loading && users.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-10 text-center">
          <p className="text-[var(--text-muted)]">No hay usuarios registrados</p>
          <button
            type="button"
            onClick={() => refreshStudents()}
            className="mt-4 text-sm text-[var(--accent)] underline"
          >
            Reintentar carga
          </button>
        </div>
      )}

      <UserFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        user={editingUser}
        onSuccess={() => refreshStudents()}
      />

      <Modal
        isOpen={Boolean(confirmDialog)}
        onClose={closeConfirm}
        title={confirmDialog?.title || 'Confirmar'}
        subtitle={confirmDialog?.subtitle}
        maxWidth="max-w-md"
      >
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          {confirmDialog?.message}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={confirmBusy}
            onClick={closeConfirm}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={confirmDialog?.confirmVariant || 'primary'}
            disabled={confirmBusy}
            onClick={runConfirm}
          >
            {confirmBusy ? 'Aplicando...' : confirmDialog?.confirmLabel || 'Confirmar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
