import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const MonthlySalary = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const fetchSalarySummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/api/salary/monthly?month=${selectedMonth}`);
      setSalaryData(res.data);
    } catch (err) {
      console.error("Failed to fetch monthly salary summary:", err);
      setSalaryData([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setLoading(true);
      
      // Fetch detailed report data
      const response = await axios.get(`http://localhost:4000/api/salary/report?month=${selectedMonth}`);
      const reportData = response.data;

      // Create PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("KAMAL AUTO PARTS", pageWidth / 2, 20, { align: "center" });
      
      pdf.setFontSize(16);
      pdf.text("Monthly Salary Report", pageWidth / 2, 30, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const monthYear = new Date(selectedMonth + "-01").toLocaleDateString("en-US", { 
        month: "long", 
        year: "numeric" 
      });
      pdf.text(`Period: ${monthYear}`, pageWidth / 2, 40, { align: "center" });
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 48, { align: "center" });
      
      // Summary section
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Summary", 14, 65);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Total Employees: ${reportData.summary.totalEmployees}`, 14, 75);
      pdf.text(`Total Company Salary: Rs. ${reportData.summary.totalCompanySalary.toLocaleString()}`, 14, 82);
      pdf.text(`Average Salary: Rs. ${reportData.summary.averageSalary.toLocaleString()}`, 14, 89);

      // Employee salary table
      const tableData = reportData.employees.map(emp => [
        emp.empId,
        emp.name,
        emp.category || 'N/A',
        `Rs. ${emp.hourlyRate}`,
        emp.totalHours.toString(),
        emp.presentDays.toString(),
        emp.completeDays.toString(),
        `Rs. ${emp.salary.toLocaleString()}`
      ]);

      pdf.autoTable({
        startY: 100,
        head: [['Emp ID', 'Name', 'Category', 'Rate/Hr', 'Total Hrs', 'Present Days', 'Complete Days', 'Salary']],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Emp ID
          1: { cellWidth: 30 }, // Name
          2: { cellWidth: 25 }, // Category
          3: { cellWidth: 20 }, // Rate
          4: { cellWidth: 20 }, // Hours
          5: { cellWidth: 20 }, // Present
          6: { cellWidth: 20 }, // Complete
          7: { cellWidth: 25 }, // Salary
        },
      });

      // Add detailed attendance for each employee (if space allows)
      let currentY = pdf.lastAutoTable.finalY + 20;
      
      reportData.employees.forEach((emp, index) => {
        // Check if we need a new page
        if (currentY > 250) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${emp.name} (${emp.empId}) - Detailed Attendance`, 14, currentY);
        
        // Create attendance table for this employee
        const attendanceData = emp.dailyRecords
          .filter(record => record.status !== 'Absent') // Only show days with attendance
          .map(record => [
            record.date,
            record.checkIn,
            record.checkOut,
            record.hours.toString(),
            record.status
          ]);

        if (attendanceData.length > 0) {
          pdf.autoTable({
            startY: currentY + 5,
            head: [['Date', 'Check In', 'Check Out', 'Hours', 'Status']],
            body: attendanceData,
            styles: {
              fontSize: 7,
              cellPadding: 1,
            },
            headStyles: {
              fillColor: [52, 152, 219],
              textColor: 255,
            },
            margin: { left: 14, right: 14 },
          });
          
          currentY = pdf.lastAutoTable.finalY + 15;
        } else {
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "italic");
          pdf.text("No attendance records found", 14, currentY + 10);
          currentY += 25;
        }
      });

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pdf.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      const fileName = `Salary_Report_${monthYear.replace(' ', '_')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalSalary = salaryData.reduce((sum, emp) => sum + emp.salary, 0);
    const totalHours = salaryData.reduce((sum, emp) => sum + emp.totalHours, 0);
    const averageSalary = salaryData.length > 0 ? totalSalary / salaryData.length : 0;
    
    return {
      totalSalary: totalSalary.toFixed(2),
      totalHours: totalHours.toFixed(2),
      averageSalary: averageSalary.toFixed(2),
      totalEmployees: salaryData.length
    };
  };

  useEffect(() => {
    fetchSalarySummary();
  }, [selectedMonth]);

  const totals = calculateTotals();

  return (
    <div className="bg-[#f3f3f3] min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Monthly Salary Summary</h2>
          <p className="text-sm text-gray-500">Home &gt; Salary</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Select Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <button
            onClick={downloadPDF}
            disabled={loading || salaryData.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                📄 Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <h3 className="text-lg font-bold text-blue-600">{totals.totalEmployees}</h3>
          <p className="text-sm text-gray-600">Total Employees</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <h3 className="text-lg font-bold text-green-600">Rs. {parseFloat(totals.totalSalary).toLocaleString()}</h3>
          <p className="text-sm text-gray-600">Total Salary</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <h3 className="text-lg font-bold text-purple-600">{totals.totalHours}</h3>
          <p className="text-sm text-gray-600">Total Hours</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <h3 className="text-lg font-bold text-orange-600">Rs. {parseFloat(totals.averageSalary).toLocaleString()}</h3>
          <p className="text-sm text-gray-600">Average Salary</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-2">Loading salary data...</span>
        </div>
      )}

      {/* Employee Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {salaryData.map((emp, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow text-center hover:shadow-lg transition-shadow">
            <img
              src={`http://localhost:4000${emp.image}`}
              alt={emp.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
            <h3 className="text-base font-semibold mb-1">{emp.name}</h3>
            <p className="text-sm text-gray-500">ID: {emp.empId}</p>
            <p className="text-sm text-gray-600">{emp.category}</p>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600">Rate: Rs. {emp.hourlyRate}/hr</p>
              <p className="text-xs text-gray-600">Hours: {emp.totalHours}</p>
              <p className="text-xs text-gray-600">Present: {emp.presentDays} days</p>
              <p className="text-sm font-bold text-green-700">Salary: Rs. {emp.salary.toLocaleString()}</p>
            </div>
          </div>
        ))}
        
        {salaryData.length === 0 && !loading && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No salary data found for the selected month.
          </div>
        )}
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Detailed Salary Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead className="border-b border-gray-300 text-left">
              <tr>
                <th className="py-2">Employee ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Category</th>
                <th className="py-2">Hourly Rate</th>
                <th className="py-2">Total Hours</th>
                <th className="py-2">Present Days</th>
                <th className="py-2">Complete Days</th>
                <th className="py-2">Salary</th>
              </tr>
            </thead>
            <tbody>
              {salaryData.map((emp, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="py-2">{emp.empId}</td>
                  <td className="py-2 flex items-center gap-2">
                    <img
                      src={`http://localhost:4000${emp.image}`}
                      alt="avatar"
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    {emp.name}
                  </td>
                  <td className="py-2">{emp.category || 'N/A'}</td>
                  <td className="py-2">Rs. {emp.hourlyRate}</td>
                  <td className="py-2">{emp.totalHours}</td>
                  <td className="py-2">{emp.presentDays}</td>
                  <td className="py-2">{emp.completeDays}</td>
                  <td className="py-2 font-bold text-green-700">Rs. {emp.salary.toLocaleString()}</td>
                </tr>
              ))}
              
              {salaryData.length > 0 && (
                <tr className="border-t-2 border-gray-400 bg-gray-50 font-bold">
                  <td className="py-3" colSpan="4">TOTAL</td>
                  <td className="py-3">{totals.totalHours}</td>
                  <td className="py-3">-</td>
                  <td className="py-3">-</td>
                  <td className="py-3 text-green-700">Rs. {parseFloat(totals.totalSalary).toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlySalary;