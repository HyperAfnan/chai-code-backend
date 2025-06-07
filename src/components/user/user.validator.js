import { ExpressValidator, oneOf } from "express-validator";
import { ApiError } from "../../utils/apiErrors.js";
import { User } from "./user.models.js";
import jwt from "jsonwebtoken";
import path from "node:path";
import ENV from "../../config/env.js";

const { body, cookie, param } = new ExpressValidator({
	checkWhitespace: (value) => {
		for (let i = 0; i < value?.length; i++) {
			if (value[i] === " ") return false;
		}
		return true;
	},
	isRefreshToken: async (value) => {
		try {
			const decodedToken = jwt.verify(value, ENV.REFRESH_TOKEN_SECRET);
			const user = await User.findById(decodedToken?._id);
			if (!user) return false;
			return value === user?.refreshToken;
		} catch (error) {
			return false;
		}
	},
	isfirstLetterLowercase: (value) =>
		value.charAt(0) === value.charAt(0).toLowerCase(),
});

export const registerValidator = [
	body("fullName")
		.notEmpty()
		.withMessage("Fulllname is required")
		.isString()
		.withMessage("Name must be a string")
		.trim(),

	body("email")
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Invalid email format")
		.trim(),
	// .custom(async (email) => {
	// 	const existingUser = await User.findOne({ email });
	// 	if (existingUser)
	// 		throw new ApiError("A user already exists with this e-mail address");
	// }),

	body("username")
		.notEmpty()
		.withMessage("Username is required")
		.isString()
		.withMessage("Username must be a string")
		.isfirstLetterLowercase()
		.withMessage("first letter of username should be lowercase")
		.trim()
		.isLength({ min: 3, max: 15 })
		.withMessage("Username must between 3-15 characters")
		.checkWhitespace()
		.withMessage("whitespace is not allowed in username"),
	// .custom(async (username) => {
	// 	const existingUser = await User.findOne({ username });
	// 	if (existingUser)
	// 		throw new ApiError("A user already exists with this username");
	// }),

	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isString()
		.withMessage("Password must be a string")
		.trim(),
];

export const registerationFilesValidator = (req, _, next) => {
	try {
		const supportedImageTypes = [".jpg", ".jpeg", ".png"];
		if (req?.files?.avatar && req?.files?.avatar?.length > 0) {
			const avatarFileExt = path
				.extname(req.files.avatar[0].path)
				.toLowerCase();
			if (!supportedImageTypes.includes(avatarFileExt)) {
				throw new ApiError(
					400,
					`Avatar image must be one of these types: ${supportedImageTypes.join(", ")}`,
				);
			}
		} else throw new ApiError(400, "Avatar image is required");

		if (req?.files?.coverImage && req?.files?.coverImage?.length > 0) {
			const coverImageFileExt = path
				.extname(req.files.coverImage[0].path)
				.toLowerCase();
			if (!supportedImageTypes.includes(coverImageFileExt))
				throw new ApiError(
					400,
					`Cover image must be one of these types: ${supportedImageTypes.join(", ")}`,
				);
		}
		next();
	} catch (error) {
		next(error);
	}
};

export const confirmEmailValidator = [
	param("confirmationToken")
		.notEmpty()
		.withMessage("Confirmation token is required")
		.isString()
		.withMessage("Confirmation token must be a string")
		.isJWT()
		.withMessage("Invalid confirmation token format"),
];

export const confirmationTokenValidator = async (req, _, next) => {
	try {
		const token = req?.params?.confirmationToken;
		const decodedToken = jwt.verify(token, ENV.CONFIRMATION_TOKEN_SECRET);
		const user = await User.findById(decodedToken?._id);

		if (user.isEmailConfirmed)
			throw new ApiError(400, "Email is already confirmed");

		if (!user) throw new ApiError(401, "Invalid confirmation token");

		req.user = user;
		next();
	} catch (error) {
		throw new ApiError(401, error);
	}
};

export const loginValidator = [
	body("email")
		.notEmpty()
		.withMessage("Email is required")
		.isString()
		.withMessage("Email must be a string")
		.isEmail()
		.withMessage("Invalid email format")
		.trim(),
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isString()
		.withMessage("Password must be a string")
		.trim(),
];

export const refreshAccessTokenValidator = [
	oneOf(
		[
			body("accessToken")
				.optional()
				.isJWT()
				.withMessage("Invalid token format")
				.isRefreshToken(),
			cookie("accessToken")
				.optional()
				.isJWT()
				.withMessage("Invalid token format")
				.isRefreshToken(),
		],
		{ message: "Valid access token is required" },
	),
];

export const changePasswordValidator = [
	body("oldPassword")
		.notEmpty()
		.withMessage("Old Password field is required")
		.isString()
		.withMessage("Old Password field must be string")
		.trim(),
	body("newPassword")
		.notEmpty()
		.withMessage("New Password field is required")
		.isString()
		.withMessage("New Password field must be string")
		.trim(),
];

export const updateAccountDetailsValidator = [
	oneOf(
		[
			body("fullName").isString().withMessage("Name must be a string").trim(),
			body("username")
				.isString()
				.withMessage("Username must be a string")
				.isfirstLetterLowercase()
				.isLength({ min: 3, max: 15 })
				.withMessage("Username must between 3-15 characters")
				.checkWhitespace()
				.custom(async (username) => {
					const existingUser = await User.findOne({ username });
					if (existingUser)
						throw new ApiError("A user already exists with this username");
					return true;
				}),
		],
		{ message: "Atleast one field is required to update" },
	),
];

export const avatarFileValidator = (req, _, next) => {
	try {
		if (!req.file || !req.file.path)
			throw new ApiError(400, "Avatar image is required");

		next();
	} catch (error) {
		next(error);
	}
};

export const coverImageFileValidator = (req, _, next) => {
	try {
		if (!req.file || !req.file.path)
			throw new ApiError(400, "Cover image is required");

		next();
	} catch (error) {
		next(error);
	}
};

export const getUserChannelProfileValidator = [
	param("username")
		.optional()
		.isString()
		.withMessage("Username must be a string")
		.isfirstLetterLowercase()
		.withMessage("first letter of username should be lowercase")
		.trim(),
];

export const usernameValidator = async (req, _, next) => {
	const { username } = req.params;
	let newUser = User.find({ username });
	if (!newUser) newUser = req.user;

	req.newUser = newUser;
	next();
};
