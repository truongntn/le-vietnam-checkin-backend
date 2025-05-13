const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  assignedQueues: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Staff', staffSchema);