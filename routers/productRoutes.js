import express from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Memory storage for file upload (files-ai RAM-la parse panna)
const upload = multer({ storage: multer.memoryStorage() });

/* ===================================================
   1. GET ALL PRODUCTS (Public)
   GET /api/products
=================================================== */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/* ===================================================
   2. GET SINGLE PRODUCT BY ID (Public)
   GET /api/products/:id
=================================================== */
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

/* ===================================================
   3. ADD SINGLE PRODUCT (Admin Only)
   POST /api/products
=================================================== */
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

/* ===================================================
   4. BULK IMPORT PRODUCTS VIA EXCEL / CSV (Admin Only)
   POST /api/products/bulk-upload
=================================================== */
router.post(
  "/bulk-upload",
  authMiddleware,
  adminMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Please upload an Excel or CSV file" });
      }

      // 1. Read Excel file buffer
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // 2. Convert Excel rows to JSON
      const rawData = XLSX.utils.sheet_to_json(sheet);

      if (rawData.length === 0) {
        return res.status(400).json({ message: "Uploaded file is empty" });
      }

      // 3. Format and clean data to match Product model
      const formattedProducts = rawData.map((row) => ({
        name: row.Name || row.name || row.title,
        brand: row.Brand || row.brand,
        price: Number(row.Price || row.price) || 0,
        image:
          row.Image ||
          row.image ||
          "https://via.placeholder.com/400x500?text=No+Image",
      }));

      // 4. MongoDB-la bulk-ah insert panrom
      const inserted = await Product.insertMany(formattedProducts);

      res.status(201).json({
        message: `Successfully imported ${inserted.length} products! 🎉`,
        count: inserted.length,
      });
    } catch (error) {
      console.error("BULK UPLOAD ERROR:", error);
      res.status(500).json({
        message: "Failed to process Excel file",
        error: error.message,
      });
    }
  }
);

/* ===================================================
   5. UPDATE PRODUCT (Admin Only)
   PUT /api/products/:id
=================================================== */
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

/* ===================================================
   6. DELETE PRODUCT (Admin Only)
   DELETE /api/products/:id
=================================================== */
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