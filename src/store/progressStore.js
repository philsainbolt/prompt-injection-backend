const challenges = require('../config/challenges');

const state = {
  beaten: new Set(),
};

function getProgress() {
  const beaten = Array.from(state.beaten).sort((a, b) => a - b);
  let currentLevel = 1;

  for (const challenge of challenges) {
    const level = challenge.level || challenge.id;
    if (!state.beaten.has(level)) {
      currentLevel = level;
      return { beaten, currentLevel };
    }
  }

  currentLevel = challenges.length + 1;
  return { beaten, currentLevel };
}

function markBeaten(id) {
  state.beaten.add(id);
  return getProgress();
}

function resetProgress() {
  state.beaten = new Set();
}

module.exports = {
  getProgress,
  markBeaten,
  resetProgress,
};
