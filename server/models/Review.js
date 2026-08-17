import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
    photos: {
      type: [String],
      default: [],
    },
    consent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;
