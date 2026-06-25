// src/screens/books/HomeScreen.js
// Fitur 7: Daftar Rak Buku (Home) + Fitur 13: Filter Status Baca
// Ini adalah pusat aplikasi — dari sini user menuju ke Detail, Tambah, Cari,
// dan Scan, sehingga semua fitur buku saling terhubung lewat screen ini.

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { useBookStore } from '../../store/useBookStore';
import { getErrorMessage } from '../../api/client';
import BookCard from '../../components/BookCard';
import EmptyState from '../../components/EmptyState';
import { spacing, fontSize, radius } from '../../constants/theme';

const FILTERS = [
  { key: null, label: 'Semua' },
  { key: 'belum_dibaca', label: 'Belum Dibaca' },
  { key: 'sedang_dibaca', label: 'Sedang Dibaca' },
  { key: 'selesai', label: 'Selesai' },
];

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { books, isLoadingBooks, fetchBooks } = useBookStore();
  const [activeFilter, setActiveFilter] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadBooks = useCallback(async (status) => {
    try {
      await fetchBooks(status ? { status } : {});
    } catch (err) {
      Alert.alert('Gagal memuat data', getErrorMessage(err));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBooks(activeFilter);
    }, [activeFilter])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBooks(activeFilter);
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Halo,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Pembaca'} 👋</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('SearchBook')} style={styles.searchBtn}>
          <Ionicons name="search" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(item) => String(item.key)}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === item.key ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setActiveFilter(item.key)}
          >
            <Text style={{ color: activeFilter === item.key ? '#FFFFFF' : colors.text, fontWeight: '600', fontSize: fontSize.xs }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          !isLoadingBooks && (
            <EmptyState
              icon="book-outline"
              title="Rak bukumu masih kosong"
              subtitle="Tambahkan buku pertamamu dengan tombol + di bawah"
            />
          )
        }
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
            onToggleFavorite={() => useBookStore.getState().toggleFavorite(item.id)}
          />
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={() => navigation.navigate('AddBook')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm,
  },
  greeting: { fontSize: fontSize.sm },
  userName: { fontSize: fontSize.xl, fontWeight: '800' },
  searchBtn: { padding: spacing.sm },
  filterRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full,
    borderWidth: 1, marginRight: spacing.sm,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2 },
  fab: {
    position: 'absolute', right: spacing.lg, bottom: spacing.lg,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
});
