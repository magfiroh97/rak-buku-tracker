// src/screens/books/PDFReaderScreen.js
// Fitur baca PDF/EPUB lokal dari storage HP user.
// File disimpan di app-specific storage (tidak perlu akses storage eksternal)
// menggunakan expo-file-system + expo-document-picker.
//
// CATATAN: react-native-pdf adalah native module.
// Fitur ini TIDAK BISA ditest di Expo Go — butuh development build lewat EAS.
// Saat dijalankan di Expo Go, akan muncul pesan informatif ke user.

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../store/ThemeContext';
import ScreenHeader from '../../components/ScreenHeader';
import { spacing, fontSize, radius } from '../../constants/theme';

// Cek apakah react-native-pdf tersedia (tidak tersedia di Expo Go)
let Pdf = null;
let pdfAvailable = false;
try {
  Pdf = require('react-native-pdf').default;
  pdfAvailable = true;
} catch (e) {
  pdfAvailable = false;
}

const PDF_DIR = FileSystem.documentDirectory + 'books/';

async function ensurePdfDir() {
  const info = await FileSystem.getInfoAsync(PDF_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PDF_DIR, { intermediates: true });
  }
}

export default function PDFReaderScreen({ route }) {
  const { book } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [pdfUri, setPdfUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Cek apakah sudah ada file tersimpan untuk buku ini
  useEffect(() => {
    checkExistingFile();
  }, []);

  const checkExistingFile = async () => {
    try {
      await ensurePdfDir();
      const filePath = PDF_DIR + `book_${book.id}.pdf`;
      const info = await FileSystem.getInfoAsync(filePath);
      if (info.exists) {
        setPdfUri(filePath);
      }
    } catch (e) {}
  };

  const handlePickFile = async () => {
    if (!pdfAvailable) {
      Alert.alert(
        'Fitur Belum Tersedia di Expo Go',
        'Fitur baca PDF membutuhkan development build.\n\n' +
        'Saat app sudah di-build dan install sebagai APK asli (bukan lewat Expo Go), ' +
        'fitur ini akan berfungsi penuh.\n\n' +
        'Langkah selanjutnya: build APK lewat EAS Build.',
        [{ text: 'Mengerti' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsLoading(false);
        return;
      }

      const picked = result.assets[0];
      await ensurePdfDir();

      const destPath = PDF_DIR + `book_${book.id}.pdf`;
      await FileSystem.copyAsync({ from: picked.uri, to: destPath });

      setPdfUri(destPath);
      Alert.alert('Berhasil', `File "${picked.name}" berhasil disimpan untuk buku ini.`);
    } catch (err) {
      Alert.alert('Gagal', 'Tidak bisa membuka file. Pastikan file adalah PDF yang valid.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = () => {
    Alert.alert('Hapus File', 'Hapus file PDF yang tersimpan untuk buku ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            const filePath = PDF_DIR + `book_${book.id}.pdf`;
            await FileSystem.deleteAsync(filePath, { idempotent: true });
            setPdfUri(null);
            setPage(1);
          } catch (e) {}
        },
      },
    ]);
  };

  // Tampilan saat PDF sudah tersedia dan react-native-pdf bisa dipakai
  if (pdfUri && pdfAvailable && Pdf) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
        <View style={[styles.pdfToolbar, { backgroundColor: '#2a2a2a', paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.pdfTitle} numberOfLines={1}>{book.title}</Text>
          <Text style={styles.pdfPageInfo}>{page}/{totalPages}</Text>
          <TouchableOpacity onPress={handleDeleteFile} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <Pdf
          source={{ uri: pdfUri, cache: true }}
          style={{ flex: 1 }}
          onLoadComplete={(numberOfPages) => setTotalPages(numberOfPages)}
          onPageChanged={(currentPage) => setPage(currentPage)}
          onError={(error) => Alert.alert('Gagal membaca PDF', 'File mungkin rusak atau tidak valid.')}
          enablePaging={false}
          horizontal={false}
          fitPolicy={0}
          enableAnnotationRendering={false}
          trustAllCerts={false}
        />
      </View>
    );
  }

  // Tampilan pilih file / info kalau belum ada PDF
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Baca File Lokal" />
      <View style={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="document-outline" size={48} color={colors.primary} />
          <Text style={[styles.infoTitle, { color: colors.text }]}>{book.title}</Text>
          <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
            Tambahkan file PDF buku ini dari storage HP kamu. File akan disimpan di dalam app untuk dibaca kapan saja.
          </Text>
        </View>

        {!pdfAvailable && (
          <View style={[styles.warnCard, { backgroundColor: colors.warning + '22', borderColor: colors.warning }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
            <Text style={[styles.warnText, { color: colors.text }]}>
              Fitur ini membutuhkan APK build asli. Saat ini kamu menggunakan Expo Go, jadi PDF reader belum aktif. Fitur akan berjalan penuh setelah app di-build lewat EAS.
            </Text>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          <TouchableOpacity
            style={[styles.pickBtn, { backgroundColor: colors.primary }]}
            onPress={handlePickFile}
          >
            <Ionicons name="folder-open-outline" size={20} color="#FFFFFF" />
            <Text style={styles.pickBtnText}>Pilih File PDF dari HP</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Tips: Kamu bisa mendapatkan file PDF dari Gramedia Digital, Google Play Books (export), atau sumber e-book legal lainnya.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  infoCard: {
    width: '100%', alignItems: 'center', borderRadius: radius.lg,
    borderWidth: 1, padding: spacing.lg, marginBottom: spacing.md,
  },
  infoTitle: { fontSize: fontSize.lg, fontWeight: '800', textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xs },
  infoDesc: { fontSize: fontSize.sm, textAlign: 'center', lineHeight: 20 },
  warnCard: {
    width: '100%', flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.md, gap: spacing.sm,
  },
  warnText: { flex: 1, fontSize: fontSize.xs, lineHeight: 18 },
  pickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: 14, paddingHorizontal: spacing.xl,
    borderRadius: radius.md, marginTop: spacing.sm,
  },
  pickBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: fontSize.md },
  hint: { fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },
  pdfToolbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.sm, paddingVertical: 10,
  },
  pdfTitle: { flex: 1, color: '#FFFFFF', fontWeight: '700', marginHorizontal: spacing.sm, fontSize: 14 },
  pdfPageInfo: { color: '#FFFFFF88', fontSize: 12, marginRight: spacing.xs },
  iconBtn: { padding: spacing.xs, marginHorizontal: 2 },
});