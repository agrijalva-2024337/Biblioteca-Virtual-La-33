// client-user/src/features/materials/screens/SubjectFilesScreen.jsx
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
import { useMaterials } from '../hooks/useMaterials.js';
import { MaterialCard } from '../components/MaterialCard.jsx';
import { Input } from '../../../shared/components/common/Input.jsx';
import { LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';
import { toListKey } from '../../../utils/formatters.js';

export const SubjectFilesScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const subjectId = route.params?.subjectId;
  const subjectName = route.params?.subjectName || 'Asignatura';
  const gradeLabel = route.params?.gradeLabel;

  const { files, loading, error, fetchFiles } = useMaterials();
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (!subjectId) return undefined;
    // eslint-disable-next-line no-undef
    const timer = setTimeout(() => {
      fetchFiles({ subject: subjectId, q: searchInput });
    }, 400);
    // eslint-disable-next-line no-undef
    return () => clearTimeout(timer);
  }, [subjectId, searchInput, fetchFiles]);

  const load = useCallback(() => {
    if (!subjectId) return;
    fetchFiles({ subject: subjectId, q: searchInput });
  }, [subjectId, searchInput, fetchFiles]);

  const handleView = (file) => {
    navigation.navigate('MaterialDetail', { id: file._id || file.id });
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
      <Pressable style={styles.backRow} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        <Text style={styles.backText}>{gradeLabel || 'Asignaturas'}</Text>
      </Pressable>
      <Text style={styles.title}>{subjectName}</Text>
      <Text style={styles.subtitle}>Materiales aprobados · se muestra el año académico</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input
        label="Buscar"
        placeholder="Buscar por título..."
        value={searchInput}
        onChangeText={setSearchInput}
        style={styles.input}
      />
    </View>
  );

  if (loading && files.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <LoadingSpinner message="Cargando materiales..." />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={files}
      keyExtractor={(item, index) => toListKey(item, index, 'file')}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <EmptyState
          icon="search-off"
          title="Sin materiales"
          message="No hay recursos aprobados en esta asignatura."
        />
      }
      renderItem={({ item }) => <MaterialCard file={item} onView={handleView} />}
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
    marginBottom: SPACING.md,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  input: {
    marginBottom: SPACING.sm,
  },
});
