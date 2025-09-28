import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { user, cartItems, setCartItems, clearCart, removeFromCart } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showBankSandbox, setShowBankSandbox] = useState(false);
  
  //Get checkout items (either from cart, selected items, or buy now)
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [isCartCheckout, setIsCartCheckout] = useState(false);
  const [isSelectedItemsCheckout, setIsSelectedItemsCheckout] = useState(false);

  const orderPlacedRef = useRef(false);
  const emptyCartMessageShown = useRef(false);

  // Form state with auto-fill from user profile
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    country: 'Sri Lanka',
    streetAddress: '',
    city: '',
    zipCode: '',
    phone: '',
    email: '',
    paymentMethod: 'cash',
    orderNotes: ''
  });

  //Set checkout items based on the type of checkout
  useEffect(() => {
    if (location.state?.isBuyNow && location.state?.buyNowItem) {
      // Buy Now scenario
      setCheckoutItems([location.state.buyNowItem]);
      setIsBuyNow(true);
      setIsCartCheckout(false);
      setIsSelectedItemsCheckout(false);
    } else if (location.state?.isCartCheckout && location.state?.selectedItems) {
      // Cart checkout with selected items
      setCheckoutItems(location.state.selectedItems);
      setIsBuyNow(false);
      setIsCartCheckout(true);
      setIsSelectedItemsCheckout(true);
    } else if (cartItems && cartItems.length > 0) {
      // Fallback: use all cart items if no specific selection
      setCheckoutItems(cartItems);
      setIsBuyNow(false);
      setIsCartCheckout(true);
      setIsSelectedItemsCheckout(false);
    } else {
      // No items to checkout
      setCheckoutItems([]);
      setIsBuyNow(false);
      setIsCartCheckout(false);
      setIsSelectedItemsCheckout(false);
    }
  }, [location.state, cartItems]);

  // Auto-fill form with user profile data when component mounts
  useEffect(() => {
    if (user) {
      // Split name into first and last name
      const nameParts = user.name ? user.name.trim().split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        phone: user.number || '',
        email: user.email || '',
        streetAddress: user.address || ''
      }));
    }
  }, [user]);

  //Updated redirect logic
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to checkout');
      navigate('/');
      return;
    }
    
    // For buy now scenario, we don't need to check cart
    if (location.state?.isBuyNow) {
      return; // Skip cart validation for buy now
    }

    // For cart checkout with selected items, we don't need to check full cart
    if (location.state?.isCartCheckout && location.state?.selectedItems) {
      return; // Skip cart validation for selected items checkout
    }

    if (orderPlacedRef.current) {
      return;
    }
    
    // For full cart checkout, check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      if (!emptyCartMessageShown.current) {
        emptyCartMessageShown.current = true;
        toast.error('Your cart is empty');
        navigate('/cart');
      }
      return;
    } else {
      // Reset flag when cart has items
      emptyCartMessageShown.current = false;
    }
  }, [user, cartItems, navigate, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    return checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

 // Helper function to remove checked out items from cart
const removeCheckedOutItemsFromCart = async () => {
  try {
    if (isSelectedItemsCheckout) {
      // Remove only the selected items that were checked out from database
      const checkedOutItemIds = checkoutItems.map(item => item.id);
      for (const itemId of checkedOutItemIds) {
        await removeFromCart(itemId);
      }
    } else if (isCartCheckout && !isBuyNow) {
      // Clear entire cart from database
      await clearCart();
    }
    // For buy now, don't modify cart at all
  } catch (error) {
    console.error('Error removing items from cart:', error);
    // Fallback: update frontend only
    if (isSelectedItemsCheckout) {
      const checkedOutItemIds = new Set(checkoutItems.map(item => item.id));
      const remainingCartItems = cartItems.filter(item => !checkedOutItemIds.has(item.id));
      setCartItems(remainingCartItems);
    } else if (isCartCheckout && !isBuyNow) {
      setCartItems([]);
    }
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data first
    const requiredFields = ['firstName', 'lastName', 'country', 'streetAddress', 'city', 'zipCode', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // If online payment is selected, show bank sandbox instead of processing order
    if (formData.paymentMethod === 'online') {
      setShowBankSandbox(true);
      return;
    }

    // Process order for cash payment
    await processOrder();
  };

  const processOrder = async () => {
    setLoading(true);

    try {
      const totalAmount = calculateTotal();
      
      // Prepare order data
      const orderData = {
        items: checkoutItems.map(item => ({
          id: item.id || item._id,
          name: item.name || item.productName,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount,
        orderType: isBuyNow ? 'buy_now' : (isSelectedItemsCheckout ? 'selected_items' : 'full_cart'),
        ...formData
      };

      console.log('Order data being sent:', orderData);

      // Get token for API call
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to place an order');
        navigate('/');
        return;
      }
      
      // Make API call to create order
      const response = await fetch('/api/user-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (result.success) {
        //Handle cart updates based on checkout type
        orderPlacedRef.current = true;

        // Remove checked out items from cart
        await removeCheckedOutItemsFromCart();
        
        toast.dismiss();

        // Show success message with checkout type info
        let successMessage = `Order placed successfully! Order ID: ${result.order.orderId}`;
        if (isSelectedItemsCheckout) {
          successMessage += ` (${checkoutItems.length} items)`;
        }
        
        toast.success(successMessage);
        
        // Redirect to profile with order info
        navigate('/profile', { 
          state: { 
            orderPlaced: true, 
            orderId: result.order.orderId,
            orderType: isBuyNow ? 'Buy Now' : (isSelectedItemsCheckout ? 'Selected Items' : 'Full Cart'),
            itemCount: checkoutItems.length,
            skipToast: true
          } 
        });
      } else {
        console.error('Order failed:', result);
        toast.error(result.message || 'Failed to place order');
      }

    } catch (error) {
      console.error('❌ Checkout error:', error);
      toast.error('An error occurred while placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBankPaymentConfirm = async () => {
    setShowBankSandbox(false);
    await processOrder();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Bank Details Sandbox Modal
  const BankSandbox = () => {
    const total = calculateTotal();
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Bank Transfer Details</h2>
              <button 
                onClick={() => setShowBankSandbox(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span>Items: {checkoutItems.length}</span>
                <span className="font-bold">Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-3">Enter Card Details</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 ">Bank Name:</span>
                  <div className="flex items-center gap-2 ">
                    <input className="w-full h-4 p-3 rounded border border-gray-300 focus:border-primary focus:outline-non"/>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Card Holders Name:</span>
                  <div className="flex items-center gap-2">
                    <input className="w-full h-4 p-3 rounded border border-gray-300 focus:border-primary focus:outline-non"/>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Card Number:</span>
                  <div className="flex items-center gap-2">
                    <input className="w-full h-4 p-3 rounded border border-gray-300 focus:border-primary focus:outline-non"/>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expire Date:</span>
                  <div className="flex items-center gap-2">
                    <input className="w-full h-4 p-3 rounded border border-gray-300 focus:border-primary focus:outline-non"/>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-sm text-gray-600">Amount to Transfer:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-green-600">Rs. {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Transfer the exact amount shown above</li>
                  <li>• Keep your transfer receipt for verification</li>
                  <li>• Your order will be processed after payment confirmation</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBankSandbox(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBankPaymentConfirm}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Processing...' : 'Pay Now'}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                Click "Pay Now" after completing your bank transfer
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get checkout type display text
  const getCheckoutTypeText = () => {
    if (isBuyNow) return 'Buy Now - Checkout';
    if (isSelectedItemsCheckout) return `Checkout Selected Items (${checkoutItems.length})`;
    return 'Checkout';
  };

  // ✅ Show loading if no items determined yet
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg">Loading...</span>
      </div>
    );
  }

  // Show loading if checkout items haven't been determined yet
  if (checkoutItems.length === 0) {
    // For buy now, if we don't have the buy now item yet, show loading
    if (location.state?.isBuyNow && !location.state?.buyNowItem) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Loading...</span>
        </div>
      );
    }
    
    // For cart checkout, if cart is empty, this should be handled by useEffect redirect
    if (!location.state?.isBuyNow) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Loading...</span>
        </div>
      );
    }
  }

  const total = calculateTotal();

  return (
    <div className="max-w-6xl mx-auto p-6 my-12">
      <div className="flex items-center gap-4 mb-6">
        
        {/*<button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
        >
          ← Back
        </button>*/}
        <h1 className="text-2xl md:text-3xl font-bold">
          {getCheckoutTypeText()}
        </h1>
      </div>

      {/* Checkout Type Indicator */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-800 font-medium">
            {isBuyNow && '🛒 Buy Now Order'}
            {isSelectedItemsCheckout && `✅ Selected Items (${checkoutItems.length} of ${cartItems.length} cart items)`}
            {isCartCheckout && !isSelectedItemsCheckout && !isBuyNow && '🛍️ Full Cart Checkout'}
          </span>
          <span className="text-blue-600">
            Total: Rs.{total.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Billing Details Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Billing Details</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded border border-gray-300 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded border border-gray-300 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Company Name (optional)</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full p-3 rounded border border-gray-300 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Country *</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded border border-gray-300 focus:border-primary focus:outline-none"
              >
                <option value="">Select Country</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="India">India</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Street Address *</label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded border border-gray-300 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Town / City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded border border-gray-300 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ZIP Code *</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded border border-gray-300 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded border border-gray-300 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded border border-gray-300 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Payment Method */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Payment Method *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                    className="text-primary"
                  />
                  Cash on Delivery
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={handleInputChange}
                    className="text-primary"
                  />
                  Online Payment
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Order Notes (optional)</label>
              <textarea
                name="orderNotes"
                value={formData.orderNotes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Notes about your order, e.g. special notes for delivery."
                className="w-full p-3 rounded border border-gray-300 focus:border-primary focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-semibold mb-4">Your Order</h2>
          
          {/* Order Type Info */}
          <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
            {isBuyNow && (
              <span className="text-green-700 font-medium">🛒 Buy Now Order</span>
            )}
            {isSelectedItemsCheckout && (
              <span className="text-blue-700 font-medium">
                ✅ {checkoutItems.length} Selected Items
              </span>
            )}
            {isCartCheckout && !isSelectedItemsCheckout && !isBuyNow && (
              <span className="text-purple-700 font-medium">🛍️ Full Cart</span>
            )}
          </div>
          
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {checkoutItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center pb-2 border-b">
                <div className="flex items-center gap-3">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-12 h-12 object-contain rounded"
                  />
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold">Rs.{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Items ({checkoutItems.length})</span>
              <span>Rs.{total.toLocaleString()}</span>
            </div>
            
            {/*{isSelectedItemsCheckout && cartItems.length > checkoutItems.length && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Remaining in cart ({cartItems.length - checkoutItems.length})</span>
                <span>Not included</span>
              </div>
            )}*/}
            
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>Rs.{total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full mt-6 py-3 rounded font-medium transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            {loading ? 'Placing Order...' : 
             formData.paymentMethod === 'online' ? 
             `Pay Online (Rs.${total.toLocaleString()})` : 
             `Place Order (Rs.${total.toLocaleString()})`}
          </button>

          {/* Additional Info 
          <div className="mt-4 text-xs text-gray-500 text-center">
            {isBuyNow && 'Your cart items will remain unchanged'}
            {isSelectedItemsCheckout && 'Only selected items will be removed from cart'}
            {isCartCheckout && !isSelectedItemsCheckout && !isBuyNow && 'Your entire cart will be cleared'}
          </div>*/}
        </div>
      </div>

      {/* Bank Details Sandbox Modal */}
      {showBankSandbox && <BankSandbox />}
    </div>
  );
};

export default Checkout;