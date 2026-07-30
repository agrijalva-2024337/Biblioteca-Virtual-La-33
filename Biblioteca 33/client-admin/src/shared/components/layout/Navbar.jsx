import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead } from '../../api/notifications';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import { showError } from '../../utils/toast';
import { getRoleLabel } from '../../utils/roles.js';
import { useSidebarUi } from './DashboardContainer.jsx';

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.notifications)) return payload.data.notifications;
  return [];
};

export const Navbar = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const role = useAuthStore((s) => s.getRole());
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebarUi();
  const profilePath = isAdmin ? '/admin/perfil' : '/teacher/perfil';
  const notificationsPath = isAdmin ? '/admin/notificaciones' : null;

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications({ limit: 10 });
      setNotifications(extractList(res));
    } catch {
      // Silencioso: el navbar no debe romper si notifications está caído.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, read: true } : item))
      );
    } catch {
      showError('No se pudo marcar la notificación');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const initials = user?.username?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U';
  const roleLabel = getRoleLabel(role);
  const displayName = user?.username || user?.name || 'Usuario';

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)]/70 bg-[var(--bg-card)]/45 shadow-[0_8px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 xl:px-10">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-alt)]/80 text-[var(--text-h)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] md:hidden"
            aria-label="Abrir menú de navegación"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text-h)]">
              Hola, <span className="text-[var(--accent)]">{displayName}</span>
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {roleLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-alt)]/80 text-[var(--text-h)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              onClick={() => setOpen((v) => !v)}
              type="button"
              aria-label="Notificaciones"
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--danger)] px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 top-12 z-50 max-h-[28rem] w-[22rem] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/95 p-4 shadow-[var(--shadow-lg)] backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--text-h)]">Notificaciones</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--text-muted)]">No leídas: {unreadCount}</span>
                    {notificationsPath && (
                      <Link
                        to={notificationsPath}
                        className="text-xs font-medium text-[var(--accent)] hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        Ver todas
                      </Link>
                    )}
                  </div>
                </div>
                {loading ? (
                  <p className="text-sm text-[var(--text-muted)]">Cargando...</p>
                ) : notifications.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">Sin notificaciones</p>
                ) : (
                  <ul className="space-y-2">
                    {notifications.map((n) => (
                      <li
                        key={n._id}
                        className={`rounded-xl border p-3 text-sm ${
                          n.read
                            ? 'border-[var(--border)] bg-[var(--bg-alt)]'
                            : 'border-[var(--accent)]/50 bg-[rgba(232,132,43,0.1)]'
                        }`}
                      >
                        <p className="font-semibold text-[var(--text-h)]">{n.title}</p>
                        <p className="mt-1 text-[var(--text-muted)]">{n.message}</p>
                        {!n.read && (
                          <button
                            type="button"
                            onClick={() => handleRead(n._id)}
                            className="mt-2 text-xs font-medium text-[var(--accent)] underline"
                          >
                            Marcar leída
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="h-7 w-px bg-[var(--border)]" />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-sm font-bold text-white shadow-[0_0_20px_rgba(232,132,43,0.35)]"
            >
              {initials}
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/95 shadow-[var(--shadow-lg)] backdrop-blur-xl">
                <div className="border-b border-[var(--border)] px-4 py-3">
                  <p className="font-semibold text-[var(--text-h)]">{displayName}</p>
                  <p className="text-xs text-[var(--text-muted)]">{roleLabel}</p>
                </div>
                <ul className="p-2 text-sm">
                  <li>
                    <Link
                      to={profilePath}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-[var(--text-h)] hover:bg-[var(--bg-hover)]"
                    >
                      Mi perfil
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-xl px-3 py-2 text-left text-[var(--danger)] hover:bg-[var(--bg-hover)]"
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
