// src/screens/books/BarcodeScannerScreen.js
// Fitur 9 (bagian kamera): Scan Barcode ISBN
//
// Memakai CameraView dari expo-camera (bukan expo-barcode-scanner yang sudah
// deprecated/dihapus dari Expo SDK terbaru). Setelah barcode ISBN terbaca,
// langsung dipanggil ke backend untuk lookup data buku via Google Books API.

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/ThemeContext';
import { googleBooksApi } from '../../api/googleBooks';
import { getErrorMessage } from '../../api/client';
import PrimaryButton from '../../components/PrimaryButton';
import { spacing, fontSize, radius } from '../../constants/theme';

export default function BarcodeScannerScreen({ navigation }) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [isLooking, setIsLooking] = useState(false);
  const hasScannedRef = useRef(false); // cegah scan ganda beruntun

  const handleBarcodeScanned = async ({ data }) => {
    if (hasScannedRef.current || isLooking) return;

    // Barcode buku biasanya EAN-13 berupa ISBN-13 (diawali 978/979)
    const cleaned = data.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) return;

    hasScannedRef.current = true;
    setIsLooking(true);

    try {
      const res = await googleBooksApi.searchByIsbn(cleaned);
      const book = res.data.data;
      navigation.replace('AddBook', {
        prefill: {
          title: book.title,
          author: book.author,
          isbn: book.isbn || cleaned,
          cover_url: book.cover_url,
          total_pages: book.total_pages,
          source: 'isbn_scan',
        },
      });
    } catch (err) {
      Alert.alert(
        'Buku tidak ditemukan',
        getErrorMessage(err) + '\n\nKamu tetap bisa menambahkan buku ini secara manual.',
        [
          { text: 'Coba Scan Lagi', onPress: () => { hasScannedRef.current = false; } },
          {
            text: 'Tambah Manual',
            onPress: () => navigation.replace('AddBook', { prefill: { isbn: cleaned, source: 'isbn_scan' } }),
          },
        ]
      );
    } finally {
      setIsLooking(false);
    }
  };

  if (!permission) {
    return <View style={[styles.container, { backgroundColor: '#000' }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="camera-outline" size={56} color={colors.textSecondary} />
        <Text style={[styles.permissionTitle, { color: colors.text }]}>Izin Kamera Diperlukan</Text>
        <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>
          Aplikasi butuh akses kamera untuk memindai barcode ISBN buku.
        </Text>
        <View style={{ marginTop: spacing.lg, width: '100%' }}>
          <PrimaryButton title="Izinkan Akses Kamera" onPress={requestPermission} />
        </View>
        <TouchableOpacity style={{ marginTop: spacing.md }} onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.textSecondary }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.frameContainer}>
          <View style={styles.scanFrame} />
          <Text style={styles.hintText}>Arahkan kamera ke barcode di belakang buku</Text>
        </View>

        {isLooking && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.loadingText}>Mencari data buku...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  closeBtn: { margin: spacing.lg, alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radius.full, padding: spacing.sm },
  frameContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  scanFrame: { width: 260, height: 160, borderWidth: 2, borderColor: '#FFFFFF', borderRadius: radius.md },
  hintText: { color: '#FFFFFF', marginTop: spacing.lg, fontSize: fontSize.sm, textAlign: 'center', paddingHorizontal: spacing.xl },
  loadingBox: { alignItems: 'center', paddingBottom: spacing.xl * 2 },
  loadingText: { color: '#FFFFFF', marginTop: spacing.sm },
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  permissionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginTop: spacing.md },
  permissionDesc: { fontSize: fontSize.sm, textAlign: 'center', marginTop: spacing.xs },
});
