import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { ApiError } from "./apiErrors.js";
import ENV from "../config/env.js"

cloudinary.config({
	cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
	api_key: ENV.CLOUDINARY_API_KEY,
	api_secret: ENV.CLOUDINARY_API_SECRET,
});
const uploadImageOnCloudinary = async (localFilePath) => {
	try {
		if (!localFilePath) return null;
		const stats = await fs.stat(localFilePath);
		if (stats.size > 5000000)
			throw new ApiError(400, "File size exceeds 5MB limit");

		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "image",
		});

		await fs.unlink(localFilePath);

		return response;
	} catch (err) {
      await fs.unlink(localFilePath);
		console.log("error uploading file to Cloudinary ", err);
	}
};
const uploadVideoOnCloudinary = async (localFilePath) => {
	try {
		if (!localFilePath) return null;

		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "video",
		});

      await fs.unlink(localFilePath);

		return response;
	} catch (err) {
		await fs.unlink(localFilePath);
		console.log("error uploading file to Cloudinary ", err);
	}
};

const deleteImageOnCloudinary = async (imageUrl) => {
	try {
		if (!imageUrl) return null;

      const publicId = URL.parse(imageUrl).pathname.split("/").at(-1).split(".").at(0)
		const response = await cloudinary.uploader.destroy(publicId, {
			resource_type: "image",
		});
		return response;
	} catch (err) {
		console.log("error deleting image to Cloudinary ", err);
	}
};

const deleteVideoOnCloudinary = async (videoUrl) => {
	try {
		if (!videoUrl) return null;

      const publicId = URL.parse(imageUrl).pathname.split("/").at(-1).split(".").at(0)
		const response = await cloudinary.uploader.destroy(publicId, {
			resource_type: "video",
		});
		return response;
	} catch (err) {
		console.log("error deleting video to Cloudinary ", err);
	}
};

export {
	deleteImageOnCloudinary,
	deleteVideoOnCloudinary,
	uploadImageOnCloudinary,
	uploadVideoOnCloudinary,
};
