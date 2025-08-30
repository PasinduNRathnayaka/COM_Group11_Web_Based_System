
import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, MapPin, Camera, Edit2, Save, X, Eye, EyeOff, Building, Badge, Calendar, AlertCircle, Check, Lock, FileText, Shield, Upload, Clock, Star, Award } from "lucide-react";

const EnhancedEmployeeProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, password, dashboard
  
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [imageUploading, setImageUploading] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    about: "",
    image: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // API service with authentication
  const apiService = {
    getAuthToken: () => {
      return localStorage.getItem('token') || localStorage.getItem('authToken');
    },

    getAuthHeaders: () => {
      const token = apiService.getAuthToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    },

    getFormDataHeaders: () => {
      const token = apiService.getAuthToken();
      return {
        'Authorization': `Bearer ${token}`
      };
    },

    async getEmployeeProfile() {
      const response = await fetch('/api/employee-profile/profile/me', {
        method: 'GET',
        headers: apiService.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    },

    async updateProfile(formData) {
      const response = await fetch('/api/employee-profile/profile/me', {
        method: 'PUT',
        headers: apiService.getFormDataHeaders(),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      return await response.json();
    },

    async updateProfileImage(formData) {
      const response = await fetch('/api/employee-profile/profile/image', {
        method: 'PUT',
        headers: apiService.getFormDataHeaders(),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile image');
      }

      return await response.json();
    },

    async changePassword(passwordData) {
      const response = await fetch('/api/employee-profile/profile/password', {
        method: 'PUT',
        headers: apiService.getAuthHeaders(),
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      return await response.json();
    },

    async getDashboard() {
      const response = await fetch('/api/employee-profile/dashboard', {
        method: 'GET',
        headers: apiService.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    }
  };

  // Fetch employee data
  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getEmployeeProfile();
      
      if (response.success && response.data) {
        setEmployee(response.data);
        setEditData({
          name: response.data.name || "",
          email: response.data.email || "",
          contact: response.data.contact || "",
          address: response.data.address || "",
          about: response.data.about || "",
          image: null
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  // Show message helper
  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  // Validation functions
  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'name':
        if (!value?.trim()) errors.name = "Name is required";
        else if (value.length < 2) errors.name = "Name must be at least 2 characters";
        break;
      case 'contact':
        if (!value?.trim()) errors.contact = "Contact number is required";
        else if (!/^\+?[\d\s-()]{10,15}$/.test(value)) errors.contact = "Enter a valid phone number";
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = "Enter a valid email address";
        }
        break;
      case 'about':
        if (value && value.length > 500) errors.about = "About section must be less than 500 characters";
        break;
      case 'address':
        if (!value?.trim()) errors.address = "Address is required";
        break;
      case 'currentPassword':
        if (!value) errors.currentPassword = "Current password is required";
        break;
      case 'newPassword':
        if (!value) errors.newPassword = "New password is required";
        else if (value.length < 6) errors.newPassword = "Password must be at least 6 characters";
        break;
      case 'confirmPassword':
        if (!value) errors.confirmPassword = "Please confirm your password";
        else if (value !== passwordData.newPassword) errors.confirmPassword = "Passwords do not match";
        break;
    }
    
    return errors;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
    
    const fieldErrors = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      ...fieldErrors,
      ...(Object.keys(fieldErrors).length === 0 && { [name]: undefined })
    }));
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    const fieldErrors = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      ...fieldErrors,
      ...(Object.keys(fieldErrors).length === 0 && { [name]: undefined })
    }));
  };

  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, image: 'Only JPEG, PNG, and WebP files are allowed' }));
      return;
    }
    
    if (file.size > maxSize) {
      setFormErrors(prev => ({ ...prev, image: 'File size must be less than 5MB' }));
      return;
    }

    try {
      setImageUploading(true);
      setFormErrors(prev => ({ ...prev, image: undefined }));
      
      const formData = new FormData();
      formData.append('image', file);
      
      const result = await apiService.updateProfileImage(formData);
      
      if (result.success) {
        setEmployee(prev => ({
          ...prev,
          image: result.data.image
        }));
        showMessage("Profile image updated successfully!", 'success');
        
        // Update localStorage if it exists
        const currentUserData = localStorage.getItem('userData');
        if (currentUserData) {
          const userData = JSON.parse(currentUserData);
          userData.image = result.data.image;
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showMessage(`Failed to update profile image: ${error.message}`, 'error');
    } finally {
      setImageUploading(false);
    }
  };

  // Get profile image URL
  const getImageUrl = (imageSource) => {
    if (preview) return preview;
    if (!imageSource) return `https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.name || 'Employee')}&size=200&background=3b82f6&color=ffffff&format=svg`;
    if (imageSource.startsWith('http')) return imageSource;
    if (imageSource.startsWith('/uploads/')) return `http://localhost:4000${imageSource}`;
    return `http://localhost:4000/uploads/employees/${imageSource}`;
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Validate all fields
      const allErrors = {};
      Object.keys(editData).forEach(key => {
        if (key !== 'image') {
          const errors = validateField(key, editData[key]);
          Object.assign(allErrors, errors);
        }
      });

      setFormErrors(allErrors);

      if (Object.keys(allErrors).length > 0) {
        showMessage("Please fix the errors before saving.", 'error');
        setSaving(false);
        return;
      }

      // Create FormData for API call
      const formData = new FormData();
      formData.append('name', editData.name);
      formData.append('email', editData.email);
      formData.append('contact', editData.contact);
      formData.append('address', editData.address);
      formData.append('about', editData.about);
      
      if (editData.image) {
        formData.append('image', editData.image);
      }

      const result = await apiService.updateProfile(formData);

      if (result.success) {
        setEmployee(result.data);
        showMessage("Profile updated successfully!", 'success');
        setIsEditing(false);
        setPreview(null);
        setEditData(prev => ({ 
          ...prev, 
          image: null 
        }));

        // Update localStorage if it exists
        const currentUserData = localStorage.getItem('userData');
        if (currentUserData) {
          const userData = JSON.parse(currentUserData);
          Object.assign(userData, result.data);
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      }

    } catch (err) {
      console.error('Error updating profile:', err);
      showMessage(`Failed to update profile: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    try {
      setSaving(true);

      // Validate password fields
      const allErrors = {};
      ['currentPassword', 'newPassword', 'confirmPassword'].forEach(field => {
        const errors = validateField(field, passwordData[field]);
        Object.assign(allErrors, errors);
      });

      setFormErrors(allErrors);

      if (Object.keys(allErrors).length > 0) {
        showMessage("Please fix the errors before changing password.", 'error');
        setSaving(false);
        return;
      }

      const result = await apiService.changePassword(passwordData);

      if (result.success) {
        showMessage("Password changed successfully!", 'success');
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setActiveTab('profile');
      }

    } catch (err) {
      console.error('Error changing password:', err);
      showMessage(`Failed to change password: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setPreview(null);
    setFormErrors({});
    setEditData({
      name: employee?.name || "",
      email: employee?.email || "",
      contact: employee?.contact || "",
      address: employee?.address || "",
      about: employee?.about || "",
      image: null
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Profile</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchEmployeeData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 w-full shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
          <p className="text-slate-600 mb-6">Unable to load employee profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
              <p className="text-slate-600 mt-2">Manage your personal information and account settings</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'profile' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <User size={16} className="inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'password' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Lock size={16} className="inline mr-2" />
                Security
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className={`p-4 rounded-xl border ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {messageType === 'success' ? (
                <Check size={20} className="mr-3" />
              ) : (
                <AlertCircle size={20} className="mr-3" />
              )}
              <p className="font-medium">{message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden sticky top-6">
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-center text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="relative inline-block mb-4">
                      {isEditing ? (
                        <div className="relative">
                          <img
                            src={getImageUrl(employee.image)}
                            alt={employee.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl mx-auto"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&size=128&background=3b82f6&color=ffffff&format=svg`;
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={imageUploading}
                            className="absolute bottom-2 right-2 bg-white text-blue-600 p-3 rounded-full shadow-xl hover:bg-slate-50 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {imageUploading ? (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Camera size={18} />
                            )}
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <img
                          src={getImageUrl(employee.image)}
                          alt={employee.name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl mx-auto"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&size=128&background=3b82f6&color=ffffff&format=svg`;
                          }}
                        />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{employee.name}</h2>
                    <p className="text-blue-100 text-lg">{employee.category}</p>
                    <div className="mt-4 inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      <Badge size={14} className="mr-1" />
                      {employee.empId}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-6">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Edit2 size={18} />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 shadow-lg"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="w-full flex items-center justify-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
                      >
                        <X size={18} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}

                  {/* Upload Error */}
                  {formErrors.image && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600 flex items-center font-medium">
                        <AlertCircle size={14} className="mr-2" />
                        {formErrors.image}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Info Cards */}
                <div className="px-6 pb-6 space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Phone size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Contact</p>
                      <p className="font-bold text-slate-900">{employee.contact}</p>
                    </div>
                  </div>

                  {employee.rate && (
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Building size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Daily Rate</p>
                        <p className="font-bold text-slate-900">Rs. {employee.rate?.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Calendar size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Joined</p>
                      <p className="font-bold text-slate-900">
                        {new Date(employee.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                {employee.qrCode && (
                  <div className="p-6 border-t border-slate-200 text-center">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
                      <img
                        src={`http://localhost:4000${employee.qrCode}`}
                        alt="QR Code"
                        className="w-24 h-24 mx-auto mb-3"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <p className="text-sm text-slate-600 font-medium">Scan for Employee Info</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                      <User size={20} className="text-blue-600" />
                    </div>
                    Personal Information
                  </h3>
                  {isEditing && (
                    <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-xl border border-orange-200">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Editing Mode</span>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Full Name</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg ${
                            formErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                          }`}
                          placeholder="Enter your email address"
                        />
                        {formErrors.email && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl">
                        <p className="text-slate-900 font-semibold text-lg flex items-center">
                          <Mail size={18} className="text-slate-500 mr-3" />
                          {employee.email || 'No email provided'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Contact Number</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          name="contact"
                          value={editData.contact}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg ${
                            formErrors.contact ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                          }`}
                          placeholder="Enter your contact number"
                        />
                        {formErrors.contact && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {formErrors.contact}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl">
                        <p className="text-slate-900 font-semibold text-lg flex items-center">
                          <Phone size={18} className="text-slate-500 mr-3" />
                          {employee.contact}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Employee Category</label>
                    <div className="px-4 py-4 bg-gradient-to-r from-slate-100 to-slate-200 border-2 border-slate-300 rounded-2xl">
                      <p className="text-slate-600 font-semibold text-lg flex items-center">
                        <Building size={18} className="text-slate-500 mr-3" />
                        {employee.category}
                        <span className="text-xs text-slate-500 ml-2">(Read-only)</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Employee ID</label>
                    <div className="px-4 py-4 bg-gradient-to-r from-slate-100 to-slate-200 border-2 border-slate-300 rounded-2xl">
                      <p className="text-slate-600 font-semibold text-lg flex items-center">
                        <Badge size={18} className="text-slate-500 mr-3" />
                        {employee.empId}
                        <span className="text-xs text-slate-500 ml-2">(System Generated)</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Address</label>
                  {isEditing ? (
                    <div>
                      <textarea
                        name="address"
                        value={editData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-lg ${
                          formErrors.address ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                        }`}
                        placeholder="Enter your complete address"
                      />
                      {formErrors.address && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {formErrors.address}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl">
                      <p className="text-slate-900 font-medium text-lg flex items-start">
                        <MapPin size={18} className="text-slate-500 mr-3 mt-0.5 flex-shrink-0" />
                        {employee.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* About Section */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                    <FileText size={20} className="text-green-600" />
                  </div>
                  About Me
                </h3>
                
                {isEditing ? (
                  <div>
                    <textarea
                      name="about"
                      value={editData.about}
                      onChange={handleInputChange}
                      rows={5}
                      className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-lg ${
                        formErrors.about ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                      }`}
                      placeholder="Tell us about yourself, your experience, skills, and expertise..."
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-slate-500">
                        {editData.about.length}/500 characters
                      </p>
                      {formErrors.about && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {formErrors.about}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-6">
                    <p className="text-slate-700 leading-relaxed text-lg">
                      {employee.about || "No bio information available. Click 'Edit Profile' to add information about yourself."}
                    </p>
                  </div>
                )}
              </div>

              {/* Account Information */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                    <Building size={20} className="text-purple-600" />
                  </div>
                  Work Information
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center border-2 border-blue-200">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Badge size={24} className="text-white" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Employee ID</p>
                    <p className="font-bold text-slate-900 text-xl">{employee.empId}</p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">System Generated</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center border-2 border-green-200">
                    <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Building size={24} className="text-white" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Category</p>
                    <p className="font-bold text-slate-900 text-xl">{employee.category}</p>
                    <p className="text-xs text-green-600 mt-2 font-medium">Assigned Role</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl text-center border-2 border-orange-200">
                    <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Calendar size={24} className="text-white" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Joined Date</p>
                    <p className="font-bold text-slate-900 text-lg">
                      {new Date(employee.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-xs text-orange-600 mt-2 font-medium">Member Since</p>
                  </div>
                </div>

                {employee.rate && (
                  <div className="mt-6 bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-2xl border-2 border-indigo-200">
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                        <Star size={20} className="text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600 font-medium mb-1">Daily Rate</p>
                        <p className="font-bold text-slate-900 text-2xl">Rs. {employee.rate?.toLocaleString()}</p>
                        <p className="text-xs text-indigo-600 mt-1 font-medium">Per Day</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} className="text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Change Password</h2>
                <p className="text-slate-600">Update your account password to keep your account secure</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-lg ${
                        formErrors.currentPassword ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                      }`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formErrors.currentPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {formErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-lg ${
                        formErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                      }`}
                      placeholder="Enter your new password (min 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formErrors.newPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {formErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-lg ${
                        formErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                      }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                  <div className="flex items-start">
                    <AlertCircle size={20} className="text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-1">Password Security Tips</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Use at least 6 characters</li>
                        <li>• Include a mix of letters, numbers, and symbols</li>
                        <li>• Avoid using personal information</li>
                        <li>• Don't reuse passwords from other accounts</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white px-6 py-4 rounded-2xl font-medium transition-colors duration-200 shadow-lg text-lg"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Changing Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={20} />
                        <span>Change Password</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                      });
                      setFormErrors({});
                      setActiveTab('profile');
                    }}
                    className="flex items-center justify-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white px-6 py-4 rounded-2xl font-medium transition-colors duration-200 text-lg"
                  >
                    <X size={20} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedEmployeeProfile;