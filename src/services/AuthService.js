const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/runtime');
const User = require('../models/User');

function sanitizeUser(user) {
  const obj = user.toObject();
  delete obj.passwordHash;
  return obj;
}

class AuthService {
  static async register(username, email, password) {
    try {
      const user = new User({ username, email, passwordHash: password });
      await user.save();
      return sanitizeUser(user);
    } catch (err) {
      if (err.code === 11000) {
        const dupErr = new Error('User already exists');
        dupErr.statusCode = 409;
        throw dupErr;
      }
      throw err;
    }
  }

  static async login(email, password) {
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() });
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const safeUser = sanitizeUser(user);
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return { user: safeUser, token };
  }

  static async verifyToken(token) {
    return jwt.verify(token, getJwtSecret());
  }

  static async getProfile(userId) {
    const user = await User.findById(userId);
    return user ? sanitizeUser(user) : null;
  }
}

module.exports = AuthService;
