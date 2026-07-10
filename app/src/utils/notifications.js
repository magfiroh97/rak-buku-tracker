import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Deteksi apakah app sedang dijalankan di dalam app "Expo Go" (untuk testing/
// development) ATAU sebagai development build/production build asli.
// appOwnership === 'expo' artinya sedang di Expo Go.
const isRunningInExpoGo = Constants.appOwnership === 'expo';

let Notifications = null;
let notificationsAvailable = false;

if (!isRunningInExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    notificationsAvailable = true;
  } catch (err) {
    console.warn('expo-notifications gagal di-load:', err);
    notificationsAvailable = false;
  }
} else {
  console.log('ℹ️ Mode Expo Go terdeteksi: fitur notifikasi reminder dinonaktifkan sementara. Akan aktif normal setelah app di-build (lihat PANDUAN_DEPLOY.md).');
}

const REMINDER_IDENTIFIER = 'rakbuku_daily_reminder';

export async function requestNotificationPermission() {
  if (!notificationsAvailable) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (err) {
    console.warn('Gagal minta izin notifikasi (normal di Expo Go):', err.message);
    return false;
  }
}

// Menjadwalkan notifikasi harian pada jam tertentu (hour, minute dalam 24h)
export async function scheduleDailyReminder(hour = 20, minute = 0) {
  if (!notificationsAvailable) return;
  try {
    await cancelDailyReminder();

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminder', {
        name: 'Pengingat Membaca',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_IDENTIFIER,
      content: {
        title: '📚 Waktunya Membaca!',
        body: 'Sudah baca buku hari ini? Lanjutkan progress baca kamu sekarang.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: Platform.OS === 'android' ? 'reminder' : undefined,
      },
    });
  } catch (err) {
    console.warn('Gagal menjadwalkan notifikasi (normal di Expo Go, akan berfungsi di build asli):', err.message);
  }
}

export async function cancelDailyReminder() {
  if (!notificationsAvailable) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER);
  } catch (err) {
    // Aman diabaikan — kemungkinan belum ada reminder terjadwal sebelumnya
  }
}