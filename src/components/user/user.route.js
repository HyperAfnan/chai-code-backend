import { Router } from "express";
import {
	changePassword,
	confirmEmail,
	deleteUser,
	forgotPassword,
	getCurrentUser,
	getUserChannelProfile,
	getUserWatchHistory,
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
	resetPassword,
	updateAccountDetails,
	updateUserAvatar,
	updateUserCoverImg,
} from "./user.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyAccessToken as auth } from "../../middlewares/auth.middleware.js";
import { validator } from "../../middlewares/validator.middleware.js";
import {
	avatarFileValidator,
	changePasswordValidator,
	confirmEmailValidator,
	coverImageFileValidator,
	forgotPasswordValidator,
	getUserChannelProfileValidator,
	loginValidator,
	refreshAccessTokenValidator,
	registerationFilesValidator,
	registerValidator,
	resetPasswordValidator,
	updateAccountDetailsValidator,
} from "./user.validator.js";
import {
	authRateLimiter,
	defaultRateLimiter,
} from "../../middlewares/rateLimiter.middleware.js";

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
	authRateLimiter,
	upload.fields([
		{ name: "avatar", maxCount: 1 },
		{ name: "coverImage", maxCount: 1 },
	]),
	registerationFilesValidator,
	registerValidator,
	validator,
	registerUser,
);

/**
 * @swagger
 * /user/confirmEmail/{confirmationToken}:
 *   get:
 *     summary: Confirm user email address
 *     tags: [Users]
 *     description: Confirm a user's email address using a confirmation token sent to their email.
 *     parameters:
 *       - in: path
 *         name: confirmationToken
 *         schema:
 *           type: string
 *         required: true
 *         description: Email confirmation token
 *     responses:
 *       200:
 *         description: Email confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email confirmed successfully
 *       400:
 *         description: Invalid or expired confirmation token
 */
router
	.route("/confirmEmail/:confirmationToken")
	.get(authRateLimiter, confirmEmailValidator, validator, confirmEmail);

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
router
	.route("/login")
	.post(authRateLimiter, loginValidator, validator, loginUser);

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
router.route("/logout").post(authRateLimiter, auth, logoutUser);

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
router
	.route("/refreshToken")
	.post(
		authRateLimiter,
		auth,
		refreshAccessTokenValidator,
		validator,
		refreshAccessToken,
	);

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
router
	.route("/updateDetails")
	.patch(
		defaultRateLimiter,
		auth,
		updateAccountDetailsValidator,
		validator,
		updateAccountDetails,
	);

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
	.patch(
		defaultRateLimiter,
		auth,
		upload.single("avatar"),
		avatarFileValidator,
		updateUserAvatar,
	);

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
	.patch(
		defaultRateLimiter,
		auth,
		upload.single("coverImage"),
		coverImageFileValidator,
		updateUserCoverImg,
	);

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
router.route("/").get(defaultRateLimiter, auth, getCurrentUser);

/**
 * @swagger
 * /user/forgotPassword:
 *   post:
 *     summary: Send password reset email
 *     tags: [Users]
 *     description: Send a password reset link to the user's email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset email sent
 *       400:
 *         description: Invalid email or user not found
 */
router
	.route("/forgotPassword")
	.post(authRateLimiter, forgotPasswordValidator, validator, forgotPassword);

/**
 * @swagger
 * /user/resetPassword/{token}:
 *   patch:
 *     summary: Reset password using token
 *     tags: [Users]
 *     description: Reset the user's password using a valid reset token.
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: The new password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password has been reset
 *       400:
 *         description: Invalid or expired token, or invalid password
 */
router
	.route("/resetPassword/:token")
	.patch(authRateLimiter, resetPasswordValidator, validator, resetPassword);

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

router
	.route("/changePassword")
	.patch(
		defaultRateLimiter,
		auth,
		changePasswordValidator,
		validator,
		changePassword,
	);

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
router.route("/history").get(defaultRateLimiter, auth, getUserWatchHistory);

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
router
	.route("/ch/:username")
	.get(
		defaultRateLimiter,
		auth,
		getUserChannelProfileValidator,
		validator,
		getUserChannelProfile,
	);

/**
 * @swagger
 * /user/delete:
 *   delete:
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
router.route("/delete").delete(authRateLimiter, auth, deleteUser);

export default router;
