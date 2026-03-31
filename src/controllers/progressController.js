const User = require('../models/User');
const Challenge = require('../models/Challenge');
const { calculateCurrentLevel } = require('../utils/progressCalc');

async function getProgressHandler(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const beaten = (user.beatenLevels || []).sort((a, b) => a - b);
    const challenges = await Challenge.find().select('level').sort({ level: 1 });
    const currentLevel = calculateCurrentLevel(beaten, challenges);

    return res.json({ beaten, beatenLevels: beaten, currentLevel, progressLevel: currentLevel });
  } catch (err) {
    next(err);
  }
}

async function beatChallengeHandler(req, res, next) {
  try {
    const level = Number(req.params.id);
    const challenge = await Challenge.findOne({ level });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { beatenLevels: level },
    });

    const user = await User.findById(req.userId);
    const beaten = (user.beatenLevels || []).sort((a, b) => a - b);
    const challenges = await Challenge.find().select('level').sort({ level: 1 });
    const currentLevel = calculateCurrentLevel(beaten, challenges);

    return res.json({ beaten, beatenLevels: beaten, currentLevel, progressLevel: currentLevel });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProgressHandler,
  beatChallengeHandler,
};
