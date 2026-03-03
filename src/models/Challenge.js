const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  technique: {
    type: String,
    required: true,
  },
  systemPrompt: {
    type: String,
    required: true,
  },
  secret: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  nextTechniqueHint: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
