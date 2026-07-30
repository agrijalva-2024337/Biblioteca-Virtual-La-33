// client-user/src/features/auth/screens/LoginScreen.jsx
import { useEffect, useState } from 'react';
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
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme.js';

export const LoginScreen = ({ navigation, route }) => {
  const { handleLogin, handleResendVerification, loading, error } = useAuth();
  const [formError, setFormError] = useState(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(
    Boolean(route.params?.needsVerification)
  );

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailOrUsername: route.params?.emailHint || '',
      password: '',
    },
  });

  useEffect(() => {
    if (route.params?.emailHint) {
      setValue('emailOrUsername', route.params.emailHint);
    }
    if (route.params?.needsVerification) {
      setEmailNotVerified(true);
    }
  }, [route.params, setValue]);

  const onSubmit = async (values) => {
    setFormError(null);
    setEmailNotVerified(false);

    if (isRecaptchaBlockingSubmit()) {
      setFormError('La verificación de seguridad no está disponible. Intenta más tarde.');
      return;
    }

    if (isRecaptchaConfigured() && !captchaToken) {
      setFormError('Completa la verificación CAPTCHA');
      return;
    }

    const result = await handleLogin({ ...values, captchaToken });
    if (!result.success) {
      setFormError(result.error);
      if (result.emailNotVerified) {
        setEmailNotVerified(true);
      }
    }
  };

  const onResend = async () => {
    const emailOrUsername = getValues('emailOrUsername');
    if (!emailOrUsername?.includes('@')) {
      setFormError('Ingresa tu correo (no el usuario) para reenviar la verificación');
      return;
    }
    await handleResendVerification(emailOrUsername);
  };

  const displayError = formError || error;

  return (
    <AuthScreenLayout>
      <Card style={styles.card}>
          {emailNotVerified ? (
            <View style={styles.verifyBox}>
              <MaterialIcons name="mark-email-unread" size={28} color={COLORS.primary} />
              <Text style={styles.verifyTitle}>Correo sin verificar</Text>
              <Text style={styles.verifyText}>
                Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja o reenvía el
                enlace.
              </Text>
              <Button
                title="Reenviar verificación"
                variant="secondary"
                loading={loading}
                onPress={onResend}
                style={styles.resendBtn}
              />
            </View>
          ) : null}

          <View style={styles.field}>
            <View style={styles.inputRow}>
              <MaterialIcons name="person" size={20} color={COLORS.textLight} style={styles.icon} />
              <Controller
                control={control}
                name="emailOrUsername"
                rules={{ required: 'El correo o usuario es obligatorio' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Correo Institucional"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={styles.inputFlex}
                    inputStyle={styles.inputInner}
                  />
                )}
              />
            </View>
            {errors.emailOrUsername ? (
              <Text style={styles.errorText}>{errors.emailOrUsername.message}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <View style={styles.inputRow}>
              <MaterialIcons name="lock" size={20} color={COLORS.textLight} style={styles.icon} />
              <Controller
                control={control}
                name="password"
                rules={{ required: 'La contraseña es obligatoria' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Contraseña"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={styles.inputFlex}
                    inputStyle={styles.inputInner}
                  />
                )}
              />
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            ) : null}
          </View>

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={styles.linkText}>Olvidé mi contraseña</Text>
          </Pressable>

          {displayError ? <Text style={styles.errorBanner}>{displayError}</Text> : null}

          <RecaptchaCheckbox value={captchaToken} onChange={setCaptchaToken} />

          <Button
            title="Iniciar Sesión"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={isRecaptchaBlockingSubmit()}
            style={styles.submit}
          />

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.registerRow}>
            <Text style={styles.muted}>¿No tienes cuenta? </Text>
            <Text style={styles.linkText}>Regístrate</Text>
          </Pressable>
        </Card>
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    padding: SPACING.lg,
  },
  field: {
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: SPACING.sm,
    width: 24,
  },
  inputFlex: {
    flex: 1,
    marginBottom: 0,
  },
  inputInner: {
    minHeight: 48,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  muted: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  submit: {
    marginTop: SPACING.xs,
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
    marginBottom: SPACING.sm,
  },
  verifyBox: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  verifyTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  verifyText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  resendBtn: {
    marginTop: SPACING.xs,
  },
});
