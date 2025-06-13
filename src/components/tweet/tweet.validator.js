import { body, oneOf, param } from "express-validator";
import { ApiError } from "../../utils/apiErrors.js";

export const createTweetValidator = [
	body("title")
		.notEmpty()
		.withMessage("Title is required")
		.isString()
		.withMessage("Title must be string")
		.trim(),
	body("content")
		.notEmpty()
		.withMessage("Content is required")
		.isString()
		.withMessage("Title must be string")
		.trim(),
];

export const createTweetFileValidator = async (req, _, next) => {
	const file = req?.file?.path;
	const supportedFileTypes = ["png", "jpg", "jpeg", "gif"];
	if (file) {
		for (let i = 0; i < supportedFileTypes.length; i++) {
			const supportedFile = supportedFileTypes[i];
			if (file.split(".")[1] === supportedFile) return next();
		}
		throw new ApiError(400, `Unsupported file type: ${file.split(".")[1]}`);
	}
	next();
};

export const updateTweetValidator = [
	oneOf(
		[
			body("title")
				.optional()
				.isString()
				.withMessage("Title must be string")
				.trim(),
			body("content")
				.optional()
				.isString()
				.withMessage("Content must be string")
				.trim(),
		],
		{ message: "At least one field required" },
	),
	param("tweetId")
		.notEmpty()
		.withMessage("TweetId is required")
		.isString()
		.withMessage("TweetId must be string")
		.isMongoId()
		.withMessage("Invalid TweetId"),
];

export const deleteTweetValidator = [
	param("tweetId")
		.notEmpty()
		.withMessage("TweetId is required")
		.isString()
		.withMessage("TweetId must be string")
		.isMongoId()
		.withMessage("Invalid TweetId"),
];

export const getUserTweetsValidator = [
	param("userId")
		.optional()
		.isString()
		.withMessage("UserId must be string")
		.isMongoId()
		.withMessage("Invalid UserId format"),
];
