// src/screens/reviews/WriteReviewScreen.js
// Fitur 15: Beri Rating Bintang + Fitur 16: Tulis Review/Catatan Pribadi
// (digabung jadi satu screen karena keduanya disimpan bersama di tabel reviews)

import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTheme } from '../../store/ThemeContext';
import { reviewsApi } from '../../api/reviews';
import { getErrorMessage } from '../../api/client';
import ScreenHeader from '../../components/ScreenHeader';
import StarRating from '../../components/StarRating';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { spacing, fontSize } from '../../constants/theme';

export default function WriteReviewScreen({ navigation, route }) {
  const { book } = route.params;
  const { colors } = useTheme();
  const [rating, setRating] = useState(book.review?.rating || 0);
  const [note, setNote] = useState(book.review?.note || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (rating === 0) {
      Alert.alert('Beri Rating', 'Silakan beri rating bintang minimal 1 sebelum menyimpan.');
      return;
    }
    setLoading(true);
    try {
      await reviewsApi.upsert(book.id, rating, note.trim());
      navigation.goBack();
    } catch (err) {
      Alert.alert('Gagal menyimpan review', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Tulis Review" />
      <View style={styles.content}>
        <Text style={[styles.bookTitle, { color: colors.text }]}>{book.title}</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Bagaimana penilaianmu untuk buku ini?</Text>

        <View style={styles.starWrap}>
          <StarRating rating={rating} onChange={setRating} size={40} />
        </View>

        <FormInput
          label="Catatan / Review (opsional)"
          value={note}
          onChangeText={setNote}
          placeholder="Tulis kesan, kutipan favorit, atau hal yang kamu pelajari dari buku ini..."
          multiline
        />

        <PrimaryButton title="Simpan Review" onPress={handleSave} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, flex: 1 },
  bookTitle: { fontSize: fontSize.lg, fontWeight: '800', textAlign: 'center', marginBottom: spacing.xs },
  label: { fontSize: fontSize.sm, textAlign: 'center', marginBottom: spacing.md },
  starWrap: { alignItems: 'center', marginBottom: spacing.lg },
});
