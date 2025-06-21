import winston from "winston";
import fs from "fs";
import path from "path";
const { colorize, timestamp, printf, combine, errors, json, align } =
	winston.format;
const { Console, File } = winston.transports;
import "winston-daily-rotate-file";
const logDir = path.join(process.cwd(), "logs");

fs.mkdirSync(logDir, { recursive: true });

const fileRotateTransport = new winston.transports.DailyRotateFile({
	filename: path.join(logDir, "application-%DATE%.json"),
	datePattern: "YYYY-MM-DD",
	maxFiles: "14d",
	format: combine(json(), timestamp(), errors({ stack: true })),
	zippedArchive: true,
});

const customFormat = printf(({ timestamp, level, message, stack }) => {
	return `${timestamp} [${level}]: ${message} ${stack || ""}`;
});

export const developmentLogger = winston.createLogger({
	level: "debug",
	format: combine(
		errors({ stack: true }),
		align(),
		timestamp({ format: "DD June HH-mm:ss" }),
		customFormat,
	),
	transports: [
		new Console({ format: colorize({ all: true }) }),
		fileRotateTransport,
		new File({
			level: "error",
			filename: path.join(logDir, "error.json"),
			format: combine(errors({ stack: true }), timestamp(), json()),
		}),
	],
	exceptionHandlers: [
		new Console(),
		new File({ filename: path.join(logDir, "exceptions.log") }),
	],
	rejectionHandlers: [
		new Console(),
		new File({ filename: path.join(logDir, "rejections.log") }),
	],
	exitOnError: false,
});
