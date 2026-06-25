// src/screens/SplashScreen.js
// Fitur 1: Splash Screen — ditampilkan singkat saat app pertama dibuka,
// sambil AuthStore mengecek apakah ada token tersimpan (lihat RootNavigator).

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { fontSize, spacing } from '../constants/theme';

export default function SplashScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Ionicons name="library" size={80} color="#FFFFFF" />
      <Text style={styles.title}>Rak Buku Tracker</Text>
      <Text style={styles.subtitle}>Lacak setiap halaman yang kamu baca</Text>
      <ActivityIndicator color="#FFFFFF" style={{ marginTop: spacing.xl }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: '#FFFFFF', marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: '#FFFFFF', opacity: 0.85, marginTop: spacing.xs },
});
