import { User } from "./user.models.js";
import { serviceHandler } from "../../utils/handlers.js";
import { ApiError } from "../../utils/apiErrors.js";
import {
	deleteImageOnCloudinary,
	uploadImageOnCloudinary,
} from "../../utils/fileHandlers.js";
import { ObjectId } from "mongodb";

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

export const registerUser = serviceHandler(
	async (
		fullName,
		email,
		username,
		password,
		avatarLocalPath,
		coverImageLocalPath,
	) => {
		// here now we will generae our confirmation token,
		// and call the email service to send email with our token in its parameter
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

		// here we will call the email service
		const { confirmationToken } = await generateConfirmationToken(user);

		const createdUser = await User.findById(user._id).select(
			"-password -refreshToken",
		);
		if (!createdUser)
			throw new ApiError(500, "Something went wrong while creating user");

		return createdUser;
	},
);

export const confirmEmail = serviceHandler(async (userMeta) => {
	const user = await User.findByIdAndUpdate(
		userMeta,
		{ isEmailVerified: true, ConfirmationToken: "" },
		{ new: true },
	);
	const { accessToken, refreshToken } = generateTokens(user);
	return { accessToken, refreshToken };
});

export const loginUser = serviceHandler(async (username, password) => {
	const user = await User.findOne({ username });
	if (!user) throw new ApiError(404, "User not found");

	const isPasswordCorrect = await user.isPasswordCorrect(password);
	if (!isPasswordCorrect) throw new ApiError(401, "Invalid User Credientials");

	const { accessToken, refreshToken } = await generateTokens(user);

	const loggedInUser = await User.findById(user._id).select(
		" -password -refreshToken",
	);

	return { user: loggedInUser, accessToken, refreshToken };
});

export const logoutUser = serviceHandler(async (userId) => {
	await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
});

// TODO: should also delete user's likes, subscriptions, videos, comments
export const deleteUser = serviceHandler(async (userId) => {
	const user = await User.findByIdAndDelete(userId);
	await deleteImageOnCloudinary(user?.avatar);
	if (user?.coverImage) await deleteImageOnCloudinary(user.coverImage);
});

export const refreshAccessToken = serviceHandler(async (userId) => {
	const user = await User.findById(userId);
	const { refreshToken, accessToken } = await generateTokens(user);
	return { refreshToken, accessToken };
});

export const changePassword = serviceHandler(
	async (userId, oldPassword, newPassword) => {
		const user = await User.findById(userId);
		const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
		if (!isPasswordCorrect) throw new ApiError(400, "Invald Password");

		user.password = newPassword;
		await user.save({ validateBeforeSave: false });
	},
);

export const updateAccountDetails = serviceHandler(
	async (userId, fullName, username) => {
		const user = await User.findByIdAndUpdate(
			userId,
			{ $set: { fullName, username } },
			{ new: true },
		).select("-password -refreshToken");

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
	return user[0];
});

export const getUserwatchHistory = serviceHandler(async (userId) => {
	const user = await User.aggregate([
		{ $match: { _id: new ObjectId(String(userId)) } },
		{
			$lookup: {
				from: "videos",
				localField: "watchHistory",
				foreignField: "_id",
				as: "watchHistory",
				pipeline: [
					{
						$lookup: {
							from: "users",
							localField: "owner",
							foreignField: "_id",
							as: "owner",
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
				],
			},
		},
	]);
	return user[0].watchHistory;
});
