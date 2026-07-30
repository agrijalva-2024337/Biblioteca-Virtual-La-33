import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPassword } from '../components/ForgotPassword.jsx';
import { AppBackground } from '../../../shared/components/ui/AppBackground.jsx';
import { LogoBrand } from '../../../shared/components/ui/Logo.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';

/**
 * @param {'login' | 'register' | 'forgot'} [initialView]
 */
export const AuthPage = ({ initialView = 'login' }) => {
  const navigate = useNavigate();
  const [view, setView] = useState(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  return (
    <AppBackground
      className="flex min-h-full items-center justify-center px-4 py-10"
      overlay="auth"
      grain
    >
      <div className="animate-auth-card relative z-10 flex w-full max-w-[440px] flex-col items-center">
        <LogoBrand className="mb-8" size="xl" />

        <div className="auth-panel w-full rounded-2xl bg-[var(--bg-card)]/92 px-8 py-8 backdrop-blur-md sm:px-10">
          {view === 'login' && (
            <LoginForm
              onForgot={() => setView('forgot')}
              onRegister={() => navigate('/register')}
            />
          )}

          {view === 'forgot' && <ForgotPassword onSwitch={() => setView('login')} />}

          {view === 'register' && (
            <div className="space-y-5 text-center">
              <p className="text-sm leading-relaxed text-[var(--text)]">
                El registro público crea cuentas de estudiante. Los administradores y docentes
                deben ser asignados por un administrador.
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Si eres estudiante, regístrate desde la app móvil. Si ya tienes cuenta de panel,
                inicia sesión aquí.
              </p>
              <Button type="button" className="w-full" onClick={() => navigate('/login')}>
                Ir a iniciar sesión
              </Button>
            </div>
          )}
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
