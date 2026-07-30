// client-user/src/features/profile/screens/ProfileScreen.jsx
import { useCallback, useEffect } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProfile } from '../hooks/useProfile.js';
import { useAuthStore } from '../../../shared/store/authStore.js';
import { Button } from '../../../shared/components/common/Button.jsx';
import { LoadingSpinner, Card } from '../../../shared/components/common/Common.jsx';
import { getGradeLabel } from '../../../shared/constants/grades.js';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme.js';

const ROLE_LABELS = {
  USER_ROLE: 'Estudiante',
  TEACHER_ROLE: 'Profesor',
  ADMIN_ROLE: 'Administrador',
};

const getDisplayName = (profile) => {
  const fullName = [profile?.name, profile?.surname].filter(Boolean).join(' ').trim();
  return fullName || profile?.username || 'Usuario';
};

const getRoleLabel = (role) => ROLE_LABELS[role] || role || '—';

export const ProfileScreen = () => {
  const logout = useAuthStore((s) => s.logout);
  const authUser = useAuthStore((s) => s.user);
  const { profile, loading, error, fetchProfile } = useProfile();

  const load = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que deseas salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  if (loading && !profile) {
    return <LoadingSpinner message="Cargando perfil..." />;
  }

  const displayName = getDisplayName(profile);
  const grade = profile?.grade || profile?.Grade || authUser?.grade || authUser?.Grade || '';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.primary} />
      }
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card style={styles.card}>
        <View style={styles.avatarWrap}>
          <Image
            source={require('../../../../assets/avatarDefault.png')}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.name}>{displayName}</Text>

        <View style={styles.row}>
          <MaterialIcons name="email" size={20} color={COLORS.primary} />
          <View style={styles.rowText}>
            <Text style={styles.label}>Correo</Text>
            <Text style={styles.value}>{profile?.email || '—'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <MaterialIcons name="badge" size={20} color={COLORS.primary} />
          <View style={styles.rowText}>
            <Text style={styles.label}>Rol</Text>
            <Text style={styles.value}>{getRoleLabel(profile?.role)}</Text>
          </View>
        </View>

        {grade ? (
          <>
            <View style={styles.divider} />
            <View style={styles.row}>
              <MaterialIcons name="school" size={20} color={COLORS.primary} />
              <View style={styles.rowText}>
                <Text style={styles.label}>Grado</Text>
                <Text style={styles.value}>{getGradeLabel(grade)}</Text>
              </View>
            </View>
          </>
        ) : null}
      </Card>

      <Button
        title="Cerrar sesión"
        variant="secondary"
        onPress={handleLogout}
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  card: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surfaceAlt,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    width: '100%',
    paddingVertical: SPACING.sm,
  },
  rowText: {
    flex: 1,
  },
  label: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
    marginVertical: SPACING.sm,
  },
  logoutBtn: {
    marginTop: SPACING.sm,
  },
});
