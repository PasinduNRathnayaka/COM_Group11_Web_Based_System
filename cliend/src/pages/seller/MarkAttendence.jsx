import React from "react";

const attendanceData = [
  {
    empNo: "EMP001",
    name: "John Doe",
    avatar: "/avatar.png",     // Replace with actual image
    date: "2025-07-07",
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
  },
  {
    empNo: "EMP002",
    name: "Jane Smith",
    avatar: "/avatar.png",
    date: "2025-07-07",
    checkIn: "09:15 AM",
    checkOut: "06:05 PM",
  },
  {
    empNo: "EMP003",
    name: "Alice Johnson",
    avatar: "/avatar.png",
    date: "2025-07-07",
    checkIn: "08:55 AM",
    checkOut: "05:50 PM",
  },
];

const AttendancePage = () => {
  return (
    <div className="bg-[#f3f3f3] min-h-screen p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Attendance</h2>
          <p className="text-sm text-gray-500">Home &gt; Attendance</p>
        </div>

        {/* Year/Month Picker */}
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

      {/* Employee Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-gray-300 rounded-full mb-2" />
              <p className="text-sm font-semibold">NAME</p>
              <p className="text-xs text-gray-500">TITLE</p>
              <div className="flex gap-2 my-2">
                <button className="bg-gray-200 text-xs px-3 py-1 rounded">Month</button>
                <button className="bg-gray-200 text-xs px-3 py-1 rounded">Year</button>
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
            {attendanceData.map((emp, index) => (
              <tr key={index} className="border-t">
                <td className="py-2">{emp.empNo}</td>
                <td className="py-2 flex items-center gap-2">
                  <img
                    src={emp.avatar}
                    alt="avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  {emp.name}
                </td>
                <td className="py-2">{emp.date}</td>
                <td className="py-2">{emp.checkIn}</td>
                <td className="py-2">{emp.checkOut}</td>
                <td className="py-2">
                  <button className="text-xs text-blue-600 underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
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
