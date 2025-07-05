// src/components/RateUsPopup.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const RateUsPopup = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = () => {
    console.log('Rating:', rating);
    console.log('Review:', review);
    console.log('Category:', category);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90%] max-w-md p-6 relative shadow-lg">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-black" onClick={onClose}>
          <X size={18} />
        </button>
        <h2 className="text-lg font-bold mb-4 text-center">Review</h2>

        <label className="text-sm font-semibold">Leave a Review</label>
        <textarea
          className="w-full border rounded mt-1 p-2 text-sm"
          rows={3}
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <div className="mt-4">
          <label className="text-sm font-semibold">Rate Us</label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                onClick={() => setRating(num)}
                className={`text-xl cursor-pointer ${
                  num <= rating ? 'text-yellow-500' : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            <option value="">Select Category</option>
            <option value="service">Service</option>
            <option value="delivery">Delivery</option>
            <option value="products">Products</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-primary hover:bg-primary-dull text-white py-2 rounded transition"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};

export default RateUsPopup;
