import express from "express";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// ========================================
// PUBLIC ROUTE — ANYONE CAN VIEW PRODUCTS
// ========================================
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ====================================================
// ADMIN ONLY ROUTES  (Protected after this middleware)
// ====================================================
router.use(authMiddleware, adminMiddleware);

// ========================================
// GET PRODUCT BY ID  (ADMIN ONLY)
// ========================================
router.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========================================
// ADD PRODUCT
// ========================================
router.post("/product", async (req, res) => {
  try {
    const { name, brand, price, image } = req.body;

    if (!name || !brand || !price || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.create({ name, brand, price, image });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// UPDATE PRODUCT
// ========================================
router.put("/product/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========================================
// DELETE PRODUCT
// ========================================
router.delete("/product/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
