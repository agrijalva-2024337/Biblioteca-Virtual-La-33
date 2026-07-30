import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router/AppRouter.jsx';
import { useAuthStore } from '../features/auth/store/authStore.js';

export const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'inherit',
            fontWeight: 600,
            fontSize: '1rem',
            borderRadius: '12px',
          },
        }}
      />
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <AppRouter />
      </div>
    </div>
  );
};
