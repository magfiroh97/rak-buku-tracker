// src/routes/googleBooksRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { searchBooks, searchByIsbn } = require('../controllers/googleBooksController');

router.use(authMiddleware);

router.get('/search', searchBooks);          // Fitur 9a: cari via teks
router.get('/isbn/:isbn', searchByIsbn);     // Fitur 9b: cari via scan barcode

module.exports = router;
