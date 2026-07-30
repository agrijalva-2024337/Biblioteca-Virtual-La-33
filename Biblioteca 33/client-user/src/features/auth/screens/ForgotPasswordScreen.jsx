// client-user/src/features/auth/screens/ForgotPasswordScreen.jsx
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth.js';
import { AuthScreenLayout } from '../components/AuthScreenLayout.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { Input } from '../../../shared/components/common/Input.jsx';
import { Card } from '../../../shared/components/common/Common.jsx';
import {
  RecaptchaCheckbox,
  isRecaptchaConfigured,
  isRecaptchaBlockingSubmit,
} from '../../../shared/components/common/RecaptchaCheckbox.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export const ForgotPasswordScreen = ({ navigation }) => {
  const { handleForgotPassword, loading, error } = useAuth();
  const [formError, setFormError] = useState(null);
  const [captchaToken, setCaptchaToken] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    setFormError(null);

    if (isRecaptchaBlockingSubmit()) {
      setFormError('La verificación de seguridad no está disponible. Intenta más tarde.');
      return;
    }

    if (isRecaptchaConfigured() && !captchaToken) {
      setFormError('Completa la verificación CAPTCHA');
      return;
    }

    const result = await handleForgotPassword(values.email, captchaToken);
    if (result.success) {
      navigation.navigate('Login');
    } else {
      setFormError(result.error);
    }
  };

  const displayError = formError || error;

  return (
    <AuthScreenLayout>
        <View style={styles.header}>
          <MaterialIcons name="lock-reset" size={48} color={COLORS.primary} />
          <Text style={styles.title}>Recuperar contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo y te enviaremos instrucciones si la cuenta existe
          </Text>
        </View>

        <Card style={styles.card}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'El correo es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Correo inválido',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Correo institucional"
                placeholder="correo@ejemplo.com"
                autoCapitalize="none"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}

          {displayError ? <Text style={styles.errorBanner}>{displayError}</Text> : null}

          <RecaptchaCheckbox value={captchaToken} onChange={setCaptchaToken} />

          <Button
            title="Enviar instrucciones"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={isRecaptchaBlockingSubmit()}
            style={styles.submit}
          />

          <Pressable onPress={() => navigation.navigate('Login')} style={styles.backRow}>
            <Text style={styles.linkText}>Volver a iniciar sesión</Text>
          </Pressable>
        </Card>
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  submit: {
    marginTop: SPACING.lg,
  },
  backRow: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  errorBanner: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
