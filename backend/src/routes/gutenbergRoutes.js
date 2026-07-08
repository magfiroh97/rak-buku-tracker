// src/routes/gutenbergRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { checkAvailability, getBookText } = require('../controllers/gutenbergController');

router.use(authMiddleware);
router.get('/check', checkAvailability);
router.get('/text', getBookText);

module.exports = router;
