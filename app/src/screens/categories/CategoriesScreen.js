// src/screens/categories/CategoriesScreen.js
// Fitur 18: Kategori/Genre Buku + Fitur 19: Tambah Kategori Custom

import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { useBookStore } from '../../store/useBookStore';
import { getErrorMessage } from '../../api/client';
import ScreenHeader from '../../components/ScreenHeader';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import EmptyState from '../../components/EmptyState';
import { spacing, fontSize, radius } from '../../constants/theme';

export default function CategoriesScreen({ navigation }) {
  const { colors } = useTheme();
  const { categories, fetchCategories, addCategory, removeCategory } = useBookStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchCategories().catch((err) => Alert.alert('Gagal memuat kategori', getErrorMessage(err)));
    }, [])
  );

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSaving(true);
    try {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Gagal menambah kategori', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category) => {
    if (category.is_default) {
      Alert.alert('Tidak Bisa Dihapus', 'Kategori default tidak bisa dihapus.');
      return;
    }
    Alert.alert('Hapus Kategori', `Hapus kategori "${category.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeCategory(category.id);
          } catch (err) {
            Alert.alert('Gagal menghapus', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Kategori Buku" rightIcon="add" onRightPress={() => setModalVisible(true)} />

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={<EmptyState icon="pricetag-outline" title="Belum ada kategori" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Home', { categoryFilter: item.id })}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              {!!item.is_default && (
                <View style={[styles.defaultBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>Default</Text>
                </View>
              )}
            </View>
            <View style={styles.rowRight}>
              <Text style={{ color: colors.textSecondary, marginRight: spacing.md }}>{item.book_count} buku</Text>
              {!item.is_default && (
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Tambah Kategori Baru</Text>
            <FormInput value={newCategoryName} onChangeText={setNewCategoryName} placeholder="Contoh: Filsafat" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.textSecondary }}>Batal</Text>
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <PrimaryButton title="Tambah" onPress={handleAddCategory} loading={saving} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: radius.md, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: fontSize.sm, fontWeight: '600', marginLeft: spacing.sm },
  defaultBadge: { paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: radius.sm, marginLeft: spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalCard: { borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', marginTop: spacing.sm, alignItems: 'center' },
  modalCancelBtn: { paddingVertical: 14, paddingHorizontal: spacing.md },
});
