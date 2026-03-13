const challenges = require('../config/challenges');
const { getProgress, markBeaten } = require('../store/progressStore');

function getProgressHandler(req, res) {
  return res.json(getProgress());
}

function beatChallengeHandler(req, res) {
  const id = Number(req.params.id);
  const exists = challenges.some((challenge) => (challenge.level || challenge.id) === id);

  if (!exists) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  return res.json(markBeaten(id));
}

module.exports = {
  getProgressHandler,
  beatChallengeHandler,
};
