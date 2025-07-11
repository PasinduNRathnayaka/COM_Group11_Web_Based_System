import React from "react";
import EmployeeTopNavbar from "./EmployeeTopNavbar";
import ViewAttendanceNavbar from "./ViewAttendanceNavbar";

const attendanceData = [
  { date: "01/06/2025", checkIn: "09:13", checkOut: "18:27", totalHours: "7", status: "Present" },
  { date: "02/06/2025", checkIn: "09:27", checkOut: "18:34", totalHours: "7", status: "Present" },
  { date: "03/06/2025", checkIn: "09:15", checkOut: "18:31", totalHours: "7", status: "Present" },
  { date: "04/06/2025", checkIn: "-", checkOut: "-", totalHours: "-", status: "Absent" },
  { date: "05/06/2025", checkIn: "09:18", checkOut: "18:30", totalHours: "7", status: "Present" },
  { date: "06/06/2025", checkIn: "09:02", checkOut: "18:05", totalHours: "7", status: "Present" },
  { date: "07/06/2025", checkIn: "09:07", checkOut: "18:15", totalHours: "7", status: "Present" },
];

const ViewAttendance = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <EmployeeTopNavbar />

      <div className="flex">
        <ViewAttendanceNavbar />

        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Attendance</h2>
              <p className="text-sm text-gray-500">Home &gt; Attendance</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">EMPLOYEE</button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-4">
              <img
                src="/avatar.png"
                alt="Employee"
                className="mx-auto rounded-full w-20 h-20 mb-2 object-cover"
              />
              <h3 className="text-lg font-semibold">My Attendance</h3>
            </div>

            <div className="flex justify-end mb-4">
              <input
                type="date"
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                defaultValue="2025-06-03"
              />
            </div>

            <table className="w-full text-center border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Check In</th>
                  <th className="p-2 border">Check Out</th>
                  <th className="p-2 border">Total Hours</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((entry, index) => (
                  <tr key={index} className="border">
                    <td className="p-2 border">{entry.date}</td>
                    <td className="p-2 border">{entry.checkIn}</td>
                    <td className="p-2 border">{entry.checkOut}</td>
                    <td className="p-2 border">{entry.totalHours}</td>
                    <td className="p-2 border">{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex items-center gap-4">
              <label className="text-sm">Monthly Attendance</label>
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm"
                placeholder="Search..."
              />
              <select className="border rounded px-2 py-1 text-sm">
                <option>Year</option>
                <option value="2021">2021</option>
                <option value="2025">2025</option>
              </select>
              <select className="border rounded px-2 py-1 text-sm">
                <option>Month</option>
                <option value="Jan">Jan</option>
                <option value="Feb">Feb</option>
                <option value="Mar">Mar</option>
                <option value="Apr">Apr</option>
                <option value="May">May</option>
                <option value="Jun">Jun</option>
                <option value="Jul">Jul</option>
                <option value="Aug">Aug</option>
                <option value="Sep">Sep</option>
                <option value="Oct">Oct</option>
                <option value="Nov">Nov</option>
                <option value="Dec">Dec</option>
              </select>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewAttendance;
