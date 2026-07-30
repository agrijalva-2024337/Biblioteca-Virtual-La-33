import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navbar } from './Navbar.jsx';
import { AdminSidebar } from './AdminSidebar.jsx';
import { TeacherSidebar } from './TeacherSidebar.jsx';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import { AppBackground } from '../ui/AppBackground.jsx';

const SidebarUiContext = createContext({
  open: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {},
});

export const useSidebarUi = () => useContext(SidebarUiContext);

export const DashboardContainer = ({ children }) => {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const isTeacher = useAuthStore((s) => s.isTeacher());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia('(min-width: 768px)').matches) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  const value = useMemo(
    () => ({ open: sidebarOpen, openSidebar, closeSidebar, toggleSidebar }),
    [sidebarOpen, openSidebar, closeSidebar, toggleSidebar]
  );

  return (
    <SidebarUiContext.Provider value={value}>
      <AppBackground className="h-full text-[var(--text)]" fillHeight overlay="light" grain>
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0">
            <Navbar />
          </div>
          <div className="relative flex min-h-0 flex-1">
            {sidebarOpen ? (
              <button
                type="button"
                aria-label="Cerrar menú"
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                onClick={closeSidebar}
              />
            ) : null}
            {isAdmin && <AdminSidebar />}
            {isTeacher && <TeacherSidebar />}
            <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 xl:px-10">
              {children}
            </main>
          </div>
        </div>
      </AppBackground>
    </SidebarUiContext.Provider>
  );
};
