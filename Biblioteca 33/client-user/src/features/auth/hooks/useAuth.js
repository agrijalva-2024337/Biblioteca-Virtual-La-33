// client-user/src/features/auth/hooks/useAuth.js
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import {
  authClient,
  loginRequest,
  registerRequest,
  resendVerificationRequest,
} from '../../../shared/api/authClient.js';
import { useAuthStore } from '../../../shared/store/authStore.js';

const ALLOWED_ROLES = new Set(['USER_ROLE']);

const getErrorMessage = (err, fallback) => {
  if (!err?.response && (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error')) {
    return 'Sin conexión al servidor. Comprueba que auth-service esté activo y que .env use la IP de tu PC (192.168.x.x), no localhost, si usas dispositivo físico.';
  }
  return (
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    err?.message ||
    fallback
  );
};

const isEmailNotVerifiedError = (err) => {
  const code = err?.response?.data?.errorCode;
  const message = String(err?.response?.data?.message || '').toLowerCase();
  return (
    code === 'EMAIL_NOT_VERIFIED' ||
    message.includes('verificar tu correo') ||
    message.includes('verifica tu correo')
  );
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const storeLogin = useAuthStore((s) => s.login);
  const storeLogout = useAuthStore((s) => s.logout);

  const handleLogin = useCallback(
    async ({ emailOrUsername, password, captchaToken }) => {
      setLoading(true);
      setError(null);

      try {
        const data = await loginRequest({ emailOrUsername, password, captchaToken });
        const token = data?.token;
        const userDetails = data?.userDetails;
        const role = userDetails?.role;

        if (role === 'ADMIN_ROLE') {
          const message = 'Esta app es para estudiantes';
          setError(message);
          return { success: false, error: message };
        }

        if (role === 'TEACHER_ROLE') {
          const message = 'Los docentes deben usar el panel web';
          setError(message);
          return { success: false, error: message };
        }

        if (!ALLOWED_ROLES.has(role)) {
          const message = 'Rol no permitido en la app móvil';
          setError(message);
          return { success: false, error: message };
        }

        if (!token || !userDetails) {
          const message = 'Respuesta de inicio de sesión inválida';
          setError(message);
          return { success: false, error: message };
        }

        storeLogin(token, userDetails);
        return { success: true };
      } catch (err) {
        const message = getErrorMessage(err, 'Error al iniciar sesión');
        setError(message);
        return {
          success: false,
          error: message,
          emailNotVerified: isEmailNotVerifiedError(err),
        };
      } finally {
        setLoading(false);
      }
    },
    [storeLogin]
  );

  const handleRegister = useCallback(async (values) => {
    setLoading(true);
    setError(null);

    try {
      // FormData global en React Native
      // eslint-disable-next-line no-undef
      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('surname', values.surname.trim());
      formData.append('username', values.username.trim());
      formData.append('email', values.email.trim().toLowerCase());
      formData.append('password', values.password);
      formData.append('phone', values.phone.replace(/\D/g, ''));
      formData.append('grade', (values.grade || '').trim());
      formData.append('captchaToken', values.captchaToken || '');

      const data = await registerRequest(formData);

      return {
        success: true,
        emailVerificationRequired: data?.emailVerificationRequired !== false,
        message:
          data?.message ||
          'Usuario registrado. Revisa tu correo para activar la cuenta.',
        email: values.email.trim().toLowerCase(),
      };
    } catch (err) {
      const message = getErrorMessage(err, 'Error al registrar la cuenta');
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResendVerification = useCallback(async (email) => {
    const trimmed = (email || '').trim().toLowerCase();
    if (!trimmed) {
      const message = 'Ingresa el correo para reenviar la verificación';
      setError(message);
      return { success: false, error: message };
    }

    setLoading(true);
    setError(null);

    try {
      const data = await resendVerificationRequest(trimmed);
      Alert.alert(
        'Correo reenviado',
        data?.message || 'Si el correo existe y no está verificado, enviamos un nuevo enlace.'
      );
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err, 'No se pudo reenviar el correo de verificación');
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleForgotPassword = useCallback(async (email, captchaToken = '') => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await authClient.post('/Auth/forgot-password', {
        email: email.trim().toLowerCase(),
        captchaToken: captchaToken || '',
      });

      Alert.alert(
        'Correo enviado',
        data?.message ||
          'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.'
      );

      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err, 'No se pudo enviar el correo de recuperación');
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    storeLogout();
    setError(null);
  }, [storeLogout]);

  return {
    handleLogin,
    handleRegister,
    handleResendVerification,
    handleForgotPassword,
    loading,
    error,
    logout,
  };
};
