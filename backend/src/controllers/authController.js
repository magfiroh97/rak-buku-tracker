// src/controllers/authController.js
// Menangani Fitur 3 (Register), 4 (Login), 5 (Edit Profil), 6 (Pengaturan)

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');

const DEFAULT_CATEGORIES = ['Fiksi', 'Non-Fiksi', 'Sains', 'Sejarah', 'Biografi'];

// Fitur 3: Register
function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const insertUser = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = insertUser.run(name, email, hashedPassword);
    const userId = result.lastInsertRowid;

    // Seed kategori default agar fitur 18/19 langsung punya data saat pertama login
    const insertCategory = db.prepare('INSERT INTO categories (user_id, name, is_default) VALUES (?, ?, 1)');
    for (const cat of DEFAULT_CATEGORIES) {
      insertCategory.run(userId, cat);
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil.',
      data: { token, user: { id: userId, name, email } }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 4: Login
function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
          theme: user.theme,
          notif_enabled: !!user.notif_enabled,
          reading_goal: user.reading_goal
        }
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Ambil profil user yang sedang login
function getProfile(req, res) {
  const user = db.prepare('SELECT id, name, email, avatar_url, theme, notif_enabled, reading_goal FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
  return res.json({ success: true, data: user });
}

// Fitur 5: Edit Profil
function updateProfile(req, res) {
  try {
    const { name, avatar_url } = req.body;
    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (avatar_url !== undefined) { fields.push('avatar_url = ?'); values.push(avatar_url); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data untuk diupdate.' });
    }

    values.push(req.userId);
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT id, name, email, avatar_url FROM users WHERE id = ?').get(req.userId);
    return res.json({ success: true, message: 'Profil berhasil diperbarui.', data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

// Fitur 6: Pengaturan (tema, notifikasi, reading goal, ganti password)
function updateSettings(req, res) {
  try {
    const { theme, notif_enabled, reading_goal } = req.body;
    const fields = [];
    const values = [];

    if (theme) { fields.push('theme = ?'); values.push(theme); }
    if (notif_enabled !== undefined) { fields.push('notif_enabled = ?'); values.push(notif_enabled ? 1 : 0); }
    if (reading_goal !== undefined) { fields.push('reading_goal = ?'); values.push(reading_goal); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada pengaturan untuk diupdate.' });
    }

    values.push(req.userId);
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    return res.json({ success: true, message: 'Pengaturan berhasil disimpan.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

function changePassword(req, res) {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    const isValid = bcrypt.compareSync(old_password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Password lama salah.' });
    }

    const hashedPassword = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, req.userId);

    return res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
}

module.exports = { register, login, getProfile, updateProfile, updateSettings, changePassword };
