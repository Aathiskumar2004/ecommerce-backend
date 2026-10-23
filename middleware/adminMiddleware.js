import User from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId);

    if (user && user.role?.toLowerCase() === "admin") {
      next(); 
    } else {
      return res.status(403).json({ message: "Admin access only" });
    }
  } catch (error) {
    console.error("ADMIN MIDDLEWARE ERROR:", error);
    res.status(500).json({ message: "Server error in admin authorization" });
  }
};

export default adminMiddleware;