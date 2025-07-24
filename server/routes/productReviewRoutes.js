// routes/productReviewRoutes.js
import express from 'express';
import {
  createProductReview,
  getProductReviews,
  getUserProductReview,
  updateProductReview,
  deleteProductReview,
  getUserAllReviews,
} from '../controllers/productReviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews); // Get all reviews for a product

// Protected routes (require authentication)
router.post('/', protect, createProductReview); // Create new product review
router.get('/user', protect, getUserAllReviews); // Get all user's reviews
router.get('/user/:productId', protect, getUserProductReview); // Get user's review for specific product
router.put('/:id', protect, updateProductReview); // Update review
router.delete('/:id', protect, deleteProductReview); // Delete review

export default router;