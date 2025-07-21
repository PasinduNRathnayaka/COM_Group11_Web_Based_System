import React, { useEffect, useState } from "react";
import axios from "axios";

const MonthlySalary = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const fetchSalarySummary = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/attendance/monthly-summary?month=${selectedMonth}`);
      setSalaryData(res.data);
    } catch (err) {
      console.error("Failed to fetch monthly salary summary:", err);
    }
  };

  useEffect(() => {
    fetchSalarySummary();
  }, [selectedMonth]);

  return (
    <div className="bg-[#f3f3f3] min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Monthly Salary Summary</h2>
          <p className="text-sm text-gray-500">Home &gt; Salary</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {salaryData.map((emp, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow text-center">
            <img
              src={`http://localhost:4000${emp.image}`}
              alt={emp.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
            />
            <h3 className="text-base font-semibold mb-1">{emp.name}</h3>
            <p className="text-sm text-gray-500">ID: {emp.empId}</p>
            <p className="text-sm text-gray-600 mt-1">Hourly Rate: Rs:{emp.rate}</p>
            <p className="text-sm text-gray-600">Total Hours: {emp.totalHours}</p>
            <p className="text-base font-bold text-green-700 mt-2">Salary: Rs:{emp.salary}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Detailed Salary Table</h3>
        <table className="w-full table-auto text-sm">
          <thead className="border-b border-gray-300 text-left">
            <tr>
              <th className="py-2">Employee ID</th>
              <th className="py-2">Name</th>
              <th className="py-2">Hourly Rate</th>
              <th className="py-2">Total Hours</th>
              <th className="py-2">Salary</th>
            </tr>
          </thead>
          <tbody>
            {salaryData.map((emp, i) => (
              <tr key={i} className="border-t">
                <td className="py-2">{emp.empId}</td>
                <td className="py-2">{emp.name}</td>
                <td className="py-2">Rs:{emp.rate}</td>
                <td className="py-2">{emp.totalHours}</td>
                <td className="py-2 font-bold">Rs:{emp.salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlySalary;
