import React, { useEffect, useState } from "react";
import axios from "axios";

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const currentYear = new Date().getFullYear();

  const fetchAttendance = async (date) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/attendance?date=${date}`);
      setAttendanceData(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      setAttendanceData([]);
    }
  };

  const fetchEmployeeAttendance = async (employeeId) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/attendance?employeeId=${employeeId}`);
      setEmployeeHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch employee attendance history:", err);
      setEmployeeHistory([]);
    }
  };

  const handleViewAttendance = (employee) => {
    setViewingEmployee(employee);
    setSelectedMonth("all");
    setSelectedYear("all");
    fetchEmployeeAttendance(employee._id);
  };

  const handleBack = () => {
    setViewingEmployee(null);
    setEmployeeHistory([]);
  };

  const processEmployeeHistory = (records) => {
    const grouped = {};
    records.forEach(({ date, checkIn, checkOut }) => {
      if (!grouped[date]) {
        grouped[date] = {
          date,
          checkIn: checkIn || null,
          checkOut: checkOut || null,
        };
      } else {
        // If multiple records exist for same date, take earliest checkIn and latest checkOut
        if (checkIn) {
          if (!grouped[date].checkIn || checkIn < grouped[date].checkIn) {
            grouped[date].checkIn = checkIn;
          }
        }
        if (checkOut) {
          if (!grouped[date].checkOut || checkOut > grouped[date].checkOut) {
            grouped[date].checkOut = checkOut;
          }
        }
      }
    });

    return Object.values(grouped).sort((a, b) => (a.date < b.date ? 1 : -1));
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "--";

    try {
      // Parse time strings in HH:MM:SS format
      const [inH, inM, inS = 0] = checkIn.split(":").map(Number);
      const [outH, outM, outS = 0] = checkOut.split(":").map(Number);

      // Convert to minutes for easier calculation
      const checkInMinutes = inH * 60 + inM + inS / 60;
      const checkOutMinutes = outH * 60 + outM + outS / 60;

      let durationMinutes = checkOutMinutes - checkInMinutes;

      // Handle overnight shifts (checkout next day)
      if (durationMinutes < 0) {
        durationMinutes += 24 * 60; // Add 24 hours in minutes
      }

      const hours = durationMinutes / 60;

      // Validate reasonable working hours (0-24 hours)
      if (isNaN(hours) || hours < 0 || hours > 24) {
        return "--";
      }

      return hours.toFixed(2);
    } catch (err) {
      console.error("Error calculating hours:", err);
      return "--";
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  return (
    <div className="bg-[#f3f3f3] min-h-screen p-6">
      {/* Top bar */}
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

      {viewingEmployee ? (
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <img
                src={`http://localhost:4000${viewingEmployee.image}`}
                alt={viewingEmployee.name}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = "/default-avatar.png"; // fallback image
                }}
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

          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600">Filter by Month:</label>
              <select
                className="border rounded px-2 py-1 text-sm ml-2"
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

            <div>
              <label className="text-sm text-gray-600">Filter by Year:</label>
              <select
                className="border rounded px-2 py-1 text-sm ml-2"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="all">All</option>
                {[...Array(5)].map((_, i) => {
                  const year = currentYear - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* History table */}
          <h3 className="text-lg font-semibold mb-3">Attendance History</h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead className="border-b border-gray-300 text-left">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Check In</th>
                  <th className="py-2">Check Out</th>
                  <th className="py-2">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {processEmployeeHistory(employeeHistory)
                  .filter((record) => {
                    const recordDate = new Date(record.date);
                    const month = recordDate.getMonth() + 1;
                    const year = recordDate.getFullYear();

                    const monthMatch =
                      selectedMonth === "all" || parseInt(selectedMonth) === month;
                    const yearMatch =
                      selectedYear === "all" || parseInt(selectedYear) === year;

                    return monthMatch && yearMatch;
                  })
                  .map((record, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2">{record.date}</td>
                      <td className="py-2">{record.checkIn || "--"}</td>
                      <td className="py-2">{record.checkOut || "--"}</td>
                      <td className="py-2">
                        {calculateHours(record.checkIn, record.checkOut)}
                      </td>
                    </tr>
                  ))}
                {processEmployeeHistory(employeeHistory).filter((record) => {
                  const recordDate = new Date(record.date);
                  const month = recordDate.getMonth() + 1;
                  const year = recordDate.getFullYear();

                  const monthMatch =
                    selectedMonth === "all" || parseInt(selectedMonth) === month;
                  const yearMatch =
                    selectedYear === "all" || parseInt(selectedYear) === year;

                  return monthMatch && yearMatch;
                }).length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      No attendance records found for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Cards */}
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
                  onError={(e) => {
                    e.target.src = "/default-avatar.png"; // fallback image
                  }}
                />
                <p className="text-sm font-semibold">{att.employee.name}</p>
                <p className="text-xs text-gray-500">{att.employee.category}</p>
                <button
                  className="text-xs text-blue-600 underline mt-2 hover:text-blue-800"
                  onClick={() => handleViewAttendance(att.employee)}
                >
                  View Attendance
                </button>
              </div>
            ))}
            {attendanceData.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No attendance records found for {selectedDate}
              </div>
            )}
          </div>

          {/* Table view */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">Attendance List</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead className="border-b border-gray-300 text-left">
                  <tr>
                    <th className="py-2">Employee Number</th>
                    <th className="py-2">Employee Name</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Check in</th>
                    <th className="py-2">Check out</th>
                    <th className="py-2">Total Hours</th>
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
                          onError={(e) => {
                            e.target.src = "/default-avatar.png"; // fallback image
                          }}
                        />
                        {att.employee.name}
                      </td>
                      <td className="py-2">{att.date}</td>
                      <td className="py-2">{att.checkIn || "--"}</td>
                      <td className="py-2">{att.checkOut || "--"}</td>
                      <td className="py-2">{calculateHours(att.checkIn, att.checkOut)}</td>
                      <td className="py-2">
                        <button
                          className="text-xs text-blue-600 underline hover:text-blue-800"
                          onClick={() => handleViewAttendance(att.employee)}
                        >
                          View Attendance
                        </button>
                      </td>
                    </tr>
                  ))}
                  {attendanceData.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-4 text-center text-gray-500">
                        No attendance records found for {selectedDate}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendancePage;