// src/routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getStats, getReadingGoal, setReadingGoal, getActivities } = require('../controllers/statsController');

router.use(authMiddleware);

router.get('/', getStats);                    // Fitur 22
router.get('/goal', getReadingGoal);          // Fitur 23
router.post('/goal', setReadingGoal);         // Fitur 23
router.get('/activities', getActivities);     // Fitur 24

module.exports = router;
