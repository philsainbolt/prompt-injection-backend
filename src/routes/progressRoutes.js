const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { getProgressHandler, beatChallengeHandler } = require('../controllers/progressController');
const validate = require('../middleware/validate');
const { paramLevelRules } = require('../middleware/validators');

const router = express.Router();

router.get('/', authMiddleware, getProgressHandler);
router.post('/beat/:id', authMiddleware, adminMiddleware, paramLevelRules, validate, beatChallengeHandler);

module.exports = router;
