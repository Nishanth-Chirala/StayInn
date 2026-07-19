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
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

dotenv.config();

// Calling mongoDB function
connectDB()
// Calling cloudinary function
connectCloudinary();

const app = express();
// Find your current app.use(cors()) and replace it with this:
app.use(cors({
  origin: "http://localhost:5173", // 👈 Point this to your frontend URL
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"] // 👈 Tells CORS to accept the token header
}));


// API to listen to Stripe Webhooks
app.post('/api/stripe', express.raw({ type: "application/json" }), stripeWebhooks)

// Middleware 
app.use(express.json())
app.use(clerkMiddleware())

// API to listen Clerk Webhooks 
app.use("/api/clerk", clerkWebhooks)

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

// Port for running
const PORT = process.env.PORT || 3000;

// Starting backend server
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));