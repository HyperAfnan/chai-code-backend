import mongoose from "mongoose";
import ENV from "./env.js";

const connectDB = async () => {
	try {
		await mongoose.connect(`${ENV.MONGODB_URI}/videotube`);
		console.log("DB Connected ");
	} catch (e) {
		console.error(e);
		throw e;
	}
};

export default connectDB;
