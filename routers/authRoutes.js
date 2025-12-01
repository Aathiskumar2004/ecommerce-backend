import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, adminCode } = req.body;

    // 🔍 Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 🔍 Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 🔐 Default role = user
    let userRole = "user";

    // 🔐 Admin validation
    if (role === "admin") {
      if (adminCode !== process.env.ADMIN_CODE) {
        return res.status(403).json({
          message: "Invalid admin code",
        });
      }
      userRole = "admin";
    }

    // 🔑 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📝 Save user
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    // 🎉 Success
    res.status(201).json({
      message: `User registered as ${userRole}`,
    });

  } catch (error) {
    res.status(500).json({
      message: `Something went wrong: ${error.message}`,
    });
  }
});


// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Token create
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
