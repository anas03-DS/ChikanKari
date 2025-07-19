const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Artisan = require('../models/artisanModel');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token is for user or artisan
      if (decoded.role === 'artisan') {
        req.user = await Artisan.findById(decoded.id).select('-password');
        req.userType = 'artisan';
      } else {
        req.user = await User.findById(decoded.id).select('-password');
        req.userType = 'user';
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // For users
    if (req.userType === 'user' && !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    // For artisans
    if (req.userType === 'artisan' && !roles.includes('artisan')) {
      return res.status(403).json({
        message: 'Artisans are not authorized to access this route',
      });
    }

    next();
  };
};

// Check if artisan is approved
exports.isApprovedArtisan = (req, res, next) => {
  if (req.userType === 'artisan' && !req.user.approved) {
    return res.status(403).json({
      message: 'Your account is pending approval. Please wait for admin approval.',
    });
  }
  next();
}; 