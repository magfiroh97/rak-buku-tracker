// src/screens/books/SearchBookScreen.js
// Fitur 9: Cari Buku via Google Books API & Scan Barcode ISBN
// Bagian pencarian teks. Tombol kamera membawa ke BarcodeScannerScreen,
// yang setelah berhasil scan akan memanggil googleBooksApi.searchByIsbn
// dan balik ke screen ini dengan hasil otomatis terisi.

import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/ThemeContext';
import { googleBooksApi } from '../../api/googleBooks';
import { getErrorMessage } from '../../api/client';
import ScreenHeader from '../../components/ScreenHeader';
import FormInput from '../../components/FormInput';
import EmptyState from '../../components/EmptyState';
import { spacing, fontSize, radius } from '../../constants/theme';

export default function SearchBookScreen({ navigation }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await googleBooksApi.search(query.trim());
      setResults(res.data.data);
    } catch (err) {
      Alert.alert('Gagal mencari buku', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (book) => {
    navigation.navigate('AddBook', {
      prefill: {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        cover_url: book.cover_url,
        total_pages: book.total_pages,
        source: 'google_books',
        is_public_domain: book.is_public_domain,
        read_link: book.read_link,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Cari Buku" />

      <View style={styles.searchSection}>
        <View style={{ flex: 1 }}>
          <FormInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari judul atau penulis..."
            icon="search-outline"
          />
        </View>
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.primary }]} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.scanBtn, { borderColor: colors.primary }]}
        onPress={() => navigation.navigate('BarcodeScanner')}
      >
        <Ionicons name="camera-outline" size={20} color={colors.primary} />
        <Text style={{ color: colors.primary, fontWeight: '700', marginLeft: spacing.sm }}>
          Scan Barcode ISBN
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => item.google_id || String(idx)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            hasSearched ? (
              <EmptyState icon="search-outline" title="Buku tidak ditemukan" subtitle="Coba kata kunci lain" />
            ) : (
              <EmptyState icon="book-outline" title="Cari buku untuk ditambahkan" subtitle="Ketik judul atau penulis, atau scan barcode ISBN" />
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleSelectBook(item)}
            >
              <Image
                source={{ uri: item.cover_url || 'https://via.placeholder.com/80x120.png?text=No+Cover' }}
                style={styles.cover}
              />
              <View style={styles.info}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>{item.author}</Text>
                {item.published_date && (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>Terbit: {item.published_date}</Text>
                )}
                {!!item.is_public_domain && (
                  <View style={[styles.freeBadge, { backgroundColor: colors.success + '22' }]}>
                    <Ionicons name="book-outline" size={11} color={colors.success} />
                    <Text style={[styles.freeBadgeText, { color: colors.success }]}>Gratis Dibaca</Text>
                  </View>
                )}
              </View>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchSection: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm, alignItems: 'flex-start' },
  searchBtn: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginLeft: spacing.sm },
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.md, paddingVertical: 12,
    borderRadius: radius.md, borderWidth: 1.5,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  resultCard: { flexDirection: 'row', borderRadius: radius.md, borderWidth: 1, padding: spacing.sm, marginBottom: spacing.sm, alignItems: 'center' },
  cover: { width: 50, height: 75, borderRadius: radius.sm, backgroundColor: '#ddd' },
  info: { flex: 1, marginHorizontal: spacing.sm },
  title: { fontSize: fontSize.sm, fontWeight: '700' },
  author: { fontSize: fontSize.xs, marginTop: 2 },
  meta: { fontSize: 11, marginTop: 2 },
  freeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 4, gap: 3 },
  freeBadgeText: { fontSize: 10, fontWeight: '700' },
});
