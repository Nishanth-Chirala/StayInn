import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect, requireHotelOwner } from "../middleware/authMiddleware.js";
import { createRoom, getOwnerRooms, getRoomById, getRooms, toggleRoomAvailabililty, updateRoomDiscount } from "../controllers/roomController.js";

const roomRouter = express.Router();

// Endpoint 
// 1st Route 
roomRouter.post('/', protect, requireHotelOwner, upload.array("images", 4), createRoom);
// 2nd Route
roomRouter.get('/', getRooms);
// 3rd Route
roomRouter.get('/owner', protect, requireHotelOwner, getOwnerRooms);
// 4th Route
roomRouter.get('/:id', getRoomById);
// 5th Route
roomRouter.post('/update-discount', protect, requireHotelOwner, updateRoomDiscount);
// 6th Route
roomRouter.post('/toggle-availability', protect, requireHotelOwner, toggleRoomAvailabililty);

export default roomRouter;