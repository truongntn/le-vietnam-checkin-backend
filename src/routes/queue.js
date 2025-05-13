const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Queue = require('../models/Queue');
const Staff = require('../models/Staff');

// @route   POST api/queue
// @desc    Create a queue
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, estimatedTime, assignedStaff } = req.body;

  try {
    // Validate name
    if (!name) {
      return res.status(400).json({ msg: 'Queue name is required' });
    }

    // Validate assignedStaff (if provided)
    let validatedStaff = [];
    if (assignedStaff && Array.isArray(assignedStaff)) {
      const staffExists = await Staff.find({ '_id': { $in: assignedStaff } });
      if (staffExists.length !== assignedStaff.length) {
        return res.status(400).json({ msg: 'One or more staff IDs are invalid' });
      }
      validatedStaff = assignedStaff;
    }

    const queue = new Queue({
      name,
      estimatedTime: estimatedTime ? Number(estimatedTime) : undefined,
      assignedStaff: validatedStaff,
    });

    await queue.save();
    await queue.populate('assignedStaff', 'name');
    res.json(queue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/queue
// @desc    Get all queues
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const queues = await Queue.find().populate('assignedStaff', 'name');
    res.json(queues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/queue/:id
// @desc    Update a queue
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, estimatedTime, assignedStaff } = req.body;

  try {
    let queue = await Queue.findById(req.params.id);
    if (!queue) {
      return res.status(404).json({ msg: 'Queue not found' });
    }

    // Update fields
    if (name) queue.name = name;
    if (estimatedTime !== undefined) {
      queue.estimatedTime = estimatedTime ? Number(estimatedTime) : undefined;
    }
    if (assignedStaff !== undefined) {
      let validatedStaff = [];
      if (Array.isArray(assignedStaff)) {
        const staffExists = await Staff.find({ '_id': { $in: assignedStaff } });
        if (staffExists.length !== assignedStaff.length) {
          return res.status(400).json({ msg: 'One or more staff IDs are invalid' });
        }
        validatedStaff = assignedStaff;
      }
      queue.assignedStaff = validatedStaff;
    }

    await queue.save();
    await queue.populate('assignedStaff', 'name');
    res.json(queue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/queue/:id
// @desc    Delete a queue
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);
    if (!queue) {
      return res.status(404).json({ msg: 'Queue not found' });
    }

    await queue.deleteOne();
    res.json({ msg: 'Queue removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;