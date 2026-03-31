const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Submission = require('../models/Submission');
const validate = require('../middleware/validate');
const { paramIdRules, updateSubmissionRules } = require('../middleware/validators');

router.use(authMiddleware);

// GET / — list submissions for logged-in user
router.get('/', async (req, res, next) => {
  try {
    const submissions = await Submission.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    next(err);
  }
});

// GET /:id — get a single submission
router.get('/:id', paramIdRules, validate, async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    if (submission.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.json(submission);
  } catch (err) {
    next(err);
  }
});

// PUT /:id — update a submission (user notes / prompt only)
router.put('/:id', paramIdRules, updateSubmissionRules, validate, async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    if (submission.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.body.userPrompt !== undefined) {
      submission.userPrompt = req.body.userPrompt;
    }
    await submission.save();
    return res.json(submission);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id — delete a submission
router.delete('/:id', paramIdRules, validate, async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    if (submission.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await submission.deleteOne();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
