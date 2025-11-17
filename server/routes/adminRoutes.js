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
  getAllChatsAdmin,
  deleteChatAdmin,
} from "../controllers/adminController.js";
import {
  getAllConfessionsAdmin,
  deleteConfessionAdmin,
} from "../controllers/confessionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin Status (only needs auth, not admin verification)
router.get("/check-status", authMiddleware, checkAdminStatus);

// Domains CRUD
router.get("/domains", adminMiddleware, getAllDomains);
router.post("/domains", adminMiddleware, addDomain);
router.put("/domains/:id", adminMiddleware, updateDomain);
router.delete("/domains/:id", adminMiddleware, deleteDomain);

// Admins CRUD
router.post("/admins", adminMiddleware, addAdmin);

// Users CRUD
router.get("/users", adminMiddleware, getAllUsersAdmin);
router.delete("/users/:userId", adminMiddleware, deleteUserAdmin);

// Chat Rooms CRUD
router.get("/chats", adminMiddleware, getAllChatsAdmin);
router.delete("/chats/:chatId", adminMiddleware, deleteChatAdmin);

// Confessions CRUD
router.get("/confessions", adminMiddleware, getAllConfessionsAdmin);
router.delete(
  "/confessions/:confessionId",
  adminMiddleware,
  deleteConfessionAdmin
);

export default router;
