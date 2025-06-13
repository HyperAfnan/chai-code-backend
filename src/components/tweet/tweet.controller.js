import { ApiError } from "../../utils/apiErrors.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/handlers.js";
import * as tweetService from "./tweet.service.js";
import debug from "debug";
const log = debug("app:tweet:controller:log");

const createTweet = asyncHandler(async (req, res) => {
	const { content, title } = req.body;
	const contentImage = req?.file?.path || null;

	const tweet = await tweetService.createTweet(
		content,
		title,
		req.user._id,
		contentImage,
	);

   log("Tweet created successfully", tweet);

	return res
		.status(201)
		.json(new ApiResponse(201, tweet, "Successfully create tweet"));
});

const updateTweet = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;
	const { content, title } = req.body;

	const tweet = await tweetService.findTweetById(tweetId);
	if (!tweet) throw new ApiError(404, "Tweet not found");

	const isOwner = await tweetService.isTweetOwner(tweetId, req.user._id);
	if (!isOwner) throw new ApiError(402, "Unauthorized to perform this task");


	const updatedTweet = await tweetService.updateTweet(content, title, tweetId);
	return res
		.status(200)
		.json(new ApiResponse(200, updatedTweet, "Successfully updated tweet"));
});

const deleteTweet = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;

	const tweet = await tweetService.findTweetById(tweetId);
	if (!tweet) throw new ApiError(404, "Tweet not found");

	const isOwner = await tweetService.isTweetOwner(tweetId, req.user._id);
	if (!isOwner) throw new ApiError(402, "Unauthorized to perform this task");

	await tweetService.deleteTweet(tweetId);
	return res.status(204).end();
});

const getUserTweets = asyncHandler(async (req, res) => {
	const { userId } = req.params;

   const user = await tweetService.findUserById(userId);
   if (!user) throw new ApiError(404, "User not found");

	const tweets = await tweetService.getUserTweets(user._id);

	return res
		.status(200)
		.json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

export { createTweet, updateTweet, deleteTweet, getUserTweets };
