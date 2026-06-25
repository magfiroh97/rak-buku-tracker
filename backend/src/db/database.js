// src/db/database.js
// Koneksi database SQLite menggunakan better-sqlite3
// Library ini dipilih karena: synchronous (lebih simpel untuk skala tugas kuliah),
// sangat cepat, dan tidak butuh setup server database terpisah.

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'rakbuku.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    -- Tabel Users (Fitur 3,4,5,6: Register, Login, Edit Profil, Pengaturan)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar_url TEXT,
      theme TEXT DEFAULT 'light',
      notif_enabled INTEGER DEFAULT 1,
      reading_goal INTEGER DEFAULT 12,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabel Categories (Fitur 18,19: Kategori/Genre, Tambah Kategori Custom)
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Tabel Books (Inti dari semua fitur: 7,8,9,10,11,12,13,14,20,21)
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      title TEXT NOT NULL,
      author TEXT,
      isbn TEXT,
      cover_url TEXT,
      total_pages INTEGER DEFAULT 0,
      current_page INTEGER DEFAULT 0,
      status TEXT DEFAULT 'belum_dibaca', -- belum_dibaca | sedang_dibaca | selesai
      is_wishlist INTEGER DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      source TEXT DEFAULT 'manual', -- manual | google_books | isbn_scan
      is_public_domain INTEGER DEFAULT 0,
      read_link TEXT,
      started_at TEXT,
      finished_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    -- Tabel Reviews (Fitur 15,16,17: Rating, Review, Lihat Semua Review)
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Tabel Activity Log (Fitur 24: Riwayat Aktivitas / timeline)
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id INTEGER,
      type TEXT NOT NULL, -- tambah_buku | update_progress | selesai_baca | beri_rating | tulis_review | dst
      description TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    -- Tabel Reading Goals (Fitur 23: Target Membaca Tahunan, riwayat per tahun)
    CREATE TABLE IF NOT EXISTS reading_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      target_books INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, year)
    );
  `);

  // --- MIGRATION AMAN ---
  // Menambahkan kolom baru ke tabel 'books' yang sudah ada (untuk fitur Baca
  // Buku domain publik). CREATE TABLE IF NOT EXISTS di atas tidak akan
  // menambah kolom ke tabel lama yang sudah pernah dibuat sebelumnya, jadi
  // kita cek manual dan tambahkan kolomnya kalau belum ada. Aman dijalankan
  // berulang kali -- kalau kolom sudah ada, akan di-skip otomatis.
  const existingColumns = db.prepare("PRAGMA table_info(books)").all().map((col) => col.name);

  if (!existingColumns.includes('is_public_domain')) {
    db.exec(`ALTER TABLE books ADD COLUMN is_public_domain INTEGER DEFAULT 0`);
    console.log('🔧 Migration: kolom is_public_domain ditambahkan ke tabel books.');
  }
  if (!existingColumns.includes('read_link')) {
    db.exec(`ALTER TABLE books ADD COLUMN read_link TEXT`);
    console.log('🔧 Migration: kolom read_link ditambahkan ke tabel books.');
  }

  // Seed kategori default untuk user baru dilakukan saat register (lihat authController)
  console.log('✅ Database schema siap di', DB_PATH);
}

module.exports = { db, initSchema };
