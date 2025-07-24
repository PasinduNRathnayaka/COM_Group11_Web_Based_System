import React, { useState, useRef, useCallback, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import Cropper from "react-easy-crop";
import getCroppedImg from "./cropImage";
import axios from "axios";
import toast from "react-hot-toast";

import { useLocation } from "react-router-dom";


const Profile = () => {
  const { user, setUser } = useAppContext();
  const [activeTab, setActiveTab] = useState("account");

  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // ✅ Helper function to get the correct image URL
  const getImageUrl = (profilePic) => {
    if (!profilePic) {
      return "https://i.ibb.co/vzvY0kQ/user.png"; // Default image
    }
    
    // If it's already a full URL (starts with http), return as is
    if (profilePic.startsWith('http')) {
      return profilePic;
    }
    
    // If it's a relative path, prepend server URL
    return `http://localhost:4000${profilePic}`;
  };

  const [profileImage, setProfileImage] = useState(getImageUrl(user?.profilePic));

  // ✅ Update profile image when user data changes (important for login)
  useEffect(() => {
    setProfileImage(getImageUrl(user?.profilePic));
  }, [user?.profilePic]);

  // Form data state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    number: user?.number || "",
    address: user?.address || ""
  });

  // ✅ Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        number: user.number || "",
        address: user.address || ""
      });
    }
  }, [user]);

  // Check if user just placed an order and switch to orders tab
    useEffect(() => {
      if (location.state?.orderPlaced) {
        setActiveTab("orders");
        if (location.state?.orderId) {
          toast.success(`Order ${location.state.orderId} placed successfully!`);
        }
      }
    }, [location.state]);

    // Fetch user orders
    const fetchOrders = async () => {
      if (!user) return;
      
      setOrdersLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/user-orders/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.error('❌ Error fetching orders:', error);
        toast.error('Failed to load order history');
      } finally {
        setOrdersLoading(false);
      }
    };

    // Fetch orders when orders tab is active
    useEffect(() => {
      if (activeTab === "orders" && user) {
        fetchOrders();
      }
    }, [activeTab, user]);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppingImage, setCroppingImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef();

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setCroppingImage(imageUrl);
      setShowCropper(true);
    }
  };
  
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // ✅ FIXED: Use correct loading state variable
  const handleCropSave = async () => {
    try {
      setLoading(true); // ✅ Use the existing loading state
      
      // Get cropped image blob
      const croppedImageBlob = await getCroppedImg(croppingImage, croppedAreaPixels);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('profileImage', croppedImageBlob, 'profile.jpg');

      const token = localStorage.getItem('token');
      
      // Upload to server
      const response = await axios.put('/api/user/profile-image', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Update local state with server response
        const newProfilePic = response.data.profilePic;
        setProfileImage(getImageUrl(newProfilePic)); // ✅ Use helper function
        
        // ✅ Update user context with the new profilePic
        setUser({ ...user, profilePic: newProfilePic });
        
        setShowCropper(false);
        setCroppingImage(null);
        toast.success("Profile image updated successfully!");
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false); // ✅ Use the existing loading state
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCroppingImage(null);
    if (croppingImage) {
      URL.revokeObjectURL(croppingImage);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  // Save profile data
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put('/api/user/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // ✅ Update user context with new data
        const updatedUserData = { ...user, ...formData };
        setUser(updatedUserData);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Save password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put('/api/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        toast.success("Password updated successfully!");
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Account Info</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">User Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              <div>
                <label className="block mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone Number</label>
                <input
                  type="tel"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`mt-4 px-6 py-2 bg-primary hover:bg-blue-700 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        );
     case "orders":
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Orders</h2>
      {ordersLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">Order #{order.orderId}</h3>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'shipped' ? 'bg-orange-100 text-orange-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <h4 className="font-medium mb-2">Items ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.productName} 
                          className="w-12 h-12 object-contain rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.productName}</p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity} × Rs.{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-gray-500">
                        + {order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <div className="text-sm text-gray-600">
                    <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.streetAddress}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t">
                <div>
                  <span className="text-sm text-gray-600">Payment: </span>
                  <span className="font-medium">
                    {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">Rs.{order.totalAmount.toLocaleString()}</p>
                  {order.estimatedDelivery && (
                    <p className="text-xs text-gray-500">
                      Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
      case "password":
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  minLength="6"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`mt-4 px-6 py-2 bg-primary hover:bg-blue-700 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 py-10 px-4 min-h-screen flex justify-center items-start">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-md p-6 md:p-10 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-gray-50 rounded-lg p-4 shadow">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <img
                src={profileImage}
                alt="profile"
                onClick={handleImageClick}
                className="w-24 h-24 rounded-full mx-auto mb-2 cursor-pointer object-cover"
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <h3 className="font-semibold mt-2">{formData.name || "User Name"}</h3>
            <p className="text-sm text-gray-500">{formData.email || "user@example.com"}</p>
          </div>
          <hr className="mb-4" />
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("account")}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === "account"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Account Info
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === "orders"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              My Order
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === "password"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">{renderMainContent()}</div>

        {/* Cropper Modal */}
        {showCropper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div
              className="relative w-[90vw] max-w-lg bg-white rounded-lg p-4 flex flex-col"
              style={{ height: "450px" }}
            >
              <Cropper
                image={croppingImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{ flexGrow: 1, position: "relative" }}
              />
              <div
                className="flex justify-between mt-4"
                style={{ pointerEvents: "auto", zIndex: 10 }}
              >
                <button
                  onClick={handleCropCancel}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  style={{ pointerEvents: "auto" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropSave}
                  disabled={loading}
                  className={`px-4 py-2 bg-primary text-white rounded hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ pointerEvents: "auto" }}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;



