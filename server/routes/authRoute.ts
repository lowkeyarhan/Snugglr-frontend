import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@college.edu
 *                 description: Must be from an allowed college domain
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123
 *               gender:
 *                 type: string
 *                 enum: [male, female, non-binary, other, prefer-not-to-say]
 *                 example: male
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: 2000-01-15
 *               pronouns:
 *                 type: string
 *                 example: he/him
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     username:
 *                       type: string
 *                       description: Auto-generated anonymous username
 *                     email:
 *                       type: string
 *                     collegeName:
 *                       type: string
 *                     institution:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: user
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Bad request - validation error or email domain not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       409:
 *         description: Email already in use
 *       500:
 *         description: Internal server error
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user with email or phone number
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@college.edu
 *                 description: Email address (provide either email or phoneNumber)
 *               phoneNumber:
 *                 type: string
 *                 example: +1234567890
 *                 description: Phone number (provide either email or phoneNumber)
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123
 *             oneOf:
 *               - required: [email, password]
 *               - required: [phoneNumber, password]
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *                         gender:
 *                           type: string
 *                         collegeName:
 *                           type: string
 *                         institution:
 *                           type: string
 *                         role:
 *                           type: string
 *                     token:
 *                       type: string
 *                       description: JWT authentication token (Bearer token)
 *       400:
 *         description: Bad request - missing email/phone or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post("/login", loginUser);

export default router;
