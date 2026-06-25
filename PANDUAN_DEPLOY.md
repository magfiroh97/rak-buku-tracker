# Panduan Menjalankan & Men-deploy Rak Buku Tracker

Panduan ini mengasumsikan kamu sudah punya project ini di laptop (folder `backend/` dan `app/`).

---

## BAGIAN 1: Menjalankan di Laptop (Development)

### 1.1 Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit file `.env`, ganti `JWT_SECRET` dengan string acak yang panjang (bebas, contoh: hasil dari `openssl rand -hex 32`).

Jalankan backend:
```bash
npm run dev
```

Kalau berhasil, akan muncul:
```
🚀 Server Rak Buku Tracker berjalan di http://localhost:3000
```

**Catatan penting:** backend ini pakai `better-sqlite3` yang butuh kompilasi native saat `npm install`. Ini normal dan akan berhasil otomatis di laptop kamu (asal sudah install Node.js versi 18+ dan ada koneksi internet biasa, bukan sandbox terbatas seperti yang saya pakai).

### 1.2 Cari IP Lokal Laptop Kamu

HP/emulator tidak bisa akses `localhost` milik laptop. Kamu butuh IP lokal:

- **Windows**: buka Command Prompt, ketik `ipconfig`, cari baris "IPv4 Address" (contoh: `192.168.1.10`)
- **Mac**: System Settings > Wi-Fi > Details, atau jalankan `ifconfig | grep "inet "` di Terminal
- **Linux**: jalankan `ip addr` di Terminal

### 1.3 Setup App React Native

Edit `app/src/constants/config.js`, ganti baris ini dengan IP lokal kamu:
```js
const DEV_LOCAL_IP = 'http://192.168.1.10:3000'; // ganti 192.168.1.10 dengan IP kamu
```

Install dependencies:
```bash
cd app
npm install
```

Jalankan app:
```bash
npx expo start
```

Scan QR code yang muncul memakai **app Expo Go** (download dari Play Store/App Store) di HP kamu. Pastikan **HP dan laptop terhubung ke WiFi yang sama**.

> Kalau kamu pakai Android Emulator (bukan HP fisik), kamu bisa pakai `http://10.0.2.2:3000` sebagai pengganti IP lokal.

---

## BAGIAN 2: Hal yang Wajib Diperbaiki Sebelum Build Production

Sebelum build ke Play Store, beberapa hal **HARUS** diubah:

### 2.1 Deploy Backend ke Server (Bukan Laptop)

Aplikasi yang sudah di-build (.aab) tidak bisa mengakses `localhost` laptop kamu — laptop kamu harus selalu menyala dan terhubung internet, dan itu tidak praktis. Backend harus di-deploy ke hosting publik.

Opsi gratis yang direkomendasikan untuk tugas kuliah:
- **Railway.app** — paling mudah, tinggal hubungkan ke GitHub repo, otomatis deploy
- **Render.com** — gratis dengan free tier, mirip Railway

Langkah umum (pakai Railway sebagai contoh):
1. Push folder `backend/` ke repository GitHub
2. Daftar di railway.app, hubungkan ke GitHub repo kamu
3. Railway otomatis mendeteksi Node.js dan men-deploy
4. Tambahkan environment variable `JWT_SECRET` di dashboard Railway (sama seperti di `.env`)
5. Railway akan memberikan URL publik, contoh: `https://rakbuku-backend.up.railway.app`

**Catatan tentang database:** `better-sqlite3` menyimpan data di file lokal (`data/rakbuku.db`). Di platform seperti Railway, file storage ini biasanya tidak permanen kecuali kamu mengaktifkan "volume" (storage permanen) di pengaturan project. Cek dokumentasi Railway/Render soal "persistent volume" agar data tidak hilang setiap deploy ulang.

### 2.2 Update URL Production di App

Edit `app/src/constants/config.js`:
```js
const PRODUCTION_URL = 'https://rakbuku-backend.up.railway.app'; // ganti dengan URL asli kamu
```

### 2.3 Aktifkan Google Books API Key (Opsional tapi Disarankan)

Tanpa API key, Google Books API tetap berfungsi tapi limit request-nya rendah. Untuk app yang akan dipakai banyak orang (atau demo ke dosen berkali-kali), disarankan pakai API key:

1. Buka https://console.cloud.google.com
2. Buat project baru
3. Aktifkan "Books API" di API Library
4. Buat API Key di bagian Credentials
5. Tambahkan ke environment variable backend: `GOOGLE_BOOKS_API_KEY=xxxxx`

