// src/components/StarRating.js
// Dipakai di Fitur 15 (Beri Rating Bintang) dan untuk menampilkan rating di
// Detail Buku & Daftar Review.

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';

export default function StarRating({ rating = 0, onChange, size = 28, readOnly = false }) {
  const { colors } = useTheme();
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          disabled={readOnly}
          onPress={() => onChange && onChange(star)}
          style={{ marginRight: 4 }}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? colors.star : colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
});
