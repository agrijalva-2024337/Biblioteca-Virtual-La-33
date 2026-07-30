import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import {
  HomeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UsersIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  AcademicCapIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { Logo } from '../ui/Logo.jsx';
import { useSidebarUi } from './DashboardContainer.jsx';

const navItems = [
  { label: 'Inicio', to: '/admin/inicio', icon: HomeIcon, end: true },
  { label: 'Moderación', to: '/admin/moderacion', icon: ShieldCheckIcon },
  { label: 'Materiales', to: '/admin/materiales', icon: DocumentTextIcon },
  { label: 'Usuarios', to: '/admin/estudiantes', icon: UsersIcon },
  { label: 'Asignaturas y Grados', to: '/admin/asignaturas', icon: AcademicCapIcon },
  { label: 'Notificaciones', to: '/admin/notificaciones', icon: BellIcon },
  { label: 'Perfil', to: '/admin/perfil', icon: UserCircleIcon },
];

export const AdminSidebar = () => {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { open, closeSidebar } = useSidebarUi();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[min(var(--sidebar-w),88vw)] flex-col justify-between overflow-y-auto border-r border-[var(--border)]/70 bg-[var(--bg-card)]/95 py-6 backdrop-blur-xl transition-transform duration-200 md:static md:z-auto md:w-[var(--sidebar-w)] md:shrink-0 md:translate-x-0 md:bg-[var(--bg-card)]/40 ${
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div>
        <div className="mb-10 flex justify-center px-5">
          <Logo size="md" />
        </div>

        <nav className="sidebar-nav px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `sidebar-nav-link${isActive ? ' sidebar-nav-link--active' : ''}`
                }
              >
                <Icon className="sidebar-nav-link__icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="px-2 pt-4">
        <button
          type="button"
          onClick={() => {
            logout();
            closeSidebar();
            navigate('/', { replace: true });
          }}
          className="sidebar-logout"
        >
          <ArrowLeftOnRectangleIcon className="sidebar-nav-link__icon" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
