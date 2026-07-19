import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUserData, storeRecentSearchedCities } from "../controllers/userController.js";

// Creating Router 
const userRouter = express.Router();

// Creating endpoint
// 1st Route 
userRouter.get('/', protect, getUserData);
// 2nd Route 
userRouter.post('/store-recent-search', protect, storeRecentSearchedCities);

export default userRouter;
