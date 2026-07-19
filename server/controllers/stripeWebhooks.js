import stripe from "stripe";
import Booking from "../models/Booking.js";

// API to handle Stripe Webhooks    - in short to update mongodb database - applicable if payment is done

export const stripeWebhooks = async (request, response) => {
    // Intializing Stripe Gateway
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Handle the event
    if(event.type === "payment_intent.succeeded"){
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        // Getting Session Metadata - from paymentIntent we get sesssion - from session we get Metadata
        const session = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId,
        });

        // Metadata
        const { bookingId } = session.data[0].metadata;
        // Mark Payment as Paid
        await Booking.findByIdAndUpdate(bookingId, {isPaid: true, paymentMethod: "Stripe"})
    } else {
        console.log("Unhandled event type :", event.type)
    }
    response.json({ received: true });
}