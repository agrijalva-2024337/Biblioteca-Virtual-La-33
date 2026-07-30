// client-user/src/shared/components/common/Common.jsx
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme.js';

export const LoadingSpinner = ({ message = 'Cargando...' }) => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    {message ? <Text style={styles.mutedText}>{message}</Text> : null}
  </View>
);

export const EmptyState = ({
  icon = 'inbox',
  title = 'Sin resultados',
  message,
}) => (
  <View style={styles.centered}>
    <MaterialIcons name={icon} size={48} color={COLORS.textLight} />
    <Text style={styles.emptyTitle}>{title}</Text>
    {message ? <Text style={styles.mutedText}>{message}</Text> : null}
  </View>
);

export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  mutedText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
});
