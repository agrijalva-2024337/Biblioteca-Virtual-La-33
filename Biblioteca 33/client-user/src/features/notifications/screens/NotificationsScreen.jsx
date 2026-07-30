// client-user/src/features/notifications/screens/NotificationsScreen.jsx
import { useCallback, useEffect } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../hooks/useNotifications.js';
import { LoadingSpinner, EmptyState, Card } from '../../../shared/components/common/Common.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';
import { formatDate, toListKey } from '../../../utils/formatters.js';

export const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const { notifications, loading, error, fetchNotifications, markAsRead } = useNotifications();

  const load = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePress = async (item) => {
    const id = item._id || item.id;
    if (!item.read && id) {
      await markAsRead(id);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
      <Text style={styles.title}>Notificaciones</Text>
      <Text style={styles.subtitle}>Avisos sobre tus materiales y la biblioteca</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <LoadingSpinner message="Cargando notificaciones..." />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={notifications}
      keyExtractor={(item, index) => toListKey(item, index, 'notif')}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <EmptyState
          icon="notifications-none"
          title="Sin notificaciones"
          message="Cuando haya novedades, aparecerán aquí."
        />
      }
      renderItem={({ item }) => {
        const isUnread = !item.read;
        return (
          <Pressable onPress={() => handlePress(item)}>
            <Card style={[styles.card, isUnread && styles.cardUnread]}>
              <View style={styles.cardHeader}>
                <MaterialIcons
                  name={isUnread ? 'notifications-active' : 'notifications'}
                  size={22}
                  color={isUnread ? COLORS.primary : COLORS.textLight}
                />
                <Text style={[styles.cardTitle, isUnread && styles.cardTitleUnread]} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
              <Text style={styles.cardMessage}>{item.message}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardDate}>
                  {formatDate(item.createdAt || item.updatedAt)}
                </Text>
                {isUnread ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>Nueva</Text>
                  </View>
                ) : (
                  <Text style={styles.readLabel}>Leída</Text>
                )}
              </View>
            </Card>
          </Pressable>
        );
      }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.primary} />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardUnread: {
    borderColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  cardTitleUnread: {
    fontWeight: '800',
  },
  cardMessage: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDate: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
  },
  unreadBadge: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  unreadText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  readLabel: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
  },
});
