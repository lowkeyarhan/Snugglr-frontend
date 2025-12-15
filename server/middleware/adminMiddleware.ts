import { Request, Response, NextFunction } from "express";

// admin middleware - allows both admin and superadmin
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // check if user is an admin or superadmin
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Admins or superadmins only. Touch grass.",
    });
  }

  // continue to the next middleware
  next();
};

// superadmin middleware - allows only superadmin
export const superadminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // check if user is a superadmin
  if (req.user.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Superadmins only.",
    });
  }

  // continue to the next middleware
  next();
};
