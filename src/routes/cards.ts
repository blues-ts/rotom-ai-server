import { Router } from "express"
import { protectRoute } from "../middleware/clerkAuth"
import { analyzeCard } from "../controllers/cardsController"
import { rateLimiter } from "../middleware/rateLimiter"
import { validateAnalyzeCardInput } from "../middleware/validation"

const router = Router()

router.post("/analyze-card", protectRoute, rateLimiter, validateAnalyzeCardInput, analyzeCard)

export default router
