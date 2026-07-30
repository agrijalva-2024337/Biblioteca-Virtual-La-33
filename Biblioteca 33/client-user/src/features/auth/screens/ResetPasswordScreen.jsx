import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthScreenLayout } from '../components/AuthScreenLayout.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { Input } from '../../../shared/components/common/Input.jsx';
import { Card } from '../../../shared/components/common/Common.jsx';
import { authClient } from '../../../shared/api/authClient.js';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

const PASSWORD_MIN = 8;

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.detail ||
  err?.message ||
  fallback;

export const ResetPasswordScreen = ({ navigation, route }) => {
  const token = useMemo(
    () => route?.params?.token || '',
    [route?.params?.token]
  );
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { password: '', confirm: '' },
  });

  const passwordValue = watch('password');

  const onSubmit = async (values) => {
    setFormError(null);

    if (!token) {
      setFormError('El enlace de recuperación no es válido o está incompleto.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authClient.post('/Auth/reset-password', {
        token,
        newPassword: values.password,
      });
      Alert.alert(
        'Contraseña actualizada',
        data?.message || 'Ya puedes iniciar sesión con tu nueva contraseña.'
      );
      navigation.navigate('Login');
    } catch (err) {
      setFormError(
        getErrorMessage(err, 'No se pudo restablecer la contraseña. El enlace puede haber expirado.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout>
      <View style={styles.header}>
        <MaterialIcons name="password" size={48} color={COLORS.primary} />
        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>
          Elige una contraseña segura de al menos {PASSWORD_MIN} caracteres.
        </Text>
      </View>

      <Card style={styles.card}>
        {!token ? (
          <Text style={styles.error}>
            Falta el token. Abre el enlace del correo o solicita uno nuevo.
          </Text>
        ) : null}

        <Controller
          control={control}
          name="password"
          rules={{
            required: 'La contraseña es obligatoria',
            minLength: {
              value: PASSWORD_MIN,
              message: `Mínimo ${PASSWORD_MIN} caracteres`,
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nueva contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              error={errors.password?.message}
              autoComplete="password-new"
            />
          )}
        />

        <Controller
          control={control}
          name="confirm"
          rules={{
            required: 'Confirma tu contraseña',
            validate: (value) =>
              value === passwordValue || 'Las contraseñas no coinciden',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirmar contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              error={errors.confirm?.message}
              autoComplete="password-new"
            />
          )}
        />

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <Button
          title={loading ? 'Guardando...' : 'Guardar contraseña'}
          onPress={handleSubmit(onSubmit)}
          disabled={loading || !token}
          style={styles.submit}
        />

        <Button
          title="Volver al inicio de sesión"
          variant="secondary"
          onPress={() => navigation.navigate('Login')}
        />
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
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  card: {
    gap: SPACING.md,
  },
  error: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  submit: {
    marginTop: SPACING.sm,
  },
});
