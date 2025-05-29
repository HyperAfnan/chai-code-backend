import { mongoose, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "dotenv";
config();

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		watchHistory: [{ type: Schema.Types.ObjectId, ref: "video" }],
		email: { type: String, required: true, unique: true, trim: true },
		fullName: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			index: true,
		},
		avatar: { type: String, required: true },
		coverImage: { type: String },
		password: { type: String, required: true },
		refreshToken: { type: String },
		confirmationToken: { type: String },
		isEmailConfirmed: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
	const isPasswordCorrect = await bcrypt.compare(password, this.password);
	return isPasswordCorrect;
};

userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
			fullname: this.fullname,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
	);
};

userSchema.methods.generateConfirmationToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
		},
		process.env.CONFIRMATION_TOKEN_SECRET,
		{ expiresIn: process.env.CONFIRMATION_TOKEN_EXPIRY },
	);
};

userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
	);
};

export const User = mongoose.model("user", userSchema);
