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

        const payload = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
        await whook.verify(payload, headers);

        const body = JSON.parse(payload.toString("utf8"));
        const { data, type } = body;

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses?.[0]?.email_address,
                    username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    image: data.image_url,
                };
                await User.create(userData);
                break;
            }

            case "user.updated": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses?.[0]?.email_address,
                    username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    image: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData, { new: true, runValidators: true });
                break;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                break;
            }

            default:
                break;
        }

        res.status(200).json({ success: true, message: "Webhook received" });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export default clerkWebhooks;