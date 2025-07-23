// controllers/reviewController.js
import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import User from '../models/User.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { rating, review, category } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!rating || !review || !category) {
    res.status(400);
    throw new Error('Please provide rating, review, and category');
  }

  // Validate rating range
  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  // Validate category
  const validCategories = ['service', 'delivery', 'products'];
  if (!validCategories.includes(category)) {
    res.status(400);
    throw new Error('Invalid category');
  }

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    // Create review
    const newReview = await Review.create({
      user: userId,
      rating: parseInt(rating),
      review: review.trim(),
      category,
    });

    // Populate user info for response
    const populatedReview = await Review.findById(newReview._id).populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        _id: populatedReview._id,
        rating: populatedReview.rating,
        review: populatedReview.review,
        category: populatedReview.category,
        user: {
          _id: populatedReview.user._id,
          name: populatedReview.user.name,
        },
        createdAt: populatedReview.createdAt,
      },
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(400);
    throw new Error(error.message || 'Review submission failed');
  }
});

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
export const getAllReviews = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category, rating } = req.query;

    // Build filter object
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (rating) filter.rating = parseInt(rating);

    const reviews = await Review.find(filter)
      .populate('user', 'name profilePic')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    res.status(200).json({
      success: true,
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });

  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to fetch reviews');
  }
});

// @desc    Get user's own reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getUserReviews = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    const reviews = await Review.find({ user: userId, isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to fetch user reviews');
  }
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review, category } = req.body;
    const userId = req.user.id;

    // Find review
    const existingReview = await Review.findById(id);
    if (!existingReview) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Check if user owns the review
    if (existingReview.user.toString() !== userId) {
      res.status(403);
      throw new Error('Not authorized to update this review');
    }

    // Update fields
    if (rating) {
      if (rating < 1 || rating > 5) {
        res.status(400);
        throw new Error('Rating must be between 1 and 5');
      }
      existingReview.rating = parseInt(rating);
    }
    if (review) existingReview.review = review.trim();
    if (category) {
      const validCategories = ['service', 'delivery', 'products'];
      if (!validCategories.includes(category)) {
        res.status(400);
        throw new Error('Invalid category');
      }
      existingReview.category = category;
    }

    const updatedReview = await existingReview.save();
    const populatedReview = await Review.findById(updatedReview._id).populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: populatedReview,
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(400);
    throw new Error(error.message || 'Review update failed');
  }
});

// @desc    Delete review (soft delete)
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Check if user owns the review
    if (review.user.toString() !== userId) {
      res.status(403);
      throw new Error('Not authorized to delete this review');
    }

    // Soft delete
    review.isActive = false;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(400);
    throw new Error(error.message || 'Review deletion failed');
  }
});

// @desc    Get review statistics
// @route   GET /api/reviews/stats
// @access  Public
export const getReviewStats = asyncHandler(async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingBreakdown: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    if (stats.length > 0 && stats[0].ratingBreakdown) {
      stats[0].ratingBreakdown.forEach(rating => {
        if (ratingDistribution.hasOwnProperty(rating)) {
          ratingDistribution[rating]++;
        }
      });
    }

    const result = {
      totalReviews: stats[0]?.totalReviews || 0,
      averageRating: stats[0]?.averageRating ? parseFloat(stats[0].averageRating.toFixed(1)) : 0,
      ratingDistribution,
    };

    res.status(200).json({
      success: true,
      stats: result,
    });

  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to fetch review statistics');
  }
});