// src/screens/books/ReadBookScreen.js
// Fitur Baca Buku (tambahan): menampilkan halaman pembaca RESMI Google Books
// di dalam WebView, HANYA untuk buku berstatus domain publik (is_public_domain).
//
// PENTING soal legalitas: kita TIDAK menyimpan, mengekstrak, atau menghosting
// teks buku sendiri di server kita. Kita murni menyalurkan ke
// books.google.com/books?id=... (link resmi Google), sama seperti membuka
// link itu di browser biasa. Ini membuat fitur ini aman secara hak cipta,
// karena Google sendiri yang menentukan & menyediakan akses baca gratisnya.

import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../store/ThemeContext';
import ScreenHeader from '../../components/ScreenHeader';
import { spacing, fontSize, radius } from '../../constants/theme';

export default function ReadBookScreen({ route }) {
  const { book } = route.params;
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!book.read_link) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="Baca Buku" />
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl }}>
            Tautan baca untuk buku ini tidak tersedia.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={book.title} />

      {isLoading && !hasError && (
        <View style={[styles.center, StyleSheet.absoluteFill, { backgroundColor: colors.background, zIndex: 1 }]}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Membuka halaman baca...</Text>
        </View>
      )}

      {hasError ? (
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
            Halaman baca tidak bisa ditampilkan langsung di dalam app.{'\n'}Coba buka lewat browser HP kamu.
          </Text>
          <TouchableOpacity
            style={[styles.fallbackBtn, { backgroundColor: colors.primary }]}
            onPress={() => Linking.openURL(book.read_link)}
          >
            <Text style={styles.fallbackBtnText}>Buka di Browser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          source={{ uri: book.read_link }}
          style={{ flex: 1 }}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onHttpError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          startInLoadingState={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: spacing.md, fontSize: fontSize.sm },
  fallbackBtn: { paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: radius.md },
  fallbackBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
