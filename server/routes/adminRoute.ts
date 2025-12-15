import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserStatus,
} from "../controllers/admin/userController";
import {
  appointAdmin,
  removeAdmin,
} from "../controllers/admin/adminController";
import {
  getAllDomains,
  addDomain,
  updateDomain,
  deleteDomain,
} from "../controllers/admin/domainController";
import {
  getAllChatrooms,
  getChatroomById,
  deleteChatroom,
  getChatroomStats,
} from "../controllers/admin/chatroomController";
import {
  getAllMatches,
  getMatchById,
  deleteMatch,
  getMatchStats,
} from "../controllers/admin/matchController";
import {
  getAllMatchPoolEntries,
  getMatchPoolEntryById,
  deleteMatchPoolEntry,
  getMatchPoolStats,
} from "../controllers/admin/matchpoolController";
import authMiddleware from "../middleware/authMiddleware";
import {
  adminMiddleware,
  superadminMiddleware,
} from "../middleware/adminMiddleware";

const router = Router();

// all routes require authentication
router.use(authMiddleware);

// ==================== User Management (Admin & Superadmin) ====================

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Admin]
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
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, username, or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, superadmin]
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Users fetched successfully
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
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       500:
 *         description: Internal server error
 */
router.get("/users", adminMiddleware, getAllUsers);

/**
 * @swagger
 * /admin/users/{userId}:
 *   get:
 *     summary: Get a single user by ID with stats
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/users/:userId", adminMiddleware, getUserById);

/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete a user and their associated data
 *     description: Deletes user, confessions, comments, likes, and matches. Chats and messages are preserved.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request - Cannot delete yourself
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot delete superadmin
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete("/users/:userId", adminMiddleware, deleteUser);

/**
 * @swagger
 * /admin/users/{userId}/status:
 *   patch:
 *     summary: Update user active status
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *                 example: false
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Bad request - isActive is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch("/users/:userId/status", adminMiddleware, updateUserStatus);

// ==================== Admin Role Management (Superadmin Only) ====================

/**
 * @swagger
 * /admin/appoint:
 *   post:
 *     summary: Appoint a user as admin (superadmin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user ID to appoint as admin
 *     responses:
 *       200:
 *         description: Admin appointed successfully
 *       400:
 *         description: Bad request - User is already an admin
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Superadmins only
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/appoint", superadminMiddleware, appointAdmin);

/**
 * @swagger
 * /admin/remove/{userId}:
 *   delete:
 *     summary: Remove admin role from a user (superadmin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to remove admin role from
 *     responses:
 *       200:
 *         description: Admin role removed successfully
 *       400:
 *         description: Bad request - User is not an admin or trying to remove self
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Superadmins only
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete("/remove/:userId", superadminMiddleware, removeAdmin);

// ==================== Domain Management (Admin & Superadmin) ====================

/**
 * @swagger
 * /admin/domains:
 *   get:
 *     summary: Get all allowed domains
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Domains fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       500:
 *         description: Internal server error
 */
router.get("/domains", adminMiddleware, getAllDomains);

/**
 * @swagger
 * /admin/domains:
 *   post:
 *     summary: Add a new allowed domain
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *               - institutionName
 *             properties:
 *               domain:
 *                 type: string
 *                 description: Email domain
 *                 example: college.edu
 *               institutionName:
 *                 type: string
 *                 description: Institution name
 *                 example: College University
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Active status
 *     responses:
 *       201:
 *         description: Domain added successfully
 *       400:
 *         description: Bad request - Domain already exists or missing fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       500:
 *         description: Internal server error
 */
router.post("/domains", adminMiddleware, addDomain);

/**
 * @swagger
 * /admin/domains/{id}:
 *   put:
 *     summary: Update an allowed domain
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The domain ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *               - institutionName
 *             properties:
 *               domain:
 *                 type: string
 *               institutionName:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Domain updated successfully
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       404:
 *         description: Domain not found
 *       500:
 *         description: Internal server error
 */
router.put("/domains/:id", adminMiddleware, updateDomain);

/**
 * @swagger
 * /admin/domains/{id}:
 *   delete:
 *     summary: Delete an allowed domain
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The domain ID
 *     responses:
 *       200:
 *         description: Domain deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       404:
 *         description: Domain not found
 *       500:
 *         description: Internal server error
 */
router.delete("/domains/:id", adminMiddleware, deleteDomain);

// ==================== Chatroom Management (Admin & Superadmin) ====================

