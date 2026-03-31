const { body, param } = require('express-validator');

const registerRules = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const createChallengeRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('systemPrompt').notEmpty().withMessage('System prompt is required'),
  body('secretPassword').notEmpty().withMessage('Secret password is required'),
  body('level').isInt({ min: 1, max: 10 }).withMessage('Level must be between 1 and 10'),
];

const updateChallengeRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('systemPrompt').optional().notEmpty().withMessage('System prompt cannot be empty'),
  body('secretPassword').optional().notEmpty().withMessage('Secret password cannot be empty'),
  body('level').optional().isInt({ min: 1, max: 10 }).withMessage('Level must be between 1 and 10'),
];

const submitAttemptRules = [
  body().custom((value, { req }) => {
    if (!req.body.userPrompt && !req.body.prompt) {
      throw new Error('Either userPrompt or prompt is required');
    }
    return true;
  }),
  body('userPrompt').optional().isString().withMessage('userPrompt must be a string'),
  body('prompt').optional().isString().withMessage('prompt must be a string'),
];

const updateSubmissionRules = [
  body('userPrompt').optional().isString().withMessage('userPrompt must be a string').trim(),
];

const paramIdRules = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

const paramLevelRules = [
  param('id').isInt({ min: 1 }).withMessage('Invalid level number'),
];

module.exports = {
  registerRules,
  loginRules,
  createChallengeRules,
  updateChallengeRules,
  submitAttemptRules,
  updateSubmissionRules,
  paramIdRules,
  paramLevelRules,
};
