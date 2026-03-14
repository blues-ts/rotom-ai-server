import { Router } from "express"
import { protectRoute } from "../middleware/clerkAuth"
import { authCallback, getUser } from "../controllers/authController"

const router = Router()

router.get("/user", protectRoute, getUser)
router.post("/callback", authCallback)

export default router
