import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { getProfile, updateProfile } from '../../shared/api/auth';
import { useAuthStore } from '../auth/store/authStore.js';
import { Spinner } from '../auth/components/Spinner.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { Input } from '../../shared/components/ui/Input.jsx';
import { Card } from '../../shared/components/ui/Card.jsx';
import { Modal } from '../../shared/components/ui/Modal.jsx';
import { showError, showSuccess } from '../../shared/utils/toast.js';
import { getRoleLabel } from '../../shared/utils/roles.js';

const PHONE_REGEX = /^\d{8}$/;

const getFullName = (profile) => {
  const parts = [profile?.name, profile?.surname].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : profile?.username || '—';
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const storeUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', surname: '', phone: '' });
  const [formErrors, setFormErrors] = useState({});

  const loadProfile = async () => {
    try {
      setError(null);
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Error al cargar el perfil';
      setError(message);
      showError(message);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadProfile();
      setLoading(false);
    })();
  }, []);

  const openEdit = () => {
    const user = profile || storeUser;
    setForm({
      name: user?.name || '',
      surname: user?.surname || '',
      phone: user?.phone || '',
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'El nombre es obligatorio';
    if (!form.surname.trim()) next.surname = 'El apellido es obligatorio';
    if (!form.phone.trim()) {
      next.phone = 'El teléfono es obligatorio';
    } else if (!PHONE_REGEX.test(form.phone.trim())) {
      next.phone = 'El teléfono debe tener exactamente 8 dígitos';
    }
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const updated = await updateProfile({
        name: form.name.trim(),
        surname: form.surname.trim(),
        phone: form.phone.trim(),
      });
      setProfile(updated);
      setEditOpen(false);
      showSuccess('Perfil actualizado correctamente');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'No se pudo actualizar el perfil';
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const user = profile || storeUser;

  const rows = [
    { label: 'Nombre', value: user?.name || '—' },
    { label: 'Apellido', value: user?.surname || '—' },
    { label: 'Teléfono', value: user?.phone || '—' },
    { label: 'Correo', value: user?.email || '—' },
    { label: 'Rol', value: getRoleLabel(user?.role) },
  ];

  return (
    <div className="max-w-2xl">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-h)]">Mi perfil</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Información de tu cuenta institucional
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={openEdit}
          className="flex items-center gap-2"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Editar perfil
        </Button>
      </header>

      {error && !user && (
        <Card className="mb-6 border-[var(--danger)] text-[var(--danger)]">
          {error}
        </Card>
      )}

      <Card className="space-y-6">
        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)] text-xl font-bold text-[#2a1c0f]">
            {(user?.username || user?.name || 'M')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-h)]">{getFullName(user)}</p>
            <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
          </div>
        </div>

        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.label} className="border-b border-[var(--border)] pb-3 last:border-b-0">
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{row.label}</p>
              <p className="mt-1 text-sm font-medium text-[var(--text-h)] break-words">{row.value}</p>
            </li>
          ))}
        </ul>

        <Button
          type="button"
          variant="danger"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Cerrar sesión
        </Button>
      </Card>

      <Modal
        isOpen={editOpen}
        onClose={() => !submitting && setEditOpen(false)}
        title="Editar perfil"
        subtitle="Puedes actualizar tu nombre, apellido y teléfono"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleFormChange}
            error={formErrors.name}
            required
          />
          <Input
            label="Apellido"
            name="surname"
            value={form.surname}
            onChange={handleFormChange}
            error={formErrors.surname}
            required
          />
          <Input
            label="Teléfono"
            name="phone"
            value={form.phone}
            onChange={handleFormChange}
            error={formErrors.phone}
            placeholder="8 dígitos"
            maxLength={8}
            required
          />
          <p className="text-xs text-[var(--text-muted)]">
            El correo y el rol solo pueden ser modificados por un administrador.
          </p>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
