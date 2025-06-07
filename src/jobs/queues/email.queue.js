import { Queue } from "bullmq";
import { redisQueueConnection as connection } from "../../config/redis.js";

const emailQueue = new Queue("emailQueue", { connection });

export default emailQueue;
