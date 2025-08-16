import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiChevronDown, FiChevronRight, FiLogOut, FiUser, FiEdit3 } from "react-icons/fi";
import { useAppContext } from "../../context/AppContext";

import logo from "../../assets/kamal-logo.png";
import addProductIcon from "../../assets/add-product.png";
import productListIcon from "../../assets/product-list.png";
import addEmployeeIcon from "../../assets/add-employee.png";
import employeeListIcon from "../../assets/employee-list.png";
import attendanceIcon from "../../assets/attendance.png";
import ordersIcon from "../../assets/orders.png";
import recycleBinIcon from "../../assets/orders.png";
import NotificationPopup from "../../components/seller/NotificationPopup";

// API Configuration
const API_BASE_URL = 'http://localhost:4000/api';

// API Service Functions
const apiService = {
  // Get auth token from localStorage
  getAuthToken: () => {
    return localStorage.getItem('adminToken');
  },

  // Get auth headers
  getAuthHeaders: () => {
    const token = apiService.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  // Get auth headers for form data
  getAuthHeadersForFormData: () => {
    const token = apiService.getAuthToken();
    return {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  // Load admin profile
  loadAdminProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'GET',
        headers: apiService.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load admin profile');
      }

      return data;
    } catch (error) {
      console.error('❌ Load admin profile error:', error);
      throw error;
    }
  },

  // Create default admin (register)
  createDefaultAdmin: async (adminData = {}) => {
    try {
      const defaultAdminData = {
        name: 'Administrator',
        email: 'admin@kamalautoparts.com',
        password: 'admin123', // Default password
        mobile: '+94771234567',
        ...adminData
      };

      const response = await fetch(`${API_BASE_URL}/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(defaultAdminData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin');
      }

      return data;
    } catch (error) {
      console.error('❌ Create admin error:', error);
      throw error;
    }
  },

  // Login admin
  loginAdmin: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  // Update admin profile
  updateAdminProfile: async (profileData, avatarFile = null) => {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key]);
        }
      });

      // Append avatar file if provided
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        headers: apiService.getAuthHeadersForFormData(),
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      return data;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  },

  // Change admin password
  changeAdminPassword: async (passwordData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
        method: 'PUT',
        headers: apiService.getAuthHeaders(),
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      return data;
    } catch (error) {
      console.error('❌ Change password error:', error);
      throw error;
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
        method: 'GET',
        headers: apiService.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get dashboard stats');
      }

      return data;
    } catch (error) {
      console.error('❌ Get dashboard stats error:', error);
      throw error;
    }
  }
};

// Admin Profile Component
const AdminProfile = ({ isOpen, onClose, adminData, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    if (adminData) {
      setFormData({
        name: adminData.name || '',
        email: adminData.email || '',
        mobile: adminData.mobile || ''
      });
      
      if (adminData.avatar) {
        setAvatarPreview(`http://localhost:4000${adminData.avatar}`);
      }
    }
  }, [adminData]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await apiService.updateAdminProfile(formData, avatar);
      
      if (response.success) {
        alert('Profile updated successfully!');
        if (onUpdate) {
          onUpdate(response.admin);
        }
        setAvatar(null);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiService.changeAdminPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        alert('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
        setActiveTab('profile');
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert(`Failed to change password: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[95%] max-w-2xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Admin Profile Management</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiLogOut size={20} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-white text-white'
                  : 'border-transparent text-blue-200 hover:text-white'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'password'
                  ? 'border-white text-white'
                  : 'border-transparent text-blue-200 hover:text-white'
              }`}
            >
              Change Password
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-blue-200">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Admin Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FiUser size={32} />
                      </div>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <span className="text-white text-xs">📷</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">Click to change profile picture</p>
              </div>
              
              {/* Form Fields */}
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="inline mr-2" size={16} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📧 Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📱 Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your mobile number"
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <span>💾</span>
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}
          
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-yellow-800 mb-2">Password Security Guidelines</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Password must be at least 6 characters long</li>
                  <li>• Use a combination of letters, numbers, and special characters</li>
                  <li>• Don't reuse your current password</li>
                </ul>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              
              {/* Password Match Indicator */}
              {passwordData.newPassword && passwordData.confirmPassword && (
                <div className={`text-sm ${
                  passwordData.newPassword === passwordData.confirmPassword 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {passwordData.newPassword === passwordData.confirmPassword 
                    ? '✓ Passwords match' 
                    : '✗ Passwords do not match'
                  }
                </div>
              )}
              
              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || passwordData.newPassword !== passwordData.confirmPassword}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <span>🔒</span>
                  <span>{loading ? 'Changing...' : 'Change Password'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// View Profile Component
const ViewProfile = ({ isOpen, onClose, adminData, onEditClick }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[90%] max-w-lg rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Admin Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ❌
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-blue-200 shadow-lg">
                {adminData?.avatar ? (
                  <img
                    src={`http://localhost:4000${adminData.avatar}`}
                    alt="Admin Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-blue-100 to-blue-200">
                    <FiUser size={32} className="text-blue-600" />
                  </div>
                )}
                {adminData?.avatar && (
                  <div className="w-full h-full hidden items-center justify-center text-gray-400 bg-gradient-to-br from-blue-100 to-blue-200">
                    <FiUser size={32} className="text-blue-600" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-800">{adminData?.name || 'Admin'}</h3>
            <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              🛡️
              <span className="capitalize">{adminData?.role || 'Admin'}</span>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">Contact Information</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    📧
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-800">{adminData?.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    📱
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mobile Number</p>
                    <p className="font-medium text-gray-800">{adminData?.mobile || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Account Details</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    📅
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Created</p>
                    <p className="font-medium text-gray-800">{formatDate(adminData?.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    🕒
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium text-gray-800">{formatDate(adminData?.lastLogin)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${adminData?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Status</p>
                    <p className={`font-medium ${adminData?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {adminData?.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                onClose();
                if (onEditClick) onEditClick();
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FiEdit3 size={16} />
              Edit Profile
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditProfileModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[90%] max-w-md rounded-xl shadow-2xl p-8 relative border border-gray-100">
        <h2 className="font-bold text-xl mb-6 text-gray-800 border-b pb-3">Edit Profile</h2>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <img
              src="https://via.placeholder.com/64"
              alt="admin"
              className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-100"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Your name</p>
            <p className="text-sm text-gray-500">yourname@gmail.com</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Name</span>
            <span className="text-gray-600">your name</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Email account</span>
            <span className="text-gray-600">yourname@gmail.com</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Password</span>
            <span className="text-gray-600">************</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Mobile number</span>
            <span className="text-blue-600 cursor-pointer hover:text-blue-700 font-medium">Add number</span>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm">
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
          >
            Cancel
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <span className="text-xl leading-none">&times;</span>
        </button>
      </div>
    </div>
  );
};

const SellerLayout = () => {
  const { setIsSeller } = useAppContext();
  const navigate = useNavigate();

  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [showViewProfile, setShowViewProfile] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const menuRef = useRef(null);
  const bellRef = useRef(null);

  // Load admin data on component mount
  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (token) {
        // Try to load existing admin profile
        try {
          const response = await apiService.loadAdminProfile();
          if (response.success) {
            setAdminData(response.admin);
            console.log('✅ Admin profile loaded successfully');
          }
        } catch (profileError) {
          console.log('Profile not found, creating default admin...');
          await createDefaultAdmin();
        }
      } else {
        // No token, create default admin
        await createDefaultAdmin();
      }
    } catch (error) {
      console.error('Error in loadAdminProfile:', error);
      // Try to create default admin as fallback
      try {
        await createDefaultAdmin();
      } catch (createError) {
        console.error('Failed to create default admin:', createError);
        alert('Failed to initialize admin. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAdmin = async () => {
    try {
      const response = await apiService.createDefaultAdmin();

      if (response.success) {
        localStorage.setItem('adminToken', response.token);
        setAdminData(response.admin);
        console.log('✅ Default admin created successfully');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
      // If admin already exists, try to login with default credentials
      if (error.message.includes('already exists')) {
        try {
          const loginResponse = await apiService.loginAdmin({
            email: 'admin@kamalautoparts.com',
            password: 'admin123'
          });
          
          if (loginResponse.success) {
            localStorage.setItem('adminToken', loginResponse.token);
            setAdminData(loginResponse.admin);
            console.log('✅ Logged in with existing admin');
          }
        } catch (loginError) {
          console.error('Failed to login with default credentials:', loginError);
          alert('Admin exists but login failed. Please check credentials.');
        }
      } else {
        throw error;
      }
    }
  };

  const handleLogout = () => {
    setIsSeller(false);
    localStorage.removeItem('adminToken');
    navigate("/seller");
  };

  const handleUpdateAdmin = (updatedAdmin) => {
    setAdminData(updatedAdmin);
  };

  const handleViewProfile = () => {
    setShowMenu(false);
    setShowViewProfile(true);
  };

  const handleEditProfile = () => {
    setShowViewProfile(false);
    setShowAdminProfile(true);
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setShowMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    fetch("http://localhost:4000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  const sidebarLinks = [
    { name: "Dashboard", path: "/seller", icon: addProductIcon },
    { name: "Product List", path: "/seller/product-list", icon: productListIcon },
    { name: "Employee List", path: "/seller/employee-list", icon: employeeListIcon },
    { name: "View Attendance", path: "/seller/view-attendence", icon: attendanceIcon },
    { name: "View Salary", path: "/seller/monthly-salary", icon: employeeListIcon },
    { name: "Orders", path: "/seller/orders", icon: ordersIcon },
    { name: "Recycle Bin", path: "/seller/recycle-bin", icon: recycleBinIcon },
  ];

  // Show loading state while initializing
  if (loading && !adminData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-2 bg-blue-900 shadow-sm border-b border-slate-700 relative">
        <a href="/" className="flex items-center gap-3">
          <img className="h-10" src={logo} alt="logo" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-white">Kamal Auto Parts</h1>
            <p className="text-xs text-slate-300 -mt-1">Admin Dashboard</p>
          </div>
        </a>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setShowSearch((p) => !p)}
              className="p-3 hover:bg-blue-700 rounded-lg transition-colors duration-200"
            >
              <FiSearch size={18} className="text-slate-300" />
            </button>
            {showSearch && (
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="absolute right-0 top-14 w-72 p-3 text-sm bg-white text-black rounded-lg shadow-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onBlur={() => setShowSearch(false)}
              />
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-3 hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <FiBell size={18} className="text-slate-300" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            <NotificationPopup
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* Admin Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium text-slate-200 transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                {adminData?.avatar ? (
                  <img
                    src={`http://localhost:4000${adminData.avatar}`}
                    alt="Admin Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full ${adminData?.avatar ? 'hidden' : 'flex'} items-center justify-center text-white text-xs font-semibold`}
                >
                  {adminData?.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
                </div>
              </div>
              <span className="hidden sm:block">
                {adminData?.name || 'Administrator'}
              </span>
              <FiChevronDown size={14} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="font-semibold text-gray-800">
                    {adminData?.name || 'Administrator'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {adminData?.email || 'admin@kamalautoparts.com'}
                  </p>
                </div>
                
                <button
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700 transition-colors duration-200 flex items-center gap-3"
                  onClick={handleViewProfile}
                >
                  <FiUser size={14} className="text-gray-500" />
                  View Profile
                </button>
                
                <button
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700 transition-colors duration-200 flex items-center gap-3"
                  onClick={() => {
                    setShowMenu(false);
                    setShowAdminProfile(true);
                  }}
                >
                  <FiEdit3 size={14} className="text-gray-500" />
                  Edit Profile
                </button>
                
                <button
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between text-gray-700 transition-colors duration-200 border-t border-gray-100"
                  onClick={handleLogout}
                >
                  <div className="flex items-center gap-3">
                    <FiLogOut size={14} className="text-gray-500" />
                    Log Out
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="md:w-64 w-16 bg-slate-100 border-r border-slate-300 flex flex-col shadow-sm">
          <div className="p-4 border-b border-slate-300">
            <h2 className="hidden md:block text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Navigation
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2">
            {sidebarLinks.map((item) => (
              <NavLink
                to={item.path}
                key={item.name}
                end={item.path === "/seller"}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 mx-2 my-1 gap-3 font-medium rounded-lg transition-all duration-200
                  ${isActive
                    ? "bg-blue-700 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-200 hover:text-slate-800"}`
                }
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <img src={item.icon} alt={item.name} className="w-5 h-5 opacity-75" />
                </div>
                <p className="hidden md:block">{item.name}</p>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Main Content + Footer */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <Outlet />
          </main>
          <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>© 2025 Kamal Auto Parts - Admin Dashboard</span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-gray-700 transition-colors duration-200">About</a>
                <a href="#" className="hover:text-gray-700 transition-colors duration-200">Contact</a>
                <a href="#" className="hover:text-gray-700 transition-colors duration-200">Support</a>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Admin Profile Modals */}
      <ViewProfile
        isOpen={showViewProfile}
        onClose={() => setShowViewProfile(false)}
        adminData={adminData}
        onEditClick={handleEditProfile}
      />

      <AdminProfile
        isOpen={showAdminProfile}
        onClose={() => setShowAdminProfile(false)}
        adminData={adminData}
        onUpdate={handleUpdateAdmin}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default SellerLayout;