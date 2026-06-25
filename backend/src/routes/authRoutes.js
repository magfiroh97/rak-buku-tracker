// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  register, login, getProfile, updateProfile, updateSettings, changePassword
} = require('../controllers/authController');

router.post('/register', register);          // Fitur 3
router.post('/login', login);                  // Fitur 4
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);       // Fitur 5
router.put('/settings', authMiddleware, updateSettings);     // Fitur 6
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
