const mongoose = require("mongoose");

const dailyRewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  claimedDates: [
    {
      date: {
        type: Date,
        required: true
      },
      amount: {
        type: Number,
        required: true
      }
    }
  ]
}, {
  timestamps: true
});

const DailyReward = mongoose.model("DailyReward", dailyRewardSchema);

module.exports = DailyReward;