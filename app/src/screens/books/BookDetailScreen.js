// src/screens/books/BookDetailScreen.js
// Fitur 10: Detail Buku — pusat aksi ke Edit (11), Hapus (12),
// Update Progress (14), dan Tulis Review (16).

import React, { useCallback, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { booksApi } from '../../api/books';
import { useBookStore } from '../../store/useBookStore';
import { getErrorMessage } from '../../api/client';
import StarRating from '../../components/StarRating';
import { spacing, fontSize, radius, statusLabels, statusColors } from '../../constants/theme';

export default function BookDetailScreen({ navigation, route }) {
  const { bookId } = route.params;
  const { colors } = useTheme();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    try {
      const res = await booksApi.getById(bookId);
      setBook(res.data.data);
    } catch (err) {
      Alert.alert('Gagal memuat detail', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail])
  );

  const handleDelete = () => {
    Alert.alert(
      'Hapus Buku',
      `Yakin ingin menghapus "${book?.title}" dari rak? Tindakan ini tidak bisa dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await useBookStore.getState().removeBook(bookId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Gagal menghapus', getErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async () => {
    try {
      await useBookStore.getState().toggleFavorite(bookId);
      setBook((prev) => ({ ...prev, is_favorite: prev.is_favorite ? 0 : 1 }));
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  const handleToggleWishlist = async () => {
    try {
      await useBookStore.getState().toggleWishlist(bookId);
      setBook((prev) => ({ ...prev, is_wishlist: prev.is_wishlist ? 0 : 1 }));
    } catch (err) {
      Alert.alert('Gagal', getErrorMessage(err));
    }
  };

  if (loading || !book) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const progressPercent = book.total_pages > 0 ? Math.round((book.current_page / book.total_pages) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Image
            source={{ uri: book.cover_url || 'https://via.placeholder.com/140x210.png?text=No+Cover' }}
            style={styles.cover}
          />
          <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
          <Text style={[styles.author, { color: colors.textSecondary }]}>{book.author || 'Penulis tidak diketahui'}</Text>

          <View style={[styles.statusBadge, { backgroundColor: statusColors[book.status] + '22' }]}>
            <Text style={{ color: statusColors[book.status], fontWeight: '700', fontSize: fontSize.xs }}>
              {statusLabels[book.status]}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.iconAction} onPress={handleToggleFavorite}>
              <Ionicons name={book.is_favorite ? 'heart' : 'heart-outline'} size={24} color={book.is_favorite ? colors.danger : colors.text} />
              <Text style={[styles.iconActionLabel, { color: colors.textSecondary }]}>Favorit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconAction} onPress={handleToggleWishlist}>
              <Ionicons name={book.is_wishlist ? 'bookmark' : 'bookmark-outline'} size={24} color={book.is_wishlist ? colors.accent : colors.text} />
              <Text style={[styles.iconActionLabel, { color: colors.textSecondary }]}>Wishlist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconAction} onPress={() => navigation.navigate('EditBook', { book })}>
              <Ionicons name="create-outline" size={24} color={colors.text} />
              <Text style={[styles.iconActionLabel, { color: colors.textSecondary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconAction} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color={colors.danger} />
              <Text style={[styles.iconActionLabel, { color: colors.danger }]}>Hapus</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!!book.is_public_domain && !!book.read_link && (
          <TouchableOpacity
            style={[styles.readBookCard, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('ReadBook', { book })}
            activeOpacity={0.85}
          >
            <Ionicons name="book-outline" size={22} color="#FFFFFF" />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text style={styles.readBookTitle}>Baca Buku Ini</Text>
              <Text style={styles.readBookSubtitle}>Tersedia gratis — buku domain publik via Google Books</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {book.total_pages > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Progres Membaca</Text>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{progressPercent}%</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.pageText, { color: colors.textSecondary }]}>
              Halaman {book.current_page} dari {book.total_pages}
            </Text>
            <TouchableOpacity
              style={[styles.updateBtn, { borderColor: colors.primary }]}
              onPress={() => navigation.navigate('UpdateProgress', { book })}
            >
              <Ionicons name="bookmark-outline" size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700', marginLeft: spacing.xs }}>Update Progress</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Rating & Review Saya</Text>
          </View>
          <StarRating rating={book.review?.rating || 0} readOnly size={22} />
          {book.review?.note ? (
            <Text style={[styles.reviewNote, { color: colors.text }]}>{book.review.note}</Text>
          ) : (
            <Text style={[styles.reviewNote, { color: colors.textSecondary }]}>Belum ada catatan review.</Text>
          )}
          <TouchableOpacity
            style={[styles.updateBtn, { borderColor: colors.primary, marginTop: spacing.sm }]}
            onPress={() => navigation.navigate('WriteReview', { book })}
          >
            <Ionicons name="star-outline" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', marginLeft: spacing.xs }}>
              {book.review ? 'Edit Review' : 'Tulis Review'}
            </Text>
          </TouchableOpacity>
        </View>

        {book.isbn && (
          <Text style={[styles.isbnText, { color: colors.textSecondary }]}>ISBN: {book.isbn}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  backBtn: { marginBottom: spacing.sm },
  headerSection: { alignItems: 'center', marginBottom: spacing.lg },
  cover: { width: 140, height: 210, borderRadius: radius.md, marginBottom: spacing.md, backgroundColor: '#ddd' },
  title: { fontSize: fontSize.xl, fontWeight: '800', textAlign: 'center' },
  author: { fontSize: fontSize.sm, marginTop: 4 },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full, marginTop: spacing.sm },
  actionRow: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.lg },
  iconAction: { alignItems: 'center' },
  iconActionLabel: { fontSize: 11, marginTop: 2 },
  card: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  readBookCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.md,
  },
  readBookTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: fontSize.sm },
  readBookSubtitle: { color: '#FFFFFF', opacity: 0.85, fontSize: 11, marginTop: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700' },
  progressTrack: { height: 8, borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: '100%' },
  pageText: { fontSize: fontSize.xs, marginTop: spacing.xs },
  updateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: radius.md, paddingVertical: 10, marginTop: spacing.md },
  reviewNote: { fontSize: fontSize.sm, marginTop: spacing.sm, lineHeight: 20 },
  isbnText: { fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.sm },
});
