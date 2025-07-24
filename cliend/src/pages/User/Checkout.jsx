import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { user, cartItems, setCartItems } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  
  // ✅ Get checkout items (either from cart or buy now)
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isBuyNow, setIsBuyNow] = useState(false);

  const orderPlacedRef = useRef(false);

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

  // ✅ Set checkout items based on whether it's buy now or cart checkout
  useEffect(() => {
    if (location.state?.isBuyNow && location.state?.buyNowItem) {
      // Buy Now scenario
      setCheckoutItems([location.state.buyNowItem]);
      setIsBuyNow(true);
    } else if (cartItems && cartItems.length > 0) {
      // Cart checkout scenario
      setCheckoutItems(cartItems);
      setIsBuyNow(false);
    } else {
      // No items to checkout
      setCheckoutItems([]);
      setIsBuyNow(false);
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

  // ✅ Updated redirect logic
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

    if (orderPlacedRef.current) {
    return;
}
    
    // For cart checkout, check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const requiredFields = ['firstName', 'lastName', 'country', 'streetAddress', 'city', 'zipCode', 'phone', 'email'];
      const missingFields = requiredFields.filter(field => !formData[field].trim());
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

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
        // ✅ Clear cart only if it was a cart checkout, not buy now
        
        orderPlacedRef.current = true;

        if (!isBuyNow) {
          setCartItems([]);
        }
        
        toast.dismiss();

        // Show success message
        toast.success(`Order placed successfully! Order ID: ${result.order.orderId}`);
        
        // Redirect to profile with order info
        navigate('/profile', { 
          state: { 
            orderPlaced: true, 
            orderId: result.order.orderId,
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
    // But add a fallback just in case
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
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        {isBuyNow ? 'Buy Now - Checkout' : 'Checkout'}
      </h1>

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
          
          <div className="space-y-3 mb-4">
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

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
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
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;