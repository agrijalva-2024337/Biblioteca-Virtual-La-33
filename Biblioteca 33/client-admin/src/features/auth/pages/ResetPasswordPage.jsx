import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { resetPassword } from '../../../shared/api/auth.js';
import { AppBackground } from '../../../shared/components/ui/AppBackground.jsx';
import { LogoBrand } from '../../../shared/components/ui/Logo.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

const PASSWORD_MIN = 8;

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
  };

  const validate = () => {
    const next = {};
    if (!token) {
      next.token = 'El enlace de recuperación no es válido o está incompleto.';
    }
    if (!form.password) {
      next.password = 'La contraseña es obligatoria';
    } else if (form.password.length < PASSWORD_MIN) {
      next.password = `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`;
    }
    if (!form.confirm) {
      next.confirm = 'Confirma tu nueva contraseña';
    } else if (form.password !== form.confirm) {
      next.confirm = 'Las contraseñas no coinciden';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError(null);
    try {
      const data = await resetPassword(token, form.password);
      showSuccess(data?.message || 'Contraseña actualizada. Ya puedes iniciar sesión.');
      navigate('/login', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'No se pudo restablecer la contraseña. El enlace puede haber expirado.';
      setSubmitError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AppBackground
        className="flex min-h-full items-center justify-center px-4 py-10"
        overlay="auth"
        grain
      >
        <div className="animate-auth-card relative z-10 flex w-full max-w-[440px] flex-col items-center">
          <LogoBrand className="mb-8" size="xl" />
          <div className="auth-panel w-full space-y-5 rounded-2xl bg-[var(--bg-card)]/92 px-8 py-8 text-center backdrop-blur-md sm:px-10">
            <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--text-h)]">
              Restablecer contraseña
            </h1>
            <p className="text-sm text-[var(--danger)]">
              Falta el token en el enlace. Solicita un nuevo correo de recuperación.
            </p>
            <Link to="/login">
              <Button type="button" className="w-full">
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground
      className="flex min-h-full items-center justify-center px-4 py-10"
      overlay="auth"
      grain
    >
      <div className="animate-auth-card relative z-10 flex w-full max-w-[440px] flex-col items-center">
        <LogoBrand className="mb-8" size="xl" />

        <div className="auth-panel w-full rounded-2xl bg-[var(--bg-card)]/92 px-8 py-8 backdrop-blur-md sm:px-10">
          <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-2xl text-[var(--text-h)]">
            Nueva contraseña
          </h1>
          <p className="mb-6 text-center text-sm text-[var(--text-muted)]">
            Elige una contraseña segura de al menos {PASSWORD_MIN} caracteres.
          </p>

          <form onSubmit={onSubmit} className="space-y-3.5" noValidate>
            <div className="auth-float-field">
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                autoComplete="new-password"
                className="auth-float-field__input"
                aria-invalid={Boolean(fieldErrors.password)}
              />
              <label htmlFor="password" className="auth-float-field__label">
                Nueva contraseña
              </label>
              <LockClosedIcon className="auth-float-field__icon" aria-hidden="true" />
            </div>
            {fieldErrors.password ? (
              <p className="text-sm text-[var(--danger)]">{fieldErrors.password}</p>
            ) : null}

            <div className="auth-float-field">
              <input
                type="password"
                id="confirm"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder=" "
                autoComplete="new-password"
                className="auth-float-field__input"
                aria-invalid={Boolean(fieldErrors.confirm)}
              />
              <label htmlFor="confirm" className="auth-float-field__label">
                Confirmar contraseña
              </label>
              <LockClosedIcon className="auth-float-field__icon" aria-hidden="true" />
            </div>
            {fieldErrors.confirm ? (
              <p className="text-sm text-[var(--danger)]">{fieldErrors.confirm}</p>
            ) : null}

            {submitError ? (
              <p className="text-center text-sm text-[var(--danger)]">{submitError}</p>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </Button>
          </form>
        </div>

        <Link
          to="/login"
          className="mt-6 text-sm text-[var(--accent)] transition hover:text-[var(--accent-bright)] hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </AppBackground>
  );
};
