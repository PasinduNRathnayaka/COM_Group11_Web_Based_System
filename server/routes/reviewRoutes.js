import express from 'express';
import {
  createReview,
  getAllReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getReviewStats,
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllReviews); // Get all reviews (public display)
router.get('/stats', getReviewStats); // Get review statistics

// Protected routes (require authentication)
router.post('/',protect, createReview); // Create new review
router.get('/my-reviews', protect, getUserReviews); // Get user's own reviews
router.put('/:id', protect, updateReview); // Update review
router.delete('/:id', protect, deleteReview); // Delete review

export default router;