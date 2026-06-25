// src/controllers/bookController.js
// Menangani Fitur 7 (Daftar Rak Buku/Home), 8 (Tambah Manual), 10 (Detail),
// 11 (Edit), 12 (Hapus), 13 (Filter Status), 14 (Update Progress),
// 20 (Wishlist), 21 (Favorit)

const { db } = require('../db/database');
const { logActivity } = require('../utils/activityLogger');

// Fitur 7: Daftar Rak Buku (Home) + Fitur 13: Filter Status
// Query param opsional: ?status=belum_dibaca|sedang_dibaca|selesai
// Query param opsional: ?category_id=1
// Query param opsional: ?wishlist=1, ?favorite=1
function getBooks(req, res) {
  try {
    const { status, category_id, wishlist, favorite, search } = req.query;
    let query = 'SELECT * FROM books WHERE user_id = ?';
    const params = [req.userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (category_id) {
      query += ' AND category_id = ?';
      params.push(category_id);
    }
    if (wishlist === '1') {
      query += ' AND is_wishlist = 1';
    }
    if (favorite === '1') {
      query += ' AND is_favorite = 1';
    }
    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY updated_at DESC';

    const books = db.prepare(query).all(...params);
    return res.json({ success: true, data: books });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 10: Detail Buku (termasuk review jika ada)
function getBookById(req, res) {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });

    const review = db.prepare('SELECT * FROM reviews WHERE book_id = ? AND user_id = ?').get(req.params.id, req.userId);

    return res.json({ success: true, data: { ...book, review: review || null } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 8: Tambah Buku Manual (juga dipakai hasil dari Fitur 9: API/Scan, beda field "source")
function createBook(req, res) {
  try {
    const {
      title, author, isbn, cover_url, total_pages,
      category_id, status, is_wishlist, source,
      is_public_domain, read_link
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Judul buku wajib diisi.' });
    }

    const stmt = db.prepare(`
      INSERT INTO books (user_id, category_id, title, author, isbn, cover_url, total_pages, status, is_wishlist, source, is_public_domain, read_link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      req.userId,
      category_id || null,
      title,
      author || null,
      isbn || null,
      cover_url || null,
      total_pages || 0,
      status || 'belum_dibaca',
      is_wishlist ? 1 : 0,
      source || 'manual',
      is_public_domain ? 1 : 0,
      read_link || null
    );

    const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);

    logActivity(req.userId, newBook.id, 'tambah_buku', `Menambahkan buku "${title}" ke rak.`);

    return res.status(201).json({ success: true, message: 'Buku berhasil ditambahkan.', data: newBook });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 11: Edit Buku
function updateBook(req, res) {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });

    const allowedFields = ['title', 'author', 'isbn', 'cover_url', 'total_pages', 'category_id', 'status'];
    const fields = [];
    const values = [];

    for (const f of allowedFields) {
      if (req.body[f] !== undefined) {
        fields.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data untuk diupdate.' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);

    db.prepare(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    logActivity(req.userId, updated.id, 'edit_buku', `Mengubah data buku "${updated.title}".`);

    return res.json({ success: true, message: 'Buku berhasil diperbarui.', data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 12: Hapus Buku
function deleteBook(req, res) {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });

    db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
    logActivity(req.userId, null, 'hapus_buku', `Menghapus buku "${book.title}" dari rak.`);

    return res.json({ success: true, message: 'Buku berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 14: Update Progress Baca (halaman ke-X)
// Otomatis update status: kalau current_page > 0 -> sedang_dibaca, kalau == total_pages -> selesai
function updateProgress(req, res) {
  try {
    const { current_page } = req.body;
    const book = db.prepare('SELECT * FROM books WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });

    if (current_page === undefined || current_page < 0) {
      return res.status(400).json({ success: false, message: 'current_page tidak valid.' });
    }

    let status = book.status;
    let startedAt = book.started_at;
    let finishedAt = book.finished_at;

    if (current_page > 0 && status === 'belum_dibaca') {
      status = 'sedang_dibaca';
      startedAt = new Date().toISOString();
    }
    if (book.total_pages > 0 && current_page >= book.total_pages) {
      status = 'selesai';
      finishedAt = new Date().toISOString();
    }

    db.prepare(`
      UPDATE books SET current_page = ?, status = ?, started_at = ?, finished_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(current_page, status, startedAt, finishedAt, req.params.id);

    const updated = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);

    if (status === 'selesai' && book.status !== 'selesai') {
      logActivity(req.userId, updated.id, 'selesai_baca', `Menyelesaikan membaca "${updated.title}". 🎉`);
    } else {
      logActivity(req.userId, updated.id, 'update_progress', `Update progress "${updated.title}" ke halaman ${current_page}.`);
    }

    return res.json({ success: true, message: 'Progress berhasil diperbarui.', data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 21: Toggle Favorit
function toggleFavorite(req, res) {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });

    const newValue = book.is_favorite ? 0 : 1;
    db.prepare('UPDATE books SET is_favorite = ? WHERE id = ?').run(newValue, req.params.id);

    return res.json({ success: true, message: newValue ? 'Ditandai favorit.' : 'Dihapus dari favorit.', data: { is_favorite: !!newValue } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 20: Toggle Wishlist
function toggleWishlist(req, res) {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });

    const newValue = book.is_wishlist ? 0 : 1;
    db.prepare('UPDATE books SET is_wishlist = ? WHERE id = ?').run(newValue, req.params.id);

    return res.json({ success: true, message: newValue ? 'Ditambahkan ke wishlist.' : 'Dihapus dari wishlist.', data: { is_wishlist: !!newValue } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

module.exports = {
  getBooks, getBookById, createBook, updateBook, deleteBook,
  updateProgress, toggleFavorite, toggleWishlist
};
