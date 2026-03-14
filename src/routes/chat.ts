import { Router } from 'express'
import { protectRoute } from '../middleware/clerkAuth'
import { streamChat } from '../controllers/chatController'
import rateLimit from 'express-rate-limit'
import type { Request } from 'express'
import { getAuth } from '@clerk/express'

const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 chat requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req: Request) => {
    const { userId } = getAuth(req)
    return userId ?? req.ip ?? 'unknown'
  },
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many chat requests. Please wait a moment.',
    })
  },
})

const router = Router()

router.post('/', protectRoute, chatRateLimiter, streamChat)

export default router
