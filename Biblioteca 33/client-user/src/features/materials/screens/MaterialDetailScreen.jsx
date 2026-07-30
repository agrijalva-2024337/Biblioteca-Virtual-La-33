// client-user/src/features/materials/screens/MaterialDetailScreen.jsx
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMaterials } from '../hooks/useMaterials.js';
import { Button } from '../../../shared/components/common/Button.jsx';
import { Input } from '../../../shared/components/common/Input.jsx';
import { LoadingSpinner, Card } from '../../../shared/components/common/Common.jsx';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme.js';
import { formatDate, getFileTypeFromUrl, getSubjectName, toListKey } from '../../../utils/formatters.js';
import { openMaterialFile } from '../../../utils/openMaterialFile.js';

export const MaterialDetailScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const fileId = route.params?.id;
  const {
    file,
    comments,
    detailLoading,
    commentsLoading,
    submittingComment,
    error,
    fetchFileById,
    fetchComments,
    postComment,
  } = useMaterials();

  const [commentText, setCommentText] = useState('');
  const [openingFile, setOpeningFile] = useState(false);

  const load = useCallback(async () => {
    if (!fileId) return;
    await fetchFileById(fileId);
    await fetchComments(fileId);
  }, [fileId, fetchFileById, fetchComments]);

  useEffect(() => {
    load();
  }, [load]);

  const openFile = async () => {
    if (openingFile) return;

    setOpeningFile(true);
    try {
      await openMaterialFile(file);
    } finally {
      setOpeningFile(false);
    }
  };

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text) return;

    const result = await postComment({ fileId, text });
    if (result.success) {
      setCommentText('');
    }
  };

  if (detailLoading && !file) {
    return <LoadingSpinner message="Cargando material..." />;
  }

  if (!file && !detailLoading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error || 'Material no encontrado'}</Text>
        <Button title="Volver" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const fileType = getFileTypeFromUrl(file.fileUrl, file.originalName);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.sm }]}
    >
      <Pressable style={styles.backRow} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        <Text style={styles.backText}>Volver</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card style={styles.mainCard}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{fileType}</Text>
        </View>
        <Text style={styles.title}>{file.title || file.originalName || 'Sin título'}</Text>
        <Text style={styles.meta}>Asignatura: {getSubjectName(file)}</Text>
        {file.promotionYear ? (
          <Text style={styles.meta}>Año académico: {file.promotionYear}</Text>
        ) : null}
        <Text style={styles.meta}>Subido: {formatDate(file.createdAt)}</Text>
        {file.description ? (
          <Text style={styles.description}>{file.description}</Text>
        ) : (
          <Text style={styles.noDescription}>Sin descripción</Text>
        )}
        <Button
          title="Abrir / Descargar"
          onPress={openFile}
          loading={openingFile}
          style={styles.openButton}
        />
      </Card>

      <Text style={styles.sectionTitle}>Comentarios</Text>

      {commentsLoading ? (
        <LoadingSpinner message="Cargando comentarios..." />
      ) : comments.length === 0 ? (
        <Text style={styles.emptyComments}>Sé el primero en comentar.</Text>
      ) : (
        comments.map((comment, index) => (
          <Card key={toListKey(comment, index, 'comment')} style={styles.commentCard}>
            <Text style={styles.commentText}>{comment.text}</Text>
            <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
          </Card>
        ))
      )}

      <View style={styles.form}>
        <Input
          label="Agregar comentario"
          placeholder="Escribe tu comentario..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
          inputStyle={styles.commentInput}
        />
        <Button
          title="Publicar"
          onPress={handleSubmitComment}
          loading={submittingComment}
          disabled={!commentText.trim()}
        />
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
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
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
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  mainCard: {
    marginBottom: SPACING.lg,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  typeText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  meta: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginBottom: 4,
  },
  description: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  noDescription: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontStyle: 'italic',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  openButton: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  emptyComments: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.lg,
  },
  commentCard: {
    marginBottom: SPACING.sm,
  },
  commentText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xs,
  },
  commentDate: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
  },
  form: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  commentInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
});
