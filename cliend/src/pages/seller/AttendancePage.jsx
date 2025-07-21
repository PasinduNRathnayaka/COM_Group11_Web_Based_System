import React, { useEffect, useState } from "react";
import axios from "axios";

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("all");

  // Fetch attendance records for a specific date (main list)
  const fetchAttendance = async (date) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/attendance?date=${date}`);
      setAttendanceData(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  };

  // Fetch full attendance history of a single employee (for "View Attendance")
  const fetchEmployeeAttendance = async (employeeId) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/attendance?employeeId=${employeeId}`);
      setEmployeeHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch employee attendance history:", err);
    }
  };

  // Handle clicking "View Attendance" button: set employee and load their attendance
  const handleViewAttendance = (employee) => {
    setViewingEmployee(employee);
    setSelectedMonth("all");
    fetchEmployeeAttendance(employee._id);
  };

  // Handle going back to main attendance list
  const handleBack = () => {
    setViewingEmployee(null);
    setEmployeeHistory([]);
  };

  // Helper to get unique attendance per date (remove duplicate dates if any)
  const getUniqueAttendanceByDate = (records) => {
    const map = new Map();
    records.forEach((record) => {
      if (!map.has(record.date)) {
        map.set(record.date, record);
      }
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  return (
    <div className="bg-[#f3f3f3] min-h-screen p-6">
      {/* Top bar with title and date picker */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Attendance</h2>
          <p className="text-sm text-gray-500">Home &gt; Attendance</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* If viewingEmployee is set, show detailed employee attendance */}
      {viewingEmployee ? (
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            {/* Employee Info */}
            <div className="flex items-center gap-4">
              <img
                src={`http://localhost:4000${viewingEmployee.image}`}
                alt={viewingEmployee.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="text-base font-medium">{viewingEmployee.name}</p>
                <p className="text-sm text-gray-500">{viewingEmployee.category}</p>
              </div>
            </div>

            <button
              onClick={handleBack}
              className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
            >
              ← Back
            </button>
          </div>

          {/* Month Filter Dropdown */}
          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm text-gray-600">Filter by Month:</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All</option>
              {[...Array(12)].map((_, i) => {
                const monthName = new Date(0, i).toLocaleString("default", {
                  month: "long",
                });
                return (
                  <option key={i} value={i + 1}>
                    {monthName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Attendance History Table */}
          <h3 className="text-lg font-semibold mb-3">Attendance History</h3>
          <table className="w-full table-auto text-sm">
            <thead className="border-b border-gray-300 text-left">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Check In</th>
                <th className="py-2">Check Out</th>
              </tr>
            </thead>
            <tbody>
              {getUniqueAttendanceByDate(employeeHistory)
                .filter((record) => {
                  if (selectedMonth === "all") return true;
                  const month = new Date(record.date).getMonth() + 1;
                  return month === parseInt(selectedMonth);
                })
                .map((record, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">{record.date}</td>
                    <td className="py-2">{record.checkIn || "--"}</td>
                    <td className="py-2">{record.checkOut || "--"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
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
                <button
                  className="text-xs text-blue-600 underline"
                  onClick={() => handleViewAttendance(att.employee)}
                >
                  View Attendance
                </button>
              </div>
            ))}
          </div>

          {/* Main Attendance List Table */}
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
                      <button
                        className="text-xs text-blue-600 underline"
                        onClick={() => handleViewAttendance(att.employee)}
                      >
                        View Attendance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendancePage;
