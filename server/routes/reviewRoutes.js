import express from 'express';
import { createReview, getReviews, numberOfreviews ,geAllReviews} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const reviewRouter = express.Router();

reviewRouter.get('/stats', numberOfreviews);
reviewRouter.get('/', getReviews);
reviewRouter.get('/getallreviews',geAllReviews);
reviewRouter.post('/', protect, createReview);

export default reviewRouter;
