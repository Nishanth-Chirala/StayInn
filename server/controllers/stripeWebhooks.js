import Stripe from "stripe";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";

// API to handle Stripe Webhooks    - in short to update mongodb database - applicable if payment is done

export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.expired") {
        const bookingId = event.data.object.metadata?.bookingId;
        if (!bookingId || !mongoose.isValidObjectId(bookingId)) {
            console.error(`Stripe event ${event.id} has missing or invalid bookingId metadata`);
            return response.status(400).json({ received: false, message: "Invalid booking metadata" });
        }

        try {
            await Booking.updateOne(
                {
                    _id: bookingId,
                    isPaid: false,
                    status: "pending",
                    $or: [
                        { stripeCheckoutSessionId: event.data.object.id },
                        { stripeCheckoutSessionId: { $exists: false } },
                    ],
                },
                { $set: { status: "cancelled" } }
            );
            return response.json({ received: true });
        } catch (error) {
            console.error(`Failed to cancel booking for expired Stripe session ${event.data.object.id}:`, error);
            return response.status(500).json({ received: false, message: "Failed to update booking" });
        }
    }

    const isCheckoutSessionEvent = [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
    ].includes(event.type);
    const isPaymentIntentEvent = event.type === "payment_intent.succeeded";

    if (!isCheckoutSessionEvent && !isPaymentIntentEvent) {
        return response.json({ received: true });
    }

    const payment = event.data.object;
    if (isCheckoutSessionEvent && payment.payment_status !== "paid") {
        return response.json({ received: true });
    }

    let bookingId = payment.metadata?.bookingId;
    if (!bookingId && isPaymentIntentEvent) {
        try {
            const sessions = await stripeInstance.checkout.sessions.list({
                payment_intent: payment.id,
                limit: 1,
            });
            bookingId = sessions.data[0]?.metadata?.bookingId;
        } catch (error) {
            console.error(`Failed to find checkout session for Stripe event ${event.id}:`, error);
            return response.status(500).json({ received: false, message: "Failed to find booking metadata" });
        }
    }

    if (!bookingId) {
        console.error(`Stripe event ${event.id} is missing bookingId metadata`);
        return response.status(400).json({ received: false, message: "Missing booking metadata" });
    }

    if (!mongoose.isValidObjectId(bookingId)) {
        console.error(`Stripe event ${event.id} contains an invalid bookingId`);
        return response.status(400).json({ received: false, message: "Invalid booking metadata" });
    }

    try {
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { $set: { isPaid: true, paymentMethod: "Stripe", status: "confirmed" } },
            { new: true }
        );

        if (!booking) {
            console.error(`Stripe event ${event.id} references missing booking ${bookingId}`);
            return response.status(500).json({ received: false, message: "Booking not found" });
        }

        return response.json({ received: true });
    } catch (error) {
        console.error(`Failed to update booking for Stripe event ${event.id}:`, error);
        return response.status(500).json({ received: false, message: "Failed to update booking" });
    }
};