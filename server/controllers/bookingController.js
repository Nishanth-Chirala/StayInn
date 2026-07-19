import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js"
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import stripe from "stripe";

// Function to Check Availability of R
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        // Finding rooms - bookings data
        const bookings = await Booking.find({
            room,
            checkInDate: {$lte: checkOutDate},
            checkOutDate: {$gte: checkInDate},
        });
        const isAvailable = bookings.length === 0;
        return isAvailable;
    } catch (error) {
        console.error(error.message);
    }
}

// API to check availability of room
// Endpoint
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        res.json({success: true, isAvailable})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// API to create new booking
// Endpoint
// POST /api/bookings/book
export const createBooking = async (req, res) => {
    try {
        
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user._id;

        // Before Booking Check Availability
        const isAvailable = await checkAvailability({checkInDate, checkOutDate, room});
        if(!isAvailable) {
            return res.json({success: false, message: "Room is not available"})
        }

        // if room is avialable
        // Get totalPrice from Room
        const roomData = await Room.findById(room).populate("hotel");
        let totalPrice = roomData.pricePerNight;

        // Calculate totalPrice based on night
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil( timeDiff / (1000 * 3600 * 24) );

        totalPrice *= nights;

        // Now creating booking
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        })

        // Mail options
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: 'Hotel Booking Details',
            html: `
                <h2>Your Booking Details</h2>
                <p>Dear ${req.user.username},</p>
                <p>Thank you for your booking! Here are your details:</p>
                <ul>
                    <li><strong>Booking ID:</strong> ${booking._id}</li>
                    <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
                    <li><strong>Location:</strong> ${roomData.hotel.address}</li>
                    <li><strong>Date:</strong> ${booking.checkInDate.toDateString()}</li>
                    <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || '$'} ${booking.totalPrice} /night</li>
                </ul>
                <p>We look forward to welcoming you!</p>
                <p>If you need to make any changes, feel free  to contact us.</p>
            `
        }

        // Sending email
        await transporter.sendMail(mailOptions)

        // response
        res.json({success: true, message: "Booking created successfully"});
    } catch (error) {
        console.error(error);
        res.json({success: false, message: "Failed to create booking"});
    }
}

// API to get all bookings for a specific user
// Endpoint: GET /api/bookings/user

export const getUserBookings = async (req, res) => {
    try {
        // Extract the authenticated user's ID (added by auth middleware)
        const user = req.user._id;

        // Fetch all bookings made by this user:
        // - Filter by user ID
        // - Populate 'room' and 'hotel' references to return full details
        // - Sort by creation date (newest first)
        let bookings = await Booking.find({ user })
            .populate("room hotel")
            .sort({ createdAt: -1 });

        // Filter out bookings whose room no longer exists
        // This prevents frontend crashes when a room is deleted
        bookings = bookings.filter(b => b.room);

        // Send response with the cleaned and sorted data
        res.json({ success: true, bookings });

    } catch (error) {
        // Handle errors such as database issues or invalid user
        res.json({
            success: false,
            message: "Failed to fetch bookings"
        });
    }
};

// API to get booking details for a particular owner
export const getHotelBookings = async (req, res) => {
    try {
        
        // Find the hotel for this owner
        const hotel = await Hotel.findOne({owner: req.auth().userId});
        if(!hotel) {
            return res.json({success: false, message: "No Hotel found"});
        }

        // Find all bookings for this hotel and populate related data
        let bookings = await Booking.find({hotel: hotel._id}).populate("room hotel user").sort({createdAt: -1});

        // Remove bookings whose room was deleted
        bookings = bookings.filter(b => b.room);

        // Total Bookings
        const totalBookings = bookings.length;
        // Total Revenue
        const totalRevenue = bookings.reduce((acc, booking)=>acc + booking.totalPrice, 0)

        // Send response
        res.json({success: true, dashboardData: {totalBookings, totalRevenue, bookings}})

    } catch (error) {
        res.json({success: false, message: "Failed to fetch bookings"})
    }
}

// controller function - for making payment for our bookings
export const stripePayment = async (req, res) => {
    try {
        // Getting booking id
        const { bookingId } = req.body;

        // Find booking data
        const booking = await Booking.findById(bookingId);
        // Find room data from booking data
        const roomData = await Room.findById(booking.room).populate('hotel');
        // Getting price
        const totalPrice = booking.totalPrice;
        // Origin - means frontend url
        const { origin } = req.headers;

        // Stripe instance
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        // Line items - for stripe
        const line_items = [
            {
                price_data:{
                    currency: "usd",
                    product_data:{
                        name: roomData.hotel.name,
                    },
                    unit_amount: totalPrice * 100
                },
                quantity: 1,
            }
        ]

        // Create Checkout Session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            metadata:{
                bookingId,
            }
        })

        // Send response
        res.json({success: true, url: session.url})

    } catch (error) {
        res.json({success: false, message: "Payment Failed"})
    }
}