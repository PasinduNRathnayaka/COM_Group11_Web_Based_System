import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext'; 
import { useNavigate } from 'react-router-dom'; 
import { assets } from '../../assets/assets'; 

import axios from 'axios';
import toast from 'react-hot-toast';

const SignUp = () => {
  // form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName : '',
    address  : '',
    number   : '',
    email    : '',
    password : '',
  });

  const { setUser } = useAppContext();
  const navigate  = useNavigate();

  /* ---------------- handlers ---------------- */
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //send to backend
      const { data } = await axios.post('/api/user/register', {
        name     : `${formData.firstName} ${formData.lastName}`,
        email    : formData.email,
        password : formData.password,
        address  : formData.address,
        number  : formData.number,
      });

      //store user + token
      setUser({
        _id       : data._id,
        name      : data.name,
        email     : data.email,
        number  : formData.number,
        address: formData.address,
        profilePic: assets.profile2, 
        token     : data.token,
      });
      localStorage.setItem('user', JSON.stringify({
        _id   : data._id,
        name  : data.name,
        email : data.email,
        number  : formData.number,
        address: formData.address,
        token : data.token,
      }));
      localStorage.setItem('token', data.token);

      toast.success('Account created!');

      //redirect
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
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

          {/* Phone Number */}
          <div>
            <label className="block mb-1 font-medium">Phone Number</label>
            <input
              type="string"
              name="number"
              placeholder="Phone number"
              value={formData.number}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
              required
              maxLength={12}
            />
          </div>

           {/* Address */}
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <input
              type="string"
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
            <label className="block mb-1 font-medium">E-mail</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded mb-2"
              required
            />
            <label className="block mb-1 font-medium">Password</label>
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
              Minimum 6 characters with at least one uppercase, one lowercase, one special character and a number
            </p>
          </div>

            <input
              type="checkbox"
              id="select"
              className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-2"
              required
               />
              <p className="block mb-1 font-medium">I Agree to the Terms and Conditions</p>
           

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
