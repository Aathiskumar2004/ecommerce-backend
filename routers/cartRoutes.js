import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get logged-in user's cart
router.get("/my-cart", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id).populate("cart.productId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add to cart
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;

    if (!productId || !size || !quantity) {
      return res.status(400).json({ message: "Missing cart data" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = user.cart.find(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size
    );

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      user.cart.push({
        productId,
        size,
        quantity: Number(quantity),
      });
    }

    await user.save();
    res.json({ message: "Added to cart", cart: user.cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Remove from cart
router.delete("/remove/:productId/:size", authMiddleware, async (req, res) => {
  try {
    const { productId, size } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = user.cart.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.size === size
        )
    );

    await user.save();
    res.json({ message: "Removed", cart: user.cart });
  } catch (error) {
    console.error("Remove cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
