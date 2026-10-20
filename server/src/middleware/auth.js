import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized. Please log in with a valid Bearer token.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'internbridge_secret_fallback');
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return sendError(res, 401, 'User associated with this token no longer exists.');
    }

    if (user.status === 'suspended') {
      return sendError(res, 403, 'Account is suspended. Please contact administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, 'Token verification failed: ' + error.message);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Role '${req.user?.role || 'Guest'}' is not authorized to access this resource.`
      );
    }
    next();
  };
};
