// src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');

router.use(authMiddleware);

router.get('/', getCategories);          // Fitur 18
router.post('/', createCategory);        // Fitur 19
router.delete('/:id', deleteCategory);

module.exports = router;
