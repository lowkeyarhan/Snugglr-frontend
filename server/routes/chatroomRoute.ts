import { Router } from "express";
import { getUserChats, getChatRoom } from "../controllers/chatroomController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Get all chats for the authenticated user
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Chats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       chatId:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [personal, group]
 *                       status:
 *                         type: string
 *                         enum: [LOCKED, ACTIVE, EXPIRED]
 *                       anonymous:
 *                         type: boolean
 *                       displayName:
 *                         type: string
 *                         nullable: true
 *                         description: Group name, "Anonymous" for anonymous chats, or null for normal DMs
 *                       lastMessage:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           text:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", authMiddleware, getUserChats);

/**
 * @swagger
 * /chat/{chatId}:
 *   get:
 *     summary: Get metadata for a single chat room
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The chatroom ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Chat room metadata fetched successfully
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
 *                     chatId:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [personal, group]
 *                     status:
 *                       type: string
 *                       enum: [LOCKED, ACTIVE, EXPIRED]
 *                     anonymous:
 *                       type: boolean
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     openingMoveSession:
 *                       type: string
 *                       nullable: true
 *                       description: Opening move session ID if chat is locked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not part of this chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
router.get("/:chatId", authMiddleware, getChatRoom);

export default router;
