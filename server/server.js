import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoute.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoute.js";
import bookingRouter from "./routes/bookingRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

dotenv.config();

// Calling mongoDB function
connectDB()
// Calling cloudinary function
connectCloudinary();

const app = express();

app.use(cors());

// API to listen to Stripe Webhooks
app.post('/api/stripe', express.raw({ type: "application/json" }), stripeWebhooks)

// API to listen Clerk Webhooks
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks)

// Middleware 
app.use(express.json())
app.use(clerkMiddleware())

// 1st Route ( Main Route )
app.get('/', (req, res)=> res.send("API is working"))
// 2nd Route ( User Route )
app.use('/api/user', userRouter)
// 3rd Route ( Hotel Route )
app.use('/api/hotels', hotelRouter)
// 4th Route ( Room Route )
app.use('/api/rooms', roomRouter)
// 5th Route ( Booking Route )
app.use('/api/bookings', bookingRouter)
app.use('/api/reviews', reviewRouter)

// Port for running
const PORT = process.env.PORT || 3000;

// Starting backend server
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));