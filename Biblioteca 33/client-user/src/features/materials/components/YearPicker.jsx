// client-user/src/features/materials/components/YearPicker.jsx
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PROMOTION_YEAR_OPTIONS } from '../../../shared/constants/grades.js';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme.js';

const normalizeYears = (years) =>
  (Array.isArray(years) ? years : []).map((item, index) => {
    if (item != null && typeof item === 'object') {
      const value = String(item.value ?? item.label ?? index);
      return { value, label: String(item.label ?? item.value ?? value) };
    }
    const value = String(item);
    return { value, label: value };
  });

export const YearPicker = ({
  label = 'Año académico',
  value,
  onChange,
  years = PROMOTION_YEAR_OPTIONS,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const options = normalizeYears(years);
  const selected = value != null && value !== '' ? String(value) : '';

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.trigger, error && styles.triggerError]}
      >
        <Text style={[styles.triggerText, !selected && styles.placeholder]}>
          {selected || 'Seleccionar año'}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.textLight} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === selected;
                return (
                  <Pressable
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <MaterialIcons name="check" size={20} color={COLORS.primary} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  triggerError: {
    borderColor: COLORS.error,
  },
  triggerText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    flex: 1,
  },
  placeholder: {
    color: COLORS.textLight,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '50%',
    paddingBottom: SPACING.lg,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionSelected: {
    backgroundColor: COLORS.surfaceAlt,
  },
  optionText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
