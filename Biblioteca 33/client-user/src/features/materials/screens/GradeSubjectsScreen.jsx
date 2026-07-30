// client-user/src/features/materials/screens/GradeSubjectsScreen.jsx
import { useCallback, useEffect, useState } from 'react';
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
import { getSubjects } from '../../../shared/api/filesClient.js';
import { getGradeLabel, normalizeGrade, sameGrade } from '../../../shared/constants/grades.js';
import { LoadingSpinner, EmptyState, Card } from '../../../shared/components/common/Common.jsx';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme.js';
import { normalizeList, toListKey } from '../../../utils/formatters.js';

export const GradeSubjectsScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const grade = normalizeGrade(route.params?.grade) || route.params?.grade;
  const gradeLabel = route.params?.gradeLabel || getGradeLabel(grade);

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!grade) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getSubjects({ grade });
      let list = normalizeList(response);
      list = list.filter((s) => sameGrade(s.grade, grade));
      setSubjects(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar asignaturas');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [grade]);

  useEffect(() => {
    load();
  }, [load]);

  const openSubject = (subject) => {
    navigation.navigate('SubjectFiles', {
      subjectId: subject._id || subject.id,
      subjectName: subject.name,
      grade,
      gradeLabel,
    });
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
      <Pressable style={styles.backRow} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        <Text style={styles.backText}>Grados</Text>
      </Pressable>
      <Text style={styles.title}>{gradeLabel}</Text>
      <Text style={styles.subtitle}>Carpetas de asignaturas</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );

  if (loading && subjects.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <LoadingSpinner message="Cargando asignaturas..." />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={subjects}
      keyExtractor={(item, index) => toListKey(item, index, 'subject')}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <EmptyState
          icon="folder"
          title="Sin asignaturas"
          message={`Aún no hay asignaturas registradas para ${gradeLabel}.`}
        />
      }
      renderItem={({ item }) => (
        <Pressable onPress={() => openSubject(item)}>
          <Card style={styles.folderCard}>
            <View style={styles.folderIcon}>
              <MaterialIcons name="folder-open" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.folderTitle}>{item.name}</Text>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.textLight} />
          </Card>
        </Pressable>
      )}
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  backText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
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
    marginBottom: SPACING.sm,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  folderIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});
