const ChallengeService = require('../services/ChallengeService');
const LLMService = require('../services/LLMService');
const Submission = require('../models/Submission');

class ChallengeController {
  static async getAllChallenges(req, res, next) {
    try {
      const challenges = await ChallengeService.getAllChallenges();
      res.json(challenges);
    } catch (err) {
      next(err);
    }
  }

  static async getChallengeById(req, res, next) {
    try {
      const challenge = await ChallengeService.getChallengeById(req.params.id);
      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }
      res.json(challenge);
    } catch (err) {
      next(err);
    }
  }

  static async submitAnswer(req, res, next) {
    try {
      const { challengeId, userInput } = req.body;
      const userId = req.userId;

      if (!challengeId || !userInput) {
        return res.status(400).json({ error: 'Missing challengeId or userInput' });
      }

      const challenge = await ChallengeService.getChallengeById(challengeId);
      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      // Call LLM service
      const llmResponse = await LLMService.callOllama(challenge.systemPrompt, userInput);

      // Check if secret is revealed
      const success = await LLMService.checkSecretInResponse(llmResponse, challenge.secret);

      // Save submission
      const submission = new Submission({
        userId,
        challengeId,
        userInput,
        llmResponse,
        success,
      });

      await submission.save();

      res.json({
        submission,
        success,
        hint: success ? challenge.explanation : 'Try a different approach',
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChallengeController;
