import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['service', 'delivery', 'products'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ category: 1 });

export default mongoose.model('Review', reviewSchema);