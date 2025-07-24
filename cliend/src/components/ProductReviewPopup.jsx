import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ProductReviewPopup = ({ onClose, onSubmit, productId, existingReview = null }) => {
  const { user } = useAppContext();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [review, setReview] = useState(existingReview?.review || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!review.trim() || rating === 0) {
      setError('Please provide both a rating and a comment.');
      return;
    }

    if (!user) {
      setError('Please login to submit a review.');
      return;
    }

    if (!productId) {
      setError('Product ID is missing.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const url = existingReview 
        ? `/api/product-reviews/${existingReview._id}`
        : '/api/product-reviews';
      
      const method = existingReview ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          rating,
          review: review.trim(),
          productId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      // Call the onSubmit callback with the new/updated review data
      if (onSubmit) {
        onSubmit({
          success: true,
          review: data.review,
          isUpdate: !!existingReview,
        });
      }

      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90%] max-w-md p-6 relative shadow-lg">
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-black" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X size={18} />
        </button>
        
        <h2 className="text-lg font-bold mb-4 text-center">
          {existingReview ? 'Update Your Review' : 'Leave a Product Review'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="text-sm font-semibold">Your Review</label>
          <textarea
            className="w-full border rounded mt-1 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this product..."
            maxLength={500}
            disabled={isSubmitting}
          />
          <div className="text-xs text-gray-500 mt-1">
            {review.length}/500 characters
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-semibold">Rating</label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                onClick={() => !isSubmitting && setRating(num)}
                className={`text-2xl cursor-pointer transition-colors ${
                  num <= rating ? 'text-yellow-500' : 'text-gray-300'
                } ${isSubmitting ? 'cursor-not-allowed' : 'hover:text-yellow-400'}`}
              >
                ★
              </span>
            ))}
          </div>
          {rating > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !review.trim() || rating === 0}
            className="flex-1 bg-primary hover:bg-primary-dull text-white py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (existingReview ? 'Updating...' : 'Submitting...') 
              : (existingReview ? 'Update Review' : 'Submit Review')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewPopup;
