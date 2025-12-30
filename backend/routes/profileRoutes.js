const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getMe,
  updateDetails,
  updatePassword
} = require('../controllers/profileController');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Profile Route: ${req.method} ${req.originalUrl}`);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  next();
});

// All routes below this middleware are protected
router.use(protect);

// Profile routes
router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);

// Debug route to check if the router is working
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.status(200).json({ 
    success: true, 
    message: 'Profile routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Debug all registered routes
console.log('Registered Profile Routes:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
  }
});

module.exports = router;
