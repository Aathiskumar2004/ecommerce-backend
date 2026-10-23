import multer from "multer";
import * as XLSX from "xlsx";

// Memory storage for file upload (files-ai RAM-la parse panna)
const upload = multer({ storage: multer.memoryStorage() });

/* ===================================================
   BULK IMPORT PRODUCTS VIA EXCEL / CSV
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

      // 4. MongoDB-la bulk-ah ore time-la insert panrom
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
export default router;