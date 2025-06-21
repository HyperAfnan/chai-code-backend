import { User } from "./user.model.js";
import { Comment } from "../comment/comments.model.js";
import { Subscription } from "../subscription/subscription.model.js";
import { Like } from "../like/like.model.js";
import { Playlist } from "../playlist/playlist.model.js";
import { Video } from "../video/video.model.js";
import { Tweet } from "../tweet/tweet.model.js";
import { WatchHistory } from "../watchHistory/watchHistory.model.js";
import { serviceHandler } from "../../utils/handlers.js";
import { ApiError } from "../../utils/apiErrors.js";
import {
	deleteImageOnCloudinary,
	uploadImageOnCloudinary,
} from "../../utils/fileHandlers.js";
import { ObjectId } from "mongodb";
import emailQueue from "../../jobs/queues/email/email.normal.js";
import userQueue from "../../jobs/queues/user/user.normal.js";
import { templates } from "../../microservices/email/email.templates.js";
import ENV from "../../config/env.js";
import jwt from "jsonwebtoken";
import { logger } from "../../utils/logger/index.js";
const userServiceLogger = logger.child({ module: "user.services" });

async function generateTokens(user) {
	const accessToken = await user.generateAccessToken();
	const refreshToken = await user.generateRefreshToken();

	user.refreshToken = refreshToken;
	await user.save({ validateBeforeSave: false });

	return { accessToken, refreshToken };
}

async function generateConfirmationToken(user) {
	const confirmationToken = await user.generateConfirmationToken();

	user.confirmationToken = confirmationToken;
	await user.save({ validateBeforeSave: false });

	return { confirmationToken };
}

async function generateForgotPasswordToken(user) {
	const forgotPasswordToken = await user.generateForgotPasswordToken();

	user.forgotPasswordToken = forgotPasswordToken;
	await user.save({ validateBeforeSave: false });

	return { forgotPasswordToken };
}

export const findUserByEmail = serviceHandler(async (email) => {
	const user = await User.findOne({ email });
	return user;
});

export const findUserByUsername = serviceHandler(async (username) => {
	const user = await User.findOne({ username });
	return user;
});

const findUserByToken = serviceHandler(async (token, tokenType) => {
	let decodedToken;
	if (tokenType === "cft")
		decodedToken = jwt.verify(token, ENV.CONFIRMATION_TOKEN_SECRET);
	else if (tokenType === "rft")
		decodedToken = jwt.verify(token, ENV.REFRESH_TOKEN_SECRET);

	const user = await User.findById(decodedToken?._id);

	return user;
});

export const isRefreshTokenValid = serviceHandler(async (token) => {
	const user = await findUserByToken(token, "rft");
	if (!user) return { status: false, message: "Invalid Refresh Token" };

	return { status: true, message: "Refresh Token is valid ", userMeta: user };
});

export const isConfirmationTokenValid = serviceHandler(
	async (confirmationToken) => {
		const user = await findUserByToken(confirmationToken, "cft");

		if (user.isEmailConfirmed)
			return { status: false, message: "Email is already confirmed" };
		if (!user) return { status: false, message: "Invalid Confirmation Token" };

		return {
			status: true,
			message: "Confirmation Token is valid",
			userMeta: user,
		};
	},
);

export const registerUser = serviceHandler(
	async (
		fullName,
		email,
		username,
		password,
		avatarLocalPath,
		coverImageLocalPath,
	) => {
		const avatar = await uploadImageOnCloudinary(avatarLocalPath);

		let coverImage;
		if (coverImageLocalPath)
			coverImage = await uploadImageOnCloudinary(coverImageLocalPath);

		const user = await User.create({
			fullName,
			email,
			avatar: avatar.secure_url,
			coverImage: coverImage?.secure_url || "",
			username,
			password,
		});

		const createdUser = await User.findById(user._id).select(
			"-password -refreshToken",
		);

		if (!createdUser) {
			throw new ApiError(500, `User creation failed in DB `, { email });
		}

		userServiceLogger.info("User created in DB", {
			userId: user._id,
			email: user.email,
		});

		const { confirmationToken } = await generateConfirmationToken(user);

		const { subject, html } = templates.registration(
			user.username,
			confirmationToken,
		);

		await emailQueue.add(
			"registrationEmail",
			{ to: user.email, html, subject },
			{ removeOnComplete: true, removeOnFail: true },
		);

		await userQueue.add(
			"removeUnverifiedUser",
			{},
			{ delay: 3600000, attempts: 1 },
		);

		return createdUser;
	},
);

