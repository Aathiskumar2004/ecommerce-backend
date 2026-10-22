import express from "express";
import Cart from "../models/Cart.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================================
   1. GET USER CART
   GET /api/cart/my-cart
================================ */
router.get("/my-cart", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // User id vachu avanga cart table-la irundhu edukkuroam
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.productId",
      select: "name price image brand",
    });

    // Cart illana pudhu empty cart create pannikalam
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Frontend Cart.jsx expects an array of items with populated productId
    res.json(cart.items || []);
  } catch (error) {
    console.error("GET CART ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   2. ADD TO CART
   POST /api/cart/add
================================ */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;

    if (!productId || !size || !quantity) {
      return res.status(400).json({ message: "Missing cart data" });
    }

    // User-oda cart document kandupidikiroam
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Ore product & ore size already iruka nu check panrom
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size
    );

    if (existingIndex > -1) {
      // Already irundha quantity increase panrom
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      // Illana pudhu item push panrom
      cart.items.push({
        productId,
        size,
        quantity: Number(quantity),
      });
    }

    await cart.save();

    res.json({
      message: "Added to cart successfully",
      items: cart.items,
    });
  } catch (error) {
    console.error("ADD CART ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   3. REMOVE FROM CART
   DELETE /api/cart/remove/:productId/:size
================================ */
router.delete("/remove/:productId/:size", authMiddleware, async (req, res) => {
  try {
    const { productId, size } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Filter out the selected product and size
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.size === size
        )
    );

    await cart.save();

    // Populate panni return panrom so frontend instantly render aagum
    await cart.populate({
      path: "items.productId",
      select: "name price image brand",
    });

    res.json(cart.items || []);
  } catch (error) {
    console.error("REMOVE CART ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;