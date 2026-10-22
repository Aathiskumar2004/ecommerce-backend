import express from "express";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

// 👉 INDHA LINE MISS AAGIRUKKU:
const router = express.Router();

/* =========================================
   CREATE ORDER
   POST /api/orders
========================================= */
router.post("/", async (req, res) => {
  try {
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod, 
      totalPrice, 
      userId, 
      userName,
      userEmail 
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No items in cart" });
    }

    const order = new Order({
      user: userId || null,
      userName: userName || shippingAddress?.name || "Customer",
      userEmail: userEmail || "",
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "cod",
      totalPrice,
    });

    const savedOrder = await order.save();

    // Clear cart table if logged in
    if (userId) {
      await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    }

    res.status(201).json({
      message: "Order placed successfully!",
      order: savedOrder,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
});

/* =========================================
   GET ALL ORDERS (Admin)
   GET /api/orders
========================================= */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

export default router;