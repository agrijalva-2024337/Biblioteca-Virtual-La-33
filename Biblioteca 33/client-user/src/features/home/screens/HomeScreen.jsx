// client-user/src/features/home/screens/HomeScreen.jsx
import { useCallback, useEffect } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHome } from '../hooks/useHome.js';
import { useAuthStore } from '../../../shared/store/authStore.js';
import { getGradeLabel } from '../../../shared/constants/grades.js';
import { LoadingSpinner, Card } from '../../../shared/components/common/Common.jsx';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme.js';
import { formatDate, getFileTypeFromUrl, getSubjectName, toListKey } from '../../../utils/formatters.js';

export const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const {
    subjects,
    recentFiles,
    selectedSubjectId,
    loading,
    filtering,
    error,
    fetchHomeData,
    selectSubject,
    clearSubjectFilter,
  } = useHome();

  const load = useCallback(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  useEffect(() => {
    load();
  }, [load]);

  const displayName = user?.username || user?.name || 'estudiante';

  const goToDetail = (file) => {
    navigation.navigate('MaterialDetail', { id: file._id || file.id });
  };

  const selectedSubject = subjects.find(
    (s) => (s._id || s.id) === selectedSubjectId
  );

  if (loading && subjects.length === 0 && recentFiles.length === 0) {
    return <LoadingSpinner message="Cargando inicio..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.md }]}
      refreshControl={
        <RefreshControl
          refreshing={loading || filtering}
          onRefresh={load}
          tintColor={COLORS.primary}
        />
      }
    >
      <Text style={styles.greeting}>¡Bienvenido de nuevo, {displayName}!</Text>
      <Text style={styles.subtitle}>Explora materiales aprobados de la biblioteca</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filtrar por asignatura</Text>
        <Text style={styles.sectionHint}>
          Toca un chip para ver recientes de esa materia. Toca de nuevo o “Todas” para quitar el filtro.
        </Text>

        {subjects.length === 0 ? (
          <Card>
            <Text style={styles.emptyHint}>No hay asignaturas disponibles.</Text>
          </Card>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            <Pressable
              onPress={clearSubjectFilter}
              style={[styles.subjectChip, !selectedSubjectId && styles.subjectChipActive]}
            >
              <MaterialIcons
                name="apps"
                size={18}
                color={!selectedSubjectId ? COLORS.background : COLORS.primary}
              />
              <Text
                style={[
                  styles.subjectName,
                  !selectedSubjectId && styles.subjectNameActive,
                ]}
              >
                Todas
              </Text>
            </Pressable>

            {subjects.map((subject, index) => {
              const id = toListKey(subject, index, 'subject');
              const isSelected = selectedSubjectId === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => selectSubject(subject._id || subject.id || id)}
                  style={[styles.subjectChip, isSelected && styles.subjectChipActive]}
                >
                  <MaterialIcons
                    name="menu-book"
                    size={18}
                    color={isSelected ? COLORS.background : COLORS.primary}
                  />
                  <View>
                    <Text
                      style={[styles.subjectName, isSelected && styles.subjectNameActive]}
                    >
                      {subject.name}
                    </Text>
                    {subject.grade ? (
                      <Text
                        style={[styles.subjectGrade, isSelected && styles.subjectGradeActive]}
                      >
                        {getGradeLabel(subject.grade)}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedSubject
            ? `Recientes · ${selectedSubject.name}`
            : 'Materiales recientes'}
        </Text>

        {filtering && recentFiles.length === 0 ? (
          <LoadingSpinner message="Filtrando..." />
        ) : recentFiles.length === 0 ? (
          <Card>
            <Text style={styles.emptyHint}>
              {selectedSubject
                ? `No hay materiales aprobados recientes de ${selectedSubject.name}.`
                : 'Aún no hay materiales aprobados para mostrar.'}
            </Text>
          </Card>
        ) : (
          recentFiles.map((file, index) => {
            const fileType = getFileTypeFromUrl(file.fileUrl, file.originalName);
            return (
              <Pressable key={toListKey(file, index, 'file')} onPress={() => goToDetail(file)}>
                <Card style={styles.recentCard}>
                  <View style={styles.recentHeader}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{fileType}</Text>
                    </View>
                    <Text style={styles.recentDate}>{formatDate(file.createdAt)}</Text>
                  </View>
                  <Text style={styles.recentTitle} numberOfLines={2}>
                    {file.title || file.originalName || 'Sin título'}
                  </Text>
                  <Text style={styles.recentSubject}>{getSubjectName(file)}</Text>
                  {file.promotionYear ? (
                    <Text style={styles.recentYear}>Año académico: {file.promotionYear}</Text>
                  ) : null}
                  <View style={styles.recentFooter}>
                    <Text style={styles.recentLink}>Ver detalle</Text>
                    <MaterialIcons name="chevron-right" size={20} color={COLORS.primary} />
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}
      </View>
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
  greeting: {
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
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  sectionHint: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.md,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  subjectChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subjectName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  subjectNameActive: {
    color: COLORS.background,
  },
  subjectGrade: {
    color: COLORS.textLight,
    fontSize: 10,
    marginTop: 1,
  },
  subjectGradeActive: {
    color: COLORS.background,
    opacity: 0.85,
  },
  emptyHint: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
  },
  recentCard: {
    marginBottom: SPACING.md,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  typeText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  recentDate: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
  },
  recentTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  recentSubject: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginBottom: 2,
  },
  recentYear: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  recentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});
