// src/screens/profile/SettingsScreen.js
// Fitur 6: Pengaturan (tema, notifikasi reminder [terhubung ke Fitur 25], logout)

import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../store/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/auth';
import { getErrorMessage } from '../../api/client';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../../utils/notifications';
import ScreenHeader from '../../components/ScreenHeader';
import { spacing, fontSize, radius } from '../../constants/theme';

export default function SettingsScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [notifEnabled, setNotifEnabled] = useState(!!user?.notif_enabled);
  const [reminderTime, setReminderTime] = useState(new Date(new Date().setHours(20, 0, 0, 0)));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleToggleNotif = async (value) => {
    setNotifEnabled(value);
    try {
      if (value) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          Alert.alert('Izin Ditolak', 'Aktifkan izin notifikasi di pengaturan HP untuk memakai fitur ini.');
          setNotifEnabled(false);
          return;
        }
        await scheduleDailyReminder(reminderTime.getHours(), reminderTime.getMinutes());
      } else {
        await cancelDailyReminder();
      }
      await authApi.updateSettings({ notif_enabled: value });
    } catch (err) {
      Alert.alert('Gagal menyimpan pengaturan', getErrorMessage(err));
    }
  };

  const handleTimeChange = async (event, selectedDate) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReminderTime(selectedDate);
      if (notifEnabled) {
        await scheduleDailyReminder(selectedDate.getHours(), selectedDate.getMinutes());
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Pengaturan" showBack={false} />

      <View style={styles.content}>
        <SectionLabel text="Akun" colors={colors} />
        <SettingRow
          icon="person-outline"
          label="Edit Profil"
          colors={colors}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingRow
          icon="lock-closed-outline"
          label="Ubah Password"
          colors={colors}
          onPress={() => navigation.navigate('ChangePassword')}
        />

        <SectionLabel text="Tampilan" colors={colors} />
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon-outline" size={20} color={colors.text} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Mode Gelap</Text>
          </View>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: colors.primary }} />
        </View>

        <SectionLabel text="Notifikasi" colors={colors} />
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Pengingat Membaca Harian</Text>
          </View>
          <Switch value={notifEnabled} onValueChange={handleToggleNotif} trackColor={{ true: colors.primary }} />
        </View>
        {notifEnabled && (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="time-outline" size={20} color={colors.text} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>Jam Pengingat</Text>
            </View>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>
              {reminderTime.getHours().toString().padStart(2, '0')}:{reminderTime.getMinutes().toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        )}
        {showTimePicker && (
          <DateTimePicker value={reminderTime} mode="time" is24Hour onChange={handleTimeChange} />
        )}

        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.danger }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={{ color: colors.danger, fontWeight: '700', marginLeft: spacing.sm }}>Keluar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SectionLabel({ text, colors }) {
  return <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{text}</Text>;
}

function SettingRow({ icon, label, colors, onPress }) {
  return (
    <TouchableOpacity style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={colors.text} />
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: radius.md, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowLabel: { fontSize: fontSize.sm, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: radius.md, paddingVertical: 12, marginTop: spacing.lg },
});
