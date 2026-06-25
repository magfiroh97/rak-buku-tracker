// src/screens/books/WishlistScreen.js
// Fitur 20: Wishlist (buku ingin dibaca)

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

export default function WishlistScreen({ navigation }) {
  const { colors } = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    try {
      const res = await booksApi.getAll({ wishlist: '1' });
      setBooks(res.data.data);
    } catch (err) {
      Alert.alert('Gagal memuat wishlist', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadWishlist(); }, [loadWishlist]));

  const handleToggleFavorite = async (id) => {
    await useBookStore.getState().toggleFavorite(id);
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, is_favorite: b.is_favorite ? 0 : 1 } : b)));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Wishlist" />
      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={
          !loading && (
            <EmptyState
              icon="bookmark-outline"
              title="Belum ada buku di wishlist"
              subtitle="Tandai buku yang ingin kamu baca nanti dari halaman Detail Buku"
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
