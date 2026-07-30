// client-user/src/navigation/AppNavigator.jsx
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { useAuthStore } from '../shared/store/authStore.js';
import { LoadingSpinner } from '../shared/components/common/Common.jsx';
import { COLORS } from '../shared/constants/theme.js';
import { AuthStack } from './AuthStack.jsx';
import { MainTabs } from './MainTabs.jsx';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    primary: COLORS.primary,
  },
};

export const AppNavigator = () => {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!hasHydrated) {
    return <LoadingSpinner message="Preparando la app..." />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};
