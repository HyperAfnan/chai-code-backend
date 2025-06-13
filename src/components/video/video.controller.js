import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/handlers.js";
import * as VideoService from "./video.service.js";

const getAllVideos = asyncHandler(async (req, res) => {
	const { page = 1, limit = 10, q, sortBy, sortType, userId } = req.query;
	const user = userId || req.user._id;

	const allVideos = await VideoService.getAllVideos(
		page,
		limit,
		q,
		sortBy,
		sortType,
		user,
	);

	return res
		.status(200)
		.json(new ApiResponse(200, allVideos, "successfully got all videos"));
});

const publishAVideo = asyncHandler(async (req, res) => {
	const { title, description } = req.body;
	const videoFileLocalPath = req.files.videoFile[0].path;
	const thumbnailLocalPath = req.files.thumbnail[0].path;
	const video = await VideoService.publishVideo(
		title,
		description,
		videoFileLocalPath,
		thumbnailLocalPath,
	);

	return res
		.status(201)
		.json(new ApiResponse(201, video, "User registered successfully "));
});

const getVideoById = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const video = await VideoService.getUserVideoById(videoId, req.video, req.user);

	return res
		.status(200)
		.json(new ApiResponse(200, video, "successfully got video"));
});

const updateVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const { description, title } = req.body;

	const video = await VideoService.updateVideo(
		title,
		description,
		req?.file?.path,
		videoId,
	);

	return res
		.status(200)
		.json(new ApiResponse(200, video, "successfully updated video"));
});

const deleteVideo = asyncHandler(async (req, res) => {
	await VideoService.deleteVideo(req.video);

	return res.status(204).end();
});

const downloadVideo = asyncHandler(async (req, res) =>
	res.redirect(req.video.videoFile),
);

const togglePublishStatus = asyncHandler(async (req, res) => {
	const video = await VideoService.togglePublishStatus(req.video);

	return res
		.status(200)
		.json(new ApiResponse(200, video, "successfully toggled publish status"));
});

export {
	getAllVideos,
	publishAVideo,
	getVideoById,
	updateVideo,
	deleteVideo,
	downloadVideo,
	togglePublishStatus,
};
