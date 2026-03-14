import rateLimit from "express-rate-limit";
import type { Request } from "express";
import { getAuth } from "@clerk/express";

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  validate: false, // Disable all validations - we primarily use userId anyway

  keyGenerator: (req: Request) => {
    // Get Clerk user ID directly from the request
    // This works because clerkMiddleware() runs before this
    const { userId } = getAuth(req);

    // Rate limit by Clerk user ID if authenticated, otherwise by IP
    return userId ?? req.ip ?? "unknown";
  },

  handler: (_req, res) => {
    res.status(429).json({
      error: "Rate limit exceeded",
      message: "Please wait and try again.",
    });
  },
});
