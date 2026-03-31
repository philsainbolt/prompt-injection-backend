function calculateCurrentLevel(beatenLevels, challenges) {
  for (const c of challenges) {
    if (!beatenLevels.includes(c.level)) {
      return c.level;
    }
  }
  return challenges.length + 1;
}

module.exports = { calculateCurrentLevel };
