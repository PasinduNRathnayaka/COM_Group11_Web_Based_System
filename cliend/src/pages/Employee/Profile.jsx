import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to get token from cookies or localStorage
  const getAuthToken = () => {
    // Try to get from localStorage first
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) return token;
    
    // If not in localStorage, try cookies
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

  // Fetch employee data from database
  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('No authentication token found');
        navigate('/login'); // Redirect to login if no token
        return;
      }

      const empid = getEmployeeIdFromToken(token);
      if (!empid) {
        setError('Invalid token - employee ID not found');
        return;
      }

      // API call to fetch employee data
      const response = await fetch(`/api/employees/${empid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const employeeData = await response.json();
      setEmployee(employeeData);
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

  const handleEditClick = () => {
    navigate("/employee/edit-profile");
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
          <button
            onClick={fetchEmployeeData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No employee data found.</p>
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
            Employee ID: {employee.empid || employee.employeeId || 'N/A'}
          </span>
        </div>

        {/* Bio Section */}
        <div className="mb-6">
          <h3 className="font-semibold mb-1">Bio,</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {employee.bio || "Bio information not available."}
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
            {employee.mobile || employee.phone || 'No mobile number provided'}
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