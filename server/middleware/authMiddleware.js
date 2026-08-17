import { getAuth } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const auth = getAuth(req);
        const userId = auth?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        let user = await User.findById(userId);
        if (!user) {
            user = await User.findOne({ clerkId: userId });
        }

        if (!user) {
            const claims = auth?.sessionClaims || {};
            const email = claims.email || `${userId}@clerk.local`;
            const username = claims.name || claims.first_name || `Clerk User ${userId.slice(-6)}`;
            const image = claims.picture || "https://placehold.co/100x100?text=User";

            user = await User.create({
                _id: userId,
                clerkId: userId,
                username,
                email,
                image,
                role: "user",
                recentSearchedCities: [],
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};
