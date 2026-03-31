const Challenge = require('../models/Challenge');
const challenges = require('./challenges');

const techniques = {
  1: 'basic injection',
  2: 'indirect framing',
  3: 'reasoning bypass',
  4: 'narrative manipulation',
  5: 'meta attack',
};

async function seedChallenges() {
  try {
    const count = await Challenge.countDocuments();
    if (count > 0) {
      console.log(`Challenges already seeded (${count} found), skipping.`);
      return;
    }

    const docs = challenges.map((c) => ({
      level: c.level,
      title: c.title,
      description: c.description,
      systemPrompt: c.systemPrompt,
      secretPassword: c.secretPassword,
      secret: c.secretPassword,
      technique: techniques[c.level] || 'unknown',
      explanation: c.description,
      order: c.level,
    }));

    await Challenge.insertMany(docs);
    console.log(`Seeded ${docs.length} challenges.`);
  } catch (err) {
    console.error('Challenge seed error:', err.message);
  }
}

module.exports = seedChallenges;
