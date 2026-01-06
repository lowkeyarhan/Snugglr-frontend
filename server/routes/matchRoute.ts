import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  getMyMatchPool,
  joinMatchPool,
  leaveMatchPool,
  tryMatch,
} from "../controllers/user/matchpoolController";

const router = Router();

/**
 * @swagger
 * /match/try:
 *   post:
 *     summary: Try to match with someone from the match pool
 *     description: |
 *       Attempts to find a match for the current user in the pool. If a match is found:
 *       - Both users are removed from the pool
 *       - A Match record is created
 *       - A LOCKED ChatRoom is created
 *       - An OpeningMoveSession is created (5 min expiry)
 *       - Both users receive notifications
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
 *                   example: true
 *                 chatId:
 *                   type: string
 *                   description: Chat room ID (only present when matched is true)
 *                   example: "507f1f77bcf86cd799439011"
 *             examples:
 *               matched:
 *                 summary: Match found
 *                 value:
 *                   matched: true
 *                   chatId: "507f1f77bcf86cd799439011"
 *               noMatch:
 *                 summary: No match found
 *                 value:
 *                   matched: false
 *       400:
 *         description: Bad request - User not in pool
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not in pool"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post("/try", authMiddleware, tryMatch);

/**
 * @swagger
 * /match/pool/me:
 *   get:
 *     summary: Get current user's match pool entry
 *     description: Returns the current user's match pool entry if they are in the pool, otherwise returns null
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved match pool status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entry:
 *                   type: object
 *                   nullable: true
 *                   description: Match pool entry if user is in pool, null otherwise
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     user:
 *                       type: string
 *                       description: User ID
 *                       example: "507f1f77bcf86cd799439012"
 *                     institute:
 *                       type: string
 *                       description: Institution ID
 *                       example: "507f1f77bcf86cd799439013"
 *                     mood:
 *                       type: string
 *                       description: User's selected mood
 *                       example: "coffee"
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       description: Optional note/description (max 80 chars)
 *                       example: "Studying for finals at the library. Need a 15min coffee break!"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: When the pool entry expires (20 minutes from join)
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *             examples:
 *               inPool:
 *                 summary: User is in pool
 *                 value:
 *                   entry:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     user: "507f1f77bcf86cd799439012"
 *                     institute: "507f1f77bcf86cd799439013"
 *                     mood: "coffee"
 *                     description: "Studying for finals at the library. Need a 15min coffee break!"
 *                     expiresAt: "2024-12-17T21:30:00.000Z"
 *                     createdAt: "2024-12-17T21:10:00.000Z"
 *                     updatedAt: "2024-12-17T21:10:00.000Z"
 *               notInPool:
 *                 summary: User is not in pool
 *                 value:
 *                   entry: null
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get("/pool/me", authMiddleware, getMyMatchPool);

/**
 * @swagger
 * /match/pool/join:
 *   post:
 *     summary: Join or update match pool
 *     description: |
 *       Joins the user to the match pool with a selected mood and optional description.
 *       If the user is already in the pool, their entry is updated.
 *       Pool entries expire after 20 minutes.
 *       This endpoint does NOT create matches - use /match/try to attempt matching.
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
 *                 description: User's current mood/activity type
 *                 enum: [coffee, study, walk, food]
 *                 example: "coffee"
 *               description:
 *                 type: string
 *                 maxLength: 80
 *                 description: Optional note/description (max 80 characters)
 *                 example: "Studying for finals at the library. Need a 15min coffee break!"
 *     responses:
 *       200:
 *         description: Successfully joined or updated match pool
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Joined match pool"
 *       400:
 *         description: Bad request - Mood is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mood is required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post("/pool/join", authMiddleware, joinMatchPool);

/**
 * @swagger
 * /match/pool/leave:
 *   post:
 *     summary: Leave the match pool
 *     description: Removes the current user from the match pool. Safe to call even if user is not in pool.
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully left match pool
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Left match pool"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post("/pool/leave", authMiddleware, leaveMatchPool);

export default router;
