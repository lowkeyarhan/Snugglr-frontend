import express from "express";
import {
  createConfession,
  getConfessions,
  likeConfession,
  commentOnConfession,
  likeComment,
  replyToComment,
  likeReply,
  manualCleanup,
} from "../controllers/confessionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createConfession);
router.get("/", authMiddleware, getConfessions);
router.post("/:confessionId/like", authMiddleware, likeConfession);
router.post("/:confessionId/comment", authMiddleware, commentOnConfession);
router.post(
  "/:confessionId/comment/:commentId/like",
  authMiddleware,
  likeComment
);
router.post(
  "/:confessionId/comment/:commentId/reply",
  authMiddleware,
  replyToComment
);
router.post(
  "/:confessionId/comment/:commentId/reply/:replyId/like",
  authMiddleware,
  likeReply
);
router.post("/cleanup", authMiddleware, manualCleanup);

export default router;