export const confirmEmail = serviceHandler(async (userMeta) => {
	const user = await User.findByIdAndUpdate(
		userMeta,
		{ isEmailConfirmed: true, confirmationToken: null },
		{ new: true },
	);
	const { accessToken, refreshToken } = await generateTokens(user);

	userServiceLogger.info("Account verified", {
		userId: userMeta._id,
		username: userMeta.username,
	});

	const { subject, html } = templates.welcome(userMeta.username);
	await emailQueue.add(
		"welcome",
		{ to: userMeta.email, html, subject },
		{ removeOnComplete: true, removeOnFail: true },
	);

	return { accessToken, refreshToken };
});

export const forgotPassword = serviceHandler(async (email) => {
	const user = await findUserByEmail(email);
	if (!user) {
		throw new ApiError(404, "User Not Found", { email });
	}

	const { forgotPasswordToken } = await generateForgotPasswordToken(user);

	const { subject, html } = templates.resetPassword(forgotPasswordToken);

	userServiceLogger.info("Forgot password request", { email });
	await emailQueue.add(
		"resetPassword",
		{ to: user.email, html, subject },
		{ removeOnComplete: true, removeOnFail: true },
	);
});

export const loginUser = serviceHandler(async (email, password) => {
	const user = await findUserByEmail(email);
	if (!user) {
		throw new ApiError(404, "User not found", { email });
	}

	if (!user.isEmailConfirmed) {
		throw new ApiError(401, "Email not confirmed", { email });
	}

	const isPasswordCorrect = await user.isPasswordCorrect(password);
	if (!isPasswordCorrect) {
		throw new ApiError(401, "Invalid User Credentials", { email });
	}

	const { accessToken, refreshToken } = await generateTokens(user);

	const loggedInUser = await User.findById(user._id).select(
		"-password -refreshToken",
	);

	userServiceLogger.info("User logged in", {
		userId: loggedInUser._id,
		username: loggedInUser.username,
	});

	return { user: loggedInUser, accessToken, refreshToken };
});

export const logoutUser = serviceHandler(async (userId) => {
	userServiceLogger.info("User logged out", { userId });
	await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
});

export const deleteUser = serviceHandler(async (userId) => {
	const user = await User.findByIdAndDelete(userId);

	if (user?.coverImage) await deleteImageOnCloudinary(user.coverImage);
	await deleteImageOnCloudinary(user?.avatar);
	await Comment.deleteMany({ user: userId });
	await Subscription.deleteMany({
		$or: [{ channel: userId }, { subscriber: userId }],
	});
	await Like.deleteMany({ user: userId });
	await Playlist.deleteMany({ owner: userId });
	await Video.deleteMany({ owner: userId });
	await Tweet.deleteMany({ user: userId });

	userServiceLogger.info("User account deleted", { userId });
});

export const refreshAccessToken = serviceHandler(async (userId) => {
	const user = await User.findById(userId);
	const { refreshToken, accessToken } = await generateTokens(user);
	userServiceLogger.info("Access token refreshed", {
		userId: user._id,
		username: user.username,
	});
	return { refreshToken, accessToken };
});

export const resetPassword = serviceHandler(async (token, newPassword) => {
	const decodedToken = jwt.verify(token, ENV.FORGET_PASSWORD_TOKEN_SECRET);

	const user = await User.findById(decodedToken?._id);

	if (!user) {
		throw new ApiError(404, "User not found", { userId: decodedToken?._id });
	}

	user.password = newPassword;
	user.forgotPasswordToken = null;
	await user.save({ validateBeforeSave: false });

	userServiceLogger.info("Password reset", {
		userId: user._id,
		username: user.username,
	});
});

