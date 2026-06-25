// src/constants/theme.js
// Tema warna terpusat. Dipakai semua screen agar tampilan konsisten,
// dan supaya fitur "Pengaturan > Mode Gelap" (bagian dari Fitur 6) mudah diterapkan.

export const lightColors = {
  primary: '#2D5A4A',       // hijau tua, kesan "rak buku perpustakaan"
  primaryLight: '#E8F0EC',
  accent: '#D98E48',        // aksen oranye hangat, kontras dengan hijau
  background: '#FBF9F6',
  surface: '#FFFFFF',
  text: '#1F2A24',
  textSecondary: '#6B7770',
  border: '#E3E0D8',
  danger: '#C0392B',
  success: '#3E8E5A',
  warning: '#D98E48',
  star: '#F0B429',
};

export const darkColors = {
  primary: '#5FA98A',
  primaryLight: '#1E2B25',
  accent: '#E3A467',
  background: '#141816',
  surface: '#1E2420',
  text: '#EDEDE8',
  textSecondary: '#9CA59E',
  border: '#2E362F',
  danger: '#E57368',
  success: '#5FBE82',
  warning: '#E3A467',
  star: '#F2C14E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
};

export const statusLabels = {
  belum_dibaca: 'Belum Dibaca',
  sedang_dibaca: 'Sedang Dibaca',
  selesai: 'Selesai',
};

export const statusColors = {
  belum_dibaca: '#9CA59E',
  sedang_dibaca: '#D98E48',
  selesai: '#3E8E5A',
};
