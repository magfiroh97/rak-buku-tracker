// src/constants/config.js
//
// PENTING UNTUK DIBACA SEBELUM TESTING DI HP:
//
// 1. Saat development dengan Expo Go / emulator, "localhost" TIDAK menunjuk ke
//    laptop kamu dari sudut pandang HP/emulator. Gunakan alamat IP lokal laptop kamu.
//    Cara cek IP lokal:
//      - Windows: buka cmd, ketik `ipconfig`, cari "IPv4 Address"
//      - Mac/Linux: buka terminal, ketik `ifconfig` atau `ip addr`
//    Contoh hasil: 192.168.1.10
//
// 2. Android Emulator (bukan device fisik) bisa juga pakai: http://10.0.2.2:3000
//
// 3. Setelah backend kamu di-deploy ke server (Railway/Render/VPS dll) untuk
//    keperluan submit ke Play Store, ganti BASE_URL ke URL production tersebut.
//    Aplikasi yang sudah di-build TIDAK bisa akses "localhost" laptop kamu.

const DEV_LOCAL_IP = 'http://192.168.1.2:3000'; // <-- GANTI dengan IP lokal laptop kamu
const PRODUCTION_URL = 'https://api-rakbuku-kamu.com'; // <-- GANTI saat deploy backend ke server

const isDev = __DEV__;

export const API_BASE_URL = `${isDev ? DEV_LOCAL_IP : PRODUCTION_URL}/api`;

export const GOOGLE_BOOKS_PLACEHOLDER_COVER =
  'https://via.placeholder.com/128x192.png?text=No+Cover';