---

## BAGIAN 3: Build APK/AAB dengan EAS Build

EAS (Expo Application Services) adalah cara resmi build app Expo tanpa perlu install Android Studio.

### 3.1 Install EAS CLI dan Login

```bash
npm install -g eas-cli
eas login
```

(Akan minta login pakai akun Expo — daftar gratis di expo.dev kalau belum punya)

### 3.2 Konfigurasi Project

```bash
cd app
eas build:configure
```

Pilih platform **Android**. Ini akan menghubungkan project kamu ke akun Expo kamu (mengisi field `extra.eas.projectId` di app.json secara otomatis).

### 3.3 Build APK untuk Testing (Sebelum ke Play Store)

Untuk coba dulu di HP sebelum submit resmi, build APK (lebih cepat dari AAB):

```bash
eas build --platform android --profile preview
```

Proses ini berjalan di server Expo (cloud), butuh waktu sekitar 10-20 menit. Setelah selesai, kamu akan mendapat link download `.apk` yang bisa langsung di-install di HP Android untuk testing.

### 3.4 Build AAB untuk Play Store (Production)

Play Store mewajibkan format `.aab` (Android App Bundle), bukan `.apk`:

```bash
eas build --platform android --profile production
```

File `.aab` hasil build inilah yang nanti diupload ke Play Console.

---

## BAGIAN 4: Submit ke Google Play Store

### 4.1 Daftar Google Play Console

- Buka https://play.google.com/console
- Bayar biaya pendaftaran developer **$25 (sekali bayar, seumur hidup)**
- Tunggu verifikasi akun (biasanya beberapa jam sampai 2 hari)

### 4.2 Buat App Baru di Play Console

1. Klik "Create app"
2. Isi nama app: **Rak Buku Tracker**
3. Pilih kategori: **Books & Reference**
4. Isi semua informasi wajib: deskripsi singkat, deskripsi lengkap, screenshot (minimal 2), icon 512x512, feature graphic 1024x500

### 4.3 Isi Kebijakan Privasi (WAJIB)

Karena app ini punya fitur akun (Register/Login) dan kamera, Google **mewajibkan** Privacy Policy yang bisa diakses lewat URL publik. Untuk tugas kuliah, cara cepat:
- Buat halaman sederhana pakai Google Sites (gratis) yang menjelaskan data apa yang disimpan (nama, email, data buku) dan untuk apa
- Masukkan URL tersebut di Play Console > App content > Privacy Policy

### 4.4 Isi Content Rating, Data Safety, Target Audience

Play Console akan memandu lewat kuesioner untuk masing-masing bagian ini. Untuk app sederhana seperti ini, jawabannya umumnya:
- Content rating: Everyone
- Data Safety: jelaskan bahwa app menyimpan nama, email (untuk akun), dan tidak membagikan data ke pihak ketiga
- Target audience: 13+ (karena ada akun pengguna)

### 4.5 Upload AAB

1. Masuk ke menu "Production" (atau "Internal testing" dulu untuk uji coba terbatas — **disarankan untuk tugas kuliah**, supaya tidak perlu menunggu review penuh Google yang bisa beberapa hari)
2. Upload file `.aab` hasil build EAS
3. Isi release notes (contoh: "Rilis pertama Rak Buku Tracker")
4. Submit untuk review

### 4.6 (Alternatif Lebih Cepat untuk Demo Tugas) Internal Testing Track

Kalau cuma butuh demo ke dosen tanpa publish publik penuh, gunakan **Internal Testing**:
1. Di Play Console, pilih track "Internal testing" bukan "Production"
2. Upload AAB di sana
3. Tambahkan email dosen/teman sebagai tester
4. Mereka akan dapat link untuk install langsung — **proses ini hanya butuh beberapa jam, tidak perlu review penuh Google**

---

## Ringkasan Checklist

- [ ] Backend jalan lokal, semua endpoint sudah dites
- [ ] Backend sudah di-deploy ke Railway/Render (bukan localhost)
- [ ] `config.js` di app sudah diarahkan ke URL production
- [ ] `eas build --profile preview` berhasil, APK sudah dicoba di HP fisik
- [ ] Icon, screenshot, deskripsi app sudah disiapkan
- [ ] Privacy Policy sudah dibuat dan online
- [ ] `eas build --profile production` berhasil menghasilkan AAB
- [ ] Akun Google Play Console aktif (sudah bayar $25)
- [ ] AAB sudah diupload, minimal ke Internal Testing track
