import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import axios from "axios";

const AttendanceScanner = () => {
  const [result, setResult] = useState("");
  const [type, setType] = useState("checkIn");
  const [message, setMessage] = useState("");
  const [cameraActive, setCameraActive] = useState(true);

  const handleScan = async (data) => {
    if (data && data !== result) {
      setResult(data);
      try {
        await axios.post("http://localhost:4000/api/attendance/mark", {
          qrData: data,
          type,
        });

        // Message
        if (type === "checkIn") {
          setMessage("✅ Welcome to Kamal Auto Parts!");
        } else {
          setMessage("👋 Goodbye! See you again at Kamal Auto Parts!");
        }

        // Auto-clear after 5 sec
        setTimeout(() => {
          setMessage("");
          setResult("");
        }, 5000);
      } catch (err) {
        // ignore error silently
      }
    }
  };

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
    setMessage("");
    setResult("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 py-6">
      {/* Logo + Title */}
      <div className="text-center mb-4">
        <img
          src="/logo192.png"
          alt="Kamal Auto Parts"
          className="w-16 h-16 mx-auto mb-2"
        />
        <h2 className="text-2xl font-bold text-gray-800">Kamal Auto Parts</h2>
      </div>

      {/* Camera View */}
      <div className="w-full max-w-md aspect-video mb-4 rounded overflow-hidden shadow-lg">
        {cameraActive ? (
          <QrReader
            constraints={{ facingMode: "environment" }}
            onResult={(result) => {
              if (!!result) handleScan(result?.text);
            }}
            videoStyle={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black text-white text-lg">
            📷 Camera is Off
          </div>
        )}
      </div>

      {/* Mode Selector */}
      <div className="mb-4">
        <label className="mr-2 font-medium text-gray-700">Mode:</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1"
        >
          <option value="checkIn">Check In</option>
          <option value="checkOut">Check Out</option>
        </select>
      </div>

      {/* Camera Toggle */}
      <button
        onClick={toggleCamera}
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
      >
        {cameraActive ? "Turn Camera Off" : "Turn Camera On"}
      </button>

      {/* Message */}
      {message && (
        <div className="text-lg font-semibold text-green-700 text-center">
          {message}
        </div>
      )}
    </div>
  );
};

export default AttendanceScanner;
