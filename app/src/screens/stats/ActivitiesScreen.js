// src/screens/stats/ActivitiesScreen.js
// Fitur 24: Riwayat Aktivitas (timeline)

import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { statsApi } from '../../api/stats';
import { getErrorMessage } from '../../api/client';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import { spacing, fontSize, radius } from '../../constants/theme';

const ACTIVITY_ICONS = {
  tambah_buku: 'add-circle-outline',
  edit_buku: 'create-outline',
  hapus_buku: 'trash-outline',
  update_progress: 'bookmark-outline',
  selesai_baca: 'checkmark-circle-outline',
  beri_review: 'star-outline',
};

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr.replace(' ', 'T') + 'Z');
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ActivitiesScreen() {
  const { colors } = useTheme();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = useCallback(async () => {
    try {
      const res = await statsApi.getActivities(100);
      setActivities(res.data.data);
    } catch (err) {
      Alert.alert('Gagal memuat riwayat', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadActivities(); }, [loadActivities]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Riwayat Aktivitas" />
      <FlatList
        data={activities}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={
          !loading && <EmptyState icon="time-outline" title="Belum ada aktivitas" subtitle="Aktivitasmu akan tercatat di sini" />
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { borderColor: colors.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name={ACTIVITY_ICONS[item.type] || 'ellipse-outline'} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
              <Text style={[styles.time, { color: colors.textSecondary }]}>{formatRelativeTime(item.created_at)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, alignItems: 'flex-start' },
  iconWrap: { width: 36, height: 36, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  description: { fontSize: fontSize.sm, fontWeight: '500' },
  time: { fontSize: 11, marginTop: 2 },
});
