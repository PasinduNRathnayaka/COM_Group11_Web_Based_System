import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
import { assets } from '../assets/assets';

const LoginModal = ({ isOpen, onClose, onSignInClick }) => {
  const { setUser } = useAppContext();

  const [step, setStep] = useState(0); // 0 = login, 1 = email, 2 = code, 3 = reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ name: 'John Doe', profilePic: assets.profile2 });
    onClose();
  };

  const handleCodeChange = (index, value) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md text-center">
        {/* STEP 0: LOGIN */}
        {step === 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              <input type="text" placeholder="Username" className="border rounded px-4 py-2" />
              <input type="password" placeholder="Password" className="border rounded px-4 py-2" />
              <button type="submit" className="bg-blue-900 text-white rounded px-4 py-2">LOGIN</button>
            </form>
            <button
              className="mt-2 text-sm text-blue-900 hover:underline"
              onClick={() => setStep(1)}
            >
              Forgot Password?
            </button>
            <div className="mt-3 text-sm">
              <span>Don't have an account? </span>
              <button onClick={onSignInClick} className="text-blue-900 hover:underline font-semibold">Sign Up</button>
            </div>
          </>
        )}

        {/* STEP 1: ENTER EMAIL */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-4 py-2 w-full"
            />
            <button
              onClick={() => setStep(2)}
              className="mt-4 w-full bg-blue-900 text-white rounded py-2"
            >
              NEXT 
            </button>
          </>
        )}

        {/* STEP 2: ENTER 4-DIGIT CODE */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
            <p className="mb-3">Enter 4 Digit Code</p>
            <div className="flex justify-center gap-2">
              {code.map((value, index) => (
                <input
                  key={index}
                  maxLength={1}
                  className="w-12 h-12 text-center border rounded"
                  value={value}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
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

        {/* STEP 3: RESET PASSWORD */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <input
              type="password"
              placeholder="Enter New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded px-4 py-2 mb-2 w-full"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="border rounded px-4 py-2 w-full"
            />
            <button
              onClick={() => {
                alert("Password updated!");
                setStep(0); // back to login
              }}
              className="mt-4 w-full bg-blue-900 text-white rounded py-2"
            >
              Save
            </button>
          </>
        )}

        {/* COMMON CLOSE BUTTON */}
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
