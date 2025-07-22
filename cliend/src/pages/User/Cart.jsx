import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { Link, Navigate } from 'react-router-dom';
import { Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  
  // States for related products
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get cart items from context
  const { cartItems, setCartItems } = useAppContext();

  const getImageUrl = (path) => {
    if (!path) return assets.Airfilter;
    return path.startsWith('http') ? path : `http://localhost:5000${path}`;
  };


  // Fetch related products from database
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        // ✅ IMPROVED: Try to fetch all products first, then use random selection
        const response = await fetch('/api/products');

        if (!response.ok) {
          throw new Error('Failed to fetch related products');
        }

        const data = await response.json();
        
        // ✅ IMPROVED: Transform products with proper image URLs and random selection
        const transformedProducts = (data.products || data).map(product => ({
          id: product._id || product.id,
          name: product.productName || product.name,
          price: product.salePrice || product.regularPrice || product.price,
          image: getImageUrl(product.image), // Using helper function
          rating: product.rating || Math.floor(Math.random() * 2) + 4, // Random 4-5 rating if not available
          category: product.category || 'Auto Parts'
        }));

        // Shuffle and take first 8 products for variety
        const shuffled = transformedProducts.sort(() => 0.5 - Math.random());
        setRelatedProducts(shuffled.slice(0, 8));

      } catch (err) {
        console.error('Error fetching related products:', err);
        setError(err.message);
        // Fallback to sample data if API fails
        setRelatedProducts([
          {
            id: 1,
            name: 'BMW i8 Air Filter',
            price: 4500,
            image: assets.Airfilter,
            rating: 4,
            category: 'Air Filters'
          },
          {
            id: 2,
            name: 'Engine Oil Filter',
            price: 2500,
            image: assets.Airfilter,
            rating: 5,
            category: 'Filters'
          },
          {
            id: 3,
            name: 'Brake Pads Set',
            price: 6500,
            image: assets.Airfilter,
            rating: 4,
            category: 'Brake Parts'
          },
          {
            id: 4,
            name: 'Car Battery',
            price: 8900,
            image: assets.Airfilter,
            rating: 5,
            category: 'Electrical'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchRelatedProducts();
  }, [user]);

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
                  <img 
                    src={item.image || assets.Airfilter} 
                    alt={item.name} 
                    className="w-16 h-16 object-contain" 
                  />
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.desc || item.description}</p>
                    <p className="mt-1 text-sm font-bold text-primary">Rs.{item.price}</p>
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
            <span>Rs.{subtotal}</span>
          </div>
          <div className="text-sm text-gray-700 mb-2 flex justify-between">
            <span>Discount</span>
            <span className="text-red-500">-Rs.{discount}</span>
          </div>
          <div className="text-sm text-gray-700 mb-2 flex justify-between">
            <span>Delivery Fee</span>
            <span>Rs.{delivery}</span>
          </div>
          <div className="text-md font-bold flex justify-between mt-4">
            <span>Total</span>
            <span>Rs.{total}</span>
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
        <h2 className="text-xl md:text-2xl font-bold mb-6">Shop More</h2>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
                <div className="w-20 h-20 mx-auto mb-3 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">
            Failed to load related products. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 8).map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow text-center">
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={product.image || assets.Airfilter} 
                    alt={product.name} 
                    className="w-20 h-20 mx-auto mb-3 object-contain" 
                  />
                  <p className="text-sm font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-600">Rs.{product.price}</p>
                  <p className="text-yellow-500 text-sm">
                    {'★'.repeat(product.rating || 0)}{'☆'.repeat(5 - (product.rating || 0))}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-right mt-4">
          <Link to="/allproducts" className="text-sm font-semibold text-black border px-4 py-2 rounded hover:bg-gray-100">
            View More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;

