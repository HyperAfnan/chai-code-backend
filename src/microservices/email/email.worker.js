import { Worker } from "bullmq";
import { redisWorkerConnection as connection } from "../../config/redis.js";
import { sendEmail } from "./email.processor.js";

const emailWorker = new Worker(
	"emailQueue",
	async (job) => {
		console.log(`Worker started for job ${job.id}`);
		const { to, subject, html } = job.data;
		await sendEmail(to, subject, html);
	},
	{ connection },
);

emailWorker.on("completed", (job) => {
	console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
	console.error(`Job ${job.id} failed: ${err.message}`);
});
