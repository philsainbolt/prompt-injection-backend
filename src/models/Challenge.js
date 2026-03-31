const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  // Canonical challenge fields
  level: {
    type: Number,
    min: 1,
    max: 10,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  systemPrompt: {
    type: String,
    required: true,
  },
  secretPassword: {
    type: String,
  },
  explanation: {
    type: String,
    required: true,
  },
  nextTechniqueHint: {
    type: String,
  },

  // Legacy compatibility fields used by current seed/services/controllers
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  technique: {
    type: String,
    required: true,
  },
  secret: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

challengeSchema.index({ level: 1 }, { unique: true, sparse: true });
challengeSchema.index({ order: 1 }, { unique: true, sparse: true });


module.exports = mongoose.model('Challenge', challengeSchema);
