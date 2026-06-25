// src/screens/books/FavoritesScreen.js
// Fitur 21: Tandai Buku Favorit (halaman untuk melihat semua favorit)

import React, { useCallback, useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { booksApi } from '../../api/books';
import { getErrorMessage } from '../../api/client';
import { useBookStore } from '../../store/useBookStore';
import ScreenHeader from '../../components/ScreenHeader';
import BookCard from '../../components/BookCard';
import EmptyState from '../../components/EmptyState';
import { spacing } from '../../constants/theme';

export default function FavoritesScreen({ navigation }) {
  const { colors } = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const res = await booksApi.getAll({ favorite: '1' });
      setBooks(res.data.data);
    } catch (err) {
      Alert.alert('Gagal memuat favorit', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadFavorites(); }, [loadFavorites]));

  const handleToggleFavorite = async (id) => {
    await useBookStore.getState().toggleFavorite(id);
    setBooks((prev) => prev.filter((b) => b.id !== id)); // langsung hilang dari list saat di-unfavorite
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Buku Favorit" />
      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={
          !loading && (
            <EmptyState
              icon="heart-outline"
              title="Belum ada buku favorit"
              subtitle="Tandai buku kesayanganmu dengan ikon hati di halaman Detail Buku"
            />
          )
        }
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
            onToggleFavorite={() => handleToggleFavorite(item.id)}
          />
        )}
      />
    </View>
  );
}
