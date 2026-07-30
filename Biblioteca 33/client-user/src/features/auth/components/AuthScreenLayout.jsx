import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export const AuthScreenLayout = ({ children, showBrand = true }) => (
  <ImageBackground
    // eslint-disable-next-line no-undef -- require de assets en React Native
    source={require('../../../../assets/library-bg.png')}
    style={styles.bg}
    resizeMode="cover"
  >
    <View style={styles.overlay} />
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {showBrand && (
          <View style={styles.header}>
            <Image
              source={require('../../../../assets/la33_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brand}>La 33</Text>
            <Text style={styles.subtitle}>Biblioteca Estudiantil Online</Text>
          </View>
        )}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </ImageBackground>
);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 21, 15, 0.82)',
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: SPACING.sm,
  },
  brand: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
});
