import { mongoose, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const watchHistorySchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: "user", required: true },
		video: {
			type: Schema.Types.ObjectId,
			ref: "video",
			required: true,
			unique: true,
		},
		isWatched: { type: Boolean, default: false },
		watchDates: [
			{
				date: { type: Date, default: Date.now },
				duration: { type: Number, default: 0 },
			},
		],
	},
	{ timestamps: true },
);

watchHistorySchema.plugin(mongooseAggregatePaginate);

export const WatchHistory = mongoose.model("watchHistory", watchHistorySchema);
