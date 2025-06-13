import { Router } from "express";
import {
	createTweet,
	deleteTweet,
	getUserTweets,
	updateTweet,
} from "./tweet.controller.js";
import { verifyAccessToken } from "../../middlewares/auth.middleware.js";
import {
	createTweetFileValidator,
	createTweetValidator,
	deleteTweetValidator,
	getUserTweetsValidator,
	updateTweetValidator,
} from "./tweet.validator.js";
import { validator } from "../../middlewares/validator.middleware.js";
import { defaultRateLimiter } from "../../middlewares/rateLimiter.js";
import { upload } from "../../middlewares/multer.middlewares.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tweets
 *   description: API endpoints for managing tweets
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tweet:
 *       type: object
 *       required:
 *         - content
 *         - owner
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the tweet
 *         content:
 *           type: string
 *           description: Content of the tweet
 *         owner:
 *           type: string
 *           description: User ID of the tweet owner
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

router.use(defaultRateLimiter);
router.use(verifyAccessToken); // Apply verifyJWT middleware to all routes in this file

/**
 * @swagger
 * /tweets:
 *   post:
 *     summary: Create a new tweet
 *     tags: [Tweets]
 *     description: Create a new tweet for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Content of the tweet
 *     responses:
 *       201:
 *         description: Tweet created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: Get all tweets
 *     tags: [Tweets]
 *     description: Retrieve all tweets with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of tweets per page
 *     responses:
 *       200:
 *         description: List of tweets retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router
	.route("/")
	.post(
		upload.single("contentImage"),
		createTweetFileValidator,
		createTweetValidator,
		validator,
		createTweet,
	)
	.get(getUserTweetsValidator, validator, getUserTweets);

/**
 * @swagger
 * /tweets/{tweetId}:
 *   patch:
 *     summary: Update a tweet
 *     tags: [Tweets]
 *     description: Update an existing tweet
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the tweet to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: New content of the tweet
 *     responses:
 *       200:
 *         description: Tweet updated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - User doesn't own this tweet
 *       404:
 *         description: Tweet not found
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Delete a tweet
 *     tags: [Tweets]
 *     description: Delete an existing tweet
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the tweet to delete
 *     responses:
 *       200:
 *         description: Tweet deleted successfully
 *       403:
 *         description: Forbidden - User doesn't own this tweet
 *       404:
 *         description: Tweet not found
 *       401:
 *         description: Unauthorized
 */
router
	.route("/:tweetId")
	.patch(updateTweetValidator, validator, updateTweet)
	.delete(deleteTweetValidator, validator, deleteTweet);

/**
 * @swagger
 * /tweets/user/{userId}:
 *   get:
 *     summary: Get tweets by user
 *     tags: [Tweets]
 *     description: Retrieve all tweets created by a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user whose tweets to retrieve
 *     responses:
 *       200:
 *         description: List of user's tweets retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router
	.route("/user/:userId")
	.get(getUserTweetsValidator, validator, getUserTweets);

export default router;
