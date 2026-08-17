import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

// @desc    Get all reviews or filter by room
// @route   GET /api/reviews
export const getReviews = async (req, res) => {
  try {
    const { roomId } = req.query;
    const filter = roomId ? { room: roomId } : {};
    
    // Fix: Populate 'user' instead of the non-existent 'Hotel' path
    const reviews = await Review.find(filter)
      .populate({
        path: 'room',
        populate: { path: 'hotel' } // Deep populate hotel if it lives inside Room schema
      })
      .populate('user') // Populates user details for ExperienceList
      .sort({ createdAt: -1 });
      
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const geAllReviews = async (req, res) => {
  try {
    
    const reviews = await Review.find({})
      .populate('room')
      .sort({ createdAt: -1 });
      
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Create a new review (Verified buyers only)
// @route   POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { roomId, name, rating, title, review, photos = [], consent = false } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!roomId || !name || !title || !review) {
      return res.status(400).json({ success: false, message: 'Room, name, title, and review are required.' });
    }

    // Verify user has completed a stay in this specific room
    const completedStay = await Booking.findOne({
      user: req.user._id,
      room: roomId,
      checkOutDate: { $lt: new Date() },
    }).sort({ checkOutDate: -1 });

    if (!completedStay) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only guests with a completed stay in this room can submit a review.' 
      });
    }

    // Prevent duplicate reviews from the same user for the same room
    const existingReview = await Review.findOne({ user: req.user._id, room: roomId });
    if (existingReview) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this room.' });
    }

    const newReview = await Review.create({
      user: req.user._id,
      room: roomId,
      name,
      rating: Number(rating) || 5,
      title,
      review,
      photos,
      consent,
    });

    return res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get total review count and average rating (Global or per Room)
// @route   GET /api/reviews/stats
import mongoose from 'mongoose'; // 1. Import mongoose at the top

export const numberOfreviews = async (req, res) => {
  try {
    const { roomId } = req.query;
    if (!roomId) {
      const totalCount = await Review.countDocuments({});
      return res.status(200).json({ success: true, totalReviews: totalCount });
    }

    // 2. Convert string ID into a native MongoDB ObjectId
    const roomObjectId = new mongoose.Types.ObjectId(roomId);

    // Advanced-path: Get count and average rating using MongoDB Aggregation
    const stats = await Review.aggregate([
      { 
        // 3. Match against the actual ObjectId instance
        $match: { room: roomObjectId } 
      },
      {
        $group: {
          _id: '$room',
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    // Fallback if the room doesn't have any reviews yet
    if (stats.length === 0) {
      return res.status(200).json({
        success: true,
        totalReviews: 0,
        averageRating: 0
      });
    }

    return res.status(200).json({
      success: true,
      totalReviews: stats[0].totalReviews,
      averageRating: Math.round(stats[0].averageRating * 10) / 10 // Rounds to 1 decimal place
    });

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
