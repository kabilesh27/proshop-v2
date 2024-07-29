import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set JWT as an HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    domain: '54.156.109.164', // Only domain or IP, without protocol
    secure: process.env.NODE_ENV === 'production',
    path: '/', // Ensure the cookie is available for all routes
  });
};

export default generateToken;
