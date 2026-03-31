const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const AuthService = require('../services/AuthService');

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await AuthService.getProfile(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
