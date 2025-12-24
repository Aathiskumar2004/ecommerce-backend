import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 STRICT check – id MUST exist
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = { id: decoded.id };
    return next(); // 🔥 important
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Auth failed" });
  }
};

export default protect;
