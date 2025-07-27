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

  // Get additional cart functions from context
  const { removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount, isCartLoading } = useAppContext();

  // Selection state for checkout
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Initialize selected items when cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      // If there's only one item, select it by default
      if (cartItems.length === 1) {
        setSelectedItems(new Set([cartItems[0].id]));
        setSelectAll(true);
      } else {
        // For multiple items, start with none selected
        setSelectedItems(new Set());
        setSelectAll(false);
      }
    } else {
      setSelectedItems(new Set());
      setSelectAll(false);
    }
  }, [cartItems]);

  // Handle individual item selection
  const handleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    
    // Update select all state
    setSelectAll(newSelected.size === cartItems.length);
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(cartItems.map(item => item.id));
      setSelectedItems(allIds);
      setSelectAll(true);
    }
  };

  // Calculate total for selected items only
  const getSelectedItemsTotal = () => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get selected items for checkout
  const getSelectedItems = () => {
    return cartItems.filter(item => selectedItems.has(item.id));
  };

  const getImageUrl = (path) => {
    if (!path) return assets.Airfilter;
    return path.startsWith('http') ? path : `http://localhost:5000${path}`;
  };

  // Render compact star rating for product cards
const renderCompactStarRating = (rating, reviewCount) => {
  if (reviewCount === 0) {
    return (
      <div className="flex items-center justify-center mt-1">
        <div className="flex text-gray-300 text-xs">
          {'★'.repeat(5)}
        </div>
        <span className="text-xs text-gray-400 ml-1">(0)</span>
      </div>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center justify-center mt-1">
      <div className="flex text-yellow-500 text-xs">
        {/* Full stars */}
        {Array(fullStars).fill().map((_, i) => (
          <span key={`full-${i}`}>★</span>
        ))}
        {/* Half star */}
        {hasHalfStar && <span>★</span>}
        {/* Empty stars */}
        {Array(emptyStars).fill().map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-1">
        ({rating}) • {reviewCount}
      </span>
    </div>
  );
};

// Add this function after the renderCompactStarRating function
// Fetch reviews for a single product
const fetchProductReviews = async (productId) => {
  try {
    const response = await fetch(`/api/product-reviews/product/${productId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.reviews && Array.isArray(data.reviews)) {
        const reviews = data.reviews;
        const averageRating = reviews.length > 0 
          ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
          : 0;
        return {
          averageRating: parseFloat(averageRating),
          reviewCount: reviews.length
        };
      }
    }
    return { averageRating: 0, reviewCount: 0 };
  } catch (err) {
    console.warn(`Failed to fetch reviews for product ${productId}:`, err);
    return { averageRating: 0, reviewCount: 0 };
  }
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
       const transformedProducts = await Promise.all(
          (data.products || data).map(async (product) => {
            // Fetch ratings for each product
            const ratings = await fetchProductReviews(product._id || product.id);
            
            return {
              id: product._id || product.id,
              name: product.productName || product.name,
              price: product.salePrice || product.regularPrice || product.price,
              image: getImageUrl(product.image),
              averageRating: ratings.averageRating,
              reviewCount: ratings.reviewCount,
              category: product.category || 'Auto Parts'
            };
          })
        );

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
            averageRating: 0,
            reviewCount: 0,
            category: 'Air Filters'
          },
          {
            id: 2,
            name: 'Engine Oil Filter',
            price: 2500,
            image: assets.Airfilter,
            averageRating: 0,
            reviewCount: 0,
            category: 'Filters'
          },
          {
            id: 3,
            name: 'Brake Pads Set',
            price: 6500,
            image: assets.Airfilter,
            averageRating: 0,
            reviewCount: 0,
            category: 'Brake Parts'
          },
          {
            id: 4,
            name: 'Car Battery',
            price: 8900,
            image: assets.Airfilter,
            averageRating: 0,
            reviewCount: 0,
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
    const item = cartItems.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const handleDecrease = (id) => {
    const item = cartItems.find(item => item.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    }
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    // Remove from selected items if it was selected
    const newSelected = new Set(selectedItems);
    newSelected.delete(id);
    setSelectedItems(newSelected);
  };

  // Handle checkout with selected items
  const handleCheckout = () => {
    const selectedCartItems = getSelectedItems();
    if (selectedCartItems.length === 0) {
      alert('Please select at least one item to checkout');
      return;
    }
    
    // Navigate to checkout with selected items
    navigate('/checkout', {
      state: {
        isCartCheckout: true,
        selectedItems: selectedCartItems
      }
    });
  };

  if (!user) return <Navigate to="/" replace />;

  const total = getCartTotal();
  const selectedTotal = getSelectedItemsTotal();
  const selectedCount = selectedItems.size;

  return (
    <div className="px-4 md:px-10 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Your Cart</h1>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 text-sm underline"
          >
            Clear Cart
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Your cart is empty.</p>
              <Link 
                to="/allproducts" 
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Select All Checkbox - Only show if there are multiple items */}
              {cartItems.length > 1 && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-2"
                  />
                  <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                    Select All Items ({cartItems.length})
                  </label>
                  {selectedCount > 0 && (
                    <span className="text-xs text-gray-500">
                      ({selectedCount} selected)
                    </span>
                  )}
                </div>
              )}

              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b py-4">
                  <div className="flex items-center gap-4">
                    {/* Selection Checkbox - Only show if there are multiple items */}
                    {cartItems.length > 1 && (
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleItemSelect(item.id)}
                        className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-2"
                      />
                    )}
                    
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
              ))}
            </>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Order Summary</h2>
          <div className="space-y-2">
            {cartItems.length > 1 ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>Selected Items ({selectedCount})</span>
                  <span>Rs.{selectedTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Total Cart Items ({cartItems.length})</span>
                  <span>Rs.{total}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="text-md font-bold flex justify-between">
                    <span>Checkout Total</span>
                    <span>Rs.{selectedTotal}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span>Items ({cartItems.length})</span>
                  <span>Rs.{total}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="text-md font-bold flex justify-between">
                    <span>Total</span>
                    <span>Rs.{total}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <button
            className={`w-full mt-6 py-2 rounded transition ${
              cartItems.length === 0 || selectedCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-900'
            }`}
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || selectedCount === 0}
          >
            {cartItems.length > 1 
              ? `Checkout Selected (${selectedCount}) →`
              : 'Go to Checkout →'
            }
          </button>

          {cartItems.length > 1 && selectedCount === 0 && (
            <p className="text-xs text-red-500 text-center mt-2">
              Please select at least one item to checkout
            </p>
          )}
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
                  {/* Real Rating Display */}
                  {renderCompactStarRating(product.averageRating || 0, product.reviewCount || 0)}
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