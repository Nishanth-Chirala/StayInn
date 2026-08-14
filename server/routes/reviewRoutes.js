import express from 'express';
import { createReview, getReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const reviewRouter = express.Router();

reviewRouter.get('/', getReviews);
reviewRouter.post('/', protect, createReview);

export default reviewRouter;
