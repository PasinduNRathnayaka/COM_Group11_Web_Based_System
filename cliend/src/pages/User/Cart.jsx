// src/pages/User/Cart.jsx
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { Link, Navigate } from 'react-router-dom';
import { Trash } from 'lucide-react';

const Cart = () => {
  const { user } = useAppContext();

  // If user is not logged in, redirect to login
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="px-4 md:px-10 py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b py-4">
              <div className="flex items-center gap-4">
                <img src={assets.Airfilter} alt="item" className="w-16 h-16 object-contain" />
                <div>
                  <p className="font-semibold text-sm">BMW i8 Air Filter</p>
                  <p className="text-xs text-gray-500">Lifan 200-250cc</p>
                  <p className="mt-1 text-sm font-bold text-primary">$145</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="bg-gray-200 px-2 py-1 rounded">-</button>
                <span className="px-2">1</span>
                <button className="bg-gray-200 px-2 py-1 rounded">+</button>
               <button
                    onClick={() => handleRemove(item.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                    title="Delete"
                >
                <Trash size={18} />
                 
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Order Summary</h2>
          <div className="text-sm text-gray-700 mb-2 flex justify-between">
            <span>Subtotal</span>
            <span>$605</span>
          </div>
          <div className="text-sm text-gray-700 mb-2 flex justify-between">
            <span>Discount</span>
            <span className="text-red-500">-$15</span>
          </div>
          <div className="text-sm text-gray-700 mb-2 flex justify-between">
            <span>Delivery Fee</span>
            <span>$15</span>
          </div>
          <div className="text-md font-bold flex justify-between mt-4">
            <span>Total</span>
            <span>$467</span>
          </div>
          <button className="w-full mt-6 bg-black text-white py-2 rounded hover:bg-gray-900 transition">
            Go to Checkout →
          </button>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-xl md:text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow text-center">
              <img src={assets.Airfilter} alt="BMW i8 Air Filter" className="w-20 h-20 mx-auto mb-3 object-contain" />
              <p className="text-sm font-semibold">BMW i8 Air Filter</p>
              <p className="text-sm text-gray-600">Rs.4500</p>
              <p className="text-yellow-500 text-sm">★★★★☆</p>
            </div>
          ))}
        </div>
        <div className="text-right mt-4">
          <Link to="/products" className="text-sm font-semibold text-black border px-4 py-2 rounded hover:bg-gray-100">
            View More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
