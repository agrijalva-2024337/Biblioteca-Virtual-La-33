// client-user/src/shared/components/common/RecaptchaCheckbox.jsx
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme.js';

const SITE_KEY = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || '';
// eslint-disable-next-line no-undef
const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

const buildHtml = (siteKey) => `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    <style>
      html, body { margin: 0; padding: 0; background: #1c150f; display: flex; justify-content: center; align-items: center; min-height: 100%; }
      .wrap { padding: 16px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="g-recaptcha"
           data-sitekey="${siteKey}"
           data-theme="dark"
           data-callback="onOk"
           data-expired-callback="onExpired"
           data-error-callback="onError"></div>
    </div>
    <script>
      function post(type, token) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, token: token || '' }));
      }
      function onOk(token) { post('verify', token); }
      function onExpired() { post('expire', ''); }
      function onError() { post('error', ''); }
    </script>
  </body>
</html>`;

export const isRecaptchaConfigured = () => Boolean(SITE_KEY);

/** En producción sin site key el login/registro deben bloquearse. */
export const isRecaptchaBlockingSubmit = () => !SITE_KEY && !IS_DEV;

/**
 * reCAPTCHA v2 vía WebView (Expo / React Native).
 */
export const RecaptchaCheckbox = ({ onChange, value }) => {
  const [open, setOpen] = useState(false);
  const html = useMemo(() => (SITE_KEY ? buildHtml(SITE_KEY) : ''), []);

  if (!SITE_KEY) {
    return (
      <Text style={[styles.hint, !IS_DEV && styles.hintProd]}>
        {IS_DEV
          ? 'reCAPTCHA desactivado (falta EXPO_PUBLIC_RECAPTCHA_SITE_KEY).'
          : 'La verificación de seguridad no está disponible. Intenta más tarde.'}
      </Text>
    );
  }

  const handleMessage = (event) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload.type === 'verify') {
        onChange?.(payload.token || '');
        setOpen(false);
      } else if (payload.type === 'expire' || payload.type === 'error') {
        onChange?.('');
      }
    } catch {
      onChange?.('');
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <MaterialIcons
          name={value ? 'check-box' : 'check-box-outline-blank'}
          size={22}
          color={value ? COLORS.primary : COLORS.textLight}
        />
        <Text style={styles.triggerText}>
          {value ? 'Verificación completada' : 'Completar verificación CAPTCHA'}
        </Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Verificación de seguridad</Text>
            <Pressable onPress={() => setOpen(false)}>
              <MaterialIcons name="close" size={24} color={COLORS.text} />
            </Pressable>
          </View>
          <WebView
            originWhitelist={['*']}
            source={{ html, baseUrl: 'https://localhost' }}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            style={styles.webview}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  hint: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.sm,
  },
  hintProd: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  triggerText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    flex: 1,
  },
  modal: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
