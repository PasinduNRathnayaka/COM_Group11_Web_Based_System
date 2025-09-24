import React, { useState, useEffect, useRef } from "react";
import { Upload, X, User, Mail, Phone, MapPin, DollarSign, Camera, AlertCircle, Check } from "lucide-react";

const AddEmployeeForm = () => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [formData, setFormData] = useState({
    empId: "",
    name: "",
    about: "",
    category: "",
    contact: "",
    rate: "",
    address: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const randomId = `EMP${Date.now().toString().slice(-6)}`;
    setFormData((prev) => ({ ...prev, empId: randomId }));
  }, []);

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'name':
        if (!value.trim()) errors.name = "Name is required";
        else if (value.length < 2) errors.name = "Name must be at least 2 characters";
        break;
      case 'contact':
        if (!value.trim()) errors.contact = "Contact number is required";
        else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) errors.contact = "Enter a valid 10-digit phone number";
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = "Enter a valid email address";
        }
        break;
      case 'rate':
        if (!value) errors.rate = "Hourly rate is required";
        else if (parseFloat(value) <= 0) errors.rate = "Rate must be greater than 0";
        break;
      case 'password':
        if (!value) errors.password = "Password is required";
        else if (value.length < 6) errors.password = "Password must be at least 6 characters";
        break;
      case 'confirmPassword':
        if (!value) errors.confirmPassword = "Please confirm your password";
        else if (value !== formData.password) errors.confirmPassword = "Passwords do not match";
        break;
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const fieldErrors = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      ...fieldErrors,
      ...(Object.keys(fieldErrors).length === 0 && { [name]: undefined })
    }));

    // Special case for confirm password when password changes
    if (name === 'password' && formData.confirmPassword) {
      const confirmErrors = validateField('confirmPassword', formData.confirmPassword);
      setFormErrors(prev => ({
        ...prev,
        ...confirmErrors
      }));
    }
  };

  const validateImage = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, and WebP are allowed.';
    }
    
    if (file.size > maxSize) {
      return 'File size too large. Maximum 5MB allowed.';
    }
    
    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processImage(file);
  };

  const processImage = (file) => {
    if (!file) return;
    
    const error = validateImage(file);
    if (error) {
      setImageError(error);
      return;
    }

    setImageError("");
    setFormData((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processImage(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setPreview(null);
    setImageError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    // Validate all fields
    const allErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'image' && key !== 'empId') {
        const errors = validateField(key, formData[key]);
        Object.assign(allErrors, errors);
      }
    });

    if (!formData.image) {
      allErrors.image = "Profile image is required";
    }

    setFormErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      setMessage("❌ Please fix the errors above before submitting.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (key === "image" && value) {
          payload.append("image", value);
        } else {
          payload.append(key, value);
        }
      }

      const res = await fetch("http://localhost:4000/api/employees", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add employee");
      }

      setMessage("✅ Employee added successfully!");

      // Reset form
      const newEmpId = `EMP${Date.now().toString().slice(-6)}`;
      setFormData({
        empId: newEmpId,
        name: "",
        about: "",
        category: "",
        contact: "",
        rate: "",
        address: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        image: null,
      });
      setPreview(null);
      setFormErrors({});
      setImageError("");
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error("Failed to add employee:", err.message);
      setMessage(`❌ Failed to add employee. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
              <p className="text-gray-600 mt-1">Create a new employee profile with personal and work details</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Ready to add employee</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Employee Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <User size={16} className="text-blue-600" />
                  </div>
                  Basic Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      name="empId"
                      value={formData.empId}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-mono text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter full name"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Enter username"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.username && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {formErrors.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
                        formErrors.category ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select Category</option>
                      <option value="Employee">Employee</option>
                      <option value="Employee for E-com">Employee for E-com</option>
                    </select>
                    {formErrors.category && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    required
                    placeholder="Enter description about the employee"
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                      formErrors.about ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.about && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {formErrors.about}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Phone size={16} className="text-purple-600" />
                  </div>
                  Contact Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      required
                      placeholder="Enter contact number"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.contact ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.contact && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {formErrors.contact}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Enter address"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      formErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {formErrors.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Work Information & Security */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <DollarSign size={16} className="text-green-600" />
                  </div>
                  Work Information & Security
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Rate (Rs:) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Enter hourly rate"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.rate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.rate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {formErrors.rate}
                      </p>
                    )}
                  </div>

                  <div></div> {/* Empty div for spacing */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter password"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm password"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Image */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <Camera size={16} className="text-orange-600" />
                  </div>
                  Profile Photo
                  <span className="text-red-500 ml-1">*</span>
                </h2>

                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : formErrors.image 
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {preview ? (
                    <div className="space-y-4">
                      <div className="relative mx-auto w-32 h-32 rounded-xl overflow-hidden">
                        <img 
                          src={preview} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">Click or drag to replace image</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                        <Upload size={24} className="text-gray-500" />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Drop profile photo here or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPEG, WebP up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {(formErrors.image || imageError) && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {formErrors.image || imageError}
                  </p>
                )}

                {/* Image Requirements */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">Image Requirements:</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Upload a clear profile photo</li>
                        <li>• Supported: PNG, JPEG, WebP</li>
                        <li>• Maximum file size: 5MB</li>
                        <li>• Recommended: Square aspect ratio</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {formData.image && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-green-800">
                        <Check size={14} className="mr-2" />
                        <span>Image selected</span>
                      </div>
                      <span className="text-green-600">
                        {formatFileSize(formData.image.size)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>All fields marked with * are required</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to cancel? All data will be lost.")) {
                      window.location.reload();
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <User size={16} />
                      <span>Save Employee</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Message Display */}
        {message && (
          <div className={`mt-6 p-4 rounded-xl text-center font-medium ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEmployeeForm;