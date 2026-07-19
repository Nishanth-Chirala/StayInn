import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { createRoom, getOwnerRooms, getRooms, toggleRoomAvailabililty } from "../controllers/roomController.js";

const roomRouter = express.Router();

// Endpoint 
// 1st Route 
roomRouter.post('/', upload.array("images", 4), protect, createRoom);
// 2nd Route
roomRouter.get('/', getRooms);
// 3rd Route
roomRouter.get('/owner', protect, getOwnerRooms);
// 4th Route
roomRouter.post('/toggle-availability', protect, toggleRoomAvailabililty);

export default roomRouter;