import ENV from "../config/env.js";
import { logger } from "../utils/logger/index.js";

export const errorHandler = (err, req, res, next) => {
	if (err) {
		const requestId = req.headers["x-request-id"];

		logger.log({
			level: "error",
			message: `[Error]: ${requestId} [${err.message.substring(0, 100)}] [${req.method}] ${req.originalUrl}`,
			id: requestId,
			statusCode: err.status || 500,
			stack: ENV.NODE_ENV === "development" ? err.stack : undefined,
			data: err.data || null,
			ip: req.ip || null,
			userAgent: req.headers["user-agent"] || null,
			user: req.user ? { id: req.user._id, email: req.user.email } : null,
		});

		return res.status(err.status || 500).json({
			statusCode: err.status || 500,
			message: err.message || "Internal Server Error",
			stack: ENV.NODE_ENV === "development" ? err.stack : undefined,
			data: err.data || null,
		});
	}
	next();
};
