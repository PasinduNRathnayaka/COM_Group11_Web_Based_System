import React, { useEffect, useState } from 'react';
import QrReader from 'react-qr-scanner';

const employees = {
  'EMP001': 'Pasindu Niroshan',
  'EMP002': 'Sewwandi Perera',
  'EMP003': 'Kamal Fernando',
};

// Helper functions
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const getCurrentDateTime = () => {
  const now = new Date();
  return {
    time: now.toLocaleTimeString(),
    date: now.toLocaleDateString(),
  };
};

const MarkAttendance = () => {
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [scannedID, setScannedID] = useState(null);
  const [employeeName, setEmployeeName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setPermissionGranted(true))
      .catch(() => setPermissionGranted(false));
  }, []);

  const handleScan = (data) => {
    if (data && data.text !== scannedID) {
      const id = data.text.trim();
      setScannedID(id);

      const name = employees[id];
      const { time, date } = getCurrentDateTime();

      if (name) {
        setEmployeeName(name);
        setGreeting(`${getGreeting()}, ${name}!`);
        setTime(time);
        setDate(date);
      } else {
        setEmployeeName('');
        setGreeting(`❌ Unknown QR Code: ${id}`);
        setTime('');
        setDate('');
      }

      setTimeout(() => {
        setScannedID(null);
        setEmployeeName('');
        setGreeting('');
        setTime('');
        setDate('');
      }, 5000);
    }
  };

  const handleError = (err) => {
    console.error('QR Error:', err);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h1 className="text-3xl font-bold mb-6">QR Code Scanner</h1>

      {permissionGranted === null && (
        <p className="text-blue-600 mb-4">🔄 Requesting camera permission...</p>
      )}

      {permissionGranted === false && (
        <p className="text-red-600 mb-4">
          ❌ Camera access denied. Please enable it in your browser settings.
        </p>
      )}

      {permissionGranted === true && (
        <div className="relative p-1 border-4 border-green-500 bg-black shadow-lg" style={{ width: '320px', height: '320px' }}>
          {/* Black box with green border */}
          <div className="absolute top-0 left-0 w-full h-full z-10 bg-black" />
          {/* Camera QR scanner */}
          <div className="absolute top-0 left-0 w-full h-full z-20">
            <QrReader
              delay={300}
              style={{ width: '100%', height: '100%' }}
              onError={handleError}
              onScan={handleScan}
              constraints={{ facingMode: 'environment' }}
            />
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-700 italic">🔍 Scanning...</p>

      {greeting && (
        <div className="mt-6 w-full max-w-md bg-white rounded shadow p-4">
          <p className="text-green-700 text-lg font-bold mb-2">{greeting}</p>
          <p className="text-gray-700">🕒 Time: {time}</p>
          <p className="text-gray-700">📅 Date: {date}</p>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
