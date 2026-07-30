import { Link } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  UsersIcon,
  AcademicCapIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const QUICK_LINKS = [
  { to: '/admin/moderacion', title: 'Moderación', icon: ShieldCheckIcon },
  { to: '/admin/materiales', title: 'Materiales', icon: DocumentTextIcon },
  { to: '/admin/estudiantes', title: 'Usuarios', icon: UsersIcon },
  { to: '/admin/asignaturas', title: 'Asignaturas y Grados', icon: AcademicCapIcon },
  { to: '/admin/notificaciones', title: 'Notificaciones', icon: BellIcon },
  { to: '/admin/perfil', title: 'Perfil', icon: UserCircleIcon },
];

export const AdminDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const name = user?.username || user?.name || 'administrador';

  return (
    <div className="animate-fadeIn space-y-8">
      <section className="welcome-banner relative overflow-hidden border border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] px-6 py-8 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--accent-dark)] via-[var(--accent)]/85 to-[color-mix(in_srgb,var(--accent)_40%,#3a2414)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/75">
            Panel de administración
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            ¡Bienvenido de nuevo, {name}!
          </h1>
          <p className="mt-3 text-sm text-white/85 sm:text-base">
            Continúa con la moderación, los materiales y la gestión de usuarios de La 33.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-5 font-display text-xl font-semibold text-[var(--text-h)]">Navegación</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group aspect-square border border-[var(--border)] bg-[var(--bg-card)]/80 p-4 backdrop-blur-md transition hover:border-[var(--accent)] hover:bg-[rgba(232,132,43,0.12)]"
              >
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <Icon className="h-10 w-10 text-[var(--accent)] transition group-hover:scale-105 sm:h-12 sm:w-12" />
                  <span className="font-semibold leading-tight text-[var(--text-h)]">{item.title}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
