// src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { upsertReview, getAllReviews, deleteReview } = require('../controllers/reviewController');

router.use(authMiddleware);

router.get('/', getAllReviews);               // Fitur 17
router.post('/:bookId', upsertReview);        // Fitur 15 & 16
router.delete('/:id', deleteReview);

module.exports = router;
