const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Verifies the JWT from the Authorization header and attaches req.user.
 * Throws 401 if missing/invalid, or if the user no longer exists / is suspended.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized — no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Not authorized — invalid or expired token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'Not authorized — user no longer exists');
  }
  if (user.isSuspended) {
    throw new ApiError(403, 'Your account has been suspended');
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to specific roles. Use after `protect`.
 * Example: router.get('/admin/users', protect, authorize('admin'), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }
  next();
};

module.exports = { protect, authorize };
