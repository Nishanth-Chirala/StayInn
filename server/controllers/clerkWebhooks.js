import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // This expects express.raw({ type: 'application/json' }) middleware on the route
        const payload = req.body; 
        await whook.verify(payload, headers);

        const body = JSON.parse(payload.toString("utf8"));
        const { data, type } = body;
        console.log(`Processing event: ${type} for user: ${data.id}`);

        // ✅ CRITICAL FIX: Send response immediately so Clerk doesn't back up your server threads
        res.status(200).json({ success: true, message: "Webhook received" });

        // Process database actions asynchronously in the background
        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    clerkId: data.id,
                    email: data.email_addresses?.[0]?.email_address ?? `${data.id}@clerk.local`,
                    username: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || `Clerk User ${data.id.slice(-6)}`,
                    image: data.image_url ?? "https://placehold.co/100x100?text=User",
                    recentSearchedCities: [],
                };
                await User.findOneAndUpdate(
                    { _id: data.id },
                    { $setOnInsert: userData },
                    { upsert: true, runValidators: true }
                );
                break;
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses?.[0]?.email_address ?? `${data.id}@clerk.local`,
                    username: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || `Clerk User ${data.id.slice(-6)}`,
                    image: data.image_url ?? "https://placehold.co/100x100?text=User",
                };
                
                // ✅ OPTIMIZATION: updateOne matches the string ID and skips returning data
                await User.updateOne(
                    { _id: data.id }, 
                    { $set: userData }, 
                    { runValidators: true }
                );
                break;
            }

            case "user.deleted": {
                await User.deleteOne({ _id: data.id });
                break;
            }

            default:
                break;
        }
    } catch (error) {
        console.error("Webhook Error:", error.message);
        // Prevent crashing if headers were already sent by the immediate 200 response
        if (!res.headersSent) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
};

export default clerkWebhooks;
