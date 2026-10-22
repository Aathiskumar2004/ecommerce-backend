import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routers/authRoutes.js";
import productRoutes from "./routers/productRoutes.js";
import cartRoutes from "./routers/cartRoutes.js";
import cookieParser from "cookie-parser";
import orderRoutes from "./routers/orderRoutes.js";


dotenv.config();

const app = express();


const allowedOrigins = [
  "https://ecommerce-frontend-ebon-delta.vercel.app",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman / server-side requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ---------------- Middleware ----------------
app.use(express.json());
app.use(cookieParser());   
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// ---------------- DB ----------------
connectDB();

// ---------------- Routes ----------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// ---------------- Error Handler ----------------
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// ---------------- Server ----------------
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
