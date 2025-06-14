import { ApiError } from "../../utils/apiErrors.js";
import { serviceHandler } from "../../utils/handlers.js";
import { User } from "../user/user.models.js";
import { Tweet } from "./tweet.models.js";
import { uploadImageOnCloudinary } from "../../utils/fileHandlers.js";
import mongoose from "mongoose";

export const createTweet = serviceHandler(
	async (content, title, ownerId, contentImageLocalPath) => {
		let contentImage;
		if (contentImageLocalPath) {
			contentImage = await uploadImageOnCloudinary(contentImageLocalPath).catch(
				(error) => {
					throw new ApiError(
						500,
						"Something went wrong while uploading image",
						error,
					);
				},
			);
		}
		const tweet = await Tweet.create({
			content,
			contentImage: contentImage?.secure_url || "",
			title,
			owner: ownerId,
		});
		if (!tweet)
			throw new ApiError(400, "Something went wrong while creating tweet");

		return tweet;
	},
);

export const updateTweet = serviceHandler(async (content, title, tweetId) => {
	const tweet = await Tweet.findByIdAndUpdate(
		tweetId,
		{ content, title },
		{ new: true },
	);

	if (!tweet) {
		throw new ApiError(400, "Something went wrong while editing tweet");
	}
});

export const deleteTweet = serviceHandler(async (tweetId) => {
	await Tweet.findByIdAndDelete(tweetId);
});

export const getUserTweets = serviceHandler(async (userId) => {
	const tweets = await User.aggregate([
		{ $match: { _id: new mongoose.Types.ObjectId(String(userId)) } },
		{
			$lookup: {
				from: "tweets",
				localField: "tweets",
				foreignField: "tweets",
				as: "tweets",
			},
		},
		{ $project: { tweets: 1, username: 1, _id: 0 } },
	]);
	return tweets;
});
