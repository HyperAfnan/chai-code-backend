import { serviceHandler } from "../../utils/handlers.js";
import nodemailer from "nodemailer";
import ENV from "../../config/env.js";

const transporter = nodemailer.createTransport({
	server: ENV.EMAIL_SERVICE,
	host: "smtp.gmail.com",
	port: 587,
	secure: false,
	auth: { user: ENV.EMAIL_USER, pass: ENV.EMAIL_PASSWORD },
});

export const sendEmail = serviceHandler(async (to, subject, html) => {
	const mailOptions = {
		from: ENV.EMAIL_USER,
		to,
		subject,
		html,
	};

	await transporter
		.sendMail(mailOptions)
		.catch((error) => console.log("Error sending email: ", error));
});
