const express = require('express');
const ChallengeController = require('../controllers/ChallengeController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const validate = require('../middleware/validate');
const {
  paramIdRules,
  createChallengeRules,
  updateChallengeRules,
  submitAttemptRules,
} = require('../middleware/validators');

const router = express.Router();

router.get('/', authMiddleware, ChallengeController.getAllChallenges);
router.get('/:id', authMiddleware, paramIdRules, validate, ChallengeController.getChallengeById);
router.post('/', authMiddleware, adminMiddleware, createChallengeRules, validate, ChallengeController.createChallenge);
router.put('/:id', authMiddleware, adminMiddleware, paramIdRules, updateChallengeRules, validate, ChallengeController.updateChallenge);
router.delete('/:id', authMiddleware, adminMiddleware, paramIdRules, validate, ChallengeController.deleteChallenge);
router.post('/:id/submit', authMiddleware, paramIdRules, submitAttemptRules, validate, ChallengeController.submitAttempt);

module.exports = router;