/**
 * @swagger
 * /admin/chatrooms:
 *   get:
 *     summary: Get all chatrooms with pagination and filtering
 *     tags: [Admin]
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
 *         description: Items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [personal, group]
 *         description: Filter by chat type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [LOCKED, ACTIVE, EXPIRED]
 *         description: Filter by status
 *       - in: query
 *         name: anonymous
 *         schema:
 *           type: boolean
 *         description: Filter by anonymous status
 *     responses:
 *       200:
 *         description: Chatrooms fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       500:
 *         description: Internal server error
 */
router.get("/chatrooms", adminMiddleware, getAllChatrooms);

/**
 * @swagger
 * /admin/chatrooms/stats:
 *   get:
 *     summary: Get chatroom statistics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       500:
 *         description: Internal server error
 */
router.get("/chatrooms/stats", adminMiddleware, getChatroomStats);

/**
 * @swagger
 * /admin/chatrooms/{chatroomId}:
 *   get:
 *     summary: Get a single chatroom by ID with details
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The chatroom ID
 *     responses:
 *       200:
 *         description: Chatroom fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       404:
 *         description: Chatroom not found
 *       500:
 *         description: Internal server error
 */
router.get("/chatrooms/:chatroomId", adminMiddleware, getChatroomById);

/**
 * @swagger
 * /admin/chatrooms/{chatroomId}:
 *   delete:
 *     summary: Delete a chatroom and all its messages
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The chatroom ID
 *     responses:
 *       200:
 *         description: Chatroom deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       404:
 *         description: Chatroom not found
 *       500:
 *         description: Internal server error
 */
router.delete("/chatrooms/:chatroomId", adminMiddleware, deleteChatroom);

// ==================== Match Management (Admin & Superadmin) ====================

/**
 * @swagger
 * /admin/matches:
 *   get:
 *     summary: Get all matches with pagination and filtering
 *     tags: [Admin]
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
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACTIVE, EXPIRED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Matches fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       500:
 *         description: Internal server error
 */
router.get("/matches", adminMiddleware, getAllMatches);

/**
 * @swagger
 * /admin/matches/stats:
 *   get:
 *     summary: Get match statistics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       500:
 *         description: Internal server error
 */
router.get("/matches/stats", adminMiddleware, getMatchStats);

/**
 * @swagger
 * /admin/matches/{matchId}:
 *   get:
 *     summary: Get a single match by ID with details
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: The match ID
 *     responses:
 *       200:
 *         description: Match fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       404:
 *         description: Match not found
 *       500:
 *         description: Internal server error
 */
router.get("/matches/:matchId", adminMiddleware, getMatchById);

/**
 * @swagger
 * /admin/matches/{matchId}:
 *   delete:
 *     summary: Delete a match
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: The match ID
 *     responses:
 *       200:
 *         description: Match deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       404:
 *         description: Match not found
 *       500:
 *         description: Internal server error
 */
router.delete("/matches/:matchId", adminMiddleware, deleteMatch);

// ==================== Match Pool Management (Admin & Superadmin) ====================

/**
 * @swagger
 * /admin/matchpool:
 *   get:
 *     summary: Get all match pool entries with pagination and filtering
 *     tags: [Admin]
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
 *         description: Items per page
 *       - in: query
 *         name: mood
 *         schema:
 *           type: string
 *         description: Filter by mood
 *     responses:
 *       200:
 *         description: Match pool entries fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       500:
 *         description: Internal server error
 */
router.get("/matchpool", adminMiddleware, getAllMatchPoolEntries);

/**
 * @swagger
 * /admin/matchpool/stats:
 *   get:
 *     summary: Get match pool statistics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       500:
 *         description: Internal server error
 */
router.get("/matchpool/stats", adminMiddleware, getMatchPoolStats);

/**
 * @swagger
 * /admin/matchpool/{entryId}:
 *   get:
 *     summary: Get a single match pool entry by ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The match pool entry ID
 *     responses:
 *       200:
 *         description: Match pool entry fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       404:
 *         description: Match pool entry not found
 *       500:
 *         description: Internal server error
 */
router.get("/matchpool/:entryId", adminMiddleware, getMatchPoolEntryById);

/**
 * @swagger
 * /admin/matchpool/{entryId}:
 *   delete:
 *     summary: Delete a match pool entry
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The match pool entry ID
 *     responses:
 *       200:
 *         description: Match pool entry deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       404:
 *         description: Match pool entry not found
 *       500:
 *         description: Internal server error
 */
router.delete("/matchpool/:entryId", adminMiddleware, deleteMatchPoolEntry);

export default router;
