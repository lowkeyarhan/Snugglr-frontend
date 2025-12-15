import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messageController";
import authMiddleware from "../middleware/authMiddleware";
import swaggerJSDoc from "swagger-jsdoc";

const router = Router();

/**
 * @swagger
 * /message/{chatId}:
 *   get:
 *     summary: Get messages for a chatroom
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The chatroom ID
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           text:
 *                             type: string
 *                           sender:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               username:
 *                                 type: string
 *                               image:
 *                                 type: string
 *                           createdAt:
 *                             type: string
 *                           readBy:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 username:
 *                                   type: string
 *                                 image:
 *                                   type: string
 *                             pagination:
 *                               type: object
 *                               properties:
 *                                 page:
 *                                   type: number
 *                                 limit:
 *                                   type: number
 *                                 totalMessages:
 *                                   type: number
 *                                 totalPages:
 *                                   type: number
 *                                 revealed:
 *                                   type: boolean
 *       404:
 *         description: Chatroom not found
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/:chatId", authMiddleware, getMessages);

/**
 * @swagger
 * /message/{chatId}:
 *   post:
 *     summary: Send a new message to a chatroom
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The chatroom ID
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
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         text:
 *                           type: string
 *                         sender:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             username:
 *                               type: string
 *                             image:
 *                               type: string
 *                         createdAt:
 *                           type: string
 *                         readBy:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 name:
 *                                   type: string
 *                                 username:
 *                                   type: string
 *                                 image:
 *                                   type: string
 *       400:
 *         description: Bad request - missing message text
 *       404:
 *         description: Chatroom not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/:chatId", authMiddleware, sendMessage);

export default router;
