import { Router } from "express";
import {
	changePassword,
	deleteUser,
	getCurrentUser,
	getUserChannelProfile,
	getUserWatchHistory,
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
	updateAccountDetails,
	updateUserAvatar,
	updateUserCoverImg,
} from "../controllers/user.controllers.js";
import { upload } from "../../../middlewares/multer.middlewares.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for user management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - fullName
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the user
 *         username:
 *           type: string
 *           description: Unique username for the user
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         fullName:
 *           type: string
 *           description: User's full name
 *         avatar:
 *           type: string
 *           description: URL to the user's avatar image
 *         coverImage:
 *           type: string
 *           description: URL to the user's cover image
 *         watchHistory:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of video IDs watched by the user
 *         password:
 *           type: string
 *           format: password
 *           description: User's password (not returned in responses)
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token for the user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when user was last updated
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     description: Register a new user with avatar and cover image
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username for the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *               fullName:
 *                 type: string
 *                 description: User's full name
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: User's profile picture
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: User's cover image
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The user ID
 *                 username:
 *                   type: string
 *                   description: User's username
 *                 email:
 *                   type: string
 *                   description: User's email
 *                 fullName:
 *                   type: string
 *                   description: User's full name
 *                 avatar:
 *                   type: string
 *                   description: URL to user's avatar
 *                 coverImage:
 *                   type: string
 *                   description: URL to user's cover image
 *       400:
 *         description: Invalid input or username/email already exists
 */
router.route("/register").post(
	upload.fields([
		{ name: "avatar", maxCount: 1 },
		{ name: "coverImage", maxCount: 1 },
	]),
	registerUser
);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     description: Authenticate a user and generate access & refresh tokens
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
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     avatar:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.route("/login").post(loginUser);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Users]
 *     description: Invalidate user's refresh token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: Unauthorized or invalid token
 */
router.route("/logout").post(verifyJWT, logoutUser);

/**
 * @swagger
 * /user/refreshToken:
 *   post:
 *     summary: Refresh access token
 *     tags: [Users]
 *     description: Generate new access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: JWT refresh token
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: New JWT refresh token
 *       401:
 *         description: Invalid refresh token
 */
router.route("/refreshToken").post(refreshAccessToken);

/**
 * @swagger
 * /user/updateDetails:
 *   patch:
 *     summary: Update user details
 *     tags: [Users]
 *     description: Update user account details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: User's new full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's new email
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid details provided
 *       401:
 *         description: Unauthorized
 */
router.route("/updateDetails").patch(verifyJWT, updateAccountDetails);

/**
 * @swagger
 * /user/updateAvatar:
 *   patch:
 *     summary: Update user avatar
 *     tags: [Users]
 *     description: Update user's profile picture
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: User's new profile picture
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatar:
 *                   type: string
 *                   description: URL of the updated avatar
 *       400:
 *         description: Invalid image format
 *       401:
 *         description: Unauthorized
 */
router
	.route("/updateAvatar")
	.patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

/**
 * @swagger
 * /user/updateCoverImage:
 *   patch:
 *     summary: Update user cover image
 *     tags: [Users]
 *     description: Update user's profile cover image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - coverImage
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: User's new cover image
 *     responses:
 *       200:
 *         description: Cover image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coverImage:
 *                   type: string
 *                   description: URL of the updated cover image
 *       400:
 *         description: Invalid image format
 *       401:
 *         description: Unauthorized
 */
router
	.route("/updateCoverImage")
	.patch(verifyJWT, upload.single("coverImage"), updateUserCoverImg);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get current user
 *     tags: [Users]
 *     description: Retrieve current logged in user details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 coverImage:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.route("/").get(verifyJWT, getCurrentUser);

/**
 * @swagger
 * /user/changePassword:
 *   patch:
 *     summary: Change user password
 *     tags: [Users]
 *     description: Update the user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: User's current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: User's new password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Incorrect old password or invalid new password
 *       401:
 *         description: Unauthorized
 */
router.route("/changePassword").patch(verifyJWT, changePassword);

/**
 * @swagger
 * /user/history:
 *   get:
 *     summary: Get user watch history
 *     tags: [Users]
 *     description: Retrieve the user's video watch history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watch history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 *       401:
 *         description: Unauthorized
 */
router.route("/history").get(verifyJWT, getUserWatchHistory);

/**
 * @swagger
 * /user/ch/{username}:
 *   get:
 *     summary: Get user channel profile
 *     tags: [Users]
 *     description: Retrieve a user's channel profile by username
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the channel
 *     responses:
 *       200:
 *         description: Channel profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 coverImage:
 *                   type: string
 *                 subscribersCount:
 *                   type: number
 *                 isSubscribed:
 *                   type: boolean
 *       404:
 *         description: Channel not found
 *       401:
 *         description: Unauthorized
 */
router.route("/ch/:username").get(verifyJWT, getUserChannelProfile);

/**
 * @swagger
 * /user/delete:
 *   get:
 *     summary: Delete user account
 *     tags: [Users]
 *     description: Delete the current user's account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/delete").get(verifyJWT, deleteUser);

export default router;
