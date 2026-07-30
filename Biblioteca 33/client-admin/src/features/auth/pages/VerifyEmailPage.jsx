import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../../../shared/api/auth.js';
import { AppBackground } from '../../../shared/components/ui/AppBackground.jsx';
import { LogoBrand } from '../../../shared/components/ui/Logo.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Spinner } from '../components/Spinner.jsx';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState(() => (token ? 'loading' : 'missing'));
  const [message, setMessage] = useState(
    token ? 'Verificando tu correo...' : 'Falta el token de verificación en el enlace.'
  );

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const data = await verifyEmail(token);
        if (cancelled) return;
        setStatus('success');
        setMessage(data?.message || 'Correo verificado correctamente. Ya puedes iniciar sesión.');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(
          err.response?.data?.message ||
            'No se pudo verificar el correo. El enlace puede haber expirado.'
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

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
            Verificar correo
          </h1>

          {status === 'loading' ? <Spinner /> : null}

          <p
            className={`text-sm leading-relaxed ${
              status === 'error' || status === 'missing'
                ? 'text-[var(--danger)]'
                : status === 'success'
                  ? 'text-[var(--success)]'
                  : 'text-[var(--text-muted)]'
            }`}
          >
            {message}
          </p>

          <Link to="/login">
            <Button type="button" className="w-full">
              Ir a iniciar sesión
            </Button>
          </Link>
        </div>

        <Link
          to="/"
          className="mt-6 text-sm text-[var(--accent)] transition hover:text-[var(--accent-bright)] hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    </AppBackground>
  );
};
