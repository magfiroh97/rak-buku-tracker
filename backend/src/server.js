// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initSchema } = require('./db/database');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const statsRoutes = require('./routes/statsRoutes');
const googleBooksRoutes = require('./routes/googleBooksRoutes');
const gutenbergRoutes = require('./routes/gutenbergRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initSchema();

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Rak Buku Tracker API berjalan dengan baik 📚' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/google-books', googleBooksRoutes);
app.use('/api/gutenberg', gutenbergRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server Rak Buku Tracker berjalan di http://localhost:${PORT}`);
});
