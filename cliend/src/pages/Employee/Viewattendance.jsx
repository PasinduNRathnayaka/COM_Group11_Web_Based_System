import React, { useEffect, useState } from "react";
import axios from "axios";

const Viewattendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [month, setMonth] = useState("07");
  const [year, setYear] = useState("2025");
  const employeeId = "687b9a5a87b84e56c311df78"; // TODO: Replace with actual logged-in employee ID

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/attendance/${employeeId}?month=${month}&year=${year}`
        );
        setAttendanceData(res.data);
      } catch (err) {
        console.error("Failed to fetch attendance", err);
      }
    };
    fetchAttendance();
  }, [employeeId, month, year]);

  const calculateHours = (checkIn, checkOut) => {
    try {
      const [h1, m1, s1] = checkIn.split(".").map(Number);
      const [h2, m2, s2] = checkOut.split(".").map(Number);
      const start = new Date(0, 0, 0, h1, m1, s1);
      const end = new Date(0, 0, 0, h2, m2, s2);
      const diff = (end - start) / 1000 / 60 / 60;
      return diff.toFixed(2);
    } catch {
      return "-";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Attendance</h2>
            <p className="text-sm text-gray-600">Home &gt; Attendance</p>
          </div>
        </header>

        <section className="text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Employee"
            className="w-20 h-20 mx-auto mb-2"
          />
          <h3 className="text-lg font-semibold mb-4">My Attendance</h3>

          {/* Filters */}
          <div className="flex justify-center gap-4 mb-4">
            <div>
              <label className="text-sm">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                {[2023, 2024, 2025].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                    {new Date(0, i).toLocaleString("default", { month: "short" })}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                  <tr key={index} className="border-b hover:bg-gray-50 text-center">
                      <td className="py-2">{entry.date}</td>
                      <td>{entry.checkIn.replaceAll(".", ":")}</td>
                      <td>{entry.checkOut.replaceAll(".", ":")}</td>
                      <td>{calculateHours(entry.checkIn, entry.checkOut)}</td>
                      <td className="text-green-600 font-semibold">Present</td>
                  </tr>

                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Viewattendance;
