// src/pages/employee/CheckPayment.jsx
import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import logo from "../../assets/kamal-logo.png";

const CheckPayment = () => {
  const slipRef = useRef();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState("Jan");

  const [salaryData, setSalaryData] = useState({
    name: "Wajhi",
    employeeId: "#04",
    designation: "Designer",
    salaryMonth: `${selectedMonth} ${selectedYear}`,
    workingDays: "00",
    presentDays: "00",
    perDaySalary: "00",
    totalSalary: "00",
    afterDeduction: "00",
  });

  const handlePrint = useReactToPrint({
    content: () => slipRef.current,
    documentTitle: "Salary_Slip",
  });

  const handleFetchSalary = () => {
    const formattedMonthYear = `${selectedMonth} ${selectedYear}`;

    setSalaryData((prev) => ({
      ...prev,
      salaryMonth: formattedMonthYear,
    }));

    // You can later fetch from backend here
    // fetch(`/api/salary?year=${selectedYear}&month=${selectedMonth}`)
    //   .then(res => res.json())
    //   .then(data => setSalaryData(data));
  };

  const monthOptions = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Check Payment</h2>
      <p className="text-sm text-gray-500 mb-6">Home &gt; Check Payment</p>

      {/* Input Fields */}
      <div className="flex gap-4 items-center mb-6">
        <div>
          <label htmlFor="year" className="text-sm font-medium mr-2">Year</label>
          <input
            id="year"
            type="number"
            min="1900"
            max="9999"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border px-2 py-1 rounded w-28"
            placeholder="Enter year"
          />
        </div>

        <div>
          <label htmlFor="month" className="text-sm font-medium mr-2">Month</label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleFetchSalary}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-1.5 rounded"
        >
          Search
        </button>
      </div>

      {/* Salary Slip */}
      <div ref={slipRef} className="max-w-md mx-auto bg-white border shadow-md p-6 rounded">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Company Logo" className="h-12" />
        </div>

        <div className="bg-gray-700 text-white text-center py-2 mb-4 font-semibold">
          Salary Slip
        </div>

        <div className="text-sm space-y-2 mb-4">
          <div className="flex justify-between"><span>Name :</span><span>{salaryData.name}</span></div>
          <div className="flex justify-between"><span>Employee ID :</span><span>{salaryData.employeeId}</span></div>
          <div className="flex justify-between"><span>Designation :</span><span>{salaryData.designation}</span></div>
          <div className="flex justify-between"><span>Salary Month :</span><span>{salaryData.salaryMonth}</span></div>
        </div>

        <div className="text-sm text-center bg-gray-300 py-2 font-semibold">
          <div className="flex justify-between px-4"><span>Total Working Days</span><span>Present</span></div>
        </div>
        <div className="flex justify-between text-center text-sm px-4 py-2 border-b">
          <span>{salaryData.workingDays}</span><span>{salaryData.presentDays}</span>
        </div>

        <div className="text-sm text-center bg-gray-300 py-2 font-semibold">
          <div className="flex justify-between px-4"><span>Per Day Salary</span><span>Total Salary</span></div>
        </div>
        <div className="flex justify-between text-center text-sm px-4 py-2 border-b">
          <span>{salaryData.perDaySalary}</span><span>{salaryData.totalSalary}</span>
        </div>

        <div className="text-sm text-center bg-gray-300 py-2 font-semibold">
          After Deduction
        </div>
        <div className="text-center py-2 text-sm font-medium">
          {salaryData.afterDeduction}
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handlePrint}
          className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-900"
        >
          DOWNLOAD
        </button>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-400">
        © 2025 · OnlineEmployee Dashboard
      </footer>
    </div>
  );
};

export default CheckPayment;
