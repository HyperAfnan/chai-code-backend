import { ApiError } from "../../utils/apiErrors.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/handlers.js";
import * as SubscriptionService from "./subscription.service.js";
import debug from "debug";
const log = debug("app:subscription:controller:log")

const toggleSubscription = asyncHandler(async (req, res) => {
	const { channelId } = req.params;

   const channel = await SubscriptionService.findChannelById(channelId);
   if (!channel) throw new ApiError(404, "Channel not found")

   const selfSubscription = await SubscriptionService.selfSubscriptionCheck(req.user._id, channelId)
   if (selfSubscription) throw new ApiError(400, "You can not subscribe to yourself")

	const subscription = await SubscriptionService.toggleSubscription(
		channelId,
		req.user._id,
	);

   log(`UserId: ${req.user._id.toString()} is subscribing to channelId: ${channelId}`)
	if (subscription.status === "Subscribed") {
		return res
			.status(201)
			.json(new ApiResponse(201, subscription.data, "Subscribed!!"));
	} else return res.status(204).end();

});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
	const { channelId } = req.params;

   const isValidChannel = await SubscriptionService.findChannelById(channelId);
   if (!isValidChannel) throw new ApiError(404, "Channel not found")

	const channel = channelId || req.user._id;
	const subscribers =
		await SubscriptionService.getUserChannelSubscribers(channel);

	return res
		.status(200)
		.json(
			new ApiResponse(200, subscribers, "Successfully fetched subscribers"),
		);
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
	const { subscriberId } = req.params;

   const isValidSubscriber = await SubscriptionService.findChannelById(subscriberId);
   if (!isValidSubscriber) throw new ApiError(404, "Subscriber not found")

	const subscriber = subscriberId || req.user._id;
	const subscriptions =
		await SubscriptionService.getSubscriberChannels(subscriber);

	return res
		.status(200)
		.json(
			new ApiResponse(200, subscriptions, "Successfully fetched subscriptions"),
		);
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
