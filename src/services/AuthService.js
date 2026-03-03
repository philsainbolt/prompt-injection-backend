const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  static async register(username, email, password) {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new User({
      username,
      email,
      passwordHash: password,
    });

    await user.save();
    return user;
  }

  static async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return { user, token };
  }

  static async verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
  }
}

module.exports = AuthService;