export const changePassword = serviceHandler(
	async (userId, oldPassword, newPassword) => {
		const user = await User.findById(userId);
		const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
		if (!isPasswordCorrect) {
			throw new ApiError(400, "Invalid Password");
		}

		user.password = newPassword;
		await user.save({ validateBeforeSave: false });

		userServiceLogger.info("Password changed", {
			userId: user._id,
			username: user.username,
		});
	},
);

export const updateAccountDetails = serviceHandler(
	async (userId, fullName, username) => {
		const user = await User.findByIdAndUpdate(
			userId,
			{ $set: { fullName, username } },
			{ new: true },
		).select("-password -refreshToken");

		userServiceLogger.info("Account details updated", {
			userId,
			username,
			fullName,
		});
		return user;
	},
);

export const updateUserAvatar = serviceHandler(
	async (userid, avatarLocalPath) => {
		const user = await User.findById(userid);

		await deleteImageOnCloudinary(user.avatar);
		const avatar = await uploadImageOnCloudinary(avatarLocalPath);
		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{
				$set: { avatar: avatar.secure_url },
			},
			{ new: true },
		).select("-password -refreshToken");

		userServiceLogger.info("Avatar updated", {
			userId: user._id,
			username: user.username,
			oldAvatar: user.avatar,
			newAvatar: updatedUser.avatar,
		});
		return updatedUser;
	},
);

export const updateCoverAvatar = serviceHandler(
	async (userid, coverLocalPath) => {
		const user = await User.findById(userid);

		await deleteImageOnCloudinary(user.coverImage);
		const coverImage = await uploadImageOnCloudinary(coverLocalPath);
		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{ $set: { coverImage: coverImage.secure_url } },
			{ new: true },
		).select("-password -refreshToken");

		userServiceLogger.info("Cover image updated", {
			userId: user._id,
			username: user.username,
			oldCover: user.coverImage,
			newCover: updatedUser.coverImage,
		});
		return updatedUser;
	},
);

export const getUserChannelProfile = serviceHandler(async (userMeta) => {
	const user = await User.aggregate([
		{
			$match: { username: userMeta.username },
		},
		{
			$lookup: {
				from: "subscriptions",
				localField: "_id",
				foreignField: "channel",
				as: "subscribers",
			},
		},
		{
			$lookup: {
				from: "subscriptions",
				localField: "_id",
				foreignField: "subscriber",
				as: "subscribedTo",
			},
		},
		{
			$addFields: {
				subscribersCount: { $size: "$subscribers" },
				subscribedToCount: { $size: "$subscribedTo" },
				isSubscribed: {
					$cond: {
						if: { $in: [userMeta._id, "$subscribers.subscriber"] },
						then: true,
						else: false,
					},
				},
			},
		},
		{
			$project: {
				fullName: 1,
				username: 1,
				subscribersCount: 1,
				subscribedToCount: 1,
				avatar: 1,
				coverImage: 1,
				isSubscribed: 1,
				email: 1,
				subscribers: 1,
				subscribedTo: 1,
			},
		},
	]);

	userServiceLogger.info("Fetched user channel profile", {
		userId: userMeta._id,
		username: userMeta.username,
	});
	return user[0];
});

export const getUserwatchHistory = serviceHandler(async (userId) => {
	const watchHistory = await WatchHistory.aggregate([
		{ $match: { _id: new ObjectId(String(userId)) } },
		{
			$lookup: {
				from: "videos",
				localField: "video",
				foreignField: "_id",
				as: "videoDetails",
				pipeline: [
					{
						$lookup: {
							from: "users",
							localField: "owner",
							foreignField: "_id",
							as: "ownerDetails",
							pipeline: [
								{
									$project: {
										fullName: 1,
										username: 1,
										avatar: 1,
									},
								},
							],
						},
					},
					{
						$project: {
							title: 1,
							thumbnail: 1,
							duration: 1,
							ownerDetails: { $arrayElemAt: ["$ownerDetails", 0] },
						},
					},
				],
			},
		},
		{
			$project: {
				_id: 0,
				video: { $arrayElemAt: ["$videoDetails", 0] },
				isWatched: 1,
				watchDates: 1,
				user: 1,
			},
		},
	]);
	userServiceLogger.info("Fetched user watch history", { userId });
	return watchHistory;
});
