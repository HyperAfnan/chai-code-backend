import { rateLimit } from "express-rate-limit";
import ENV from "../config/env.js";

export const defaultRateLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 100,
   message: { error: "Too many requests, please try again later." },
   skip: () => ENV.NODE_ENV !== 'production',
})

export const authRateLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 10,
   message: { error: "Too many requests, please try again later." },
   skip: () => ENV.NODE_ENV !== 'production',
})
