import React, { useEffect, useState } from "react";
import { Calendar, Download, Eye, AlertCircle, CheckCircle, Clock, DollarSign, TrendingUp, Users, Lock } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import toast from 'react-hot-toast';

const EmployeeSalaryView = () => {
  const { user } = useAppContext();
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [showSalaryDetail, setShowSalaryDetail] = useState(false);
  const [selectedSalaryReport, setSelectedSalaryReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // API Base URL
  const API_BASE = 'http://localhost:4000/api';

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch employee's salary data
  const fetchEmployeeSalary = async () => {
    if (!user || !user._id) {
      toast.error('User information not available');
      return;
    }

    setLoading(true);
    try {
      console.log(`Fetching salary data for employee: ${user._id}, month: ${selectedMonth}`);
      
      // Fetch salary data for the specific employee and month
      const response = await fetch(`${API_BASE}/salary/individual/${user._id}?month=${selectedMonth}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // No salary record found for this month
          setSalaryData([]);
          return;
        }
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch salary data`);
      }
      
      const data = await response.json();
      console.log('Received salary data:', data);
      
      // Check if salary is approved before showing
      if (data.metadata && data.metadata.status === 'approved') {
        setSalaryData([data]);
      } else if (data.metadata && data.metadata.status === 'paid') {
        setSalaryData([data]);
      } else {
        // Salary not approved yet
        setSalaryData([]);
      }
      
    } catch (err) {
      console.error("Failed to fetch employee salary:", err);
      setSalaryData([]);
      if (!err.message.includes('404')) {
        toast.error(`Failed to fetch salary data: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // View salary details
  const handleViewSalaryDetail = async (salaryReport) => {
    setSelectedSalaryReport(salaryReport);
    setShowSalaryDetail(true);
  };

  // Download salary slip as PDF
  const downloadSalaryPDF = (salaryReport) => {
    if (!salaryReport) return;

    const monthYear = new Date(selectedMonth + "-01").toLocaleDateString("en-US", { 
      month: "long", 
      year: "numeric" 
    });

    // Build allowances section with non-zero values only
    const allowancesEntries = salaryReport.salary?.allowances ? 
      Object.entries(salaryReport.salary.allowances)
        .filter(([key, value]) => Number(value) > 0)
        .map(([key, value]) => `
          <tr>
            <td class="item-label">${key.charAt(0).toUpperCase() + key.slice(1)}</td>
            <td class="item-value">Rs. ${Number(value).toLocaleString()}</td>
          </tr>
        `).join('') : '';

    // Build deductions section with non-zero values only
    const deductionsEntries = salaryReport.salary?.deductions ? 
      Object.entries(salaryReport.salary.deductions)
        .filter(([key, value]) => Number(value) > 0)
        .map(([key, value]) => `
          <tr>
            <td class="item-label">${key.toUpperCase()}</td>
            <td class="item-value">Rs. ${Number(value).toLocaleString()}</td>
          </tr>
        `).join('') : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Sheet - ${salaryReport.employee?.name || 'Employee'}</title>
        <style>
          @page { 
            size: A4; 
            margin: 15mm; 
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
          }
          
          .container {
            max-width: 100%;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #2c5aa0;
          }
          
          .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 3px;
          }
          
          .document-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 2px;
          }
          
          .period {
            font-size: 11px;
            color: #888;
          }
          
          .employee-header {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            border-left: 4px solid #2c5aa0;
          }
          
          .emp-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .emp-details h2 {
            font-size: 16px;
            color: #2c5aa0;
            margin-bottom: 2px;
          }
          
          .emp-meta {
            font-size: 10px;
            color: #666;
          }
          
          .emp-stats {
            text-align: right;
            font-size: 10px;
          }
          
          .stat-item {
            margin-bottom: 1px;
          }
          
          .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          
          .section {
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
          }
          
          .section-header {
            padding: 8px 12px;
            font-weight: bold;
            font-size: 13px;
          }
          
          .earnings-header {
            background: #e8f5e8;
            color: #2d5a2d;
            border-bottom: 1px solid #d0e7d0;
          }
          
          .deductions-header {
            background: #fce8e8;
            color: #5a2d2d;
            border-bottom: 1px solid #e7d0d0;
          }
          
          .section-content {
            padding: 8px 0;
          }
          
          .breakdown-table {
            width: 100%;
          }
          
          .breakdown-table tr {
            border-bottom: 1px solid #f0f0f0;
          }
          
          .breakdown-table tr:last-child {
            border-bottom: none;
          }
          
          .item-label {
            padding: 4px 12px;
            font-size: 11px;
            color: #555;
          }
          
          .item-value {
            padding: 4px 12px;
            text-align: right;
            font-weight: 500;
            font-size: 11px;
          }
          
          .basic-salary {
            background: #f8f9fa !important;
            font-weight: bold;
          }
          
          .section-total {
            background: #f5f5f5 !important;
            font-weight: bold;
            border-top: 2px solid #ddd !important;
          }
          
          .section-total .item-label {
            font-weight: bold;
            color: #333;
          }
          
          .section-total .item-value {
            font-weight: bold;
            font-size: 12px;
          }
          
          .final-summary {
            background: linear-gradient(135deg, #2c5aa0 0%, #1e3a6f 100%);
            color: white;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            margin: 15px 0;
          }
          
          .net-amount {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 3px;
          }
          
          .net-label {
            font-size: 11px;
            opacity: 0.9;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
          }
          
          .summary-item {
            text-align: center;
            padding: 8px;
            background: white;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
          }
          
          .summary-label {
            font-size: 9px;
            color: #666;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .summary-value {
            font-size: 13px;
            font-weight: bold;
            color: #333;
          }
          
          .notes-section {
            background: #fff8e1;
            border: 1px solid #ffcc02;
            border-radius: 4px;
            padding: 10px;
            margin: 10px 0;
          }
          
          .notes-title {
            font-size: 11px;
            font-weight: bold;
            color: #856404;
            margin-bottom: 5px;
          }
          
          .notes-content {
            font-size: 10px;
            color: #856404;
            line-height: 1.3;
          }
          
          .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            font-size: 9px;
            color: #666;
          }
          
          .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            margin-left: 5px;
          }
          
          .status-approved {
            background: #d4edda;
            color: #155724;
          }
          
          .status-paid {
            background: #cce5ff;
            color: #004085;
          }
          
          .no-break {
            page-break-inside: avoid;
          }
          
          @media print {
            body { font-size: 11px; }
            .container { max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-name">KAMAL AUTO PARTS</div>
            <div class="document-title">Monthly Salary Statement</div>
            <div class="period">${monthYear} | Generated: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="employee-header no-break">
            <div class="emp-info">
              <div class="emp-details">
                <h2>${salaryReport.employee?.name || 'Unknown Employee'}</h2>
                <div class="emp-meta">
                  ID: ${salaryReport.employee?.empId || 'N/A'} | Category: ${salaryReport.employee?.category || 'N/A'}
                </div>
              </div>
              <div class="emp-stats">
                <div class="stat-item">Daily Rate: <strong>Rs. ${(Number(salaryReport.employee?.hourlyRate) || 0).toLocaleString()}</strong></div>
                <div class="stat-item">Hours: <strong>${Number(salaryReport.attendance?.totalHours) || 0}</strong> | Days: <strong>${Number(salaryReport.attendance?.presentDays) || 0}</strong></div>
              </div>
            </div>
          </div>

          <div class="summary-grid no-break">
            <div class="summary-item">
              <div class="summary-label">Gross Earnings</div>
              <div class="summary-value">Rs. ${(salaryReport.salary?.grossSalary || 0).toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Deductions</div>
              <div class="summary-value">Rs. ${(salaryReport.salary?.totalDeductions || 0).toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Net Payable</div>
              <div class="summary-value" style="color: #2c5aa0;">Rs. ${(salaryReport.salary?.netSalary || 0).toLocaleString()}</div>
            </div>
          </div>

          <div class="content-grid no-break">
            <div class="section">
              <div class="section-header earnings-header">Earnings</div>
              <div class="section-content">
                <table class="breakdown-table">
                  <tr class="basic-salary">
                    <td class="item-label">Basic Salary</td>
                    <td class="item-value">Rs. ${(salaryReport.salary?.basicSalary || 0).toLocaleString()}</td>
                  </tr>
                  ${allowancesEntries}
                  ${!allowancesEntries ? '<tr><td class="item-label" style="text-align: center; padding: 8px; color: #888;">No additional allowances</td></tr>' : ''}
                  <tr class="section-total">
                    <td class="item-label">Total Earnings</td>
                    <td class="item-value">Rs. ${(salaryReport.salary?.grossSalary || 0).toLocaleString()}</td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="section">
              <div class="section-header deductions-header">Deductions</div>
              <div class="section-content">
                <table class="breakdown-table">
                  ${deductionsEntries || '<tr><td class="item-label" style="text-align: center; padding: 8px; color: #888;">No deductions applied</td></tr>'}
                  <tr class="section-total">
                    <td class="item-label">Total Deductions</td>
                    <td class="item-value">Rs. ${(salaryReport.salary?.totalDeductions || 0).toLocaleString()}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <div class="final-summary no-break">
            <div class="net-amount">Rs. ${(salaryReport.salary?.netSalary || 0).toLocaleString()}</div>
            <div class="net-label">Net Salary - ${monthYear}</div>
          </div>

          ${salaryReport.metadata?.notes ? `
          <div class="notes-section no-break">
            <div class="notes-title">Additional Notes</div>
            <div class="notes-content">${salaryReport.metadata.notes}</div>
          </div>
          ` : ''}

          <div class="footer">
            <p>
              This is a computer-generated salary statement. No signature required.
              <span class="status-badge ${salaryReport.metadata?.status ? `status-${salaryReport.metadata.status}` : 'status-approved'}">
                ${salaryReport.metadata?.status || 'Approved'}
              </span>
            </p>
            <p style="margin-top: 5px;">
              For queries, contact HR Department | Document ID: SAL-${salaryReport.employee?.empId || 'XXX'}-${selectedMonth.replace('-', '')}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create and trigger download
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      toast.error('Unable to open print window. Please check popup blocker settings.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  useEffect(() => {
    fetchEmployeeSalary();
  }, [selectedMonth]);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Salary</h1>
              <p className="text-gray-600">View and download your approved salary statements</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Employee Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
              {user?.image ? (
                <img
                  src={user.image.startsWith('/uploads/') 
                    ? `http://localhost:4000${user.image}` 
                    : user.image}
                  alt="Employee"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-full h-full ${user?.image ? 'hidden' : 'flex'} items-center justify-center text-blue-600 text-xl font-semibold`}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{user?.name || 'Employee'}</h3>
              <p className="text-gray-600">Employee ID: {user?.empId || 'N/A'}</p>
              <p className="text-gray-600">Category: {user?.category || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Data Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Salary Statement for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading salary data...</span>
          </div>
        ) : salaryData.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Salary Found</h3>
              <p className="text-gray-500 mb-4">
                Your salary for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} is not yet approved or no record exists.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Note:</p>
                    <p>You can only view and download salary statements that have been approved by the admin. Please contact HR if you have any questions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {salaryData.map((salaryReport, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 mb-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-blue-700">Basic Salary</p>
                    <p className="text-2xl font-bold text-blue-800">
                      Rs. {(salaryReport.salary?.basicSalary || 0).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-green-700">Total Allowances</p>
                    <p className="text-2xl font-bold text-green-800">
                      Rs. {(salaryReport.salary?.totalAllowances || 0).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-sm font-medium text-red-700">Total Deductions</p>
                    <p className="text-2xl font-bold text-red-800">
                      Rs. {(salaryReport.salary?.totalDeductions || 0).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-purple-700">Net Salary</p>
                    <p className="text-2xl font-bold text-purple-800">
                      Rs. {(salaryReport.salary?.netSalary || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(salaryReport.metadata?.status)}
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(salaryReport.metadata?.status)}`}>
                        {salaryReport.metadata?.status === 'paid' ? 'Paid' : 'Approved'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Last updated: {salaryReport.metadata?.lastModified ? 
                        new Date(salaryReport.metadata.lastModified).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleViewSalaryDetail(salaryReport)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => downloadSalaryPDF(salaryReport)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      {showSalaryDetail && selectedSalaryReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                Detailed Salary Report - {selectedSalaryReport.employee?.name || 'Unknown Employee'}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadSalaryPDF(selectedSalaryReport)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowSalaryDetail(false);
                    setSelectedSalaryReport(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Employee Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                    {user?.image ? (
                      <img
                        src={user.image.startsWith('/uploads/') 
                          ? `http://localhost:4000${user.image}` 
                          : user.image}
                        alt="Employee"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full ${user?.image ? 'hidden' : 'flex'} items-center justify-center text-blue-600 text-2xl font-semibold`}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">{selectedSalaryReport.employee?.name || 'Unknown Employee'}</h4>
                    <p className="text-lg text-gray-600">{selectedSalaryReport.employee?.empId || 'N/A'} • {selectedSalaryReport.employee?.category || 'N/A'}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        Rs. {(Number(selectedSalaryReport.employee?.hourlyRate) || 0).toLocaleString()}/day
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadge(selectedSalaryReport.metadata?.status)}`}>
                        {selectedSalaryReport.metadata?.status || 'approved'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h5 className="text-blue-700 font-medium mb-2">Total Hours</h5>
                  <p className="text-2xl font-bold text-blue-800">{selectedSalaryReport.attendance?.totalHours || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <h5 className="text-green-700 font-medium mb-2">Present Days</h5>
                  <p className="text-2xl font-bold text-green-800">{selectedSalaryReport.attendance?.presentDays || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <h5 className="text-purple-700 font-medium mb-2">Complete Days</h5>
                  <p className="text-2xl font-bold text-purple-800">{selectedSalaryReport.attendance?.completeDays || 0}</p>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-700 mb-4 text-lg flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Earnings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-green-100">
                      <span>Basic Salary:</span>
                      <span className="font-semibold">Rs. {(selectedSalaryReport.salary?.basicSalary || 0).toLocaleString()}</span>
                    </div>
                    {selectedSalaryReport.salary?.allowances && 
                      Object.entries(selectedSalaryReport.salary.allowances).map(([key, value]) => (
                        value > 0 && (
                          <div key={key} className="flex justify-between py-2 border-b border-green-100">
                            <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                            <span className="font-semibold">Rs. {value.toLocaleString()}</span>
                          </div>
                        )
                      ))
                    }
                    <div className="flex justify-between py-3 font-bold text-lg border-t-2 border-green-300 bg-green-100 px-3 rounded">
                      <span>Total Earnings:</span>
                      <span>Rs. {(selectedSalaryReport.salary?.grossSalary || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h4 className="font-bold text-red-700 mb-4 text-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Deductions
                  </h4>
                  <div className="space-y-3">
                    {selectedSalaryReport.salary?.deductions && 
                      Object.entries(selectedSalaryReport.salary.deductions).map(([key, value]) => (
                        value > 0 && (
                          <div key={key} className="flex justify-between py-2 border-b border-red-100">
                            <span>{key.toUpperCase()}:</span>
                            <span className="font-semibold">Rs. {value.toLocaleString()}</span>
                          </div>
                        )
                      ))
                    }
                    {(!selectedSalaryReport.salary?.deductions || 
                      Object.values(selectedSalaryReport.salary?.deductions || {}).every(val => val === 0)) && (
                      <div className="text-center py-4 text-gray-500">
                        <p>No deductions applied</p>
                      </div>
                    )}
                    <div className="flex justify-between py-3 font-bold text-lg border-t-2 border-red-300 bg-red-100 px-3 rounded">
                      <span>Total Deductions:</span>
                      <span>Rs. {(selectedSalaryReport.salary?.totalDeductions || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg text-center shadow-lg">
                <h4 className="text-xl font-medium mb-3">Net Salary for {selectedMonth}</h4>
                <p className="text-4xl font-bold mb-2">
                  Rs. {(selectedSalaryReport.salary?.netSalary || 0).toLocaleString()}
                </p>
                <p className="text-blue-100 text-sm">
                  Last updated: {selectedSalaryReport.metadata?.lastModified ? 
                    new Date(selectedSalaryReport.metadata.lastModified).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              {/* Daily Attendance Records */}
              {selectedSalaryReport.attendance?.dailyRecords && selectedSalaryReport.attendance.dailyRecords.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-bold text-gray-700 mb-4 text-lg">Daily Attendance Records</h4>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-200 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">Check In</th>
                          <th className="px-3 py-2 text-left">Check Out</th>
                          <th className="px-3 py-2 text-left">Hours</th>
                          <th className="px-3 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSalaryReport.attendance.dailyRecords.map((record, index) => (
                          <tr key={index} className="border-b border-gray-200">
                            <td className="px-3 py-2">{record.date}</td>
                            <td className="px-3 py-2">{record.checkIn}</td>
                            <td className="px-3 py-2">{record.checkOut}</td>
                            <td className="px-3 py-2">{record.hours}h</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                record.status === 'Complete' ? 'bg-green-100 text-green-800' :
                                record.status === 'Incomplete' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedSalaryReport.metadata?.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">Additional Notes</h4>
                  <p className="text-yellow-700">{selectedSalaryReport.metadata.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSalaryView;