// src/screens/books/UpdateProgressScreen.js
// Fitur 14: Update Progress Baca (halaman ke-X)
// Backend otomatis mengubah status book jadi sedang_dibaca/selesai
// berdasarkan nilai current_page yang dikirim dari sini.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../store/ThemeContext';
import { useBookStore } from '../../store/useBookStore';
import { getErrorMessage } from '../../api/client';
import ScreenHeader from '../../components/ScreenHeader';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { spacing, fontSize, radius } from '../../constants/theme';

export default function UpdateProgressScreen({ navigation, route }) {
  const { book } = route.params;
  const { colors } = useTheme();
  const [currentPage, setCurrentPage] = useState(book.current_page || 0);
  const [pageInput, setPageInput] = useState(String(book.current_page || 0));
  const [loading, setLoading] = useState(false);

  const totalPages = book.total_pages || 1;
  const percent = Math.min(100, Math.round((currentPage / totalPages) * 100));

  const handleSliderChange = (value) => {
    const page = Math.round(value);
    setCurrentPage(page);
    setPageInput(String(page));
  };

  const handleInputChange = (text) => {
    setPageInput(text);
    const num = parseInt(text, 10);
    if (!isNaN(num)) {
      setCurrentPage(Math.min(num, totalPages));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await useBookStore.getState().updateProgress(book.id, currentPage);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Gagal update progress', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFinished = () => {
    setCurrentPage(totalPages);
    setPageInput(String(totalPages));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Update Progress" />
      <View style={styles.content}>
        <Text style={[styles.bookTitle, { color: colors.text }]}>{book.title}</Text>

        <View style={styles.percentCircleWrap}>
          <Text style={[styles.percentText, { color: colors.primary }]}>{percent}%</Text>
          <Text style={[styles.percentLabel, { color: colors.textSecondary }]}>selesai dibaca</Text>
        </View>

        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={totalPages}
          step={1}
          value={currentPage}
          onValueChange={handleSliderChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />

        <View style={styles.pageInputRow}>
          <Text style={{ color: colors.textSecondary }}>Halaman ke-</Text>
          <View style={{ width: 100, marginLeft: spacing.sm }}>
            <FormInput value={pageInput} onChangeText={handleInputChange} keyboardType="number-pad" />
          </View>
          <Text style={{ color: colors.textSecondary, marginLeft: spacing.sm }}>dari {totalPages}</Text>
        </View>

        <TouchableOpacity style={[styles.finishBtn, { borderColor: colors.success }]} onPress={handleMarkFinished}>
          <Text style={{ color: colors.success, fontWeight: '700' }}>Tandai Selesai Dibaca</Text>
        </TouchableOpacity>

        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton title="Simpan Progress" onPress={handleSave} loading={loading} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, flex: 1 },
  bookTitle: { fontSize: fontSize.lg, fontWeight: '800', textAlign: 'center', marginBottom: spacing.lg },
  percentCircleWrap: { alignItems: 'center', marginBottom: spacing.lg },
  percentText: { fontSize: 48, fontWeight: '800' },
  percentLabel: { fontSize: fontSize.sm },
  pageInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  finishBtn: { borderWidth: 1.5, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', marginTop: spacing.lg },
});
