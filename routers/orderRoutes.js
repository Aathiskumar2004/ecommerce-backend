import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";

const router = express.Router();

/* =========================================
   CREATE ORDER (With User ID & Name)
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

    // Create Order with User ID & Name
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

    // User logged-in-ah irundha avanga backend cart-ai clear panrom
    if (userId) {
      await User.findByIdAndUpdate(userId, { cart: [] });
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
   GET ALL ORDERS (Admin-ku user details oda varum)
========================================= */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email") // User details populate
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

export default router;