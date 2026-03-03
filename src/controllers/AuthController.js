const AuthService = require('../services/AuthService');

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const user = await AuthService.register(username, email, password);
      res.status(201).json({ user, message: 'User registered successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
      }

      const { user, token } = await AuthService.login(email, password);
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
