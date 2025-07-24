// models/ProductReview.js
import mongoose from 'mongoose';

const productReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Assuming you have a Product model
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    required: [true, 'Please provide a review'],
    maxlength: [500, 'Review cannot be more than 500 characters'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Optional: Add verified purchase flag
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
  },
  // Optional: Add helpful votes
  helpfulVotes: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Index for better query performance
productReviewSchema.index({ product: 1, createdAt: -1 });
productReviewSchema.index({ user: 1, product: 1 }, { unique: true }); // One review per user per product
productReviewSchema.index({ rating: 1 });
productReviewSchema.index({ isActive: 1 });

export default mongoose.model('ProductReview', productReviewSchema);