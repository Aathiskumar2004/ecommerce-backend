import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";

const router = express.Router();

/* =========================================
   1. CREATE NEW ORDER (Checkout)
   POST /api/orders
========================================= */
router.post("/", async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice, userId } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items in cart" });
    }

    // Create Order in DB
    const order = new Order({
      user: userId || req.user?.id || null,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "cod",
      totalPrice,
    });

    const savedOrder = await order.save();

    // Oruvela user logged-in-ah irundha avanga cart-ai DB-la empty panrom
    if (userId || req.user?.id) {
      await User.findByIdAndUpdate(userId || req.user.id, { cart: [] });
    }

    res.status(201).json({
      message: "Order placed successfully!",
      order: savedOrder,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
});

/* =========================================
   2. GET ALL ORDERS (For Admin Panel)
   GET /api/orders
========================================= */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* =========================================
   3. UPDATE ORDER STATUS (For Admin)
   PUT /api/orders/:id/status
========================================= */
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

export default router;