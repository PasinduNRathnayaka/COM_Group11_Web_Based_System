import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { Link, Navigate } from 'react-router-dom';
import { Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { user } = useAppContext();

  const navigate = useNavigate();

  // Sample cart data (you can later fetch from context or backend)
  const { cartItems, setCartItems } = useAppContext(
    { id: 1, name: 'BMW i8 Air Filter', desc: 'Lifan 200-250cc', price: 145, quantity: 1 },
    { id: 2, name: 'Ignition Coil', desc: 'Toyota Vitz', price: 180, quantity: 2 },
    { id: 3, name: 'Fuel Filter', desc: 'Nissan Sunny', price: 120, quantity: 1 },
  );

  const handleIncrease = (id) => {
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (id) => {
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemove = (id) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== id));
  };

  if (!user) return <Navigate to="/" replace />;

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = 15;
  const delivery = 15;
  const total = subtotal - discount + delivery;

  return (
    <div className="px-4 md:px-10 py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          {cartItems.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b py-4">
                <div className="flex items-center gap-4">
                  <img src={assets.Airfilter} alt="item" className="w-16 h-16 object-contain" />
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                    <p className="mt-1 text-sm font-bold text-primary">${item.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrease(item.id)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>

                    <span className="min-w-[24px] text-center">{item.quantity}</span>

                    <button
                      onClick={() => handleIncrease(item.id)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                    title="Delete"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Order Summary</h2>
          <div className="text-sm text-gray-700 mb-2 flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal}</span>
          </div>
          <div className="text-sm text-gray-700 mb-2 flex justify-between">
            <span>Discount</span>
            <span className="text-red-500">-${discount}</span>
          </div>
          <div className="text-sm text-gray-700 mb-2 flex justify-between">
            <span>Delivery Fee</span>
            <span>${delivery}</span>
          </div>
          <div className="text-md font-bold flex justify-between mt-4">
            <span>Total</span>
            <span>${total}</span>
          </div>
          <button
            className="w-full mt-6 bg-black text-white py-2 rounded hover:bg-gray-900 transition"
            onClick={() => navigate('/checkout')}
            >
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
              
              <Link to="/product/airfilter">

              
              <img src={assets.Airfilter} alt="BMW i8 Air Filter" className="w-20 h-20 mx-auto mb-3 object-contain" />
              <p className="text-sm font-semibold">BMW i8 Air Filter</p>
              <p className="text-sm text-gray-600">Rs.4500</p>
              <p className="text-yellow-500 text-sm">★★★★☆</p>

            </Link>

            </div>
          ))}
        </div>
        <div className="text-right mt-4">
          <Link to="/product" className="text-sm font-semibold text-black border px-4 py-2 rounded hover:bg-gray-100">
            View More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;

