// src/screens/books/AddBookScreen.js
// Fitur 8: Tambah Buku Manual
// Bisa juga menerima data awal (prefill) dari hasil Search/Scan (Fitur 9)
// lewat route.params.prefill, sehingga fitur-fitur ini terhubung satu sama lain.

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/ThemeContext';
import { useBookStore } from '../../store/useBookStore';
import { getErrorMessage } from '../../api/client';
import ScreenHeader from '../../components/ScreenHeader';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { spacing, fontSize, radius } from '../../constants/theme';

export default function AddBookScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { categories, fetchCategories, addBook } = useBookStore();
  const prefill = route.params?.prefill;

  const [title, setTitle] = useState(prefill?.title || '');
  const [author, setAuthor] = useState(prefill?.author || '');
  const [isbn, setIsbn] = useState(prefill?.isbn || '');
  const [coverUrl, setCoverUrl] = useState(prefill?.cover_url || '');
  const [totalPages, setTotalPages] = useState(prefill?.total_pages ? String(prefill.total_pages) : '');
  const [categoryId, setCategoryId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories().catch(() => {});
  }, []);

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = 'Judul buku wajib diisi.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addBook({
        title: title.trim(),
        author: author.trim() || null,
        isbn: isbn.trim() || null,
        cover_url: coverUrl.trim() || null,
        total_pages: totalPages ? parseInt(totalPages, 10) : 0,
        category_id: categoryId,
        source: prefill ? prefill.source || 'google_books' : 'manual',
        is_public_domain: prefill?.is_public_domain || false,
        read_link: prefill?.read_link || null,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Gagal menyimpan buku', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Tambah Buku" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.coverPreview} />
        ) : null}

        <FormInput label="Judul Buku *" value={title} onChangeText={setTitle} placeholder="Contoh: Laskar Pelangi" error={errors.title} icon="book-outline" />
        <FormInput label="Penulis" value={author} onChangeText={setAuthor} placeholder="Contoh: Andrea Hirata" icon="person-outline" />
        <FormInput label="ISBN (opsional)" value={isbn} onChangeText={setIsbn} placeholder="Contoh: 9789799731404" keyboardType="number-pad" icon="barcode-outline" />
        <FormInput label="Jumlah Halaman" value={totalPages} onChangeText={setTotalPages} placeholder="Contoh: 300" keyboardType="number-pad" icon="documents-outline" />

        <Text style={[styles.label, { color: colors.text }]}>Kategori</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: categoryId === cat.id ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
            >
              <Text style={{ color: categoryId === cat.id ? '#FFFFFF' : colors.text, fontSize: fontSize.xs, fontWeight: '600' }}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <PrimaryButton title="Simpan ke Rak Buku" onPress={handleSave} loading={loading} />

        <TouchableOpacity
          style={styles.scanLink}
          onPress={() => navigation.navigate('SearchBook')}
        >
          <Ionicons name="camera-outline" size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, marginLeft: spacing.xs, fontWeight: '600' }}>
            Cari otomatis lewat judul / scan barcode
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  coverPreview: { width: 100, height: 150, borderRadius: radius.md, alignSelf: 'center', marginBottom: spacing.lg },
  label: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.sm },
  categoryChip: {
    paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full,
    borderWidth: 1, marginRight: spacing.sm,
  },
  scanLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
});
