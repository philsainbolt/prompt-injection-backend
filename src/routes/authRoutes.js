const express = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { registerRules, loginRules } = require('../middleware/validators');

const router = express.Router();

router.post('/register', registerRules, validate, AuthController.register);
router.post('/login', loginRules, validate, AuthController.login);
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;
