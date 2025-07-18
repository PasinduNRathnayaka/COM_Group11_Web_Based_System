// src/pages/employee/CheckPayment.jsx
import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
    workingDays: "26",
    presentDays: "24",
    perDaySalary: "1000",
    totalSalary: "24000",
    afterDeduction: "23000",
  });

  const handleFetchSalary = () => {
    const formattedMonthYear = `${selectedMonth} ${selectedYear}`;
    setSalaryData((prev) => ({
      ...prev,
      salaryMonth: formattedMonthYear,
    }));
  };

  const handleDownload = () => {
    const input = slipRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Salary_Slip_${selectedMonth}_${selectedYear}.pdf`);
    });
  };

  const monthOptions = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-2">Check Payment</h2>
      <p className="text-sm text-gray-500 mb-6">Home &gt; Check Payment</p>

      <div className="flex gap-4 items-center mb-6">
        <div>
          <label className="text-sm font-medium mr-2">Year</label>
          <input
            type="number"
            min="1900"
            max="9999"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border px-2 py-1 rounded w-28"
          />
        </div>
        <div>
          <label className="text-sm font-medium mr-2">Month</label>
          <select
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
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Search
        </button>
      </div>

      {/* Salary Slip */}
      <div ref={slipRef} className="max-w-md mx-auto bg-white border shadow-md p-6 rounded text-black">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Company Logo" className="h-12" />
        </div>

        <div className="bg-gray-800 text-white text-center py-2 mb-4 font-semibold">
          Salary Slip
        </div>

        <div className="text-sm space-y-2 mb-4">
          <div className="flex justify-between"><span>Name :</span><span>{salaryData.name}</span></div>
          <div className="flex justify-between"><span>Employee ID :</span><span>{salaryData.employeeId}</span></div>
          <div className="flex justify-between"><span>Designation :</span><span>{salaryData.designation}</span></div>
          <div className="flex justify-between"><span>Salary Month :</span><span>{salaryData.salaryMonth}</span></div>
        </div>

        <div className="text-sm bg-gray-200 font-semibold px-4 py-2 flex justify-between">
          <span>Total Working Days</span>
          <span>Present Days</span>
        </div>
        <div className="text-sm px-4 py-2 flex justify-between border-b">
          <span>{salaryData.workingDays}</span>
          <span>{salaryData.presentDays}</span>
        </div>

        <div className="text-sm bg-gray-200 font-semibold px-4 py-2 flex justify-between">
          <span>Per Day Salary</span>
          <span>Total Salary</span>
        </div>
        <div className="text-sm px-4 py-2 flex justify-between border-b">
          <span>{salaryData.perDaySalary}</span>
          <span>{salaryData.totalSalary}</span>
        </div>

        <div className="text-sm bg-gray-200 font-semibold text-center py-2">
          After Deduction
        </div>
        <div className="text-center py-2 font-medium text-sm">
          {salaryData.afterDeduction}
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          DOWNLOAD
        </button>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-500">
        © 2025 · Employee Dashboard
      </footer>
    </div>
  );
};

export default CheckPayment;
