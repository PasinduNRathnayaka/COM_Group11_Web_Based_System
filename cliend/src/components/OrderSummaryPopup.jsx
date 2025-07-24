import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSummaryPopup = ({ product, quantity, onClose }) => {
  const navigate = useNavigate();

  const total = product.price * quantity;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90%] max-w-md p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Order Summary</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Product:</span>
            <span>{product.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span>{quantity}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total:</span>
            <span>Rs {total}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCheckout}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900 transition"
          >
            Continue to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPopup;