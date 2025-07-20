import React, { useEffect, useState } from "react";
import axios from "axios";

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/attendance");
        setAttendanceData(res.data);
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <div className="bg-[#f3f3f3] min-h-screen p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Attendance</h2>
          <p className="text-sm text-gray-500">Home &gt; Attendance</p>
        </div>

        {/* Year/Month Picker (Static for now) */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Year</label>
          <select className="border rounded px-2 py-1 text-sm">
            <option>2025</option>
          </select>
          <label className="text-sm text-gray-700">Month</label>
          <select className="border rounded px-2 py-1 text-sm">
            <option>July</option>
          </select>
        </div>
      </div>

      {/* Employee Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {attendanceData.map((att, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow text-center flex flex-col items-center"
          >
            <img
              src={`http://localhost:4000${att.employee.image}`}
              alt={att.employee.name}
              className="w-16 h-16 rounded-full mb-2 object-cover"
            />
            <p className="text-sm font-semibold">{att.employee.name}</p>
            <p className="text-xs text-gray-500">{att.employee.category}</p>
            <div className="flex gap-2 my-2">
              <span className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded">
                IN: {att.checkIn || "--"}
              </span>
              <span className="text-xs px-3 py-1 bg-red-100 text-red-800 rounded">
                OUT: {att.checkOut || "--"}
              </span>
            </div>
            <button className="text-xs text-blue-600 underline">Profile Details</button>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Attendance List</h3>
        <table className="w-full table-auto text-sm">
          <thead className="border-b border-gray-300 text-left">
            <tr>
              <th className="py-2">Employee Number</th>
              <th className="py-2">Employee Name</th>
              <th className="py-2">Date</th>
              <th className="py-2">Check in</th>
              <th className="py-2">Check out</th>
              <th className="py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((att, index) => (
              <tr key={index} className="border-t">
                <td className="py-2">{att.employee.empId}</td>
                <td className="py-2 flex items-center gap-2">
                  <img
                    src={`http://localhost:4000${att.employee.image}`}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  {att.employee.name}
                </td>
                <td className="py-2">{att.date}</td>
                <td className="py-2">{att.checkIn || "--"}</td>
                <td className="py-2">{att.checkOut || "--"}</td>
                <td className="py-2">
                  <button className="text-xs text-blue-600 underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination placeholder */}
        <div className="flex justify-end gap-2 mt-4">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              className={`w-8 h-8 text-sm rounded ${
                num === 1
                  ? "bg-black text-white"
                  : "bg-white border border-gray-300"
              }`}
            >
              {num}
            </button>
          ))}
          <button className="w-8 h-8 text-sm rounded border border-gray-300">
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
