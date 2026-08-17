import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { registerHotel ,subcribers} from "../controllers/hotelController.js";

const hotelRouter = express.Router();

// Endpoint
hotelRouter.post('/', protect, registerHotel);
hotelRouter.post('/subscribers', subcribers);

export default hotelRouter;