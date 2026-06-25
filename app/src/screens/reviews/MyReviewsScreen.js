// src/screens/reviews/MyReviewsScreen.js
// Fitur 17: Lihat Semua Review Saya

import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { reviewsApi } from '../../api/reviews';
import { getErrorMessage } from '../../api/client';
import ScreenHeader from '../../components/ScreenHeader';
import StarRating from '../../components/StarRating';
import EmptyState from '../../components/EmptyState';
import { spacing, fontSize, radius } from '../../constants/theme';

export default function MyReviewsScreen({ navigation }) {
  const { colors } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      const res = await reviewsApi.getAll();
      setReviews(res.data.data);
    } catch (err) {
      Alert.alert('Gagal memuat review', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadReviews(); }, [loadReviews]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Review Saya" />
      <FlatList
        data={reviews}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={
          !loading && (
            <EmptyState
              icon="star-outline"
              title="Belum ada review"
              subtitle="Beri rating dan tulis kesanmu setelah membaca buku"
            />
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('BookDetail', { bookId: item.book_id })}
          >
            <Image
              source={{ uri: item.book_cover || 'https://via.placeholder.com/60x90.png?text=No+Cover' }}
              style={styles.cover}
            />
            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.book_title}</Text>
              <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>{item.book_author}</Text>
              <StarRating rating={item.rating} readOnly size={16} />
              {item.note && (
                <Text style={[styles.note, { color: colors.text }]} numberOfLines={2}>{item.note}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: radius.md, borderWidth: 1, padding: spacing.sm, marginBottom: spacing.sm },
  cover: { width: 50, height: 75, borderRadius: radius.sm, backgroundColor: '#ddd' },
  info: { flex: 1, marginLeft: spacing.sm },
  title: { fontSize: fontSize.sm, fontWeight: '700' },
  author: { fontSize: fontSize.xs, marginBottom: 4 },
  note: { fontSize: fontSize.xs, marginTop: 4, lineHeight: 16 },
});
