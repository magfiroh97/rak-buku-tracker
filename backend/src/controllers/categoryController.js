// src/controllers/categoryController.js
// Menangani Fitur 18 (Kategori/Genre Buku), 19 (Tambah Kategori Custom)

const { db } = require('../db/database');

function getCategories(req, res) {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(b.id) as book_count
      FROM categories c
      LEFT JOIN books b ON b.category_id = c.id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.is_default DESC, c.name ASC
    `).all(req.userId);

    return res.json({ success: true, data: categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 19: Tambah Kategori Custom
function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });
    }

    const existing = db.prepare('SELECT id FROM categories WHERE user_id = ? AND name = ?').get(req.userId, name.trim());
    if (existing) {
      return res.status(409).json({ success: false, message: 'Kategori dengan nama ini sudah ada.' });
    }

    const result = db.prepare('INSERT INTO categories (user_id, name, is_default) VALUES (?, ?, 0)').run(req.userId, name.trim());
    const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan.', data: newCategory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

function deleteCategory(req, res) {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!category) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });

    if (category.is_default) {
      return res.status(403).json({ success: false, message: 'Kategori default tidak bisa dihapus.' });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    return res.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

module.exports = { getCategories, createCategory, deleteCategory };
