// src/components/LoginModel.jsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

import axios from 'axios';             
import toast from 'react-hot-toast';   

const LoginModal = ({ isOpen, onClose, onSignInClick }) => {
  const { setUser } = useAppContext();

  /* ---------- local state ---------- */
  const [step, setStep] = useState(0);      // 0 = login, 1 = email, 2 = code, 3 = reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [newPwd, setNewPwd] = useState('');
  const [confirmNew, setConfirmNew] = useState('');

  /* ---------- login handler ---------- */
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post('/api/user/login', {
        email,
        password,
      });

      // ✅ UPDATED: Store complete user data including profilePic
      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        number: data.number,
        address: data.address,
        profilePic: data.profilePic, // ✅ Make sure this is included
        token: data.token
      };

      // save user in context + localStorage
      setUser(userData);

      toast.success('Logged in!');
      onClose();
      setStep(0);
      setEmail(''); 
      setPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  /* ---------- forgot‑password helpers (kept minimal) ---------- */
  const handleCodeChange = (i, val) => {
    const tmp = [...code];
    tmp[i] = val;
    setCode(tmp);
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
              <button type="submit" className="bg-blue-900 text-white rounded px-4 py-2">
                LOGIN
              </button>
            </form>

            <button
              className="mt-2 text-sm text-blue-900 hover:underline"
              onClick={() => setStep(1)}
            >
              Forgot Password?
            </button>

            <div className="mt-3 text-sm">
              <span>Don't have an account? </span>
              <button
                onClick={onSignInClick}
                className="text-blue-900 hover:underline font-semibold"
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
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-4 py-2 w-full"
              required
            />
            <button
              onClick={() => setStep(2)}
              className="mt-4 w-full bg-blue-900 text-white rounded py-2"
            >
              NEXT
            </button>
          </>
        )}

        {/* ---------------- STEP 2 — enter 4‑digit code ---------------- */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
            <p className="mb-3">Enter 4 Digit Code</p>
            <div className="flex justify-center gap-2">
              {code.map((val, i) => (
                <input
                  key={i}
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  className="w-12 h-12 text-center border rounded"
                />
              ))}
            </div>
            <button
              onClick={() => setStep(3)}
              className="mt-4 w-full bg-blue-900 text-white rounded py-2"
            >
              NEXT
            </button>
          </>
        )}

        {/* ---------------- STEP 3 — reset password ---------------- */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <input
              type="password"
              placeholder="Enter New Password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="border rounded px-4 py-2 mb-2 w-full"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmNew}
              onChange={(e) => setConfirmNew(e.target.value)}
              className="border rounded px-4 py-2 w-full"
            />
            <button
              onClick={() => {
                toast('Password updated (dummy)', { icon: '✅' });
                setStep(0);
                setNewPwd(''); setConfirmNew('');
              }}
              className="mt-4 w-full bg-blue-900 text-white rounded py-2"
            >
              Save
            </button>
          </>
        )}

        {/* ---------------- CLOSE BUTTON (all steps) ---------------- */}
        <button
          onClick={() => {
            onClose();
            setStep(0);
          }}
          className="mt-4 text-sm text-gray-500 hover:underline block mx-auto"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LoginModal;