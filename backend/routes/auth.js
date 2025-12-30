const express = require('express');
const router = express.Router();
const { signup, signin, updateEmail } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const profileRoutes = require('./profileRoutes');

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);

// Protected routes
router.use(auth);
router.put('/update-email', updateEmail);

// Profile routes
router.use('/profile', profileRoutes);

module.exports = router;