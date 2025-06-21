import { User } from "../user/user.model.js";
import { serviceHandler } from "../../utils/handlers.js";
import mongoose from "mongoose";
import { logger } from "../../utils/logger/index.js";
const dashboardLogger = logger.child({ module: "dashboard.service" });

// BUG: showing total likes to 1, while video likes array is empty
// NOTE: use $arrayElemAt instead of $unwind to avoid the issue
export const getChannelStats = serviceHandler(async (userMeta) => {
	dashboardLogger.info("Fetching channel stats (aggregate)", {
		userId: userMeta._id,
	});

	const stats = await User.aggregate([
		{ $match: { _id: new mongoose.Types.ObjectId(String(userMeta._id)) } },
		{
			$lookup: {
				from: "subscriptions",
				localField: "_id",
				foreignField: "channel",
				as: "subscriptions",
				pipeline: [
					{
						$lookup: {
							from: "users",
							localField: "subscriber",
							foreignField: "_id",
							as: "subscriber",
							pipeline: [{ $project: { username: 1, avatar: 1, _id: 0 } }],
						},
					},
					{ $unwind: "$subscriber" },
					{ $project: { subscriber: 1, _id: 0 } },
				],
			},
		},
		{
			$lookup: {
				from: "videos",
				localField: "_id",
				foreignField: "owner",
				as: "videos",
				pipeline: [
					{
						$lookup: {
							from: "likes",
							localField: "_id",
							foreignField: "video",
							as: "likes",
							pipeline: [
								{
									$lookup: {
										from: "users",
										localField: "likedBy",
										foreignField: "_id",
										as: "likedBy",
										pipeline: [{ $project: { username: 1, _id: 0 } }],
									},
								},
								{ $unwind: "$likedBy" },
								{ $project: { likedBy: 1, _id: 0 } },
							],
						},
					},
					{ $unwind: "$likes" },
				],
			},
		},
		{
			$addFields: {
				totalVideos: { $size: "$videos" },
				totalLikes: { $size: "$videos.likes" },
				totalSubscribers: { $size: "$subscriptions" },
			},
		},
		{
			$project: {
				fullName: 1,
				username: 1,
				avatar: 1,
				videos: 1,
				subscriptions: 1,
				totalVideos: 1,
				totalLikes: 1,
			},
		},
	]);
	dashboardLogger.info("Fetched channel stats (aggregate)", {
		userId: userMeta._id,
		statsCount: Array.isArray(stats) ? stats.length : undefined,
		hasStats: Array.isArray(stats) ? stats.length > 0 : false,
	});
	return stats;
});

export const getChannelVideos = serviceHandler(async (userMeta) => {
	dashboardLogger.info("Fetching channel videos (aggregate)", {
		userId: userMeta._id,
	});

	const channelVideos = await User.aggregate([
		{ $match: { _id: new mongoose.Types.ObjectId(String(userMeta._id)) } },
		{
			$lookup: {
				from: "videos",
				localField: "_id",
				foreignField: "owner",
				as: "videos",
			},
		},
		{ $addFields: { totalVideos: { $size: "$videos" } } },
		{ $project: { videos: 1, username: 1, totalVideos: 1, _id: 0 } },
	]);
	dashboardLogger.info("Fetched channel videos (aggregate)", {
		userId: userMeta._id,
		videoBatchCount: Array.isArray(channelVideos)
			? channelVideos.length
			: undefined,
		totalVideos:
			Array.isArray(channelVideos) && channelVideos[0]
				? channelVideos[0].totalVideos
				: undefined,
	});
	return channelVideos;
});
