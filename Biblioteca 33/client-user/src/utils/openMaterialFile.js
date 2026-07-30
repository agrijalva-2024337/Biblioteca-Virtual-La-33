import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { resolveDevHost } from '../shared/constants/endpoints.js';

const MIME_EXT = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'video/mp4': 'mp4',
};

const sanitizeFileName = (name) => name.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'archivo';

const resolveFileName = (file) => {
  let name = sanitizeFileName(file?.originalName || file?.title || 'archivo');

  if (!name.includes('.') && file?.mimeType) {
    const ext = MIME_EXT[file.mimeType];
    if (ext) name = `${name}.${ext}`;
  }

  return name;
};

const openOnAndroid = async (localUri, mimeType) => {
  const contentUri = await FileSystem.getContentUriAsync(localUri);

  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1,
    type: mimeType,
  });
};

const openOnIos = async (localUri, mimeType, fileName) => {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(localUri, {
      mimeType,
      UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : undefined,
      dialogTitle: fileName,
    });
    return;
  }

  throw new Error('Sharing no disponible');
};

export const openMaterialFile = async (file) => {
  if (!file?.fileUrl) {
    Alert.alert('Archivo no disponible', 'Este material no tiene URL de descarga.');
    return { success: false };
  }

  // Emulador Android: localhost del host → 10.0.2.2
  const remoteUrl = resolveDevHost(file.fileUrl);
  const fileName = resolveFileName(file);
  const mimeType = file?.mimeType || 'application/octet-stream';
  const cacheDir = FileSystem.cacheDirectory;

  if (!cacheDir) {
    throw new Error('Cache no disponible');
  }

  const localUri = `${cacheDir}${fileName}`;

  try {
    const existing = await FileSystem.getInfoAsync(localUri);
    if (existing.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    }

    const download = await FileSystem.downloadAsync(remoteUrl, localUri);
    if (download.status !== 200) {
      throw new Error(`Descarga fallida (${download.status})`);
    }

    if (Platform.OS === 'android') {
      await openOnAndroid(download.uri, mimeType);
    } else {
      await openOnIos(download.uri, mimeType, fileName);
    }

    return { success: true };
  } catch {
    Alert.alert(
      'No se pudo abrir el archivo',
      'Comprueba tu conexión o intenta de nuevo. Si el problema continúa, el formato puede no tener visor en tu dispositivo.'
    );
    return { success: false };
  }
};
