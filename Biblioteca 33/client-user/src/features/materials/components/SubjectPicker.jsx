// client-user/src/features/materials/components/SubjectPicker.jsx
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
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme.js';
import { toListKey } from '../../../utils/formatters.js';

export const SubjectPicker = ({
  label,
  subjects = [],
  value = '',
  onChange,
  placeholder = 'Todas las asignaturas',
  allowEmpty = true,
  error,
}) => {
  const [open, setOpen] = useState(false);

  const selected = subjects.find((s) => String(s._id || s.id || '') === String(value));
  const displayLabel = selected?.name || placeholder;

  const options = allowEmpty
    ? [{ _id: '', name: placeholder }, ...subjects]
    : subjects;

  const listEmpty =
    !allowEmpty && subjects.length === 0 ? (
      <Text style={styles.emptyOptions}>{placeholder}</Text>
    ) : null;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.trigger, error && styles.triggerError]}
      >
        <Text style={[styles.triggerText, !selected && allowEmpty && styles.placeholder]}>
          {displayLabel}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.textLight} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label || 'Asignatura'}</Text>
            <FlatList
              data={options}
              keyExtractor={(item, index) => toListKey(item, index, 'subject-opt')}
              ListEmptyComponent={listEmpty}
              renderItem={({ item }) => {
                const id = item._id != null ? String(item._id) : item.id != null ? String(item.id) : '';
                const isSelected = id === String(value || '');
                return (
                  <Pressable
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => {
                      onChange(id);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {item.name}
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
    maxHeight: '60%',
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
  emptyOptions: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    textAlign: 'center',
  },
});
