import { Router } from "express";
import {
	deleteVideo,
	downloadVideo,
	getAllVideos,
	getVideoById,
	publishAVideo,
	togglePublishStatus,
	updateVideo,
} from "./video.controller.js";
import { verifyAccessToken } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middlewares.js";
import {
	deleteVideoValidator,
	getAllVideosValidator,
	getVideoByIdValidator,
	permsAndVideoIdValidator,
	publishVideoFilesValidator,
	publishVideoValidator,
	togglePublishStatusValidator,
	updateVideoValidator,
	videoIdValidator,
} from "./video.validator.js";
import { validator } from "../../middlewares/validator.middleware.js";
import { defaultRateLimiter } from "../../middlewares/rateLimiter.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: API endpoints for managing videos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - videoFile
 *         - thumbnail
 *         - owner
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the video
 *         videoFile:
 *           type: string
 *           description: URL of the video file
 *         thumbnail:
 *           type: string
 *           description: URL of the video thumbnail
 *         title:
 *           type: string
 *           description: Title of the video
 *         description:
 *           type: string
 *           description: Description of the video
 *         duration:
 *           type: number
 *           description: Duration of the video in seconds
 *         views:
 *           type: number
 *           description: Number of video views
 *         isPublished:
 *           type: boolean
 *           description: Whether the video is published or not
 *         owner:
 *           type: string
 *           description: User ID of the video owner
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
 * /videos:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
 *     description: Retrieve all published videos with optional filtering
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
 *         description: Number of videos per page
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term for video title or description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, views, duration]
 *         description: Field to sort by
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: List of videos retrieved successfully
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Upload a new video
 *     tags: [Videos]
 *     description: Upload and publish a new video with thumbnail
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - videoFile
 *               - thumbnail
 *             properties:
 *               videoFile:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image for the video
 *               title:
 *                 type: string
 *                 description: Title of the video
 *               description:
 *                 type: string
 *                 description: Description of the video
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *       400:
 *         description: Invalid input or file format
 *       401:
 *         description: Unauthorized
 */
router
	.route("/")
	.get(getAllVideosValidator, validator, getAllVideos)
	.post(
		upload.fields([
			{ name: "videoFile", maxCount: 1 },
			{ name: "thumbnail", maxCount: 1 },
		]),
		publishVideoFilesValidator,
		publishVideoValidator,
		validator,
		publishAVideo,
	);

/**
 * @swagger
 * /videos/{videoId}:
 *   get:
 *     summary: Get video by ID
 *     tags: [Videos]
 *     description: Retrieve a specific video by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the video to retrieve
 *     responses:
 *       200:
 *         description: Video retrieved successfully
 *       404:
 *         description: Video not found
 *       401:
 *         description: Unauthorized
 *
 *   patch:
 *     summary: Update video details
 *     tags: [Videos]
 *     description: Update a video's title, description, or thumbnail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the video to update
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: New title of the video
 *               description:
 *                 type: string
 *                 description: New description of the video
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: New thumbnail image for the video
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - User doesn't own this video
 *       404:
 *         description: Video not found
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Delete a video
 *     tags: [Videos]
 *     description: Delete a specific video
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the video to delete
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       403:
 *         description: Forbidden - User doesn't own this video
 *       404:
 *         description: Video not found
 *       401:
 *         description: Unauthorized
 */
router
	.route("/:videoId")
	.get(getVideoByIdValidator, validator, videoIdValidator, getVideoById)
	.delete(
		deleteVideoValidator,
		validator,
		permsAndVideoIdValidator,
		deleteVideo,
	)
	.patch(
		upload.single("thumbnail"),
		updateVideoValidator,
		validator,
		permsAndVideoIdValidator,
		updateVideo,
	);

/**
 * @swagger
 * /videos/toggle/publish/{videoId}:
 *   patch:
 *     summary: Toggle video publish status
 *     tags: [Videos]
 *     description: Toggle a video's publish status between published and unpublished
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the video to toggle publish status
 *     responses:
 *       200:
 *         description: Video publish status toggled successfully
 *       403:
 *         description: Forbidden - User doesn't own this video
 *       404:
 *         description: Video not found
 *       401:
 *         description: Unauthorized
 */
router
	.route("/toggle/publish/:videoId")
	.patch(
		permsAndVideoIdValidator,
		togglePublishStatusValidator,
		validator,
		permsAndVideoIdValidator,
		togglePublishStatus,
	);

/**
 * @swagger
 * /videos/download/{videoId}:
 *   get:
 *     summary: Download a video file
 *     tags: [Videos]
 *     description: Download the video file associated with the specified video ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the video to download
 *     responses:
 *       200:
 *         description: Video file downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Video not found
 *       401:
 *         description: Unauthorized
 */
router
	.route("/download/:videoId")
	.get(videoIdValidator, validator, downloadVideo);

export default router;
