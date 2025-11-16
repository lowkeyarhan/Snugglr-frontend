import express from "express";
import {
  addDomain,
  updateDomain,
  deleteDomain,
  addAdmin,
  checkAdminStatus,
  getAllDomains,
  getAllUsersAdmin,
  deleteUserAdmin,
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Status
router.get("/check-status", authMiddleware, checkAdminStatus);

// Domains CRUD
router.get("/domains", authMiddleware, getAllDomains);
router.post("/domains", authMiddleware, addDomain);
router.put("/domains/:id", authMiddleware, updateDomain);
router.delete("/domains/:id", authMiddleware, deleteDomain);

// Admins CRUD
router.post("/admins", authMiddleware, addAdmin);

// Users CRUD
router.get("/users", authMiddleware, getAllUsersAdmin);
router.delete("/users/:userId", authMiddleware, deleteUserAdmin);

export default router;
