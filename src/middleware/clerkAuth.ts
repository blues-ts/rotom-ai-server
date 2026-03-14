import type { Request, Response, NextFunction } from "express"
import { getAuth } from "@clerk/express"
import { User } from "../types/User"
import { requireAuth } from "@clerk/express"

export type AuthRequest = Request & {
    userId?: String
}

const isDev = process.env.NODE_ENV !== 'production'

export const protectRoute = isDev
    ? [(_req: Request, _res: Response, next: NextFunction) => { next() }]
    : [
        requireAuth(),
        async (req: AuthRequest, res: Response, next: NextFunction) => {
            try {
                const { userId: clerkId } = getAuth(req)
                if (!clerkId) {
                    return res.status(401).json({ error: "Unauthorized - invalid token" })
                }
                const user = await User.findOne({ clerkUserId: clerkId })
                if (!user) {
                    return res.status(404).json({ error: "User not found" })
                }
                req.userId = user._id.toString()
                next()
            } catch (error) {
                console.error("Error in protectRoute middleware:", error)
                return res.status(500).json({ error: "Internal server error" })
            }
        }
    ]
