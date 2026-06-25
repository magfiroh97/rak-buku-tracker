// src/controllers/reviewController.js
// Menangani Fitur 15 (Beri Rating Bintang), 16 (Tulis Review/Catatan),
// 17 (Lihat Semua Review Saya)

const { db } = require('../db/database');
const { logActivity } = require('../utils/activityLogger');

// Fitur 15 & 16: Beri Rating + Tulis Review (gabung jadi satu endpoint upsert)
function upsertReview(req, res) {
  try {
    const { rating, note } = req.body;
    const bookId = req.params.bookId;

    const book = db.prepare('SELECT * FROM books WHERE id = ? AND user_id = ?').get(bookId, req.userId);
    if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating harus antara 1-5.' });
    }

    const existing = db.prepare('SELECT * FROM reviews WHERE book_id = ? AND user_id = ?').get(bookId, req.userId);

    if (existing) {
      db.prepare(`
        UPDATE reviews SET rating = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(rating ?? existing.rating, note ?? existing.note, existing.id);
    } else {
      db.prepare(`
        INSERT INTO reviews (book_id, user_id, rating, note) VALUES (?, ?, ?, ?)
      `).run(bookId, req.userId, rating || null, note || null);
    }

    const result = db.prepare('SELECT * FROM reviews WHERE book_id = ? AND user_id = ?').get(bookId, req.userId);

    logActivity(req.userId, bookId, 'beri_review', `Memberi rating/review untuk "${book.title}".`);

    return res.json({ success: true, message: 'Review berhasil disimpan.', data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 17: Lihat Semua Review Saya (join dengan judul buku)
function getAllReviews(req, res) {
  try {
    const reviews = db.prepare(`
      SELECT r.*, b.title as book_title, b.author as book_author, b.cover_url as book_cover
      FROM reviews r
      JOIN books b ON r.book_id = b.id
      WHERE r.user_id = ?
      ORDER BY r.updated_at DESC
    `).all(req.userId);

    return res.json({ success: true, data: reviews });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

function deleteReview(req, res) {
  try {
    const review = db.prepare('SELECT * FROM reviews WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!review) return res.status(404).json({ success: false, message: 'Review tidak ditemukan.' });

    db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
    return res.json({ success: true, message: 'Review berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

module.exports = { upsertReview, getAllReviews, deleteReview };
