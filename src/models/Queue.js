// src/models/Queue.js
const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  estimatedTime: {
    type: Number,
  },
  assignedStaff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Queue', queueSchema);