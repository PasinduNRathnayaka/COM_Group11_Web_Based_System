import React, { useState } from 'react';
import axios from 'axios';

const MonthlySalary = () => {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSalary = async () => {
    if (!month || !year) {
      alert('Please select month and year');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:4000/api/salary/monthly-salary?month=${month}&year=${year}`);
      setSalaryData(response.data);
    } catch (error) {
      console.error('Failed to fetch salary data:', error);
      alert('Error fetching salary data');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow rounded mt-6">
      <h2 className="text-xl font-bold mb-4 text-center">Monthly Salary Report</h2>

      <div className="flex items-center justify-center gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Select Month</option>
            {Array.from({ length: 12 }, (_, i) => {
              const m = (i + 1).toString().padStart(2, '0');
              return <option key={m} value={m}>{m}</option>;
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border rounded px-3 py-2"
            placeholder="e.g., 2025"
          />
        </div>

        <button
          onClick={fetchSalary}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Loading...' : 'Generate'}
        </button>
      </div>

      {salaryData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Emp ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Present Days</th>
                <th className="px-4 py-2 border">Salary (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {salaryData.map(({ employee, presentDays, salary }) => (
                <tr key={employee.empId} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{employee.empId}</td>
                  <td className="px-4 py-2 border">{employee.name}</td>
                  <td className="px-4 py-2 border text-center">{presentDays}</td>
                  <td className="px-4 py-2 border text-right">{salary.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {salaryData.length === 0 && !loading && (
        <p className="text-center text-gray-500 mt-4">No records found</p>
      )}
    </div>
  );
};

export default MonthlySalary;
