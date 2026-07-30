// client-user/src/features/materials/components/GradePicker.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getGrades } from '../../../shared/api/filesClient.js';
import { getGradeLabel, gradesToOptions } from '../../../shared/constants/grades.js';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme.js';

export const GradePicker = ({
  label = 'Grado',
  value = '',
  onChange,
  allowEmpty = false,
  placeholder = 'Seleccionar grado',
  error,
  options: optionsProp,
  locked = false,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(!optionsProp);
  const [remoteOptions, setRemoteOptions] = useState([]);

  useEffect(() => {
    if (optionsProp) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const grades = await getGrades();
        if (!cancelled) setRemoteOptions(gradesToOptions(grades));
      } catch {
        if (!cancelled) setRemoteOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [optionsProp]);

  const baseOptions = optionsProp || remoteOptions;
  const options = useMemo(() => {
    return allowEmpty
      ? [{ value: '', label: placeholder }, ...baseOptions]
      : baseOptions;
  }, [allowEmpty, baseOptions, placeholder]);

  const displayLabel = value ? getGradeLabel(value) : placeholder;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => !locked && !loading && setOpen(true)}
        style={[styles.trigger, error && styles.triggerError, locked && styles.triggerLocked]}
        disabled={locked || loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <Text style={[styles.triggerText, !value && styles.placeholder]}>{displayLabel}</Text>
        )}
        {!locked ? (
          <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.textLight} />
        ) : (
          <MaterialIcons name="lock" size={18} color={COLORS.textLight} />
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item, index) => String(item.value ?? item.id ?? `grade-${index}`)}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
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
  triggerLocked: {
    opacity: 0.85,
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
    maxHeight: '40%',
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
