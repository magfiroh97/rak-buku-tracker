// src/screens/OnboardingScreen.js
// Fitur 2: Onboarding — diperlihatkan sekali ke user baru sebelum Register/Login.
// Status "sudah lihat onboarding" disimpan di AsyncStorage agar tidak muncul lagi.

import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../store/ThemeContext';
import { spacing, fontSize, radius } from '../constants/theme';

const { width } = Dimensions.get('window');
export const ONBOARDING_KEY = 'rakbuku_has_onboarded';

const SLIDES = [
  {
    icon: 'book',
    title: 'Catat Semua Bukumu',
    description: 'Simpan setiap buku yang ingin, sedang, dan sudah kamu baca dalam satu rak digital.',
  },
  {
    icon: 'camera',
    title: 'Scan & Cari Otomatis',
    description: 'Pindai barcode buku atau cari lewat judul — data buku terisi otomatis dari Google Books.',
  },
  {
    icon: 'stats-chart',
    title: 'Pantau Progres Membaca',
    description: 'Lihat statistik, capai target tahunan, dan rayakan setiap buku yang selesai kamu baca.',
  },
];

export default function OnboardingScreen({ onFinish }) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  const handleFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onFinish();
  };

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      handleFinish();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.skipBtn} onPress={handleFinish}>
        <Text style={{ color: colors.textSecondary }}>Lewati</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name={item.icon} size={64} color={colors.primary} />
            </View>
            <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.slideDesc, { color: colors.textSecondary }]}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === index ? colors.primary : colors.border },
              i === index && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={handleNext}>
        <Text style={styles.nextBtnText}>{index === SLIDES.length - 1 ? 'Mulai' : 'Lanjut'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { alignSelf: 'flex-end', padding: spacing.lg },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  iconCircle: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
  },
  slideTitle: { fontSize: fontSize.xl, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm },
  slideDesc: { fontSize: fontSize.md, textAlign: 'center', lineHeight: 22 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  dotActive: { width: 24 },
  nextBtn: {
    marginHorizontal: spacing.xl, marginBottom: spacing.xl,
    paddingVertical: 14, borderRadius: radius.md, alignItems: 'center',
  },
  nextBtnText: { color: '#FFFFFF', fontSize: fontSize.md, fontWeight: '700' },
});
