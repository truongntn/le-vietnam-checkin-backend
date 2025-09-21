const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const auth = require("../middleware/auth");

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD${timestamp}${random}`;
};

// Create a new order
router.post("/", async (req, res) => {
  const { phone, name, items, paymentMethod, notes, estimatedPickupTime } =
    req.body;

  if (
    !phone ||
    !name ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      message: "Phone, name, and items array are required",
    });
  }

  try {
    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone, name });
      await user.save();
    }

    // Calculate totals
    let subtotal = 0;
    const orderDetails = [];

    for (const item of items) {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      orderDetails.push({
        productName: item.productName,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        note: item.note || "",
        category: item.category || "",
        totalPrice: itemTotal,
      });
    }

    const tax = subtotal * 0; // 10% tax
    const totalAmount = subtotal + tax;

    // Create order
    const order = new Order({
      userId: user._id,
      phone,
      name,
      orderNumber: generateOrderNumber(),
      subtotal,
      tax,
      totalAmount,
      paymentMethod: paymentMethod || "cash",
      notes: notes || "",
      estimatedPickupTime: estimatedPickupTime
        ? new Date(estimatedPickupTime)
        : null,
    });

    await order.save();

    // Create order details
    for (const detail of orderDetails) {
      const orderDetail = new OrderDetail({
        orderId: order._id,
        ...detail,
      });
      await orderDetail.save();
    }

    // Populate order details for response
    const populatedOrder = await Order.findById(order._id).populate(
      "userId",
      "phone name rewardPoints"
    );

    res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
      orderDetails: orderDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders (with pagination) - excluding completed orders
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, phone } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: { $ne: "completed" } }; // Exclude completed orders
    if (status) query.status = status;
    if (phone) query.phone = phone;

    const orders = await Order.find(query)
      .populate("userId", "phone name rewardPoints")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get history orders (with pagination)
router.get("/history", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, phone } = req.query;
    const skip = (page - 1) * limit;

    // Get the current date and set it to the beginning of the day (UTC)
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    // Get the beginning of the next day (UTC)
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);

    let query = {
      status: "completed",
      updatedAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }; // Completed orders
    if (status) query.status = status;
    if (phone) query.phone = phone;

    const orders = await Order.find(query)
      .populate("userId", "phone name rewardPoints")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get latest order with checkinStatus: true and active status
router.get("/latest", async (req, res) => {
  try {
    const query = {
      status: { $in: ["pending", "confirmed", "preparing", "ready"] },
      checkinStatus: true,
      showWelcome: false,
    };
    const latestOrder = await Order.findOne(query).sort({ createdAt: -1 });
    if (!latestOrder) {
      return res
        .status(404)
        .json({ message: "No order found matching the condition." });
    }
    latestOrder.showWelcome = true;
    await latestOrder.save();
    res.json(latestOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get order by ID with details
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "phone name rewardPoints"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderDetails = await OrderDetail.find({ orderId: order._id });

    res.json({
      order,
      orderDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get orders by user phone
router.get("/user/:phone", async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orders = await Order.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order status
router.put("/:id/status", async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update payment status
router.put("/:id/payment", auth, async (req, res) => {
  const { paymentStatus } = req.body;

  if (!paymentStatus) {
    return res.status(400).json({ message: "Payment status is required" });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order details
router.put("/:id", auth, async (req, res) => {
  const {
    status,
    paymentStatus,
    notes,
    estimatedPickupTime,
    totalAmount,
    subtotal,
    tax,
    discount,
  } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (notes !== undefined) order.notes = notes;
    if (estimatedPickupTime)
      order.estimatedPickupTime = new Date(estimatedPickupTime);
    if (totalAmount !== undefined) order.totalAmount = totalAmount;
    if (subtotal !== undefined) order.subtotal = subtotal;
    if (tax !== undefined) order.tax = tax;
    if (discount !== undefined) order.discount = discount;

    await order.save();

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete order
router.delete("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Delete order details first
    await OrderDetail.deleteMany({ orderId: order._id });

    // Delete order
    await Order.findByIdAndDelete(req.params.id);

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get order statistics
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const completedOrders = await Order.countDocuments({ status: "completed" });
    const totalRevenue = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;