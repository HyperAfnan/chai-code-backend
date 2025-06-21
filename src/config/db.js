import mongoose from "mongoose";
import ENV from "./env.js";
import { logger } from "../utils/logger/index.js";

const connectDB = async () => {
	mongoose.set("debug", (collectionName, method, query, doc) => {
		logger.debug(`MongoDB ${method}`, {
			collection: collectionName,
			query: JSON.stringify(query),
			doc: JSON.stringify(doc),
			queryTime: Date.now(),
		});
	});

	try {
		await mongoose.connect(`${ENV.MONGODB_URI}/videotube`);
	} catch (e) {
		throw e;
	}
};

export default connectDB;
