import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/my-cart", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id).populate({
      path: "cart.productId",
      select: "name price image brand",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // safety
    if (!user.cart) user.cart = [];

    res.json(user.cart);
  } catch (error) {
    console.error("GET CART ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;

    if (!productId || !size || !quantity) {
      return res.status(400).json({ message: "Missing cart data" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.cart) user.cart = [];

    const existingItem = user.cart.find(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      user.cart.push({
        productId,
        size,
        quantity: Number(quantity),
      });
    }

    await user.save();

    res.json({
      message: "Added to cart",
      cart: user.cart,
    });
  } catch (error) {
    console.error("ADD CART ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete(
  "/remove/:productId/:size",
  authMiddleware,
  async (req, res) => {
    try {
      const { productId, size } = req.params;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.cart) user.cart = [];

      user.cart = user.cart.filter(
        (item) =>
          !(
            item.productId.toString() === productId &&
            item.size === size
          )
      );

      await user.save();

      res.json({
        message: "Removed from cart",
        cart: user.cart,
      });
    } catch (error) {
      console.error("REMOVE CART ERROR:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
