import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/handlers.js";
import * as userService from "./user.services.js";

const cookieOptions = { httpOnly: true, secure: true };

const registerUser = asyncHandler(async (req, res) => {
	const { fullName, email, username, password } = req.body;

	const avatarLocalPath = req.files?.avatar[0].path;
	const coverImageLocalPath = req.files?.coverImage?.[0].path || null;

	const user = await userService.registerUser(
		fullName,
		email,
		username,
		password,
		avatarLocalPath,
		coverImageLocalPath,
	);

	return res
		.status(201)
		.json(new ApiResponse(201, user, "User registered successfully"));
});

const confirmEmail = asyncHandler(async (req, res) => {
	const confirmEmail = await userService.confirmEmail(req.user);

	return res
		.status(200)
		.cookie("accessToken", confirmEmail.accessToken, cookieOptions)
		.cookie("refreshToken", confirmEmail.refreshToken, cookieOptions)
		.json(new ApiResponse(200, null, "Email confirmed successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const loginService = await userService.loginUser(email, password);
	return res
		.status(200)
		.cookie("accessToken", loginService.accessToken, cookieOptions)
		.cookie("refreshToken", loginService.refreshToken, cookieOptions)
		.json(new ApiResponse(200, loginService, "User logged In successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
	await userService.logoutUser(req.user._id);

	return res
		.status(204)
		.clearCookie("accessToken", cookieOptions)
		.clearCookie("refreshToken", cookieOptions)
		.end();
});

const deleteUser = asyncHandler(async (req, res) => {
	await userService.deleteUser(req.user._id);
	return res
		.status(204)
		.clearCookie("accessToken", cookieOptions)
		.clearCookie("refreshToken", cookieOptions)
		.end();
});

const refreshAccessToken = asyncHandler(async (req, res) => {
	const { refreshToken, accessToken } = await userService.refreshAccessToken(
		req.user._id,
	);

	return res
		.status(200)
		.cookie("accessToken", accessToken, cookieOptions)
		.cookie("refreshToken", refreshToken, cookieOptions)
		.json(
			new ApiResponse(
				200,
				{ accessToken, refreshToken },
				"Access Token refreshed",
			),
		);
});

const changePassword = asyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	await userService.changePassword(req.user._id, oldPassword, newPassword);
	return res.status(204).end();
});

const updateAccountDetails = asyncHandler(async (req, res) => {
	const { fullName, username } = req.body;
	const user = await userService.updateAccountDetails(
		req.user._id,
		fullName,
		username,
	);

	return res
		.status(200)
		.json(new ApiResponse(200, user, "Account details updated "));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
	const avatarLocalPath = req.file.path;
	const user = await userService.updateUserAvatar(
		req.user._id,
		avatarLocalPath,
	);

	return res
		.status(200)
		.json(new ApiResponse(200, user, "successfully updated avatar"));
});

const updateUserCoverImg = asyncHandler(async (req, res) => {
	const avatarLocalPath = req.file.path;
	const user = await userService.updateCoverAvatar(
		req.user._id,
		avatarLocalPath,
	);

	return res
		.status(200)
		.json(new ApiResponse(200, user, "successfully updated cover image"));
});

const getCurrentUser = asyncHandler(async (req, res) =>
	res
		.status(200)
		.json(new ApiResponse(200, req.user, "Current User Fetched successfully")),
);

const getUserChannelProfile = asyncHandler(async (req, res) => {
	const channel = await userService.getUserChannelProfile(req.newUser);
	return res
		.status(200)
		.json(new ApiResponse(200, channel, "Channel fetched successfully"));
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
	const user = await userService.getUserwatchHistory(req.user._id);
	return res
		.status(200)
		.json(new ApiResponse(200, user, "watch history fetched successfully"));
});

export {
	registerUser,
	loginUser,
	logoutUser,
	deleteUser,
	refreshAccessToken,
	changePassword,
	confirmEmail,
	getCurrentUser,
	updateAccountDetails,
	updateUserAvatar,
	updateUserCoverImg,
	getUserChannelProfile,
	getUserWatchHistory,
};
