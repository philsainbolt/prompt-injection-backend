const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Submission = require('../models/Submission');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const submissions = await Submission.find({ userId: req.userId });
    res.json(submissions);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    if (submission.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json(submission);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
