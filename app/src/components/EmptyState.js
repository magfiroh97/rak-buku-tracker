// src/components/EmptyState.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { spacing, fontSize } from '../constants/theme';

export default function EmptyState({ icon = 'book-outline', title, subtitle }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={colors.border} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl * 2 },
  title: { fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, marginTop: spacing.xs, textAlign: 'center', paddingHorizontal: spacing.lg },
});
