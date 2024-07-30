import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, "f34b6f1b8d2053f3647d04bf4e37cbfd0738853d48df5befa3ea44c99494e205aab6bdeb41e03cdb4c6b60e8c9c8e3a3df186f5a6128e103de88e7c45022fb8d", {
    expiresIn: '30d',
  });

  // Set JWT as an HTTP-Only cookie
  // res.cookie('jwt', token, {
  //   httpOnly: true,
  //   sameSite: 'lax', // Prevent CSRF attacks
  //   maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  // });
  return token;
};

export default generateToken;
