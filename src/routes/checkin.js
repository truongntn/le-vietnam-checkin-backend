const express = require("express");
const router = express.Router();
const User = require("../models/User");
const CheckIn = require("../models/CheckIn");
const Queue = require("../models/Queue");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

router.post("/checkin", async (req, res) => {
  const { phone } = req.body;
  const { status } = req.body;
  if (!phone)
    return res.status(400).json({ message: "Phone number is required" });

  try {
    // Check for pending orders first
    const pendingOrder = await Order.findOne({ 
      phone: phone, 
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] } 
    });

    if (pendingOrder) {
      return res.status(400).json({ 
        message: "You have a waiting order.",
        pendingOrder: {
          orderNumber: pendingOrder.orderNumber,
          status: pendingOrder.status,
          totalAmount: pendingOrder.totalAmount,
          createdAt: pendingOrder.createdAt,
          phone: pendingOrder.phone,
          name: pendingOrder.name,
        }
      });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
      await user.save();
    }

    const checkIn = new CheckIn({ 
      userId: user._id, 
      phone, 
      name: user.name || 'Guest', 
      status 
    });
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
      customerName: user.name || 'Guest',
      name: user.name || 'Guest',
      customerPhone: user.phone,
    });
    await queueEntry.save();

    // Update latest active order's checkin_status to true
    const latestOrder = await Order.findOne({
      phone: user.phone,
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] },
      checkin_status: false
    }).sort({ createdAt: -1 });
    if (latestOrder) {
      latestOrder.checkin_status = true;
      await latestOrder.save();
    }

    res.json({
      rewardPoints: user.rewardPoints,
      queuePosition: position,
      estimatedWaitTime,
      customerName: user.name || 'Guest',
      customerPhone: user.phone,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/completeCheckin", async (req, res) => {
  try {
    const { id } = req.body;
    const checkIn = await CheckIn.findById(id);
    if (!checkIn)
      return res.status(404).json({ message: "Check-in not found" });

    checkIn.status = "done";
    await checkIn.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user/:phone", async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const queueEntry = await Queue.findOne({ userId: user._id }).sort({
      checkInTime: -1,
    });

    // Check for pending orders
    const pendingOrder = await Order.findOne({ 
      phone: req.params.phone, 
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] } 
    });

    res.json({
      rewardPoints: user.rewardPoints,
      queuePosition: queueEntry ? queueEntry.position : null,
      estimatedWaitTime: queueEntry ? queueEntry.estimatedWaitTime : null,
      customerName: user.name,
      customerPhone: user.phone,
      hasPendingOrder: !!pendingOrder,
      pendingOrder: pendingOrder ? {
        orderNumber: pendingOrder.orderNumber,
        status: pendingOrder.status,
        totalAmount: pendingOrder.totalAmount,
        createdAt: pendingOrder.createdAt
      } : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all check-ins
router.get("/", async (req, res) => {
  try {
    const checkIns = await CheckIn.find({ status: "waiting" })
      .sort({ checkInTime: -1 })
      .populate("userId", "phone name");
    res.json(checkIns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a check-in
router.put("/:id", auth, async (req, res) => {
  const { rewardPointsEarned } = req.body;
  try {
    const checkIn = await CheckIn.findById(req.params.id);
    if (!checkIn)
      return res.status(404).json({ message: "Check-in not found" });

    checkIn.rewardPointsEarned =
      rewardPointsEarned !== undefined
        ? rewardPointsEarned
        : checkIn.rewardPointsEarned;
    await checkIn.save();

    // Update user's reward points
    const user = await User.findById(checkIn.userId);
    const oldPoints = await CheckIn.findById(req.params.id).select(
      "rewardPointsEarned"
    );
    user.rewardPoints =
      user.rewardPoints -
      oldPoints.rewardPointsEarned +
      checkIn.rewardPointsEarned;
    await user.save();

    res.json(checkIn);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a check-in
router.delete("/:id", auth, async (req, res) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id);
    if (!checkIn)
      return res.status(404).json({ message: "Check-in not found" });

    // Subtract points from user
    const user = await User.findById(checkIn.userId);
    user.rewardPoints -= checkIn.rewardPointsEarned;
    await user.save();

    await CheckIn.findByIdAndDelete(req.params.id);
    res.json({ message: "Check-in deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
