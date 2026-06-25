// src/middleware/auth.js
// Middleware untuk memverifikasi token JWT pada setiap request yang butuh login.
// Hampir semua fitur (7-25) butuh middleware ini karena data buku/rating/dst
// selalu terikat pada user yang sedang login.

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rakbuku_secret_key_ganti_di_production';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan. Silakan login kembali.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
