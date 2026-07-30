import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore.js';
import { showSuccess } from '../../../shared/utils/toast.js';
import { getDefaultRouteForRole } from '../../../shared/utils/roles.js';
import { Button } from '../../../shared/components/ui/Button.jsx';
import {
  RecaptchaCheckbox,
  isRecaptchaConfigured,
  isRecaptchaBlockingSubmit,
} from '../../../shared/components/ui/RecaptchaCheckbox.jsx';

const EMAIL_OR_USER_MIN = 3;
const PASSWORD_MIN = 8;

export const LoginForm = ({ onForgot, onRegister }) => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState('');
  const [shake, setShake] = useState(false);
  const [captchaError, setCaptchaError] = useState(null);

  useEffect(() => {
    if (!error) return undefined;
    setShake(true);
    const timer = window.setTimeout(() => setShake(false), 400);
    return () => window.clearTimeout(timer);
  }, [error]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validate = () => {
    const next = {};
    const identity = form.emailOrUsername.trim();
    if (!identity) {
      next.emailOrUsername = 'El correo o usuario es obligatorio';
    } else if (identity.length < EMAIL_OR_USER_MIN) {
      next.emailOrUsername = `Ingresa al menos ${EMAIL_OR_USER_MIN} caracteres`;
    }
    if (!form.password) {
      next.password = 'La contraseña es obligatoria';
    } else if (form.password.length < PASSWORD_MIN) {
      next.password = `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`;
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setCaptchaError(null);

    if (!validate()) {
      setShake(true);
      window.setTimeout(() => setShake(false), 400);
      return;
    }

    if (isRecaptchaBlockingSubmit()) {
      setCaptchaError('La verificación de seguridad no está disponible. Intenta más tarde.');
      return;
    }

    if (isRecaptchaConfigured() && !captchaToken) {
      setCaptchaError('Completa la verificación CAPTCHA');
      return;
    }

    const res = await login({
      emailOrUsername: form.emailOrUsername.trim(),
      password: form.password,
      captchaToken,
    });
    if (res.success) {
      const destination = getDefaultRouteForRole(res.role);
      const welcome =
        res.role === 'TEACHER_ROLE'
          ? 'Bienvenido — Panel docente'
          : 'Bienvenido — Panel de administración';
      showSuccess(welcome);
      navigate(destination, { replace: true });
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-3.5 ${shake ? 'animate-form-shake' : ''}`}
      noValidate
    >
      <div className="auth-float-field">
        <input
          type="text"
          id="emailOrUsername"
          name="emailOrUsername"
          value={form.emailOrUsername}
          onChange={handleChange}
          placeholder=" "
          autoComplete="username"
          className="auth-float-field__input"
          aria-invalid={Boolean(fieldErrors.emailOrUsername)}
        />
        <label htmlFor="emailOrUsername" className="auth-float-field__label">
          Correo Institucional
        </label>
        <UserIcon className="auth-float-field__icon" aria-hidden="true" />
      </div>
      {fieldErrors.emailOrUsername ? (
        <p className="text-sm text-[var(--danger)]">{fieldErrors.emailOrUsername}</p>
      ) : null}

      <div className="auth-float-field">
        <input
          type="password"
          id="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder=" "
          autoComplete="current-password"
          className="auth-float-field__input"
          aria-invalid={Boolean(fieldErrors.password)}
        />
        <label htmlFor="password" className="auth-float-field__label">
          Contraseña
        </label>
        <LockClosedIcon className="auth-float-field__icon" aria-hidden="true" />
      </div>
      {fieldErrors.password ? (
        <p className="text-sm text-[var(--danger)]">{fieldErrors.password}</p>
      ) : null}

      {error && <p className="text-[var(--danger)] text-sm text-center">{error}</p>}

      <RecaptchaCheckbox onChange={setCaptchaToken} />
      {captchaError ? (
        <p className="text-center text-sm text-[var(--danger)]">{captchaError}</p>
      ) : null}

      {onForgot && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgot}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Olvidé mi contraseña
          </button>
        </div>
      )}

      <Button type="submit" disabled={loading || isRecaptchaBlockingSubmit()} className="w-full">
        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
      </Button>

      {onRegister && (
        <p className="text-center text-sm text-[var(--text-muted)]">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            onClick={onRegister}
            className="text-[var(--accent)] font-medium hover:underline"
          >
            Regístrate
          </button>
        </p>
      )}
    </form>
  );
};
