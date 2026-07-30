import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal.jsx';
import { Input } from '../../../shared/components/ui/Input.jsx';
import { Select } from '../../../shared/components/ui/Select.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { useStudentsStore } from '../store/useStudentsStore.js';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

const ROLE_OPTIONS = [
  { value: 'USER_ROLE', label: 'Estudiante' },
  { value: 'TEACHER_ROLE', label: 'Docente' },
  { value: 'ADMIN_ROLE', label: 'Administrador' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{8}$/;

const emptyForm = {
  name: '',
  surname: '',
  username: '',
  email: '',
  password: '',
  phone: '',
  roleName: 'USER_ROLE',
};

const getUserId = (user) => user?.id || user?.Id;

export const UserFormModal = ({ isOpen, onClose, user = null, onSuccess }) => {
  const isEdit = Boolean(user);
  const createUser = useStudentsStore((s) => s.createUser);
  const updateUserDetails = useStudentsStore((s) => s.updateUserDetails);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (user) {
      setForm({
        name: user.name || '',
        surname: user.surname || '',
        username: user.username || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        roleName: user.role || 'USER_ROLE',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) next.name = 'El nombre es obligatorio';
    if (!form.surname.trim()) next.surname = 'El apellido es obligatorio';

    if (!form.email.trim()) {
      next.email = 'El correo es obligatorio';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      next.email = 'El correo no es válido';
    }

    if (!form.phone.trim()) {
      next.phone = 'El teléfono es obligatorio';
    } else if (!PHONE_REGEX.test(form.phone.trim())) {
      next.phone = 'El teléfono debe tener exactamente 8 dígitos';
    }

    if (!isEdit) {
      if (!form.username.trim()) next.username = 'El usuario es obligatorio';
      if (!form.password) {
        next.password = 'La contraseña es obligatoria';
      } else if (form.password.length < 8) {
        next.password = 'La contraseña debe tener al menos 8 caracteres';
      }
      if (!form.roleName) next.roleName = 'Selecciona un rol';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      if (isEdit) {
        const userId = getUserId(user);
        const result = await updateUserDetails(userId, {
          name: form.name.trim(),
          surname: form.surname.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
        });

        if (result.success) {
          showSuccess('Usuario actualizado correctamente');
          onSuccess?.();
          onClose();
        } else {
          showError(result.error || 'No se pudo actualizar el usuario');
        }
      } else {
        const result = await createUser({
          name: form.name.trim(),
          surname: form.surname.trim(),
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim(),
          roleName: form.roleName,
        });

        if (result.success) {
          showSuccess('Usuario creado correctamente');
          onSuccess?.();
          onClose();
        } else {
          showError(result.error || 'No se pudo crear el usuario');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      subtitle={
        isEdit
          ? 'Actualiza los datos del usuario seleccionado'
          : 'Crea una cuenta de estudiante, docente o administrador'
      }
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          <Input
            label="Apellido"
            name="surname"
            value={form.surname}
            onChange={handleChange}
            error={errors.surname}
            required
          />
        </div>

        {!isEdit && (
          <Input
            label="Nombre de usuario"
            name="username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
            required
          />
        )}

        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Teléfono"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="8 dígitos"
          maxLength={8}
          required
        />

        {!isEdit && (
          <>
            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <Select
              label="Rol"
              name="roleName"
              value={form.roleName}
              onChange={handleChange}
              error={errors.roleName}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
