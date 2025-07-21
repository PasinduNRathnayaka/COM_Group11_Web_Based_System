import React, { useState, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import logo from '../../assets/kamal-logo.png'; // ✅ replace with actual path

const AttendanceScanner = () => {
  const [cameraActive, setCameraActive] = useState(true);
  const [mode, setMode] = useState('checkIn');
  const [scannedData, setScannedData] = useState('');
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    if (!cameraActive) {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      return;
    }

    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera for mirror:', error);
        setMessage('❌ Unable to access camera for mirror');
      }
    };

    enableCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  const handleScan = async (data) => {
    if (data && !scanning) {
      setScanning(true);
      setScannedData(data);

      try {
        await axios.post('http://localhost:4000/api/attendance/mark', {
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

      setTimeout(() => {
        setMessage('');
        setScanning(false);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center p-4">
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-4">
        <img src={logo} alt="Kamal Auto Parts Logo" className="w-20 h-20 object-contain mb-2" />
        <h1 className="text-2xl font-bold text-gray-900">Kamal Auto Parts</h1>
      </div>

      {/* QR Reader hidden but running */}
      <div
        style={{
          visibility: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          position: 'absolute',
          height: 0,
          width: 0,
        }}
      >
        {cameraActive && (
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={(result, error) => {
              if (!!result) {
                handleScan(result?.text);
              }
            }}
            containerStyle={{ width: '100%', height: '100%' }}
            videoStyle={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

      {/* Mirror Preview - Small */}
      <div className="mt-4 border rounded-lg overflow-hidden shadow-lg bg-black">
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '300px',
              height: '200px',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
            }}
          />
        ) : (
          <div className="w-[300px] h-[200px] flex items-center justify-center bg-gray-200">
            <p className="text-gray-500">Camera is off</p>
          </div>
        )}
      </div>

      {/* Mode Selector */}
      <div className="mt-4">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded shadow"
        >
          <option value="checkIn">Check In</option>
          <option value="checkOut">Check Out</option>
        </select>
      </div>

      {/* Toggle Camera */}
      <button
        onClick={() => setCameraActive((prev) => !prev)}
        className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
      >
        {cameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
      </button>

      {/* Result Message */}
      {message && (
        <div className="mt-5 bg-green-100 text-green-800 px-6 py-3 rounded shadow text-center text-lg font-semibold border border-green-300">
          {message}
        </div>
      )}
    </div>
  );
};

export default AttendanceScanner;
