const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create a new user
router.post('/', auth, async (req, res) => {
  const { phone, name, rewardPoints } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number is required' });

  try {
    let user = await User.findOne({ phone });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ phone, name, rewardPoints: rewardPoints || 0 });
    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a user
router.put('/:id', auth, async (req, res) => {
  const { phone, name, rewardPoints } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({ phone });
      if (existingUser) return res.status(400).json({ message: 'Phone number already in use' });
      user.phone = phone;
    }
    user.name = name !== undefined ? name : user.name;
    user.rewardPoints = rewardPoints !== undefined ? rewardPoints : user.rewardPoints;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;