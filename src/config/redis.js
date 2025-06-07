import IORedis from "ioredis";
import ENV from "./env.js";

export const redisQueueConnection = new IORedis({
	host: ENV.REDIS_HOST,
	port: ENV.REDIS_PORT,
	username: ENV.REDIS_USERNAME,
	password: ENV.REDIS_PASSWORD,
	tls: true,
});

export const redisWorkerConnection = new IORedis({
	host: ENV.REDIS_HOST,
	port: ENV.REDIS_PORT,
	username: ENV.REDIS_USERNAME,
	password: ENV.REDIS_PASSWORD,
	tls: true,
	maxRetriesPerRequest: null,
});
