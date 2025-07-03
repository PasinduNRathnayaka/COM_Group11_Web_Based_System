import React, { useState } from 'react';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: send data to backend or show success message
    alert('Account created successfully!');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Your Name */}
          <div>
            <label className="block mb-1 font-medium">Your Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-1/2 border px-4 py-2 rounded"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-1/2 border px-4 py-2 rounded"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
              required
            />
          </div>

          {/* Login Details */}
          <div>
            <label className="block mb-1 font-medium">Login Details</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded mb-2"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 characters with at least one uppercase, one lowercase, one special character and a number
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-800 text-white rounded py-2 mt-2"
          >
            SIGN UP 
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
