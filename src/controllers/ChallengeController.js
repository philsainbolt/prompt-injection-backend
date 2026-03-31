const { generateResponse } = require('../services/llmAdapter');
const { containsSecretPassword } = require('../utils/passwordDetection');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const User = require('../models/User');

const SENSITIVE_FIELDS = '-systemPrompt -secretPassword -secret -system_prompt -secret_password';

class ChallengeController {
  static async getAllChallenges(req, res, next) {
    try {
      const challenges = await Challenge.find()
        .select(SENSITIVE_FIELDS)
        .sort({ level: 1 });
      res.json(challenges);
    } catch (err) {
      next(err);
    }
  }

  static async getChallengeById(req, res, next) {
    try {
      const challenge = await Challenge.findById(req.params.id)
        .select(SENSITIVE_FIELDS);

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      return res.json(challenge);
    } catch (err) {
      next(err);
    }
  }

  static async createChallenge(req, res, next) {
    try {
      const challenge = await Challenge.create(req.body);
      const safe = challenge.toObject();
      delete safe.systemPrompt;
      delete safe.secretPassword;
      delete safe.secret;
      delete safe.system_prompt;
      delete safe.secret_password;
      return res.status(201).json(safe);
    } catch (err) {
      next(err);
    }
  }

  static async updateChallenge(req, res, next) {
    try {
      const challenge = await Challenge.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      const safe = challenge.toObject();
      delete safe.systemPrompt;
      delete safe.secretPassword;
      delete safe.secret;
      delete safe.system_prompt;
      delete safe.secret_password;
      return res.json(safe);
    } catch (err) {
      next(err);
    }
  }

  static async deleteChallenge(req, res, next) {
    try {
      const challenge = await Challenge.findByIdAndDelete(req.params.id);

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async submitAttempt(req, res, next) {
    try {
      const { prompt, userPrompt } = req.body;
      const normalizedPrompt = userPrompt || prompt;
      const challenge = await Challenge.findById(req.params.id);

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      if (!normalizedPrompt || typeof normalizedPrompt !== 'string') {
        return res.status(400).json({ error: 'prompt or userPrompt is required' });
      }

      const systemPrompt = challenge.systemPrompt || challenge.system_prompt;
      const secretPassword = challenge.secretPassword || challenge.secret_password || challenge.secret;

      const llmResponse = await generateResponse(systemPrompt, normalizedPrompt);
      const success = containsSecretPassword(llmResponse, secretPassword);

      const submission = await Submission.create({
        userId: req.userId,
        challengeId: challenge._id,
        userPrompt: normalizedPrompt,
        llmResponse,
        success,
      });

      let progress = null;
      if (success) {
        const level = challenge.level || challenge.order;
        await User.findByIdAndUpdate(req.userId, {
          $addToSet: { beatenLevels: level },
          $max: { progressLevel: level + 1 },
        });
        const user = await User.findById(req.userId);
        const beaten = (user.beatenLevels || []).sort((a, b) => a - b);
        progress = { beaten, beatenLevels: beaten, currentLevel: user.progressLevel };
      }

      return res.json({
        success,
        pass: success,
        response: llmResponse,
        hint: success ? undefined : 'Try reframing your request and chaining transformations.',
        submissionId: submission._id,
        progress,
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = ChallengeController;
