import { useState } from 'react';
import { forgotPassword } from '../../../shared/api/auth';
import { showSuccess, showError } from '../../../shared/utils/toast.js';
import { Button } from '../../../shared/components/ui/Button.jsx';
import {
  RecaptchaCheckbox,
  isRecaptchaConfigured,
  isRecaptchaBlockingSubmit,
} from '../../../shared/components/ui/RecaptchaCheckbox.jsx';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ForgotPassword = ({ onSwitch }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState(null);

  const validate = () => {
    const value = email.trim();
    if (!value) {
      setFieldError('El correo es obligatorio');
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      setFieldError('Ingresa un correo válido');
      return false;
    }
    setFieldError(null);
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setCaptchaError(null);

    if (!validate()) return;

    if (isRecaptchaBlockingSubmit()) {
      setCaptchaError('La verificación de seguridad no está disponible. Intenta más tarde.');
      return;
    }

    if (isRecaptchaConfigured() && !captchaToken) {
      setCaptchaError('Completa la verificación CAPTCHA');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase(), captchaToken);
      showSuccess(res?.message || 'Si el correo existe, enviamos un enlace de recuperación.');
    } catch (err) {
      showError(err.response?.data?.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="auth-float-field auth-float-field--no-icon">
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldError(null);
          }}
          placeholder=" "
          autoComplete="email"
          className="auth-float-field__input"
          aria-invalid={Boolean(fieldError)}
        />
        <label htmlFor="email" className="auth-float-field__label">
          Correo institucional
        </label>
      </div>
      {fieldError ? <p className="text-sm text-[var(--danger)]">{fieldError}</p> : null}

      <RecaptchaCheckbox onChange={setCaptchaToken} />
      {captchaError ? (
        <p className="text-center text-sm text-[var(--danger)]">{captchaError}</p>
      ) : null}

      <Button type="submit" disabled={loading || isRecaptchaBlockingSubmit()} className="w-full">
        {loading ? 'Enviando...' : 'Recuperar Contraseña'}
      </Button>

      <p className="text-center text-sm text-[var(--text-muted)]">
        ¿Recordaste tu contraseña?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[var(--accent)] font-medium hover:underline"
        >
          Iniciar Sesión
        </button>
      </p>
    </form>
  );
};
