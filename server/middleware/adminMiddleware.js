import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

const adminMiddleware = async (req, res, next) => {
  try {
    // Step 1: Authenticate user (verify JWT token)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user to request
    req.user = user;

    // Step 2: Check if user is an admin
    const admin = await Admin.findOne({
      email: user.email.toLowerCase(),
    });

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Admin access required",
      });
    }

    // Attach admin info to request
    req.admin = admin;
    next();
  } catch (error) {
    console.error(`Admin Middleware Error: ${error.message}`);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid or expired token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

export default adminMiddleware;
