// src/screens/books/GutenbergReaderScreen.js
// Reader teks asli dari Project Gutenberg dengan kontrol font dan tema baca.
// Dipakai saat buku tersedia teksnya di Gutenberg. Kalau tidak tersedia,
// BookDetailScreen akan fallback ke ReadBookScreen (WebView Google Books).

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../store/ThemeContext';
import { gutenbergApi } from '../../api/gutenberg';
import { spacing, radius } from '../../constants/theme';

const FONT_SIZE_STEPS = [14, 16, 18, 20, 24, 28];

const READING_THEMES = {
  light: { background: '#FBF9F6', text: '#2B2B2B', label: 'Terang' },
  sepia: { background: '#F4ECD8', text: '#3A2E1F', label: 'Sepia' },
  dark: { background: '#1A1A1A', text: '#D8D8D8', label: 'Gelap' },
};

export default function GutenbergReaderScreen({ route }) {
  const { book, textUrl } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fontStepIndex, setFontStepIndex] = useState(1); // default 16px
  const [readingTheme, setReadingTheme] = useState('light');
  const [showControls, setShowControls] = useState(true);

  const loadText = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await gutenbergApi.getBookText(textUrl);
      setText(res.data.data.text);
    } catch (err) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [textUrl]);

  useEffect(() => { loadText(); }, [loadText]);

  const theme = READING_THEMES[readingTheme];
  const fontSize = FONT_SIZE_STEPS[fontStepIndex];
  const THEME_ORDER = ['light', 'sepia', 'dark'];

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ color: theme.text, marginTop: spacing.md }}>Menyiapkan halaman baca...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.xl }}>
          Gagal memuat teks buku. Pastikan koneksi internet aktif.
        </Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, marginTop: spacing.lg }]} onPress={loadText}>
          <Text style={styles.btnText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Toolbar kontrol baca — muncul/sembunyi saat tap layar */}
      {showControls && (
        <View style={[styles.toolbar, { backgroundColor: theme.background, borderBottomColor: theme.text + '22', paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.toolbarTitle, { color: theme.text }]} numberOfLines={1}>
            {book.title}
          </Text>

          <View style={styles.controls}>
            {/* Perkecil font */}
            <TouchableOpacity
              onPress={() => setFontStepIndex(i => Math.max(i - 1, 0))}
              style={styles.iconBtn}
              disabled={fontStepIndex === 0}
            >
              <Text style={[styles.fontBtn, { color: fontStepIndex === 0 ? theme.text + '44' : theme.text }]}>A-</Text>
            </TouchableOpacity>

            {/* Perbesar font */}
            <TouchableOpacity
              onPress={() => setFontStepIndex(i => Math.min(i + 1, FONT_SIZE_STEPS.length - 1))}
              style={styles.iconBtn}
              disabled={fontStepIndex === FONT_SIZE_STEPS.length - 1}
            >
              <Text style={[styles.fontBtn, { color: fontStepIndex === FONT_SIZE_STEPS.length - 1 ? theme.text + '44' : theme.text }]}>A+</Text>
            </TouchableOpacity>

            {/* Ganti tema */}
            <TouchableOpacity
              onPress={() => {
                const next = THEME_ORDER[(THEME_ORDER.indexOf(readingTheme) + 1) % THEME_ORDER.length];
                setReadingTheme(next);
              }}
              style={[styles.iconBtn, styles.themeBtn, { borderColor: theme.text + '44' }]}
            >
              <Text style={{ color: theme.text, fontSize: 10, fontWeight: '700' }}>
                {READING_THEMES[readingTheme].label}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.textContent, { paddingTop: showControls ? spacing.md : spacing.lg }]}
        onTouchEnd={() => setShowControls(s => !s)}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: theme.text, fontSize, lineHeight: fontSize * 1.7, fontFamily: undefined }}>
          {text}
        </Text>
      </ScrollView>

      {/* Indicator ukuran font saat ini */}
      {showControls && (
        <View style={[styles.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.text + '22' }]}>
          <Text style={{ color: theme.text + '88', fontSize: 12 }}>Font: {fontSize}px</Text>
          <Text style={{ color: theme.text + '88', fontSize: 12 }}>Tap layar untuk sembunyikan toolbar</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toolbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.sm, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  toolbarTitle: { flex: 1, fontWeight: '700', fontSize: 14, marginHorizontal: spacing.sm },
  controls: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: spacing.xs, marginHorizontal: 2 },
  fontBtn: { fontWeight: '800', fontSize: 15 },
  themeBtn: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4 },
  textContent: { paddingHorizontal: spacing.lg, paddingBottom: 80 },
  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: 8, borderTopWidth: 1,
  },
  btn: { paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: radius.md },
  btnText: { color: '#FFFFFF', fontWeight: '700' },
});