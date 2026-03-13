const challenges = require('../config/challenges');
const { generateResponse } = require('../services/llmAdapter');
const { containsSecretPassword } = require('../utils/passwordDetection');

class ChallengeController {
  static getAllChallenges(req, res) {
    res.json(challenges.map(({ secretPassword, secret_password, ...rest }) => rest));
  }

  static getChallengeById(req, res) {
    const id = Number(req.params.id);
    const challenge = challenges.find((item) => item.id === id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const { secretPassword, secret_password, ...safeChallenge } = challenge;
    return res.json(safeChallenge);
  }

  static async submitAttempt(req, res, next) {
    try {
      const id = Number(req.params.id);
      const { prompt, userPrompt } = req.body;
      const normalizedPrompt = userPrompt || prompt;
      const challenge = challenges.find((item) => item.id === id);

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      if (!normalizedPrompt || typeof normalizedPrompt !== 'string') {
        return res.status(400).json({ error: 'prompt or userPrompt is required' });
      }

      const systemPrompt = challenge.systemPrompt || challenge.system_prompt;
      const secretPassword = challenge.secretPassword || challenge.secret_password;

      const llmResponse = await generateResponse(systemPrompt, normalizedPrompt);
      const success = containsSecretPassword(llmResponse, secretPassword);

      return res.json({
        success,
        response: llmResponse,
        hint: success ? undefined : 'Try reframing your request and chaining transformations.',
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = ChallengeController;
