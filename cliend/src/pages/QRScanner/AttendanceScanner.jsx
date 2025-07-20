import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import logo from '../../assets/kamal-logo.png'; // ✅ replace with your actual logo path

const AttendanceScanner = () => {
  const [cameraActive, setCameraActive] = useState(true);
  const [mode, setMode] = useState('checkIn');
  const [scannedData, setScannedData] = useState('');
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleScan = async (data) => {
    if (data && !scanning) {
      setScanning(true);
      setScannedData(data);

      try {
        const res = await axios.post('http://localhost:4000/api/attendance/mark', {
          qrData: data,
          type: mode,
        });

        const msg =
          mode === 'checkIn'
            ? '✅ Welcome to Kamal Auto Parts!'
            : '👋 Goodbye. See you again at Kamal Auto Parts!';
        setMessage(msg);
      } catch (err) {
        setMessage(err.response?.data?.message || '❌ Attendance failed');
      }

      // Clear message after 5s and allow scanning again
      setTimeout(() => {
        setMessage('');
        setScanning(false);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-4">
        <img src={logo} alt="Kamal Auto Parts Logo" className="w-20 h-20 object-contain mb-2" />
        <h1 className="text-2xl font-bold">Kamal Auto Parts</h1>
      </div>

      {/* Camera and controls */}
      <div className="relative w-full max-w-md rounded-lg overflow-hidden shadow-lg">
        {cameraActive ? (
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={(result, error) => {
              if (!!result) {
                handleScan(result?.text);
              }
            }}
            containerStyle={{ width: '100%' }}
            videoStyle={{ width: '100%' }}
          />
        ) : (
          <div className="w-full h-72 bg-gray-900 flex items-center justify-center">
            <p className="text-gray-400">Camera is off</p>
          </div>
        )}
      </div>

      {/* Mode dropdown */}
      <div className="mt-4">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded shadow"
        >
          <option value="checkIn">Check In</option>
          <option value="checkOut">Check Out</option>
        </select>
      </div>

      {/* Camera toggle */}
      <button
        onClick={() => setCameraActive((prev) => !prev)}
        className="mt-3 bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600 transition"
      >
        {cameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
      </button>

      {/* Message */}
      {message && (
        <div className="mt-5 bg-white text-black px-6 py-3 rounded shadow text-center text-lg font-semibold">
          {message}
        </div>
      )}
    </div>
  );
};

export default AttendanceScanner;
