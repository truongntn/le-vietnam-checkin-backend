const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Staff = require('../models/Staff');
const Queue = require('../models/Queue');

// @route   POST api/staff
// @desc    Create a staff member
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, email, assignedQueues } = req.body;

  try {
    // Validate name
    if (!name) {
      return res.status(400).json({ msg: 'Name is required' });
    }

    // Validate assignedQueues (if provided)
    let validatedQueues = [];
    if (assignedQueues && Array.isArray(assignedQueues)) {
      const queuesExist = await Queue.find({ '_id': { $in: assignedQueues } });
      if (queuesExist.length !== assignedQueues.length) {
        return res.status(400).json({ msg: 'One or more queue IDs are invalid' });
      }
      validatedQueues = assignedQueues;
    }

    const staff = new Staff({
      name,
      email,
      assignedQueues: validatedQueues,
    });

    await staff.save();
    await staff.populate('assignedQueues', 'name');
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/staff
// @desc    Get all staff members
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const staff = await Staff.find();
    console.log('Staff before population:', staff); // Debug log: raw staff data
    const populatedStaff = await Staff.find().populate('assignedQueues', 'name');
    console.log('Staff after population:', populatedStaff); // Debug log: populated staff data
    res.json(populatedStaff);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/staff/:id
// @desc    Update a staff member
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, email, assignedQueues } = req.body;

  try {
    let staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ msg: 'Staff not found' });
    }

    // Update fields
    if (name) staff.name = name;
    if (email !== undefined) staff.email = email;
    if (assignedQueues !== undefined) {
      let validatedQueues = [];
      if (Array.isArray(assignedQueues)) {
        const queuesExist = await Queue.find({ '_id': { $in: assignedQueues } });
        if (queuesExist.length !== assignedQueues.length) {
          return res.status(400).json({ msg: 'One or more queue IDs are invalid' });
        }
        validatedQueues = assignedQueues;
      }
      staff.assignedQueues = validatedQueues;
    }

    await staff.save();
    await staff.populate('assignedQueues', 'name');
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/staff/:id
// @desc    Delete a staff member
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ msg: 'Staff not found' });
    }

    await staff.deleteOne();
    res.json({ msg: 'Staff removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;