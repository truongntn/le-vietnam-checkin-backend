const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phone: { type: String, required: true },
  name: { type: String, required: true },
  status: {type: String, enum: ['waiting', 'done'], default: 'waiting' },
  checkInTime: { type: Date, default: Date.now },
  rewardPointsEarned: { type: Number, default: 1 },
});

module.exports = mongoose.model('CheckIn', checkInSchema);