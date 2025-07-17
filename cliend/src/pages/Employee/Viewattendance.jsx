// src/pages/Employee/Viewattendance.jsx
import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";

const attendanceData = [
  { date: "01/06/2025", checkIn: "09:13", checkOut: "18:27", totalHours: "7", status: "Present" },
  { date: "02/06/2025", checkIn: "09:27", checkOut: "18:34", totalHours: "7", status: "Present" },
  { date: "03/06/2025", checkIn: "09:15", checkOut: "18:31", totalHours: "7", status: "Present" },
  { date: "03/06/2025", checkIn: "-", checkOut: "-", totalHours: "-", status: "Absent" },
  { date: "03/06/2025", checkIn: "09:18", checkOut: "18:30", totalHours: "7", status: "Present" },
  { date: "03/06/2025", checkIn: "09:02", checkOut: "18:05", totalHours: "7", status: "Present" },
  { date: "03/06/2025", checkIn: "09:07", checkOut: "18:15", totalHours: "7", status: "Present" },
];

const Viewattendance = () => {
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Top Navbar */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Attendance</h2>
            <p className="text-sm text-gray-600">Home &gt; Attendance</p>
          </div>
        </header>

        {/* Profile Section */}
        <section className="text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Employee"
            className="w-20 h-20 mx-auto mb-2"
          />
          <h3 className="text-lg font-semibold mb-4">My Attendance</h3>

          {/* Date Picker */}
          <div className="flex justify-end mb-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            />
          </div>

          {/* Attendance Table */}
          <div className="bg-white shadow-md rounded p-4 max-w-4xl mx-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((entry, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2">{entry.date}</td>
                    <td>{entry.checkIn}</td>
                    <td>{entry.checkOut}</td>
                    <td>{entry.totalHours}</td>
                    <td className={entry.status === "Absent" ? "text-red-500" : "text-green-600"}>{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Monthly Attendance */}
          <div className="mt-8 text-left max-w-4xl mx-auto">
            <h4 className="text-sm font-semibold mb-2">Monthly Attendance</h4>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder=""
                className="border px-2 py-1 rounded w-1/3"
              />
              <div className="flex items-center gap-2">
                <label className="text-sm">Year</label>
                <select className="border rounded px-2 py-1 text-sm">
                  <option>2021</option>
                  <option>2022</option>
                  <option>2023</option>
                  <option>2024</option>
                  <option>2025</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">Month</label>
                <select className="border rounded px-2 py-1 text-sm">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-500">
          © 2025 · Employee Dashboard
        </footer>
      </main>
    </div>
  );
};

export default Viewattendance;
