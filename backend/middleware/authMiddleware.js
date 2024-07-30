import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import { getUserById } from '../models/userModel.js';

// User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the Authorization header is set and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the Authorization header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify the token
      const decoded = jwt.verify(token, "f34b6f1b8d2053f3647d04bf4e37cbfd0738853d48df5befa3ea44c99494e205aab6bdeb41e03cdb4c6b60e8c9c8e3a3df186f5a6128e103de88e7c45022fb8d");
      
      // Attach the user to the request object
      req.user = await getUserById(decoded.userId);
      console.log(decoded);
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
});

// User must be an admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin };
