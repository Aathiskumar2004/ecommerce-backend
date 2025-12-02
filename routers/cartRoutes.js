import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 Get logged-in user's cart
router.get("/my-cart", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).populate("cart.productId");
  res.json(user.cart);
});

// 🔥 Add to cart
router.post("/add", authMiddleware, async (req, res) => {
  const { productId, size, quantity } = req.body;

  const user = await User.findById(req.user.id);

  const existing = user.cart.find(
    (p) => p.productId.toString() === productId && p.size === size
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    user.cart.push({ productId, size, quantity });
  }

  await user.save();
  res.json({ message: "Added to cart", cart: user.cart });
});

// 🔥 Remove from cart
router.delete("/remove/:productId/:size", authMiddleware, async (req, res) => {
  const { productId, size } = req.params;

  const user = await User.findById(req.user.id);

  user.cart = user.cart.filter(
    (item) => !(item.productId.toString() === productId && item.size === size)
  );

  await user.save();
  res.json({ message: "Removed", cart: user.cart });
});

export default router;
