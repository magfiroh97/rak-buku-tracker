// src/screens/stats/StatsScreen.js
// Fitur 22: Statistik Membaca (grafik) + Fitur 23: Target Membaca Tahunan
// (digabung di satu screen karena keduanya tampil bersamaan secara natural
// sebagai "dashboard" pembaca, lalu ada tombol ke Riwayat Aktivitas terpisah)

import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeContext';
import { statsApi } from '../../api/stats';
import { getErrorMessage } from '../../api/client';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { spacing, fontSize, radius } from '../../constants/theme';

const { width } = Dimensions.get('window');
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

export default function StatsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [saving, setSaving] = useState(false);

  const currentYear = new Date().getFullYear();

  const loadData = useCallback(async () => {
    try {
      const [statsRes, goalRes] = await Promise.all([
        statsApi.getStats(currentYear),
        statsApi.getGoal(currentYear),
      ]);
      setStats(statsRes.data.data);
      setGoal(goalRes.data.data);
      setTargetInput(goalRes.data.data.target_books ? String(goalRes.data.data.target_books) : '');
    } catch (err) {
      Alert.alert('Gagal memuat statistik', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSaveGoal = async () => {
    const target = parseInt(targetInput, 10);
    if (!target || target < 1) {
      Alert.alert('Target tidak valid', 'Masukkan jumlah target buku yang valid.');
      return;
    }
    setSaving(true);
    try {
      await statsApi.setGoal(currentYear, target);
      setModalVisible(false);
      loadData();
    } catch (err) {
      Alert.alert('Gagal menyimpan target', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !stats) {
    return <View style={[styles.center, { backgroundColor: colors.background }]} />;
  }

  const monthlyData = Array(12).fill(0);
  (stats.finished_per_month || []).forEach((row) => {
    const idx = parseInt(row.month, 10) - 1;
    if (idx >= 0 && idx < 12) monthlyData[idx] = row.total;
  });

  const totalBooks = (stats.total_by_status || []).reduce((sum, s) => sum + s.total, 0);
  const goalPercent = goal?.target_books ? goal.progress_percent : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Statistik Membaca</Text>

      <View style={styles.statsRow}>
        <StatBox label="Total Buku" value={totalBooks} colors={colors} />
        <StatBox label="Selesai Tahun Ini" value={stats.total_finished_this_year} colors={colors} />
        <StatBox label="Rating Rata-rata" value={stats.average_rating || '-'} colors={colors} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Target Membaca {currentYear}</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {goal?.target_books ? (
          <>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${goalPercent}%`, backgroundColor: colors.accent }]} />
            </View>
            <Text style={[styles.goalText, { color: colors.textSecondary }]}>
              {goal.finished_books} dari {goal.target_books} buku ({goalPercent}%)
            </Text>
          </>
        ) : (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Atur target membaca tahun ini</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, marginBottom: spacing.sm }]}>Buku Selesai per Bulan</Text>
        <BarChart
          data={{ labels: MONTH_LABELS, datasets: [{ data: monthlyData }] }}
          width={width - spacing.lg * 2 - spacing.md * 2}
          height={200}
          fromZero
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: () => colors.primary,
            labelColor: () => colors.textSecondary,
            barPercentage: 0.6,
          }}
          style={{ borderRadius: radius.md }}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, marginBottom: spacing.sm }]}>Genre Favorit</Text>
        {stats.genre_distribution.length === 0 ? (
          <Text style={{ color: colors.textSecondary }}>Belum ada data genre.</Text>
        ) : (
          stats.genre_distribution.map((g) => (
            <View key={g.category} style={styles.genreRow}>
              <Text style={{ color: colors.text, flex: 1 }}>{g.category}</Text>
              <Text style={{ color: colors.textSecondary }}>{g.total} buku</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={[styles.activityBtn, { borderColor: colors.primary }]}
        onPress={() => navigation.navigate('Activities')}
      >
        <Ionicons name="time-outline" size={18} color={colors.primary} />
        <Text style={{ color: colors.primary, fontWeight: '700', marginLeft: spacing.sm }}>Lihat Riwayat Aktivitas</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Target Membaca {currentYear}</Text>
            <FormInput
              label="Jumlah buku yang ingin dibaca"
              value={targetInput}
              onChangeText={setTargetInput}
              keyboardType="number-pad"
              placeholder="Contoh: 24"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.textSecondary }}>Batal</Text>
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <PrimaryButton title="Simpan" onPress={handleSaveGoal} loading={saving} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function StatBox({ label, value, colors }) {
  return (
    <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  headerTitle: { fontSize: fontSize.xl, fontWeight: '800', marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statBox: { flex: 1, borderRadius: radius.md, borderWidth: 1, padding: spacing.sm, alignItems: 'center' },
  statValue: { fontSize: fontSize.lg, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2, textAlign: 'center' },
  card: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700' },
  progressTrack: { height: 10, borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: '100%' },
  goalText: { fontSize: fontSize.xs, marginTop: spacing.xs },
  genreRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  activityBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: radius.md, paddingVertical: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalCard: { borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', marginTop: spacing.sm, alignItems: 'center' },
  modalCancelBtn: { paddingVertical: 14, paddingHorizontal: spacing.md },
});
