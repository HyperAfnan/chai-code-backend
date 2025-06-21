import winston from "winston";
import fs from "fs";
import path from "path";
import "winston-daily-rotate-file";
const { timestamp, errors, json, combine, align } = winston.format;
const { File, Console } = winston.transports;
const logDir = path.join(process.cwd(), "logs");
import ENV from "../../config/env.js";

fs.mkdirSync(logDir, { recursive: true });

const fileRotateTransport = new winston.transports.DailyRotateFile({
	filename: path.join(logDir, "application-%DATE%.json"),
	datePattern: "YYYY-MM-DD",
	maxFiles: "14d",
	format: combine(json(), timestamp(), errors({ stack: true })),
	zippedArchive: true,
});

export const productionLogger = winston.createLogger({
	level: ENV.LOG_LEVEL,
	format: combine(errors({ stack: true }), align(), timestamp(), json()),
	transports: [
		fileRotateTransport,
		new Console({ level: "info" }),
		new File({ filename: path.join(logDir, "error.log"), level: "error" }),
		new File({ filename: path.join(logDir, "debug.log"), level: "debug" }),
	],
	exceptionHandlers: [
		new File({ filename: path.join(logDir, "exceptions.log") }),
	],
	rejectionHandlers: [
		new File({ filename: path.join(logDir, "rejections.log") }),
	],
	exitOnError: false,
});
