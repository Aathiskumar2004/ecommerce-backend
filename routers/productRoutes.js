import express from "express";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

/* ========================================
   1. GET ALL PRODUCTS (Public)
   GET /api/products
======================================== */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/* ========================================
   2. GET SINGLE PRODUCT (Public)
   GET /api/products/:id
======================================== */
router.get("/:id", async (req, res) => {
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

/* ========================================
   3. ADD PRODUCT (Admin Only)
   POST /api/products
======================================== */
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, brand, price, image } = req.body;

    if (!name || !brand || !price || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.create({
      name,
      brand,
      price: Number(price),
      image,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message || "Failed to create product" });
  }
});

/* ========================================
   4. UPDATE PRODUCT (Admin Only)
   PUT /api/products/:id
======================================== */
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product updated successfully", product: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ========================================
   5. DELETE PRODUCT (Admin Only)
   DELETE /api/products/:id
======================================== */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
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