const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided in header');
    return res.status(401).json({ message: 'No token provided.' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Use either decoded.id or decoded._id, whichever exists
    const userId = decoded.id || decoded._id;
    if (!userId) {
      console.error('No user ID found in token');
      return res.status(401).json({ message: 'Invalid token: No user ID found.' });
    }
    
    console.log('Looking for user with ID:', userId);
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.error('User not found for ID:', userId);
      return res.status(401).json({ message: 'User not found.' });
    }
    
    console.log('User found:', { id: user._id, email: user.email });
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', {
      message: err.message,
      name: err.name,
      expiredAt: err.expiredAt
    });
    res.status(401).json({ 
      message: 'Invalid or expired token.',
      error: err.message 
    });
  }
};

module.exports = auth;