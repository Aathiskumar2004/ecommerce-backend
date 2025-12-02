import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routers/authRoutes.js";
import adminRouter from "./routers/adminRoutes.js";
import cartRoutes from "./routers/cartRoutes.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// Rate Limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, try again later",
  })
);

// ⭐ FIXED CORS FOR FRONTEND + RENDER
app.use(
  cors({
    origin: ["http://localhost:5173"],   // your LOCAL frontend
    credentials: true,                   // allow cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ⭐ Allow cookies to pass through
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// IMPORTANT: Helmet must not override CORS
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", adminRouter);
app.use("/api/cart", cartRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
