import { Router } from "express";
import { tryMatch } from "../controllers/matchController";
import { joinMatchPool } from "../controllers/matchpoolController";
import { submitOpeningMove } from "../controllers/openingmoveController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /match/try:
 *   post:
 *     summary: Try to match with another user in the pool
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Match attempt completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matched:
 *                   type: boolean
 *                   description: Whether a match was found
 *                 chatId:
 *                   type: string
 *                   nullable: true
 *                   description: Chat room ID if matched (only present when matched is true)
 *       400:
 *         description: Bad request - User not in pool
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not in pool
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/try", authMiddleware, tryMatch);

/**
 * @swagger
 * /match/pool/join:
 *   post:
 *     summary: Join the match pool
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mood
 *             properties:
 *               mood:
 *                 type: string
 *                 description: User's current mood
 *                 example: happy
 *               description:
 *                 type: string
 *                 maxLength: 80
 *                 description: Optional description
 *                 example: Looking for someone to chat with
 *     responses:
 *       200:
 *         description: Successfully joined match pool
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Joined match pool
 *       400:
 *         description: Bad request - Mood is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mood is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/pool/join", authMiddleware, joinMatchPool);

/**
 * @swagger
 * /match/opening-move:
 *   post:
 *     summary: Submit an opening move choice for a locked chat
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - choice
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The chat room ID
 *                 example: 507f1f77bcf86cd799439011
 *               choice:
 *                 type: string
 *                 description: The opening move choice
 *                 example: option1
 *     responses:
 *       200:
 *         description: Opening move submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request - Chat not locked or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     chatNotLocked: "Chat not locked"
 *                     sessionExpired: "Session expired"
 *       403:
 *         description: Forbidden - User is not part of this chat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not your chat
 *       404:
 *         description: Opening move session not found or expired
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/opening-move", authMiddleware, submitOpeningMove);

export default router;
