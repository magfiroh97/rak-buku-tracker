// src/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getBooks, getBookById, createBook, updateBook, deleteBook,
  updateProgress, toggleFavorite, toggleWishlist
} = require('../controllers/bookController');

router.use(authMiddleware); // semua route buku wajib login

router.get('/', getBooks);                       // Fitur 7 & 13 (filter via query)
router.post('/', createBook);                    // Fitur 8
router.get('/:id', getBookById);                  // Fitur 10
router.put('/:id', updateBook);                   // Fitur 11
router.delete('/:id', deleteBook);                // Fitur 12
router.patch('/:id/progress', updateProgress);    // Fitur 14
router.patch('/:id/favorite', toggleFavorite);    // Fitur 21
router.patch('/:id/wishlist', toggleWishlist);    // Fitur 20

module.exports = router;
