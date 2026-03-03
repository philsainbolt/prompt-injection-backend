const express = require('express');
const ChallengeController = require('../controllers/ChallengeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', ChallengeController.getAllChallenges);
router.get('/:id', ChallengeController.getChallengeById);
router.post('/submit', authMiddleware, ChallengeController.submitAnswer);

module.exports = router;
