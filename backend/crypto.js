import Crypto from 'crypto';

const jwtSecret = Crypto.randomBytes(64).toString('hex');

console.log(jwtSecret);