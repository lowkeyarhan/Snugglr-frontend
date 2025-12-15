import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

// Extend Express Request type to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        role: string;
        institution: string;
      };
    }
  }
}

// middleware to authenticate requests
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    // check if authorization header is provided and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token",
      });
    }

    // get the token from the authorization header
    const token = authHeader.split(" ")[1];

    // verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
      institution: string;
    };

    // attach user data to the request object
    req.user = {
      _id: decoded.userId,
      role: decoded.role,
      institution: decoded.institution,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
