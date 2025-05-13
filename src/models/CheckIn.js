const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkInTime: { type: Date, default: Date.now },
  rewardPointsEarned: { type: Number, default: 10 },
});

module.exports = mongoose.model('CheckIn', checkInSchema);