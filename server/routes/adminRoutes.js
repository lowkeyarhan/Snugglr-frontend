import express from "express";
import {
  addDomain,
  updateDomain,
  deleteDomain,
  addAdmin,
  checkAdminStatus,
  getAllDomains,
  getDomainById,
  getAllUsersAdmin,
  getUsersByCommunity,
  deleteUserAdmin,
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Status
router.get("/check-status", authMiddleware, checkAdminStatus);

// Domains CRUD
router.get("/domains", authMiddleware, getAllDomains);
router.get("/domains/:id", authMiddleware, getDomainById);
router.post("/domains", authMiddleware, addDomain);
router.put("/domains/:id", authMiddleware, updateDomain);
router.delete("/domains/:id", authMiddleware, deleteDomain);

// Admins CRUD
router.post("/admins", authMiddleware, addAdmin);

// Users CRUD
router.get("/users", authMiddleware, getAllUsersAdmin);
router.get("/users/community/:community", authMiddleware, getUsersByCommunity);
router.delete("/users/:userId", authMiddleware, deleteUserAdmin);

export default router;
