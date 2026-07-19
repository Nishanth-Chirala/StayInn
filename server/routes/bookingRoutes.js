import express from "express";
import { checkAvailabilityAPI, createBooking, getHotelBookings, getUserBookings, stripePayment } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

// Endpoint
// 1st Route 
bookingRouter.post('/check-availability', checkAvailabilityAPI);
// 2nd Route
bookingRouter.post('/book', protect, createBooking);
// 3rd Route
bookingRouter.get('/user', protect, getUserBookings);
// 4th Route
bookingRouter.get('/hotel', protect, getHotelBookings);
// 5th Route
bookingRouter.post('/stripe-payment', protect, stripePayment);

export default bookingRouter;