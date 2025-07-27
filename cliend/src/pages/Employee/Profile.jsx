import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Fetch employee profile data
  const fetchProfile = async () => {
    try {
      const token = getToken();
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/employee/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setEmployee(data.employee);
      } else {
        setError(data.message || 'Failed to fetch profile');
        if (response.status === 401) {
          // Token is invalid, redirect to login
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          navigate('/login');
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditClick = () => {
    navigate("/employee/edit-profile");
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchProfile}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile data found</p>
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
          className="absolute top-4 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm rounded"
        >
          Edit
        </button>

        {/* Greeting */}
        <h2 className="text-xl font-semibold mb-4">
          Hi {employee.name ? employee.name.split(' ')[0] : 'Employee'},
        </h2>

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <img
            src={employee.image 
              ? `${employee.image}` 
              : "https://img.freepik.com/free-photo/young-businessman-standing-with-arms-crossed-white-background_114579-20876.jpg"
            }
            alt={employee.name || 'Employee'}
            className="w-48 h-48 rounded-full object-cover border-4 border-gray-300"
            onError={(e) => {
              e.target.src = "https://img.freepik.com/free-photo/young-businessman-standing-with-arms-crossed-white-background_114579-20876.jpg";
            }}
          />
        </div>

        {/* Employee Info */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="font-semibold text-gray-700">Employee ID: </span>
              <span className="text-gray-600">{employee.empId}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Category: </span>
              <span className="text-gray-600">{employee.category || 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Username: </span>
              <span className="text-gray-600">{employee.username}</span>
            </div>
            {employee.rate && (
              <div>
                <span className="font-semibold text-gray-700">Rate: </span>
                <span className="text-gray-600">Rs. {employee.rate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Bio,</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {employee.about || "No bio information available. Please update your profile to add a bio."}
          </p>
        </div>

        {/* Contact Section */}
        <div className="text-sm space-y-2">
          <h3 className="font-semibold mb-2">Contact-</h3>
          
          {employee.email && (
            <p>
              <span className="font-semibold">Email = </span>
              <a href={`mailto:${employee.email}`} className="text-blue-600 underline">
                {employee.email}
              </a>
            </p>
          )}
          
          {employee.contact && (
            <p>
              <span className="font-semibold">Mobile = </span>
              {employee.contact}
            </p>
          )}

          {employee.address && (
            <p>
              <span className="font-semibold">Address = </span>
              {employee.address}
            </p>
          )}

          {!employee.email && !employee.contact && !employee.address && (
            <p className="text-gray-500 italic">No contact information available.</p>
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