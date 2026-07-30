// client-user/src/shared/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      login: (accessToken, user) =>
        set({
          token: accessToken,
          user,
          isAuthenticated: Boolean(accessToken && user),
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),

      setAccessToken: (accessToken) =>
        set({
          token: accessToken,
          isAuthenticated: Boolean(accessToken),
        }),

      updateUser: (user) => set({ user }),

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'auth-biblioteca-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ _hasHydrated: true });
      },
    }
  )
);
