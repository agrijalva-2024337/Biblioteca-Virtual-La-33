// client-user/src/features/materials/screens/MaterialsListScreen.jsx
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMaterials } from '../hooks/useMaterials.js';
import { MaterialCard } from '../components/MaterialCard.jsx';
import { SubjectPicker } from '../components/SubjectPicker.jsx';
import { Input } from '../../../shared/components/common/Input.jsx';
import { LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';
import { toListKey } from '../../../utils/formatters.js';

export const MaterialsListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { files, subjects, loading, error, fetchSubjects, fetchFiles } = useMaterials();
  const [searchInput, setSearchInput] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    const timer = setTimeout(() => {
      fetchFiles({ subject: subjectFilter, q: searchInput });
    }, 400);

    // eslint-disable-next-line no-undef
    return () => clearTimeout(timer);
  }, [searchInput, subjectFilter, fetchFiles]);

  const load = useCallback(() => {
    fetchSubjects();
    fetchFiles({ subject: subjectFilter, q: searchInput });
  }, [fetchSubjects, fetchFiles, subjectFilter, searchInput]);

  const handleView = (file) => {
    navigation.navigate('MaterialDetail', { id: file._id || file.id });
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
      <Text style={styles.title}>Materiales</Text>
      <Text style={styles.subtitle}>Busca y filtra recursos aprobados</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input
        label="Buscar"
        placeholder="Buscar por título..."
        value={searchInput}
        onChangeText={setSearchInput}
        style={styles.input}
      />
      <SubjectPicker
        label="Asignatura"
        subjects={subjects}
        value={subjectFilter}
        onChange={setSubjectFilter}
        placeholder="Todas las asignaturas"
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
          title="Sin resultados"
          message="Prueba con otro término o asignatura."
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
    marginBottom: SPACING.md,
  },
});
