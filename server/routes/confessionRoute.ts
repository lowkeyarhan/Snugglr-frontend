import { Router } from "express";
import {
  createConfession,
  getConfessions,
  likeConfession,
  commentOnConfession,
  replyToComment,
  likeComment,
  getCommentsForConfession,
} from "../controllers/confessionController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /confession:
 *   post:
 *     summary: Create a new confession
 *     tags: [Confessions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 1000
 *                 example: I have a crush on someone in my class but too shy to talk
 *     responses:
 *       201:
 *         description: Confession created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     confession:
 *                       type: string
 *                     user:
 *                       type: string
 *                     institution:
 *                       type: string
 *                     likesCount:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *       400:
 *         description: Bad request - missing or invalid confession text
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post("/", authMiddleware, createConfession);

/**
 * @swagger
 * /confession:
 *   get:
 *     summary: Get all confessions for user's institution
 *     tags: [Confessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of confessions per page
 *     responses:
 *       200:
 *         description: Confessions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     confessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     currentPage:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     totalConfessions:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", authMiddleware, getConfessions);

/**
 * @swagger
 * /confession/{confessionId}/like:
 *   post:
 *     summary: Like or unlike a confession
 *     tags: [Confessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: confessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The confession ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 liked:
 *                   type: boolean
 *                   description: true if liked, false if unliked
 *       404:
 *         description: Confession not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/:confessionId/like", authMiddleware, likeConfession);

/**
 * @swagger
 * /confession/{confessionId}/comment:
 *   post:
 *     summary: Comment on a confession
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: confessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The confession ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 500
 *                 example: I totally agree with this!
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - missing comment text
 *       404:
 *         description: Confession not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/:confessionId/comment", authMiddleware, commentOnConfession);

/**
 * @swagger
 * /confession/{confessionId}/comment/{commentId}/reply:
 *   post:
 *     summary: Reply to a comment
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: confessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The confession ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The parent comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 500
 *                 example: I think so too!
 *     responses:
 *       201:
 *         description: Reply created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - missing reply text
 *       404:
 *         description: Confession or comment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:confessionId/comment/:commentId/reply",
  authMiddleware,
  replyToComment
);

/**
 * @swagger
 * /confession/{commentId}/like:
 *   post:
 *     summary: Like or unlike a comment
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 liked:
 *                   type: boolean
 *                   description: true if liked, false if unliked
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/:commentId/like", authMiddleware, likeComment);

/**
 * @swagger
 * /confession/{confessionId}/comments:
 *   get:
 *     summary: Get all comments for a confession
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: confessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The confession ID
 *     responses:
 *       200:
 *         description: Comments fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       text:
 *                         type: string
 *                       user:
 *                         type: object
 *                       confession:
 *                         type: string
 *                       parentComment:
 *                         type: string
 *                         nullable: true
 *                       likesCount:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *       404:
 *         description: Confession not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/:confessionId/comments", authMiddleware, getCommentsForConfession);

export default router;
