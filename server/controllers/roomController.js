import Hotel from "../models/Hotel.js"
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const {roomType, pricePerNight, amenities} = req.body;
        const hotel = await Hotel.findOne({owner: req.auth().userId})

        // Checking the hotel availability
        if(!hotel) return res.json({success: false, message: "No Hotel found"});
        
        // Upload images to cloudinary
        const uploadImages = req.files.map(async (file) => {
           const response = await cloudinary.uploader.upload(file.path);
           return response.secure_url;
        })
        // wait for all uploads to complete
        const images = await Promise.all(uploadImages)

        // Storing data into the database using Room model
        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: JSON.parse(amenities),
            images,
        })
        res.json({ success: true, message: "Room Created Successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


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


// API to get all rooms for a specific hotel
export const getOwnerRooms = async (req, res) => {
    try {
        // Getting hotel data
        const hotelData = await Hotel.findOne({owner: req.auth().userId})
        // Getting rooms of this particular hotel
        const rooms = await Room.find({hotel: hotelData._id.toString()}).populate("hotel");
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
        const roomData = await Room.findById(roomId);
        // Toggling isavailability property
        roomData.isAvailable = !roomData.isAvailable;
        // Updating data
        await roomData.save();
        res.json({success: true, message: "Room availability Updated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}