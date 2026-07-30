// client-user/src/navigation/AuthStack.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../features/auth/screens/LoginScreen.jsx';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen.jsx';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen.jsx';
import { ResetPasswordScreen } from '../features/auth/screens/ResetPasswordScreen.jsx';
import { COLORS } from '../shared/constants/theme.js';

const Stack = createNativeStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};
