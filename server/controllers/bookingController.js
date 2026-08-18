import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js"
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Stripe from "stripe";

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

        if (!room || !checkInDate || !checkOutDate) {
            return res.status(400).json({ success: false, message: 'Room, check-in date, and check-out date are required.' });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date provided.' });
        }

        if (checkOut <= checkIn) {
            return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date.' });
        }

        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        return res.json({ success: true, isAvailable });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// API to create new booking
// Endpoint
// POST /api/bookings/book
export const createBooking = async (req, res) => {
    try {

        const { room, checkInDate, checkOutDate, guests, paymentMethod } = req.body;
        const user = req.user._id;

        if (!room || !checkInDate || !checkOutDate || guests === undefined || guests === null || guests === '') {
            return res.status(400).json({ success: false, message: 'Room, dates, and guest count are required.' });
        }

        const guestCount = Number(guests);
        if (!Number.isInteger(guestCount) || guestCount < 1) {
            return res.status(400).json({ success: false, message: 'Guests must be a valid number greater than 0.' });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid booking dates provided.' });
        }

        if (checkOut <= checkIn) {
            return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date.' });
        }

        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        if (!isAvailable) {
            return res.json({ success: false, message: 'Room is not available' });
        }

        const roomData = await Room.findById(room).populate('hotel');
        if (!roomData) {
            return res.status(404).json({ success: false, message: 'Room not found.' });
        }

        if (guestCount > roomData.maxGuests) {
            return res.status(400).json({ success: false, message: `This room accommodates up to ${roomData.maxGuests} guests.` });
        }

        const discountedNightPrice = roomData.pricePerNight * (1 - roomData.discount / 100);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const totalPrice = discountedNightPrice * nights;

        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: guestCount,
            checkInDate,
            checkOutDate,
            totalPrice,
            paymentMethod: paymentMethod || 'Pay At Hotel',
        });

        // Mail options
        console.log(req.user.email)
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

// API to get booking details for all hotels owned by the user
export const getHotelBookings = async (req, res) => {
    try {
        
        // Find all hotels for this owner
        const hotels = await Hotel.find({ owner: req.user._id });
        if(!hotels || hotels.length === 0) {
            return res.json({success: false, message: "No hotels found"});
        }

        // Get all hotel IDs
        const hotelIds = hotels.map(hotel => hotel._id.toString());

        // Find all bookings for these hotels and populate related data
        let bookings = await Booking.find({hotel: {$in: hotelIds}}).populate("room hotel user").sort({createdAt: -1});

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
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Find room data from booking data
        const roomData = await Room.findById(booking.room).populate('hotel');
        // Getting price
        const totalPrice = booking.totalPrice;
        // Origin - means frontend url
        const { origin } = req.headers;

        // Stripe instance
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

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