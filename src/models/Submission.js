const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },

  userPrompt: {
    type: String,
    required: true,
  },

  llmResponse: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

submissionSchema.index({ userId: 1, challengeId: 1, createdAt: -1 });
submissionSchema.index({ userId: 1, success: 1, createdAt: -1 });


module.exports = mongoose.model('Submission', submissionSchema);
