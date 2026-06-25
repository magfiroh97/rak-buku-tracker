// src/screens/books/EditBookScreen.js
// Fitur 11: Edit Buku

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../store/ThemeContext';
import { useBookStore } from '../../store/useBookStore';
import { getErrorMessage } from '../../api/client';
import ScreenHeader from '../../components/ScreenHeader';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { spacing, fontSize, radius } from '../../constants/theme';

export default function EditBookScreen({ navigation, route }) {
  const { book } = route.params;
  const { colors } = useTheme();
  const { categories, fetchCategories, editBook } = useBookStore();

  const [title, setTitle] = useState(book.title || '');
  const [author, setAuthor] = useState(book.author || '');
  const [isbn, setIsbn] = useState(book.isbn || '');
  const [totalPages, setTotalPages] = useState(book.total_pages ? String(book.total_pages) : '');
  const [categoryId, setCategoryId] = useState(book.category_id);
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
      await editBook(book.id, {
        title: title.trim(),
        author: author.trim() || null,
        isbn: isbn.trim() || null,
        total_pages: totalPages ? parseInt(totalPages, 10) : 0,
        category_id: categoryId,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Gagal menyimpan perubahan', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Edit Buku" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <FormInput label="Judul Buku *" value={title} onChangeText={setTitle} error={errors.title} icon="book-outline" />
        <FormInput label="Penulis" value={author} onChangeText={setAuthor} icon="person-outline" />
        <FormInput label="ISBN" value={isbn} onChangeText={setIsbn} keyboardType="number-pad" icon="barcode-outline" />
        <FormInput label="Jumlah Halaman" value={totalPages} onChangeText={setTotalPages} keyboardType="number-pad" icon="documents-outline" />

        <Text style={[styles.label, { color: colors.text }]}>Kategori</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                { backgroundColor: categoryId === cat.id ? colors.primary : colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
            >
              <Text style={{ color: categoryId === cat.id ? '#FFFFFF' : colors.text, fontSize: fontSize.xs, fontWeight: '600' }}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <PrimaryButton title="Simpan Perubahan" onPress={handleSave} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  label: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.sm },
  categoryChip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, marginRight: spacing.sm },
});
