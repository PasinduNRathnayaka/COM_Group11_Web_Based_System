import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fixed function to get token from localStorage
  const getAuthToken = () => {
    // Check localStorage for token (based on your screenshot, it's stored as 'token')
    const token = localStorage.getItem('token');
    if (token) return token;
    
    // Fallback to check for 'authToken' 
    const authToken = localStorage.getItem('authToken');
    if (authToken) return authToken;
    
    // If not in localStorage, try cookies as fallback
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'authToken' || name === 'token') {
        return value;
      }
    }
    return null;
  };

  // Function to get employee ID from token (you'll need to implement JWT decode or similar)
  const getEmployeeIdFromToken = (token) => {
    try {
      // If using JWT, you would decode it here
      // For now, assuming you have a way to extract empid from token
      const payload = JSON.parse(atob(token.split('.')[1])); // Basic JWT decode
      return payload.empid || payload.employeeId || payload.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Updated fetch employee data function
  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('No authentication token found');
        // Don't auto-redirect, let user choose
        return;
      }

      console.log('Fetching employee data with token:', token); // Debug log

      // Try the employee profile endpoint
      let response;
      try {
        response = await fetch('/api/employee-profile/profile/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (fetchError) {
        console.error('Network error:', fetchError);
        throw new Error('Network error. Please check your connection.');
      }

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        if (response.status === 401) {
          // Instead of immediately removing token and redirecting,
          // let's try alternative approaches or give user more info
          setError('Authentication failed. Please login again as an employee.');
          return;
        } else if (response.status === 404) {
          setError('Employee profile endpoint not found. Please contact support.');
          return;
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('API Response:', result); // Debug log

      if (result.success) {
        setEmployee(result.data);
        setError(null);
      } else {
        throw new Error(result.message || 'Failed to fetch employee data');
      }
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError(`Failed to load employee data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Alternative function to get employee data from localStorage
  const getEmployeeFromLocalStorage = () => {
    try {
      const userData = localStorage.getItem('userData') || localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('User data from localStorage:', parsedUser); // Debug log
        
        // Check if this is employee data
        if (parsedUser.empId || parsedUser.employeeId || parsedUser.category === 'Employee') {
          setEmployee(parsedUser);
          setError(null);
          setLoading(false);
          return true;
        }
      }
    } catch (err) {
      console.error('Error parsing user data from localStorage:', err);
    }
    return false;
  };

  useEffect(() => {
    // First try to get employee data from localStorage
    const foundInLocalStorage = getEmployeeFromLocalStorage();
    
    // If not found in localStorage, try API call
    if (!foundInLocalStorage) {
      fetchEmployeeData();
    }
  }, []);

  const handleEditClick = () => {
    navigate("/employee/edit-profile");
  };

  const handleLoginRedirect = () => {
    // Only remove tokens when user explicitly chooses to login again
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={fetchEmployeeData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
            >
              Try Again
            </button>
            {error.includes('Authentication') && (
              <button
                onClick={handleLoginRedirect}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded w-full"
              >
                Login Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No employee data found.</p>
          <button
            onClick={handleLoginRedirect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 relative">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-2">Home &gt; Profile</div>

        {/* Edit Button */}
        <button
          onClick={handleEditClick}
          className="absolute top-4 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm rounded transition-colors duration-200"
        >
          Edit
        </button>

        {/* Greeting */}
        <h2 className="text-xl font-semibold mb-4">
          Hi {employee.name || employee.firstName || 'Employee'},
        </h2>

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <img
            src={employee.profileImage || employee.image || "https://img.freepik.com/free-photo/young-businessman-standing-with-arms-crossed-white-background_114579-20876.jpg"}
            alt={employee.name || "Employee"}
            className="w-48 h-48 rounded-full object-cover border-4 border-gray-300"
            onError={(e) => {
              e.target.src = "https://img.freepik.com/free-photo/young-businessman-standing-with-arms-crossed-white-background_114579-20876.jpg";
            }}
          />
        </div>

        {/* Employee ID Display */}
        <div className="mb-4 text-center">
          <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            Employee ID: {employee.empId || employee.employeeId || employee.empid || 'N/A'}
          </span>
        </div>

        {/* Bio Section */}
        <div className="mb-6">
          <h3 className="font-semibold mb-1">Bio,</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {employee.bio || employee.about || "Bio information not available."}
          </p>
        </div>

        {/* Contact Section */}
        <div className="text-sm space-y-2">
          <h3 className="font-semibold mb-1">Contact-</h3>
          <p>
            <span className="font-semibold">Email = </span>
            <a 
              href={`mailto:${employee.email || ''}`} 
              className="text-blue-600 underline hover:text-blue-800"
            >
              {employee.email || 'No email provided'}
            </a>
          </p>
          <p>
            <span className="font-semibold">Mobile = </span>
            {employee.mobile || employee.phone || employee.number || 'No mobile number provided'}
          </p>
          {employee.department && (
            <p>
              <span className="font-semibold">Department = </span>
              {employee.department}
            </p>
          )}
          {employee.position && (
            <p>
              <span className="font-semibold">Position = </span>
              {employee.position}
            </p>
          )}
          {employee.address && (
            <p>
              <span className="font-semibold">Address = </span>
              {employee.address}
            </p>
          )}
          {employee.category && (
            <p>
              <span className="font-semibold">Role = </span>
              {employee.category}
            </p>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-gray-500">
          © 2025 - Employee Dashboard
        </footer>
      </div>
    </div>
  );
};

export default EmployeeProfile;