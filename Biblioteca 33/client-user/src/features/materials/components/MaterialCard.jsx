// client-user/src/features/materials/components/MaterialCard.jsx
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '../../../shared/components/common/Button.jsx';
import { Card } from '../../../shared/components/common/Common.jsx';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme.js';
import { formatDate, getFileTypeFromUrl, getSubjectName } from '../../../utils/formatters.js';

export const MaterialCard = ({ file, onView }) => {
  const fileType = getFileTypeFromUrl(file.fileUrl, file.originalName);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <MaterialIcons name="insert-drive-file" size={16} color={COLORS.primary} />
          <Text style={styles.typeText}>{fileType}</Text>
        </View>
        <Text style={styles.date}>{formatDate(file.createdAt)}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {file.title || file.originalName || 'Sin título'}
      </Text>
      <Text style={styles.subject}>{getSubjectName(file)}</Text>
      {file.promotionYear ? (
        <Text style={styles.year}>Año académico: {file.promotionYear}</Text>
      ) : null}
      <Button
        title="Ver"
        onPress={() => onView(file)}
        style={styles.button}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  typeText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  date: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  subject: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginBottom: 2,
  },
  year: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  button: {
    alignSelf: 'flex-start',
    minWidth: 100,
    minHeight: 40,
    paddingVertical: SPACING.sm,
  },
});
