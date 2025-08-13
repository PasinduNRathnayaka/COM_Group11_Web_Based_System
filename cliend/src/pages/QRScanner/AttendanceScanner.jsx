import React, { useState, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import logo from '../../assets/kamal-logo.png'; // ✅ replace with actual path

const AttendanceScanner = () => {
  const [cameraActive, setCameraActive] = useState(true);
  const [scannedData, setScannedData] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'warning'
  const [scanning, setScanning] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [showGreeting, setShowGreeting] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [lastScanTime, setLastScanTime] = useState(0);

  const videoRef = useRef(null);
  const SCAN_COOLDOWN = 3000; // 3 seconds cooldown between scans

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

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
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera for mirror:', error);
        setMessage('❌ Unable to access camera. Please check camera permissions.');
        setMessageType('error');
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
    const currentTime = Date.now();
    
    // Prevent scanning if:
    // 1. Already processing a scan
    // 2. Showing greeting 
    // 3. Same QR code scanned within cooldown period
    if (data && !scanning && !showGreeting) {
      // Check if this is the same QR code scanned recently
      if (lastScannedCode === data && (currentTime - lastScanTime) < SCAN_COOLDOWN) {
        console.log('Duplicate scan detected, ignoring...');
        return; // Ignore duplicate scan within cooldown period
      }

      setScanning(true);
      setScannedData(data);
      setLastScannedCode(data);
      setLastScanTime(currentTime);

      // Show scanning message
      setMessage('📱 Processing QR Code...');
      setMessageType('warning');

      try {
        const response = await axios.post('http://localhost:4000/api/attendance/mark', {
          qrData: data,
        });

        // Get employee name and attendance type from response
        const { employeeName, attendanceType, checkInTime, checkOutTime } = response.data;
        setEmployeeName(employeeName);

        // Show greeting message
        setShowGreeting(true);
        const now = new Date().toLocaleTimeString('en-US', { hour12: false });
        
        let greetingMsg;
        if (attendanceType === 'checkIn') {
          greetingMsg = `🌅 Good morning, ${employeeName}!\nWelcome to Kamal Auto Parts!\nCheck-in time: ${checkInTime || now}`;
        } else {
          greetingMsg = `🌅 Goodbye, ${employeeName}!\nSee you again at Kamal Auto Parts!\nCheck-out time: ${checkOutTime || now}`;
        }
        
        setMessage(greetingMsg);
        setMessageType('success');

        // Log the response for debugging
        console.log('Attendance marked successfully:', response.data);

      } catch (err) {
        console.error('Attendance marking failed:', err);
        
        // More detailed error messages
        let errorMsg = '❌ Attendance failed';
        if (err.response?.data?.message) {
          errorMsg = `❌ ${err.response.data.message}`;
        } else if (err.code === 'NETWORK_ERROR') {
          errorMsg = '❌ Network error. Please check your connection.';
        } else if (err.code === 'ECONNREFUSED') {
          errorMsg = '❌ Server connection failed. Please contact IT support.';
        }
        
        setMessage(errorMsg);
        setMessageType('error');
      }

      // Clear message after 5 seconds and reset scanning state
      setTimeout(() => {
        setMessage('');
        setMessageType('');
        setScanning(false);
        setScannedData('');
        setShowGreeting(false);
        setEmployeeName('');
        // Don't clear lastScannedCode and lastScanTime here to maintain cooldown
      }, 5000);
    }
  };

  const handleError = (error) => {
    console.error('QR Scanner error:', error);
    // Don't show error message for every scan attempt
    // Only show if there's a persistent issue
  };

  const getMessageStyle = () => {
    const baseStyle = "mt-5 px-6 py-4 rounded-lg shadow-lg text-center text-lg font-semibold border-2";
    
    switch (messageType) {
      case 'success':
        return `${baseStyle} bg-green-50 text-green-800 border-green-300`;
      case 'error':
        return `${baseStyle} bg-red-50 text-red-800 border-red-300`;
      case 'warning':
        return `${baseStyle} bg-yellow-50 text-yellow-800 border-yellow-300`;
      default:
        return `${baseStyle} bg-blue-50 text-blue-800 border-blue-300`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-gray-800 flex flex-col items-center justify-center p-4">
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-6">
        <img src={logo} alt="Kamal Auto Parts Logo" className="w-24 h-24 object-contain mb-3 drop-shadow-lg" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kamal Auto Parts</h1>
        <p className="text-lg text-gray-600 font-medium">Employee Attendance System</p>
      </div>

      {/* Current Time Display */}
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-500 mb-1">Current Time</p>
        <p className="text-lg font-mono font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
          {currentTime}
        </p>
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
        {cameraActive && !showGreeting && (
          <QrReader
            constraints={{ 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }}
            onResult={(result, error) => {
              if (result) {
                handleScan(result?.text);
              }
              if (error) {
                handleError(error);
              }
            }}
            containerStyle={{ width: '100%', height: '100%' }}
            videoStyle={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

      {/* Mirror Preview */}
      <div className="mt-4 border-2 border-gray-300 rounded-xl overflow-hidden shadow-xl bg-black">
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '320px',
              height: '240px',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
            }}
          />
        ) : (
          <div className="w-[320px] h-[240px] flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-gray-500">Camera is turned off</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="mt-4 text-center">
        {showGreeting ? (
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg border border-blue-300">
            <span className="font-medium">🚫 Scanning disabled during greeting</span>
          </div>
        ) : scanning ? (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-300">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span className="font-medium">Processing...</span>
            </div>
          </div>
        ) : (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg border border-green-300">
            <span className="font-medium">✅ Ready to scan QR code</span>
            {lastScannedCode && (
              <div className="text-xs mt-1 opacity-75">
                Last scan: {new Date(lastScanTime).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toggle Camera */}
      <button
        onClick={() => setCameraActive((prev) => !prev)}
        className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md disabled:opacity-50"
        disabled={scanning || showGreeting}
      >
        {cameraActive ? '📷 Turn Camera Off' : '📷 Turn Camera On'}
      </button>

      {/* Scanned Data Display (for debugging) */}
      {scannedData && (
        <div className="mt-3 bg-gray-100 px-4 py-2 rounded-lg">
          <p className="text-xs text-gray-600">Last Scanned: <span className="font-mono">{scannedData}</span></p>
        </div>
      )}

      {/* Result Message / Greeting */}
      {message && (
        <div className={getMessageStyle()}>
          <div className="whitespace-pre-line">
            {message}
          </div>
          {showGreeting && (
            <div className="mt-3 text-sm opacity-75">
              This message will disappear in 5 seconds...
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 max-w-md text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Instructions:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>1. Hold your QR code in front of the camera</li>
          <li>2. First scan = Check In, Second scan = Check Out</li>
          <li>3. Wait for the greeting message to complete</li>
          <li>4. Wait 3 seconds between scans to avoid duplicates</li>
          <li>5. Make sure the camera has good lighting</li>
        </ul>
      </div>
    </div>
  );
};

export default AttendanceScanner;