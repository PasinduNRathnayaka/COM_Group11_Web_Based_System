import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [employee, setEmployee] = useState({
    name: "",
    bio: "",
    email: "",
    mobile: "",
    profileImage: "",
    department: "",
    position: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  
  const navigate = useNavigate();

  // Function to get token from cookies or localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) return token;
    
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'authToken' || name === 'token') {
        return value;
      }
    }
    return null;
  };

  // Function to get employee ID from token
  const getEmployeeIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.empid || payload.employeeId || payload.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Fetch employee data for editing
  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('No authentication token found');
        navigate('/login');
        return;
      }

      const empid = getEmployeeIdFromToken(token);
      if (!empid) {
        setError('Invalid token - employee ID not found');
        return;
      }

      const response = await fetch(`/api/employees/${empid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const employeeData = await response.json();
      setEmployee({
        name: employeeData.name || "",
        bio: employeeData.bio || "",
        email: employeeData.email || "",
        mobile: employeeData.mobile || employeeData.phone || "",
        profileImage: employeeData.profileImage || employeeData.image || "",
        department: employeeData.department || "",
        position: employeeData.position || ""
      });
      setImagePreview(employeeData.profileImage || employeeData.image || "");
      setError(null);
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError('Failed to load employee data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const handleInputChange = (field, value) => {
    setEmployee(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, JPG, or PNG)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const uploadImage = async (file, token) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload/profile-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const result = await response.json();
    return result.imageUrl || result.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage("");

    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication token not found. Please login again.');
        navigate('/login');
        return;
      }

      const empid = getEmployeeIdFromToken(token);
      if (!empid) {
        setError('Invalid token - employee ID not found');
        return;
      }

      let updatedEmployee = { ...employee };

      // Upload image if a new one was selected
      if (imageFile) {
        try {
          const imageUrl = await uploadImage(imageFile, token);
          updatedEmployee.profileImage = imageUrl;
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          setError('Failed to upload image. Profile will be updated without image change.');
          // Continue with profile update even if image upload fails
        }
      }

      // Update employee profile
      const response = await fetch(`/api/employees/${empid}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEmployee),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSuccessMessage('Profile updated successfully!');
      
      // Redirect to profile page after successful update
      setTimeout(() => {
        navigate('/employee/profile');
      }, 2000);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 shadow-md rounded-md">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          Home &gt; Profile &gt; Edit Profile
        </div>
        <h2 className="text-xl font-bold mb-6">Edit Profile</h2>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Form Layout */}
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
          {/* Left Side */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block font-medium mb-1">Name *</label>
              <input
                value={employee.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Bio</label>
              <textarea
                value={employee.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Contact Information</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  value={employee.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email"
                  required
                />
                <input
                  type="tel"
                  value={employee.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mobile"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Work Information</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={employee.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Department"
                />
                <input
                  type="text"
                  value={employee.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Position"
                />
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={imagePreview || "https://img.freepik.com/free-photo/young-businessman-standing-with-arms-crossed-white-background_114579-20876.jpg"}
                alt="Profile Preview"
                className="w-40 h-40 rounded-full object-cover border-4 border-gray-300"
                onError={(e) => {
                  e.target.src = "https://img.freepik.com/free-photo/young-businessman-standing-with-arms-crossed-white-background_114579-20876.jpg";
                }}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Profile Picture</label>
              <div className="border border-dashed border-gray-400 rounded p-4 text-center">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Drop your image here, or browse. JPEG, JPG, PNG are allowed (Max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-3 flex justify-center space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/employee/profile')}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'SAVE'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-gray-400">
          © 2025 - Employee Dashboard
        </footer>
      </div>
    </div>
  );
};

export default EditProfile;