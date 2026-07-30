// client-user/src/features/materials/screens/GradesListScreen.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getGrades } from '../../../shared/api/filesClient.js';
import { useAuthStore } from '../../../shared/store/authStore.js';
import { getGradeLabel, gradesToOptions, normalizeGrade, sameGrade } from '../../../shared/constants/grades.js';
import { Card } from '../../../shared/components/common/Common.jsx';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme.js';

export const GradesListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const userGrade = useAuthStore((s) => s.user?.grade || s.user?.Grade || '');
  const lockedGrade = normalizeGrade(userGrade) || userGrade;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const autoNavigated = useRef(false);

  const loadGrades = useCallback(async () => {
    setError(null);
    try {
      const grades = await getGrades();
      let mapped = gradesToOptions(grades);
      if (lockedGrade) {
        mapped = mapped.filter((g) => sameGrade(g.value, lockedGrade));
      }
      setOptions(mapped);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los grados');
      setOptions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lockedGrade]);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  // Si solo hay un grado (el del estudiante), entrar a sus asignaturas (una sola vez).
  useEffect(() => {
    if (!loading && lockedGrade && options.length === 1 && !autoNavigated.current) {
      autoNavigated.current = true;
      const only = options[0];
      navigation.navigate('GradeSubjects', {
        grade: only.value,
        gradeLabel: only.label,
      });
    }
  }, [loading, lockedGrade, options, navigation]);

  const subtitle = useMemo(() => {
    if (lockedGrade) {
      return `Tu grado: ${getGradeLabel(lockedGrade)}. Solo puedes ver materiales de este grado.`;
    }
    return 'Elige un grado para ver sus carpetas de asignaturas';
  }, [lockedGrade]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.md }]}>
      <Text style={styles.title}>Materiales</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadGrades();
              }}
              tintColor={COLORS.primary}
            />
          }
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {options.length === 0 && !error ? (
            <Text style={styles.empty}>
              {lockedGrade
                ? 'Tu grado aún no está configurado en el catálogo.'
                : 'Aún no hay grados configurados.'}
            </Text>
          ) : null}
          {options.map((grade) => (
            <Pressable
              key={grade.value}
              onPress={() =>
                navigation.navigate('GradeSubjects', {
                  grade: grade.value,
                  gradeLabel: grade.label,
                })
              }
            >
              <Card style={styles.folderCard}>
                <View style={styles.folderIcon}>
                  <MaterialIcons name="folder" size={32} color={COLORS.primary} />
                </View>
                <View style={styles.folderText}>
                  <Text style={styles.folderTitle}>{grade.label}</Text>
                  <Text style={styles.folderDesc}>{grade.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={COLORS.textLight} />
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
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
    marginBottom: SPACING.lg,
  },
  error: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  empty: {
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  folderIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderText: {
    flex: 1,
  },
  folderTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  folderDesc: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
  },
});
