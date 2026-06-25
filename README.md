# 📚 Rak Buku Tracker

Aplikasi React Native (Expo) untuk melacak buku yang sudah, sedang, dan belum dibaca — dilengkapi backend API sendiri dan integrasi Google Books API.

## Struktur Project

```
rak-buku-tracker/
├── backend/          # Node.js + Express + SQLite (REST API)
└── app/               # React Native (Expo) — aplikasi mobile
```

## Daftar 25 Fitur

### Modul Akun & Setup
1. Splash Screen
2. Onboarding
3. Register
4. Login
5. Edit Profil
6. Pengaturan (tema gelap/terang, notifikasi reminder, ubah password, logout)

### Modul Buku (Core)
7. Daftar Rak Buku (Home)
8. Tambah Buku Manual
9. Cari Buku via Google Books API & Scan Barcode ISBN (kamera)
10. Detail Buku
11. Edit Buku
12. Hapus Buku
13. Filter Status Baca (Belum Dibaca / Sedang Dibaca / Selesai)
14. Update Progress Baca

### Modul Rating & Review
15. Beri Rating Bintang
16. Tulis Review / Catatan Pribadi
17. Lihat Semua Review Saya

### Modul Organisasi
18. Kategori / Genre Buku
19. Tambah Kategori Custom
20. Wishlist
21. Tandai Buku Favorit

### Modul Statistik & Sosial
22. Statistik Membaca (grafik bulanan, distribusi genre, rating rata-rata)
23. Target Membaca Tahunan
24. Riwayat Aktivitas (timeline)
25. Notifikasi Reminder Baca

## Cara Menjalankan

Lihat **PANDUAN_DEPLOY.md** untuk instruksi lengkap dari development sampai publish ke Play Store.

Ringkas:
```bash
# Backend
cd backend && npm install && npm run dev

# App (di terminal terpisah)
cd app && npm install && npx expo start
```

## Tech Stack

**Backend:** Node.js, Express, better-sqlite3, JWT, bcrypt
**App:** React Native (Expo SDK 56), React Navigation, Zustand, expo-camera, react-native-chart-kit, expo-notifications
**API Eksternal:** Google Books API (pencarian + lookup ISBN)
