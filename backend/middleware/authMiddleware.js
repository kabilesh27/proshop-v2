import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import { getUserByIdController } from '../controllers/userController.js';
import { getUserById } from '../models/userModel.js';

// User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read JWT from the 'jwt' cookie
  token = req.headers.authorization.split(' ')[1];
  console.log(token);
  if (!token) {
    try {
      const decoded = jwt.verify(token, "f34b6f1b8d2053f3647d04bf4e37cbfd0738853d48df5befa3ea44c99494e205aab6bdeb41e03cdb4c6b60e8c9c8e3a3df186f5a6128e103de88e7c45022fb8d");
      
      req.user = await getUserById(decoded.userId);
      console.log(decoded);
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
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
