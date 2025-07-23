import React, { useEffect, useState } from "react";
import axios from "axios";

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

  const downloadPDF = () => {
    try {
      if (salaryData.length === 0) {
        alert("No data available to generate PDF");
        return;
      }

      // Create HTML content for PDF
      const monthYear = new Date(selectedMonth + "-01").toLocaleDateString("en-US", { 
        month: "long", 
        year: "numeric" 
      });

      const totals = calculateTotals();
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Salary Report - ${monthYear}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              color: #666;
              margin-bottom: 10px;
            }
            .period {
              font-size: 14px;
              color: #888;
            }
            .summary {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
            }
            .summary-item {
              text-align: center;
              padding: 10px;
              background: white;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .summary-value {
              font-size: 18px;
              font-weight: bold;
              color: #2c5aa0;
            }
            .summary-label {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #2c5aa0;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
            .total-row {
              background-color: #e8f4f8 !important;
              font-weight: bold;
              border-top: 2px solid #2c5aa0;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            @media print {
              body { margin: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">KAMAL AUTO PARTS</div>
            <div class="report-title">Monthly Salary Report</div>
            <div class="period">Period: ${monthYear}</div>
            <div class="period">Generated on: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="summary">
            <div class="summary-item">
              <div class="summary-value">${totals.totalEmployees}</div>
              <div class="summary-label">Total Employees</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">Rs. ${parseFloat(totals.totalSalary).toLocaleString()}</div>
              <div class="summary-label">Total Salary</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${totals.totalHours}</div>
              <div class="summary-label">Total Hours</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">Rs. ${parseFloat(totals.averageSalary).toLocaleString()}</div>
              <div class="summary-label">Average Salary</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Hourly Rate</th>
                <th>Total Hours</th>
                <th>Present Days</th>
                <th>Complete Days</th>
                <th>Salary</th>
              </tr>
            </thead>
            <tbody>
              ${salaryData.map(emp => `
                <tr>
                  <td>${emp.empId}</td>
                  <td>${emp.name}</td>
                  <td>${emp.category || 'N/A'}</td>
                  <td>Rs. ${emp.hourlyRate || emp.rate || 0}</td>
                  <td>${emp.totalHours || 0}</td>
                  <td>${emp.presentDays || 0}</td>
                  <td>${emp.completeDays || 0}</td>
                  <td>Rs. ${(emp.salary || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4"><strong>TOTAL</strong></td>
                <td><strong>${totals.totalHours}</strong></td>
                <td><strong>-</strong></td>
                <td><strong>-</strong></td>
                <td><strong>Rs. ${parseFloat(totals.totalSalary).toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>This report was generated automatically by Kamal Auto Parts Payroll System</p>
            <p>For any discrepancies, please contact the HR department</p>
          </div>
        </body>
        </html>
      `;

      // Create a new window and print
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
        // Close the window after printing (optional)
        // printWindow.close();
      };

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    }
  };

  const calculateTotals = () => {
    const totalSalary = salaryData.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const totalHours = salaryData.reduce((sum, emp) => sum + (emp.totalHours || 0), 0);
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
                📄 Print/Save PDF
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
              <p className="text-xs text-gray-600">Rate: Rs. {emp.hourlyRate || emp.rate || 0}/hr</p>
              <p className="text-xs text-gray-600">Hours: {emp.totalHours || 0}</p>
              <p className="text-xs text-gray-600">Present: {emp.presentDays || 0} days</p>
              <p className="text-sm font-bold text-green-700">Salary: Rs. {(emp.salary || 0).toLocaleString()}</p>
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
                  <td className="py-2">Rs. {emp.hourlyRate || emp.rate || 0}</td>
                  <td className="py-2">{emp.totalHours || 0}</td>
                  <td className="py-2">{emp.presentDays || 0}</td>
                  <td className="py-2">{emp.completeDays || 0}</td>
                  <td className="py-2 font-bold text-green-700">Rs. {(emp.salary || 0).toLocaleString()}</td>
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