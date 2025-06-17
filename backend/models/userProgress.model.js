const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  attemptDate: {
    type: Date,
    default: Date.now
  },
  isCorrect: {
    type: Boolean, 
    default: false
  },
  cumulativeTime: {
    type: Number,
    default: 0,  // Total time up to this attempt
  },
  attemptNumber: {
    type: Number,
    default: 1
  }
}, { _id: false });

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.Mixed, // Changed to Mixed to support numeric IDs
    required: true
  },
  exercisesCompleted: {
    type: Number,
    default: 0
  },
  totalExercises: {
    type: Number,
    default: 1
  },
  completed: {
    type: Boolean,
    default: false
  },
  totalTimeSpent: {
    type: Number,
    default: 0
  },
  lastAttemptTime: {  // Add this new field
    type: Number,
    default: 0
  },
  attempts: [attemptSchema],
  lastAttemptDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index for userId and quizId
userProgressSchema.index({ userId: 1, quizId: 1 }, { unique: true });

const UserProgress = mongoose.model("UserProgress", userProgressSchema);
module.exports = UserProgress;