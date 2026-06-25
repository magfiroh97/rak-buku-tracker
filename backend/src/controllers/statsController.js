// src/controllers/statsController.js
// Menangani Fitur 22 (Statistik Membaca), 23 (Target Membaca Tahunan),
// 24 (Riwayat Aktivitas)

const { db } = require('../db/database');

// Fitur 22: Statistik Membaca
// Mengembalikan: total buku per status, buku selesai per bulan (tahun ini),
// distribusi genre favorit, rata-rata rating
function getStats(req, res) {
  try {
    const userId = req.userId;
    const year = req.query.year || new Date().getFullYear();

    const totalByStatus = db.prepare(`
      SELECT status, COUNT(*) as total FROM books WHERE user_id = ? GROUP BY status
    `).all(userId);

    const finishedPerMonth = db.prepare(`
      SELECT strftime('%m', finished_at) as month, COUNT(*) as total
      FROM books
      WHERE user_id = ? AND status = 'selesai' AND strftime('%Y', finished_at) = ?
      GROUP BY month
      ORDER BY month
    `).all(userId, String(year));

    const genreDistribution = db.prepare(`
      SELECT c.name as category, COUNT(b.id) as total
      FROM books b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
      GROUP BY c.id
      ORDER BY total DESC
    `).all(userId);

    const avgRating = db.prepare(`
      SELECT ROUND(AVG(rating), 2) as avg_rating, COUNT(*) as total_reviews
      FROM reviews WHERE user_id = ? AND rating IS NOT NULL
    `).get(userId);

    const totalBooksFinishedThisYear = db.prepare(`
      SELECT COUNT(*) as total FROM books
      WHERE user_id = ? AND status = 'selesai' AND strftime('%Y', finished_at) = ?
    `).get(userId, String(year));

    return res.json({
      success: true,
      data: {
        total_by_status: totalByStatus,
        finished_per_month: finishedPerMonth,
        genre_distribution: genreDistribution,
        average_rating: avgRating.avg_rating || 0,
        total_reviews: avgRating.total_reviews,
        total_finished_this_year: totalBooksFinishedThisYear.total
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 23: Target Membaca Tahunan
function getReadingGoal(req, res) {
  try {
    const year = req.query.year || new Date().getFullYear();
    const goal = db.prepare('SELECT * FROM reading_goals WHERE user_id = ? AND year = ?').get(req.userId, year);

    const finished = db.prepare(`
      SELECT COUNT(*) as total FROM books
      WHERE user_id = ? AND status = 'selesai' AND strftime('%Y', finished_at) = ?
    `).get(req.userId, String(year));

    return res.json({
      success: true,
      data: {
        year: Number(year),
        target_books: goal ? goal.target_books : null,
        finished_books: finished.total,
        progress_percent: goal ? Math.min(100, Math.round((finished.total / goal.target_books) * 100)) : 0
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

function setReadingGoal(req, res) {
  try {
    const { year, target_books } = req.body;
    if (!year || !target_books || target_books < 1) {
      return res.status(400).json({ success: false, message: 'Tahun dan target buku wajib diisi dengan benar.' });
    }

    const existing = db.prepare('SELECT * FROM reading_goals WHERE user_id = ? AND year = ?').get(req.userId, year);

    if (existing) {
      db.prepare('UPDATE reading_goals SET target_books = ? WHERE id = ?').run(target_books, existing.id);
    } else {
      db.prepare('INSERT INTO reading_goals (user_id, year, target_books) VALUES (?, ?, ?)').run(req.userId, year, target_books);
    }

    return res.json({ success: true, message: 'Target membaca berhasil disimpan.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 24: Riwayat Aktivitas (timeline)
function getActivities(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activities = db.prepare(`
      SELECT a.*, b.title as book_title
      FROM activities a
      LEFT JOIN books b ON a.book_id = b.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT ?
    `).all(req.userId, limit);

    return res.json({ success: true, data: activities });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

module.exports = { getStats, getReadingGoal, setReadingGoal, getActivities };
