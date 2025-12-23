import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||               // from cookie
      req.headers.authorization?.split(" ")[1]; // from header

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // IMPORTANT: ensure req.user.id exists
    req.user = { id: decoded.id || decoded._id };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

export default protect;
