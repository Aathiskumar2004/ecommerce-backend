import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Create product
router.post("/bulk", async (req, res) => {
  try {
    const products = await Product.insertMany(req.body);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Bulk insert failed" });
  }
});

export default router;
