import { param } from "express-validator";

export const toggleSubscriptionValidator = [
	param("channelId")
		.isEmpty()
		.withMessage("channelId is required")
		.isString()
		.withMessage("channelId must be string")
		.isMongoId()
		.withMessage("Invalid channelId"),
];

export const getUserChannelSubscribersValidator = [
	param("channelId")
		.isEmpty()
		.withMessage("channelId is required")
		.isString()
		.withMessage("channelId must be string")
		.isMongoId()
		.withMessage("Invalid channelId"),
];

export const getSubscribedChannelsValidator = [
	param("subscriberId")
		.isEmpty()
		.withMessage("subscriberId is required")
		.isString()
		.withMessage("subscriberId must be string")
		.isMongoId()
		.withMessage("Invalid subscriberId"),
];
