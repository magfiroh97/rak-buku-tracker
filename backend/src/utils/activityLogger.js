// src/utils/activityLogger.js
// Helper terpusat untuk mencatat aktivitas user (Fitur 24: Riwayat Aktivitas).
// Dipanggil dari berbagai controller setiap kali ada aksi penting,
// supaya semua fitur "terhubung" lewat satu timeline log yang sama.

const { db } = require('../db/database');

function logActivity(userId, bookId, type, description) {
  const stmt = db.prepare(`
    INSERT INTO activities (user_id, book_id, type, description)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(userId, bookId || null, type, description);
}

module.exports = { logActivity };
