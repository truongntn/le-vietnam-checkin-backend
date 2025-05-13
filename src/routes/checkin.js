const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CheckIn = require('../models/CheckIn');
const Queue = require('../models/Queue');
const auth = require('../middleware/auth');

router.post('/checkin', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number is required' });

  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
      await user.save();
    }

    const checkIn = new CheckIn({ userId: user._id });
    await checkIn.save();

    user.rewardPoints += checkIn.rewardPointsEarned;
    await user.save();

    const lastQueue = await Queue.findOne().sort({ position: -1 });
    const position = lastQueue ? lastQueue.position + 1 : 1;
    const estimatedWaitTime = position * 5;
    const queueEntry = new Queue({
      userId: user._id,
      position,
      estimatedWaitTime,
      customerName: user.name,
      name: user.name,
      customerPhone: user.phone,
    });
    await queueEntry.save();

    res.json({
      rewardPoints: user.rewardPoints,
      queuePosition: position,
      estimatedWaitTime,
      customerName: user.name,
      customerPhone: user.phone,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const queueEntry = await Queue.findOne({ userId: user._id }).sort({ checkInTime: -1 });
    res.json({
      rewardPoints: user.rewardPoints,
      queuePosition: queueEntry ? queueEntry.position : null,
      estimatedWaitTime: queueEntry ? queueEntry.estimatedWaitTime : null,
      customerName: user.name,
      customerPhone: user.phone,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all check-ins
router.get('/', auth, async (req, res) => {
  try {
    const checkIns = await CheckIn.find().populate('userId', 'phone name');
    res.json(checkIns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a check-in
router.put('/:id', auth, async (req, res) => {
  const { rewardPointsEarned } = req.body;
  try {
    const checkIn = await CheckIn.findById(req.params.id);
    if (!checkIn) return res.status(404).json({ message: 'Check-in not found' });

    checkIn.rewardPointsEarned = rewardPointsEarned !== undefined ? rewardPointsEarned : checkIn.rewardPointsEarned;
    await checkIn.save();

    // Update user's reward points
    const user = await User.findById(checkIn.userId);
    const oldPoints = await CheckIn.findById(req.params.id).select('rewardPointsEarned');
    user.rewardPoints = user.rewardPoints - oldPoints.rewardPointsEarned + checkIn.rewardPointsEarned;
    await user.save();

    res.json(checkIn);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a check-in
router.delete('/:id', auth, async (req, res) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id);
    if (!checkIn) return res.status(404).json({ message: 'Check-in not found' });

    // Subtract points from user
    const user = await User.findById(checkIn.userId);
    user.rewardPoints -= checkIn.rewardPointsEarned;
    await user.save();

    await CheckIn.findByIdAndDelete(req.params.id);
    res.json({ message: 'Check-in deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;