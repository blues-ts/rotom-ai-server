import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middleware/clerkAuth";
import { User } from "../types/User";
import { clerkClient, getAuth } from "@clerk/express";

export async function getUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId
        const user = await User.findById(userId)
        if (!user) {
            res.status(404).json({ error: "User not found" })
            return;
        }
        return res.status(200).json({ user })
    } catch (error) {
        console.error("Error in getUser controller:", error)
        next(error)
    }
}

export async function authCallback(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId: clerkUserId } = getAuth(req);
        if (!clerkUserId) {
            res.status(401).json({ error: "Unauthorized - invalid token" })
            return;
        }
        let user = await User.findOne({ clerkUserId });
        if (!user) {
            const clerkUser = await clerkClient.users.getUser(clerkUserId);
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            if (email) {
                user = await User.findOne({ email: email.toLowerCase() });
                if (user) {
                    user.clerkUserId = clerkUserId;
                    if (clerkUser.firstName || clerkUser.lastName) {
                        user.name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");
                    }
                    if (clerkUser.imageUrl) user.avatarUrl = clerkUser.imageUrl;
                    await user.save();
                }
            }
            if (!user) {
                user = await User.create({
                    clerkUserId: clerkUserId,
                    name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim() : (clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ?? "User"),
                    email: email ?? `${clerkUserId}@clerk.placeholder`,
                    avatarUrl: clerkUser.imageUrl ?? "",
                });
            }
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500);
        next(error);
    }
}
