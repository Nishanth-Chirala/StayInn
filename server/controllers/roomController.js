import Hotel from "../models/Hotel.js"
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const { hotelId, roomType, pricePerNight, amenities, discount = 0, maxGuests = 2, description = "" } = req.body;

        if (!roomType || !pricePerNight || !amenities) {
            return res.status(400).json({ success: false, message: "Room type, price, and amenities are required." });
        }

        if (!hotelId) {
            return res.status(400).json({ success: false, message: "Hotel ID is required." });
        }

        // Verify that the hotel belongs to the current user
        const hotel = await Hotel.findOne({ _id: hotelId, owner: req.user._id });
        if (!hotel) {
            return res.json({success: false, message: "Hotel not found or you are not authorized to add rooms to this hotel"});
        }

        const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
        const normalizedMaxGuests = Math.max(1, Number(maxGuests) || 2);
        const normalizedDiscount = Math.min(Math.max(Number(discount) || 0, 0), 100);

        // Upload images to cloudinary
        const uploadImages = req.files.map(async (file) => {
           const response = await cloudinary.uploader.upload(file.path);
           return response.secure_url;
        })
        // wait for all uploads to complete
        const images = await Promise.all(uploadImages)

        // Storing data into the database using Room model
        await Room.create({
            hotel: hotelId,
            roomType,
            pricePerNight: +pricePerNight,
            discount: normalizedDiscount,
            maxGuests: normalizedMaxGuests,
            description: String(description).trim(),
            amenities: parsedAmenities,
            images,
        })
        res.json({ success: true, message: "Room Created Successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const updateRoomDiscount = async (req, res) => {
    try {
        const { roomId, discount } = req.body;
        const room = await Room.findById(roomId).populate('hotel');
        if (!room) return res.json({ success: false, message: "Room not found" });

        // Verify the hotel belongs to the current user
        if (room.hotel.owner.toString() !== req.user._id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        room.discount = Math.min(Math.max(Number(discount) || 0, 0), 100);
        await room.save();

        res.json({ success: true, message: "Room discount updated successfully", room });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// API to get a single room by id
export const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id).populate({
            path: 'hotel',
            populate: {
                path: 'owner',
                select: 'image',
            }
        });

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        return res.json({ success: true, room });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// API to get all rooms
export const getRooms = async (req, res) => {
    try {
        // Finding rooms
        const rooms = await Room.find({isAvailable: true}).populate({
            path: 'hotel',
            populate: {
                path: 'owner',
                select: 'image',
            }
        }).sort({createdAt: -1})
        res.json({success: true, rooms});
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}


// API to get all rooms for a specific hotel owner (across all their hotels)
export const getOwnerRooms = async (req, res) => {
    try {
        // Get all hotels owned by this user
        const hotels = await Hotel.find({ owner: req.user._id });
        if (!hotels || hotels.length === 0) {
            return res.json({success: false, message: "No hotels found"});
        }

        // Get all hotel IDs
        const hotelIds = hotels.map(hotel => hotel._id.toString());

        // Get all rooms for these hotels
        const rooms = await Room.find({hotel: {$in: hotelIds}}).populate("hotel");
        res.json({success: true, rooms});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}


// API to toggle availability of a room
export const toggleRoomAvailabililty = async (req, res) => {
    try {
        // Getting room id
        const { roomId } = req.body;
        // Gettign room data
        const roomData = await Room.findById(roomId).populate('hotel');
        if (!roomData) return res.json({success: false, message: "Room not found"});

        // Verify the hotel belongs to the current user
        if (roomData.hotel.owner.toString() !== req.user._id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // Toggling isavailability property
        roomData.isAvailable = !roomData.isAvailable;
        // Updating data
        await roomData.save();
        res.json({success: true, message: "Room availability Updated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}