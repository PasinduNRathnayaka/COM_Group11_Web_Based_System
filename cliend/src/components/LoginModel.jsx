import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';             
import toast from 'react-hot-toast';   

const LoginModal = ({ isOpen, onClose, onSignInClick }) => {
  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);     
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']); // 6 digits now
  const [newPwd, setNewPwd] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState(null); // Track if user or employee for forgot password

  // Function to handle redirect based on user type
  const handleUserRedirect = (userType, userData) => {
    console.log('Redirecting user:', userType, userData);
    
    switch (userType) {
      case 'admin':
        toast.success(`Welcome Admin, ${userData.name}!`);
        navigate('/seller', { replace: true });
        break;
      case 'employee':
        toast.success(`Welcome Employee, ${userData.name}!`);
        navigate('/employee', { replace: true });
        break;
      case 'online_employee':
        toast.success(`Welcome Employee, ${userData.name}!`);
        navigate('/online_employee', { replace: true });
        break;
      case 'user':
      default:
        toast.success(`Welcome, ${userData.name}!`);
        navigate('/', { replace: true });
        break;
    }
  };

  // Enhanced login function with better user type detection
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Clear any existing user data first
      setUser(null);
      
      let loginResponse = null;
      let userType = 'user';
      
      // First, try employee login to avoid conflicts
      try {
        console.log('Attempting employee login...');
        const response = await axios.post('/api/employees/login', {
          email,
          password
        });
        
        loginResponse = response.data;
        
        console.log('Employee login successful:', loginResponse);
        console.log('Employee category:', loginResponse.category);
        console.log('Employee role:', loginResponse.role);
        
        // Create a mapping for categories to user types
        const categoryMapping = {
          'seller': 'admin',
          'admin': 'admin',
          'Employee for E-com': 'online_employee',
          'online_employee': 'online_employee',
          'online employee': 'online_employee',
          'default': 'employee'
        };
        
        // Determine user type based on category or role
        userType = categoryMapping[loginResponse.category] || 
                  categoryMapping[loginResponse.role] || 
                  categoryMapping['default'];
        
        console.log('Determined user type:', userType);
        
      } catch (employeeError) {
        console.log('Employee login failed, trying user login...');
        
        // If employee login fails, try user login
        try {
          console.log('Attempting user login...');
          const response = await axios.post('/api/user/login', {
            email,
            password
          });
          
          loginResponse = response.data;
          userType = 'user';
          console.log('User login successful:', loginResponse);
          
        } catch (userError) {
          console.log('Both login attempts failed');
          const errorMessage = userError.response?.data?.message || 
                              employeeError.response?.data?.message || 
                              'Invalid credentials. Please check your email and password.';
          throw new Error(errorMessage);
        }
      }

      // Store complete user data with proper structure
      const userData = {
        _id: loginResponse._id,
        name: loginResponse.name,
        email: loginResponse.email,
        number: loginResponse.number || loginResponse.contact,
        address: loginResponse.address,
        profilePic: loginResponse.profilePic || loginResponse.image,
        token: loginResponse.token,
        userType: userType,
        // Employee specific fields (will be undefined for regular users)
        empId: loginResponse.empId,
        category: loginResponse.category,
        role: loginResponse.role,
        rate: loginResponse.rate,
        about: loginResponse.about
      };

      console.log('Final user data being stored:', userData);

      // Save user in context
      setUser(userData);

      // Store in localStorage for persistence (optional, but recommended)
      localStorage.setItem('userData', JSON.stringify(userData));

      // Handle redirect based on user type
      handleUserRedirect(userType, userData);
      
      // Close modal and reset form with appropriate timing
      const closeDelay = userType === 'user' ? 300 : 800;
      setTimeout(() => {
        onClose();
        resetForm();
      }, closeDelay);

    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to reset form
  const resetForm = () => {
    setStep(0);
    setEmail(''); 
    setPassword('');
    setCode(['', '', '', '', '', '']); // Reset to 6 digits
    setNewPwd('');
    setConfirmNew('');
    setUserType(null);
  };

  // Enhanced forgot password handling - try both user and employee endpoints
  const handleForgotPasswordNext = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let response = null;
      let detectedUserType = 'user';
      
      // First try user forgot password
      try {
        console.log('Trying user forgot password...');
        response = await axios.post('/api/user/forgot-password', {
          email
        });
        detectedUserType = 'user';
        console.log('User forgot password successful');
      } catch (userError) {
        console.log('User forgot password failed, trying employee...');
        
        // If user fails, try employee
        try {
          response = await axios.post('/api/employees/forgot-password', {
            email
          });
          detectedUserType = 'employee';
          console.log('Employee forgot password successful');
        } catch (employeeError) {
          // If both fail, show error
          const errorMessage = employeeError.response?.data?.message || 
                              userError.response?.data?.message || 
                              'Email not found in our system';
          throw new Error(errorMessage);
        }
      }
      
      if (response.data.success) {
        setUserType(detectedUserType); // Store which type for later steps
        toast.success('Reset code sent to your email');
        setStep(2);
      } else {
        toast.error('Failed to send reset code');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced code verification
  const handleCodeVerification = async () => {
    const codeString = code.join('');
    
    if (codeString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = userType === 'employee' 
        ? '/api/employees/verify-reset-code'
        : '/api/user/verify-reset-code';
        
      const { data } = await axios.post(endpoint, {
        email,
        resetCode: codeString, // Use resetCode instead of code
      });
      
      if (data.success) {
        toast.success('Code verified!');
        setStep(3);
      } else {
        toast.error('Invalid code');
      }
    } catch (err) {
      console.error('Code verification error:', err);
      toast.error(err.response?.data?.message || 'Code verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced password reset
  const handlePasswordReset = async () => {
    if (!newPwd || !confirmNew) {
      toast.error('Please fill all fields');
      return;
    }
    
    if (newPwd !== confirmNew) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPwd.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = userType === 'employee' 
        ? '/api/employees/reset-password'
        : '/api/user/reset-password';
        
      const { data } = await axios.post(endpoint, {
        email,
        resetCode: code.join(''), // Include the reset code
        newPassword: newPwd,
      });
      
      if (data.success) {
        toast.success('Password updated successfully!');
        resetForm();
      } else {
        toast.error('Password reset failed');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (i, val) => {
    // Only allow numbers
    if (val && !/^\d$/.test(val)) return;
    
    const tmp = [...code];
    tmp[i] = val;
    setCode(tmp);
    
    // Auto-focus next input
    if (val && i < 5) {
      const nextInput = document.querySelector(`input[data-index="${i + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace to go to previous input
  const handleCodeKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      const prevInput = document.querySelector(`input[data-index="${i - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md text-center">

        {/* ---------------- STEP 0 — LOGIN ---------------- */}
        {step === 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Login</h2>

            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded px-4 py-2"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded px-4 py-2"
                required
              />
              <button 
                type="submit" 
                className="bg-blue-900 text-white rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  'LOGIN'
                )}
              </button>
            </form>

            <button
              className="mt-2 text-sm text-blue-900 hover:underline"
              onClick={() => setStep(1)}
              disabled={isLoading}
            >
              Forgot Password?
            </button>

            <div className="mt-3 text-sm">
              <span>Don't have an account? </span>
              <button
                onClick={onSignInClick}
                className="text-blue-900 hover:underline font-semibold"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </div>
          </>
        )}

        {/* ---------------- STEP 1 — enter email ---------------- */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email address and we'll send you a verification code to reset your password.
            </p>
            
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-4 py-2 w-full"
              required
              disabled={isLoading}
            />
            <button
              onClick={handleForgotPasswordNext}
              className="mt-4 w-full bg-blue-900 text-white rounded py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'SEND CODE'
              )}
            </button>
            
            <button
              onClick={() => setStep(0)}
              className="mt-2 text-sm text-gray-500 hover:underline"
              disabled={isLoading}
            >
              ← Back to Login
            </button>
          </>
        )}

        {/* ---------------- STEP 2 — enter 6‑digit code ---------------- */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-4">Verify Code</h2>
            <p className="mb-3 text-sm text-gray-600">
              Enter the 6-digit code sent to <br />
              <span className="font-semibold">{email}</span>
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {code.map((val, i) => (
                <input
                  key={i}
                  data-index={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  className="w-12 h-12 text-center border rounded text-lg font-semibold focus:border-blue-500 focus:outline-none"
                  disabled={isLoading}
                />
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mb-4">
              Code expires in 15 minutes
            </p>
            
            <button
              onClick={handleCodeVerification}
              className="w-full bg-blue-900 text-white rounded py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'VERIFY CODE'
              )}
            </button>
            
            <button
              onClick={() => setStep(1)}
              className="mt-2 text-sm text-gray-500 hover:underline"
              disabled={isLoading}
            >
              ← Back to Email
            </button>
          </>
        )}

        {/* ---------------- STEP 3 — reset password ---------------- */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold mb-4">Set New Password</h2>
            <p className="text-sm text-gray-600 mb-4">
              Create a strong password for your account
            </p>
            
            <div className="flex flex-col gap-3">
              <input
                type="password"
                placeholder="Enter New Password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="border rounded px-4 py-2 w-full"
                minLength={6}
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmNew}
                onChange={(e) => setConfirmNew(e.target.value)}
                className="border rounded px-4 py-2 w-full"
                minLength={6}
                disabled={isLoading}
              />
            </div>
            
            <p className="text-xs text-gray-500 mt-2 mb-4">
              Password must be at least 6 characters long
            </p>
            
            <button
              onClick={handlePasswordReset}
              className="w-full bg-blue-900 text-white rounded py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'UPDATE PASSWORD'
              )}
            </button>
          </>
        )}

        {/* ---------------- CLOSE BUTTON (all steps) ---------------- */}
        <button
          onClick={handleClose}
          className="mt-4 text-sm text-gray-500 hover:underline block mx-auto"
          disabled={isLoading}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LoginModal;