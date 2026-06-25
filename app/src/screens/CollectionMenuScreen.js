// src/screens/CollectionMenuScreen.js
// Hub navigasi untuk tab "Koleksi" — menghubungkan Fitur 17 (Review Saya),
// 18 (Kategori), 20 (Wishlist), 21 (Favorit) dalam satu menu yang rapi,
// daripada membuat 4 tab terpisah yang akan membuat bottom tab terlalu padat.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { spacing, fontSize, radius } from '../constants/theme';

const MENU_ITEMS = [
  { key: 'Wishlist', icon: 'bookmark-outline', title: 'Wishlist', subtitle: 'Buku yang ingin kamu baca' },
  { key: 'Favorites', icon: 'heart-outline', title: 'Buku Favorit', subtitle: 'Buku kesayanganmu' },
  { key: 'Categories', icon: 'pricetag-outline', title: 'Kategori', subtitle: 'Atur genre buku kamu' },
  { key: 'MyReviews', icon: 'star-outline', title: 'Review Saya', subtitle: 'Semua rating & catatanmu' },
];

export default function CollectionMenuScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Koleksi Saya</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate(item.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name={item.icon} size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  scroll: { padding: spacing.lg },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  iconWrap: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700' },
  cardSubtitle: { fontSize: fontSize.xs, marginTop: 2 },
});
