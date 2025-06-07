import dotenv from "dotenv";
dotenv.config();

const ENV = {
	NODE_ENV: process.env.NODE_ENV || "development",
	PORT: parseInt(process.env.PORT, 10) || 5000,

	MONGODB_URI: process.env.MONGODB_URI,

	ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
	ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "1d",

	REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
	REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "10d",

	CONFIRMATION_TOKEN_SECRET: process.env.CONFIRMATION_TOKEN_SECRET,
	CONFIRMATION_TOKEN_EXPIRY: process.env.CONFIRMATION_TOKEN_EXPIRY || "2h",

	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

	EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
	EMAIL_USER: process.env.EMAIL_USER,
	EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

	REDIS_HOST: process.env.REDIS_HOST,
	REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
	REDIS_USERNAME: process.env.REDIS_USERNAME,
	REDIS_PASSWORD: process.env.REDIS_PASSWORD,
};

const requiredKeys = [
	"MONGODB_URI",
	"ACCESS_TOKEN_SECRET",
	"REFRESH_TOKEN_SECRET",
	"CONFIRMATION_TOKEN_SECRET",
	"CLOUDINARY_CLOUD_NAME",
	"CLOUDINARY_API_KEY",
	"CLOUDINARY_API_SECRET",
	"EMAIL_USER",
	"EMAIL_PASSWORD",
	"REDIS_HOST",
	"REDIS_PORT",
];

for (const key of requiredKeys) {
	if (!ENV[key]) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
}

export default ENV;
