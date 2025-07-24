// controllers/productReviewController.js
import asyncHandler from 'express-async-handler';
import ProductReview from '../models/ProductReview.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
// import Product from '../models/Product.js'; // Uncomment if you have a Product model

// @desc    Create a new product review
// @route   POST /api/product-reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, review, productId } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!rating || !review || !productId) {
    res.status(400);
    throw new Error('Please provide rating, review, and product ID');
  }

  // Validate rating range
  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if user already reviewed this product
    const existingReview = await ProductReview.findOne({
      user: userId,
      product: productId,
      isActive: true
    });

    if (existingReview) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }

    // Create review
    const newReview = await ProductReview.create({
      user: userId,
      product: productId,
      rating: parseInt(rating),
      review: review.trim(),
    });

    // Populate user info for response
    const populatedReview = await ProductReview.findById(newReview._id)
      .populate('user', 'name email profilePic')
      .populate('product', 'productName name');

    res.status(201).json({
      success: true,
      message: 'Product review submitted successfully',
      review: populatedReview,
    });

  } catch (error) {
    console.error('Create product review error:', error);
    res.status(400);
    throw new Error(error.message || 'Product review submission failed');
  }
});

// @desc    Get all reviews for a specific product
// @route   GET /api/product-reviews/product/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { rating } = req.query;

    // Build filter object
    const filter = { product: productId, isActive: true };
    if (rating) filter.rating = parseInt(rating);

    const reviews = await ProductReview.find(filter)
      .populate('user', 'name profilePic')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProductReview.countDocuments(filter);

    // Calculate average rating and rating distribution
    const ratingStats = await ProductReview.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), isActive: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    let stats = {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    if (ratingStats.length > 0) {
      const stat = ratingStats[0];
      stats.averageRating = parseFloat(stat.averageRating.toFixed(1));
      stats.totalReviews = stat.totalReviews;
      
      // Calculate rating distribution
      stat.ratingDistribution.forEach(rating => {
        if (stats.ratingDistribution.hasOwnProperty(rating)) {
          stats.ratingDistribution[rating]++;
        }
      });
    }

    res.status(200).json({
      success: true,
      reviews,
      stats,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });

  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to fetch product reviews');
  }
});

// @desc    Get user's review for a specific product
// @route   GET /api/product-reviews/user/:productId
// @access  Private
export const getUserProductReview = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const review = await ProductReview.findOne({
      user: userId,
      product: productId,
      isActive: true
    }).populate('user', 'name profilePic');

    res.status(200).json({
      success: true,
      review,
      hasReviewed: !!review,
    });

  } catch (error) {
    console.error('Get user product review error:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to fetch user review');
  }
});

// @desc    Update product review
// @route   PUT /api/product-reviews/:id
// @access  Private
export const updateProductReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    // Find review
    const existingReview = await ProductReview.findById(id);
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

    const updatedReview = await existingReview.save();
    const populatedReview = await ProductReview.findById(updatedReview._id)
      .populate('user', 'name profilePic')
      .populate('product', 'productName name');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: populatedReview,
    });

  } catch (error) {
    console.error('Update product review error:', error);
    res.status(400);
    throw new Error(error.message || 'Review update failed');
  }
});

// @desc    Delete product review (soft delete)
// @route   DELETE /api/product-reviews/:id
// @access  Private
export const deleteProductReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find review
    const review = await ProductReview.findById(id);
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
    console.error('Delete product review error:', error);
    res.status(400);
    throw new Error(error.message || 'Review deletion failed');
  }
});

// @desc    Get all reviews by a user
// @route   GET /api/product-reviews/user
// @access  Private
export const getUserAllReviews = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await ProductReview.find({ user: userId, isActive: true })
      .populate('product', 'productName name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProductReview.countDocuments({ user: userId, isActive: true });

    res.status(200).json({
      success: true,
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });

  } catch (error) {
    console.error('Get user all reviews error:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to fetch user reviews');
  }
});