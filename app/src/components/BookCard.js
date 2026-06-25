// src/components/BookCard.js
// Dipakai di Home, Wishlist, Favorites, Search results — kartu buku konsisten
// di semua screen supaya tampilan app terasa terhubung satu sama lain.

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { spacing, radius, fontSize, statusLabels, statusColors } from '../constants/theme';

export default function BookCard({ book, onPress, onToggleFavorite }) {
  const { colors } = useTheme();
  const progressPercent =
    book.total_pages > 0 ? Math.min(100, Math.round((book.current_page / book.total_pages) * 100)) : 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: book.cover_url || 'https://via.placeholder.com/100x150.png?text=No+Cover' }}
        style={styles.cover}
      />
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
          {book.author || 'Penulis tidak diketahui'}
        </Text>

        <View style={[styles.statusBadge, { backgroundColor: statusColors[book.status] + '22' }]}>
          <Text style={[styles.statusText, { color: statusColors[book.status] }]}>
            {statusLabels[book.status]}
          </Text>
        </View>

        {book.status === 'sedang_dibaca' && book.total_pages > 0 && (
          <View style={styles.progressRow}>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>{progressPercent}%</Text>
          </View>
        )}
      </View>

      {onToggleFavorite && (
        <TouchableOpacity style={styles.favoriteBtn} onPress={onToggleFavorite}>
          <Ionicons
            name={book.is_favorite ? 'heart' : 'heart-outline'}
            size={20}
            color={book.is_favorite ? colors.danger : colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  cover: { width: 64, height: 96, borderRadius: radius.sm, backgroundColor: '#ddd' },
  info: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  title: { fontSize: fontSize.sm, fontWeight: '700', marginBottom: 2 },
  author: { fontSize: fontSize.xs, marginBottom: spacing.xs },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  progressTrack: { flex: 1, height: 5, borderRadius: radius.full, overflow: 'hidden', marginRight: spacing.xs },
  progressFill: { height: '100%' },
  progressText: { fontSize: 11 },
  favoriteBtn: { padding: spacing.xs, justifyContent: 'center' },
});
