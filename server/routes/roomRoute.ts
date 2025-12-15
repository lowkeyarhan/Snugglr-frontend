import { Router } from "express";
import {
  createPersonalChat,
  createGroupChat,
  getMyChats,
  getChatById,
  addUserToGroup,
  removeUserFromGroup,
} from "../controllers/roomController";
import authMiddleware from "../middleware/authMiddleware";
import swaggerJSDoc from "swagger-jsdoc";

const router = Router();

/**
 * @swagger
 * /room/personal:
 *   post:
 *     summary: Create a new personal chatroom
 *     tags: [Chatrooms]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Personal chatroom already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 institute:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     type: string
 *                 type:
 *                   type: string
 *                   example: personal
 *                 groupName:
 *                   type: string
 *                   nullable: true
 *                 revealed:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       201:
 *         description: Personal chatroom created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 institute:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     type: string
 *                 type:
 *                   type: string
 *                   example: personal
 *                 groupName:
 *                   type: string
 *                   nullable: true
 *                 revealed:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - invalid userIds or users from different institutions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidUsers: "Personal chat requires exactly 2 users"
 *                     differentInstitution: "Users must belong to the same institution"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/personal", authMiddleware, createPersonalChat);

/**
 * @swagger
 * /room/group:
 *   post:
 *     summary: Create a new group chatroom
 *     tags: [Chatrooms]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - groupName
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 3
 *                 description: Array of user IDs (minimum 3 users required)
 *                 example: ["507f1f77bcf86cd799439011", "507f191e810c19729de860ea", "507f1f77bcf86cd799439012"]
 *               groupName:
 *                 type: string
 *                 description: Name of the group chat
 *                 example: Study Group
 *     responses:
 *       201:
 *         description: Group chatroom created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 institute:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     type: string
 *                 type:
 *                   type: string
 *                   example: group
 *                 groupName:
 *                   type: string
 *                 revealed:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - invalid userIds or missing groupName
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Group chat needs at least 3 users
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/group", authMiddleware, createGroupChat);

/**
 * @swagger
 * /room/my-chats:
 *   get:
 *     summary: Get all chatrooms for the logged-in user
 *     tags: [Chatrooms]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Chatrooms fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   institute:
 *                     type: string
 *                   users:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                   type:
 *                     type: string
 *                     enum: [personal, group]
 *                   groupName:
 *                     type: string
 *                     nullable: true
 *                   revealed:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/my-chats", authMiddleware, getMyChats);

/**
 * @swagger
 * /room/{chatId}:
 *   get:
 *     summary: Get a single chatroom by ID
 *     tags: [Chatrooms]
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
 *         description: Chatroom fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 institute:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                 type:
 *                   type: string
 *                   enum: [personal, group]
 *                 groupName:
 *                   type: string
 *                   nullable: true
 *                 revealed:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Chat not found
 *       500:
 *         description: Internal server error
 */
router.get("/:chatId", authMiddleware, getChatById);

/**
 * @swagger
 * /room/add-user:
 *   post:
 *     summary: Add a user to a group chat
 *     tags: [Chatrooms]
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
 *               - userIdToAdd
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The group chatroom ID
 *                 example: 507f1f77bcf86cd799439011
 *               userIdToAdd:
 *                 type: string
 *                 description: The user ID to add to the group
 *                 example: 507f191e810c19729de860ea
 *     responses:
 *       200:
 *         description: User added to group successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 institute:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     type: string
 *                 type:
 *                   type: string
 *                   example: group
 *                 groupName:
 *                   type: string
 *                 revealed:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - invalid group chat or user already in group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidGroup: "Invalid group chat"
 *                     alreadyInGroup: "User already in group"
 *                     differentInstitution: "User belongs to a different institution"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/add-user", authMiddleware, addUserToGroup);

/**
 * @swagger
 * /room/remove-user:
 *   post:
 *     summary: Remove a user from a group chat
 *     tags: [Chatrooms]
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
 *               - userIdToRemove
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: The group chatroom ID
 *                 example: 507f1f77bcf86cd799439011
 *               userIdToRemove:
 *                 type: string
 *                 description: The user ID to remove from the group
 *                 example: 507f191e810c19729de860ea
 *     responses:
 *       200:
 *         description: User removed from group successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 institute:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     type: string
 *                 type:
 *                   type: string
 *                   example: group
 *                 groupName:
 *                   type: string
 *                 revealed:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - invalid group chat or cannot remove last user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidGroup: "Invalid group chat"
 *                     lastUser: "Cannot remove the last user from group"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/remove-user", authMiddleware, removeUserFromGroup);

export default router;
