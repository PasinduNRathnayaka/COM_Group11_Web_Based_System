// pages/seller/MarkAttendance.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const mockEmployees = [
  { id: "EMP001", name: "Nuwan Perera", role: "Mechanic" },
  { id: "EMP002", name: "Kasun Silva", role: "Technician" },
  { id: "EMP003", name: "Dilani Perera", role: "Supervisor" },
];

const MarkAttendance = () => {
  const [attendanceLog, setAttendanceLog] = useState([]);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner("qr-reader", {
        fps: 10,
        qrbox: 250,
      });

      scannerRef.current.render(handleSuccess, handleError);
    }

    return () => {
      if (scannerRef.current?.clear) {
        scannerRef.current.clear().catch(err => console.error("Clear error:", err));
      }
    };
  }, []);

  const handleSuccess = (decodedText) => {
    const id = decodedText.replace("Attendance:", "").trim();
    const employee = mockEmployees.find(emp => emp.id === id);

    if (employee && !attendanceLog.find(e => e.id === id)) {
      setAttendanceLog(prev => [
        ...prev,
        {
          ...employee,
          time: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  const handleError = (error) => {
    // Optional: handle scan errors silently
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-6 text-center">📷 Mark Attendance by Scanning ID</h2>

      <div id="qr-reader" className="w-full max-w-md mx-auto mb-10" />

      {attendanceLog.length > 0 && (
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="text-lg font-semibold mb-2">🟢 Attendance Log:</h3>
          <ul className="space-y-2">
            {attendanceLog.map((emp, index) => (
              <li key={index} className="p-3 bg-green-100 rounded">
                ✅ {emp.name} ({emp.role}) at {emp.time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
