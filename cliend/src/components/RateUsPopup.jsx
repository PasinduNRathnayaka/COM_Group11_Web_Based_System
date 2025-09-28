// src/components/RateUsPopup.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const RateUsPopup = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
 const { user, backendUrl } = useAppContext();


  const handleSubmit = async () => {
    // Validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!review.trim()) {
      setError('Please write a review');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }

     if (!user || !user.token) {
    setError('You must be logged in to submit a review.');
    return;
  }

    setIsSubmitting(true);
    setError('');

    try {
      const reviewData = {
        rating,
        review: review.trim(),
        category,
        userId: user?._id || null,
        userName: user?.name || 'Anonymous',
        userEmail: user?.email || null,
        createdAt: new Date().toISOString()
      };

      console.log('Submitting review to:', `${backendUrl}/api/reviews`);
      console.log('Review data:', reviewData);

      const response = await fetch(`${backendUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        },
        body: JSON.stringify(reviewData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Response result:', result);

      if (result.success) {
        // Show success message
        console.log('Review submitted successfully:', result);
        
        // Reset form
        setRating(0);
        setReview('');
        setCategory('');
        
        // Close popup after short delay
        setTimeout(() => {
          onClose();
        }, 500);
        
        //Show success toast
        toast.success('Thank you for your review!');
        
      } else {
        setError(result.message || 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // More specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Cannot connect to server. Please check if the server is running.');
      } else if (error.message.includes('HTTP error')) {
        setError(`Server error: ${error.message}`);
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90%] max-w-md p-6 relative shadow-lg">
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-black transition" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X size={18} />
        </button>
        
        <h2 className="text-lg font-bold mb-4 text-center text-gray-800">Leave a Review</h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Review Text */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Your Review *
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={4}
            placeholder="Tell us about your experience..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            disabled={isSubmitting}
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {review.length}/500
          </div>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Rating *
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                disabled={isSubmitting}
                className={`text-2xl cursor-pointer transition-colors hover:scale-110 transform ${
                  num <= rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                } ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {rating === 0 ? 'Click to rate' : `${rating} star${rating > 1 ? 's' : ''}`}
          </div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select a category</option>
            <option value="service">Customer Service</option>
            <option value="delivery">Delivery & Shipping</option>
            <option value="products">Product Quality</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0 || !review.trim() || !category}
          className={`w-full py-3 rounded-md font-medium transition-all ${
            isSubmitting || rating === 0 || !review.trim() || !category
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-primary hover:bg-primary-dull text-white hover:shadow-md'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </div>
          ) : (
            'Submit Review'
          )}
        </button>

        {/* User Info Display */}
        {user && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Reviewing as: {user.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default RateUsPopup;