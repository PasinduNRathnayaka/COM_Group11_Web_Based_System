import React, { useEffect, useState } from "react";
import { Calendar, Edit3, Eye, Download, Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

const MonthlySalary = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryAdjustments, setSalaryAdjustments] = useState({
    basicSalary: 0,
    allowances: {
      transport: 0,
      food: 0,
      bonus: 0,
      overtime: 0,
      medical: 0,
      performance: 0,
      other: 0
    },
    deductions: {
      epf: 0,
      etf: 0,
      insurance: 0,
      advance: 0,
      loan: 0,
      uniform: 0,
      damage: 0,
      other: 0
    },
    notes: ""
  });
  const [showIndividualReport, setShowIndividualReport] = useState(false);
  const [selectedEmployeeReport, setSelectedEmployeeReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // API Base URL - adjust according to your backend
  const API_BASE = 'http://localhost:4000/api';

  // Fetch salary data from backend
  const fetchSalarySummary = async () => {
    setLoading(true);
    try {
      console.log(`Fetching salary data for month: ${selectedMonth}`);
      const response = await fetch(`${API_BASE}/salary/monthly?month=${selectedMonth}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch salary data`);
      }
      
      const data = await response.json();
      console.log('Received salary data:', data);
      
      // Ensure data is an array and has the expected structure
      const processedData = Array.isArray(data) ? data.map(emp => ({
        ...emp,
        // Ensure all numeric fields are numbers
        calculatedSalary: Number(emp.calculatedSalary) || 0,
        totalAllowances: Number(emp.totalAllowances) || 0,
        totalDeductions: Number(emp.totalDeductions) || 0,
        finalSalary: Number(emp.finalSalary) || 0,
        dailyRate: Number(emp.dailyRate) || 0,
        totalHours: Number(emp.totalHours) || 0,
        presentDays: Number(emp.presentDays) || 0,
        completeDays: Number(emp.completeDays) || 0,
        // Ensure nested objects exist
        salaryAdjustments: emp.salaryAdjustments || {
          allowances: {},
          deductions: {},
          notes: ''
        }
      })) : [];
      
      setSalaryData(processedData);
    } catch (err) {
      console.error("Failed to fetch monthly salary summary:", err);
      setSalaryData([]);
      alert(`Failed to fetch salary data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSalary = (employee) => {
    console.log('Editing salary for employee:', employee);
    setSelectedEmployee(employee);
    
    setSalaryAdjustments({
      basicSalary: Number(employee.calculatedSalary) || 0,
      allowances: {
        transport: Number(employee.salaryAdjustments?.allowances?.transport) || 0,
        food: Number(employee.salaryAdjustments?.allowances?.food) || 0,
        bonus: Number(employee.salaryAdjustments?.allowances?.bonus) || 0,
        overtime: Number(employee.salaryAdjustments?.allowances?.overtime) || 0,
        medical: Number(employee.salaryAdjustments?.allowances?.medical) || 0,
        performance: Number(employee.salaryAdjustments?.allowances?.performance) || 0,
        other: Number(employee.salaryAdjustments?.allowances?.other) || 0
      },
      deductions: {
        epf: Number(employee.salaryAdjustments?.deductions?.epf) || 0,
        etf: Number(employee.salaryAdjustments?.deductions?.etf) || 0,
        insurance: Number(employee.salaryAdjustments?.deductions?.insurance) || 0,
        advance: Number(employee.salaryAdjustments?.deductions?.advance) || 0,
        loan: Number(employee.salaryAdjustments?.deductions?.loan) || 0,
        uniform: Number(employee.salaryAdjustments?.deductions?.uniform) || 0,
        damage: Number(employee.salaryAdjustments?.deductions?.damage) || 0,
        other: Number(employee.salaryAdjustments?.deductions?.other) || 0
      },
      notes: employee.salaryAdjustments?.notes || ""
    });
    setShowEditModal(true);
  };

  const handleSaveSalaryAdjustments = async () => {
    if (!selectedEmployee) return;
    
    try {
      setLoading(true);
      console.log('Saving salary adjustments:', {
        employeeId: selectedEmployee._id,
        month: selectedMonth,
        adjustments: salaryAdjustments
      });
      
      const response = await fetch(`${API_BASE}/salary/adjustments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: selectedEmployee._id,
          month: selectedMonth,
          adjustments: salaryAdjustments,
          modifiedBy: 'Admin' // You can get this from auth context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to save salary adjustments');
      }

      const result = await response.json();
      console.log('Salary adjustment saved:', result);
      
      // Update the salary data locally with the response
      setSalaryData(prev => 
        prev.map(emp => 
          emp._id === selectedEmployee._id 
            ? { 
                ...emp, 
                totalAllowances: Number(result.data.totalAllowances) || 0,
                totalDeductions: Number(result.data.totalDeductions) || 0,
                finalSalary: Number(result.data.finalSalary) || 0,
                salaryAdjustments: {
                  allowances: result.data.allowances || {},
                  deductions: result.data.deductions || {},
                  notes: result.data.notes || ''
                },
                status: result.data.status,
                lastModified: result.data.lastModified
              }
            : emp
        )
      );
      
      setShowEditModal(false);
      setSelectedEmployee(null);
      
      alert("Salary adjustments saved successfully!");
    } catch (error) {
      console.error("Error saving salary adjustments:", error);
      alert(`Failed to save salary adjustments: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewIndividualReport = async (employee) => {
    setReportLoading(true);
    try {
      console.log(`Fetching individual report for employee: ${employee._id}`);
      const response = await fetch(`${API_BASE}/salary/individual/${employee._id}?month=${selectedMonth}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to fetch individual report');
      }
      
      const reportData = await response.json();
      console.log('Individual report data:', reportData);
      setSelectedEmployeeReport(reportData);
      setShowIndividualReport(true);
    } catch (error) {
      console.error("Error fetching individual report:", error);
      alert(`Failed to fetch individual salary report: ${error.message}`);
    } finally {
      setReportLoading(false);
    }
  };

  const downloadIndividualPDF = (employee) => {
    const monthYear = new Date(selectedMonth + "-01").toLocaleDateString("en-US", { 
      month: "long", 
      year: "numeric" 
    });

    // Build allowances section
    const allowancesEntries = employee.salaryAdjustments?.allowances ? 
      Object.entries(employee.salaryAdjustments.allowances)
        .filter(([key, value]) => Number(value) > 0)
        .map(([key, value]) => `
          <div class="breakdown-item">
            <span>${key.charAt(0).toUpperCase() + key.slice(1)}</span>
            <span>Rs. ${Number(value).toLocaleString()}</span>
          </div>
        `).join('') : '';

    // Build deductions section
    const deductionsEntries = employee.salaryAdjustments?.deductions ? 
      Object.entries(employee.salaryAdjustments.deductions)
        .filter(([key, value]) => Number(value) > 0)
        .map(([key, value]) => `
          <div class="breakdown-item">
            <span>${key.toUpperCase()}</span>
            <span>Rs. ${Number(value).toLocaleString()}</span>
          </div>
        `).join('') : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Individual Salary Report - ${employee.name || 'Unknown'}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2c5aa0;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 5px;
          }
          .report-title {
            font-size: 18px;
            color: #666;
            margin-bottom: 5px;
          }
          .report-meta {
            font-size: 14px;
            color: #888;
          }
          .employee-details {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 25px;
            border-left: 5px solid #2c5aa0;
          }
          .employee-details h2 {
            margin: 0 0 15px 0;
            color: #2c5aa0;
            font-size: 22px;
          }
          .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          .detail-item {
            background: white;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .detail-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .detail-value {
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }
          .salary-breakdown {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 25px;
          }
          .breakdown-section {
            background: white;
            border: 2px solid #eee;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .breakdown-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
          }
          .earnings-title {
            color: #28a745;
          }
          .deductions-title {
            color: #dc3545;
          }
          .breakdown-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
          }
          .breakdown-item:last-child {
            border-bottom: none;
          }
          .breakdown-item.total {
            font-weight: bold;
            font-size: 16px;
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #eee;
            border-bottom: none;
          }
          .total-section {
            background: linear-gradient(135deg, #2c5aa0 0%, #1e3a6f 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin: 25px 0;
            box-shadow: 0 6px 12px rgba(44, 90, 160, 0.3);
          }
          .final-salary {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .salary-label {
            font-size: 14px;
            opacity: 0.9;
          }
          .notes-section {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .notes-title {
            font-weight: bold;
            color: #856404;
            margin-bottom: 10px;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-draft {
            background: #ffeaa7;
            color: #856404;
          }
          .status-approved {
            background: #d4edda;
            color: #155724;
          }
          .status-paid {
            background: #cce5ff;
            color: #004085;
          }
          @media print {
            body { margin: 0; }
            .breakdown-section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">KAMAL AUTO PARTS</div>
          <div class="report-title">Individual Salary Report - ${monthYear}</div>
          <div class="report-meta">Generated on: ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="employee-details">
          <h2>${employee.name || 'Unknown Employee'}</h2>
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">Employee ID</div>
              <div class="detail-value">${employee.empId || 'N/A'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Category</div>
              <div class="detail-value">${employee.category || 'N/A'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Daily Rate</div>
              <div class="detail-value">Rs. ${(Number(employee.dailyRate) || 0).toLocaleString()}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Total Hours</div>
              <div class="detail-value">${Number(employee.totalHours) || 0} hrs</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Present Days</div>
              <div class="detail-value">${Number(employee.presentDays) || 0} days</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Complete Days</div>
              <div class="detail-value">${Number(employee.completeDays) || 0} days</div>
            </div>
          </div>
        </div>

        <div class="salary-breakdown">
          <div class="breakdown-section">
            <div class="breakdown-title earnings-title">💰 Earnings</div>
            <div class="breakdown-item">
              <span>Basic Salary</span>
              <span>Rs. ${(Number(employee.calculatedSalary) || 0).toLocaleString()}</span>
            </div>
            ${allowancesEntries}
            <div class="breakdown-item total">
              <span>Total Earnings</span>
              <span>Rs. ${((Number(employee.calculatedSalary) || 0) + (Number(employee.totalAllowances) || 0)).toLocaleString()}</span>
            </div>
          </div>

          <div class="breakdown-section">
            <div class="breakdown-title deductions-title">💸 Deductions</div>
            ${deductionsEntries || '<div class="breakdown-item"><span>No deductions applied</span><span>Rs. 0</span></div>'}
            <div class="breakdown-item total">
              <span>Total Deductions</span>
              <span>Rs. ${(Number(employee.totalDeductions) || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="total-section">
          <div class="final-salary">Rs. ${(Number(employee.finalSalary) || 0).toLocaleString()}</div>
          <div class="salary-label">Net Salary for ${monthYear}</div>
        </div>

        ${employee.salaryAdjustments?.notes ? `
        <div class="notes-section">
          <div class="notes-title">📝 Additional Notes</div>
          <p>${employee.salaryAdjustments.notes}</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            This is a computer-generated report. No signature required.<br>
            Report Status: <span class="status-badge ${employee.status ? `status-${employee.status}` : 'status-draft'}">${employee.status || 'Draft'}</span>
          </p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(employee.name || 'Employee').replace(/\s+/g, '_')}_Salary_Report_${monthYear.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApproveSalary = async (employee) => {
    if (!confirm(`Are you sure you want to approve salary for ${employee.name || 'this employee'}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/salary/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employee._id,
          month: selectedMonth,
          approvedBy: 'Admin' // Get from auth context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to approve salary');
      }

      // Refresh data
      await fetchSalarySummary();
      alert("Salary approved successfully!");
    } catch (error) {
      console.error("Error approving salary:", error);
      alert(`Failed to approve salary: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalarySummary();
  }, [selectedMonth]);

  // Calculate summary statistics with proper number handling
  const totalEmployees = salaryData.length;
  const totalBasicSalary = salaryData.reduce((sum, emp) => sum + (Number(emp.calculatedSalary) || 0), 0);
  const totalAllowances = salaryData.reduce((sum, emp) => sum + (Number(emp.totalAllowances) || 0), 0);
  const totalDeductions = salaryData.reduce((sum, emp) => sum + (Number(emp.totalDeductions) || 0), 0);
  const totalFinalSalary = salaryData.reduce((sum, emp) => sum + (Number(emp.finalSalary) || 0), 0);

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

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Monthly Salary Management</h1>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Basic Salary</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {totalBasicSalary.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Allowances</p>
                <p className="text-2xl font-bold text-emerald-600">Rs. {totalAllowances.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600">Rs. {totalDeductions.toLocaleString()}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Salary</p>
                <p className="text-2xl font-bold text-purple-600">Rs. {totalFinalSalary.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Salary Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Employee Salary Details</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading salary data...</span>
          </div>
        ) : salaryData.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Salary Data Found</h3>
              <p className="text-gray-500">No employees or salary records found for {selectedMonth}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours/Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowances</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              
              {/*Find this section in your code (around line 600-650) and replace it: */}

            <tbody className="bg-white divide-y divide-gray-200">
              {salaryData.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* CHANGE THIS PART - Currently showing daily rate, should show employee name */}
                    <div>
                      <div className="font-medium text-gray-900">{employee.name || 'Unknown Employee'}</div>
                      <div className="text-xs text-gray-500">{employee.empId || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* MOVE THE DAILY RATE HERE */}
                    Rs. {(Number(employee.dailyRate) || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{Number(employee.totalHours) || 0}h</div>
                      <div className="text-xs text-gray-500">{Number(employee.presentDays) || 0} days</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    Rs. {(Number(employee.calculatedSalary) || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    Rs. {(Number(employee.totalAllowances) || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    Rs. {(Number(employee.totalDeductions) || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                    Rs. {(Number(employee.finalSalary) || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(employee.status)}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        employee.status === 'approved' ? 'bg-green-100 text-green-800' :
                        employee.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee.status || 'draft'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSalary(employee)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Edit Salary"
                        disabled={loading}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewIndividualReport(employee)}
                        className="text-green-600 hover:text-green-800 p-1 rounded"
                        title="View Report"
                        disabled={reportLoading || loading}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadIndividualPDF(employee)}
                        className="text-purple-600 hover:text-purple-800 p-1 rounded"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {employee.status === 'draft' && (
                        <button
                          onClick={() => handleApproveSalary(employee)}
                          className="text-green-600 hover:text-green-800 p-1 rounded"
                          title="Approve Salary"
                          disabled={loading}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Salary Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                Edit Salary - {selectedEmployee.name || 'Unknown'} ({selectedEmployee.empId || 'N/A'})
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Salary Display */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-blue-700 mb-2">Basic Salary Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-600">Basic Salary</p>
                    <p className="text-xl font-bold text-blue-800">
                      Rs. {(Number(selectedEmployee.calculatedSalary) || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Hours Worked</p>
                    <p className="text-xl font-bold text-blue-800">
                      {Number(selectedEmployee.totalHours) || 0} hrs
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Present Days</p>
                    <p className="text-xl font-bold text-blue-800">
                      {Number(selectedEmployee.presentDays) || 0} days
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Allowances Section */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-green-700 mb-4">Allowances (+)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Transport</label>
                      <input
                        type="number"
                        value={salaryAdjustments.allowances.transport}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          allowances: {
                            ...salaryAdjustments.allowances,
                            transport: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Food</label>
                      <input
                        type="number"
                        value={salaryAdjustments.allowances.food}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          allowances: {
                            ...salaryAdjustments.allowances,
                            food: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Bonus</label>
                      <input
                        type="number"
                        value={salaryAdjustments.allowances.bonus}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          allowances: {
                            ...salaryAdjustments.allowances,
                            bonus: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Overtime</label>
                      <input
                        type="number"
                        value={salaryAdjustments.allowances.overtime}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          allowances: {
                            ...salaryAdjustments.allowances,
                            overtime: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Medical</label>
                      <input
                        type="number"
                        value={salaryAdjustments.allowances.medical}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          allowances: {
                            ...salaryAdjustments.allowances,
                            medical: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Performance</label>
                      <input
                        type="number"
                        value={salaryAdjustments.allowances.performance}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          allowances: {
                            ...salaryAdjustments.allowances,
                            performance: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Other Allowances</label>
                      <input
                        type="number"
                        value={salaryAdjustments.allowances.other}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          allowances: {
                            ...salaryAdjustments.allowances,
                            other: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-green-100 rounded">
                    <p className="text-sm text-green-700">
                      Total Allowances: <span className="font-bold">Rs. {Object.values(salaryAdjustments.allowances).reduce((sum, val) => sum + (Number(val) || 0), 0).toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* Deductions Section */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-red-700 mb-4">Deductions (-)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">EPF (8%)</label>
                      <input
                        type="number"
                        value={salaryAdjustments.deductions.epf}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          deductions: {
                            ...salaryAdjustments.deductions,
                            epf: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">ETF (3%)</label>
                      <input
                        type="number"
                        value={salaryAdjustments.deductions.etf}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          deductions: {
                            ...salaryAdjustments.deductions,
                            etf: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Insurance</label>
                      <input
                        type="number"
                        value={salaryAdjustments.deductions.insurance}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          deductions: {
                            ...salaryAdjustments.deductions,
                            insurance: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Advance</label>
                      <input
                        type="number"
                        value={salaryAdjustments.deductions.advance}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          deductions: {
                            ...salaryAdjustments.deductions,
                            advance: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Loan</label>
                      <input
                        type="number"
                        value={salaryAdjustments.deductions.loan}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          deductions: {
                            ...salaryAdjustments.deductions,
                            loan: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Uniform</label>
                      <input
                        type="number"
                        value={salaryAdjustments.deductions.uniform}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          deductions: {
                            ...salaryAdjustments.deductions,
                            uniform: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Damage</label>
                      <input
                        type="number"
                        value={salaryAdjustments.deductions.damage}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          deductions: {
                            ...salaryAdjustments.deductions,
                            damage: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Other Deductions</label>
                      <input
                        type="number"
                        value={salaryAdjustments.deductions.other}
                        onChange={(e) => setSalaryAdjustments({
                          ...salaryAdjustments,
                          deductions: {
                            ...salaryAdjustments.deductions,
                            other: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-red-100 rounded">
                    <p className="text-sm text-red-700">
                      Total Deductions: <span className="font-bold">Rs. {Object.values(salaryAdjustments.deductions).reduce((sum, val) => sum + (Number(val) || 0), 0).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={salaryAdjustments.notes}
                  onChange={(e) => setSalaryAdjustments({
                    ...salaryAdjustments,
                    notes: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Add any notes about salary adjustments, bonuses, or deductions..."
                  disabled={loading}
                />
              </div>

              {/* Salary Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-100">
                <h4 className="text-lg font-semibold mb-4 text-center text-gray-800">Final Salary Summary</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Basic Salary:</span>
                      <span className="font-semibold">Rs. {(Number(selectedEmployee.calculatedSalary) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span className="text-green-600">Total Allowances:</span>
                      <span className="font-semibold text-green-600">Rs. {Object.values(salaryAdjustments.allowances).reduce((sum, val) => sum + (Number(val) || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-red-200">
                      <span className="text-red-600">Total Deductions:</span>
                      <span className="font-semibold text-red-600">Rs. {Object.values(salaryAdjustments.deductions).reduce((sum, val) => sum + (Number(val) || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center p-4 bg-white rounded-lg shadow-md border-2 border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Net Salary</p>
                      <p className="text-3xl font-bold text-blue-800">
                        Rs. {((Number(selectedEmployee.calculatedSalary) || 0) + 
                          Object.values(salaryAdjustments.allowances).reduce((sum, val) => sum + (Number(val) || 0), 0) - 
                          Object.values(salaryAdjustments.deductions).reduce((sum, val) => sum + (Number(val) || 0), 0)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const basicSalary = Number(selectedEmployee.calculatedSalary) || 0;
                    setSalaryAdjustments(prev => ({
                      ...prev,
                      deductions: {
                        ...prev.deductions,
                        epf: Math.round(basicSalary * 0.08),
                        etf: Math.round(basicSalary * 0.03)
                      }
                    }));
                  }}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                  disabled={loading}
                >
                  Auto Calculate EPF/ETF
                </button>
                <button
                  onClick={() => {
                    setSalaryAdjustments(prev => ({
                      ...prev,
                      allowances: {
                        transport: 0,
                        food: 0,
                        bonus: 0,
                        overtime: 0,
                        medical: 0,
                        performance: 0,
                        other: 0
                      }
                    }));
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Clear Allowances
                </button>
                <button
                  onClick={() => {
                    setSalaryAdjustments(prev => ({
                      ...prev,
                      deductions: {
                        epf: 0,
                        etf: 0,
                        insurance: 0,
                        advance: 0,
                        loan: 0,
                        uniform: 0,
                        damage: 0,
                        other: 0
                      }
                    }));
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Clear Deductions
                </button>
                <button
                  onClick={() => {
                    setSalaryAdjustments(prev => ({
                      ...prev,
                      allowances: {
                        transport: 2000,
                        food: 1500,
                        bonus: 0,
                        overtime: 0,
                        medical: 1000,
                        performance: 0,
                        other: 0
                      }
                    }));
                  }}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                  disabled={loading}
                >
                  Apply Standard Allowances
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedEmployee(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSalaryAdjustments}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Report Modal */}
      {showIndividualReport && selectedEmployeeReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                Individual Salary Report - {selectedEmployeeReport.employee?.name || 'Unknown Employee'}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadIndividualPDF({
                    ...selectedEmployeeReport.employee,
                    calculatedSalary: selectedEmployeeReport.salary?.basicSalary,
                    totalHours: selectedEmployeeReport.attendance?.totalHours,
                    presentDays: selectedEmployeeReport.attendance?.presentDays,
                    completeDays: selectedEmployeeReport.attendance?.completeDays,
                    dailyRate: selectedEmployeeReport.employee?.hourlyRate,
                    totalAllowances: selectedEmployeeReport.salary?.totalAllowances,
                    totalDeductions: selectedEmployeeReport.salary?.totalDeductions,
                    finalSalary: selectedEmployeeReport.salary?.netSalary,
                    salaryAdjustments: {
                      allowances: selectedEmployeeReport.salary?.allowances,
                      deductions: selectedEmployeeReport.salary?.deductions,
                      notes: selectedEmployeeReport.metadata?.notes
                    },
                    status: selectedEmployeeReport.metadata?.status
                  })}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowIndividualReport(false);
                    setSelectedEmployeeReport(null);
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
                  <img
                    src={selectedEmployeeReport.employee?.image ? `http://localhost:4000${selectedEmployeeReport.employee.image}` : "https://via.placeholder.com/80"}
                    alt={selectedEmployeeReport.employee?.name || 'Employee'}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80";
                    }}
                  />
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">{selectedEmployeeReport.employee?.name || 'Unknown Employee'}</h4>
                    <p className="text-lg text-gray-600">{selectedEmployeeReport.employee?.empId || 'N/A'} • {selectedEmployeeReport.employee?.category || 'N/A'}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        Rs. {(Number(selectedEmployeeReport.employee?.hourlyRate) || 0).toLocaleString()}/day
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        selectedEmployeeReport.metadata?.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedEmployeeReport.metadata?.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedEmployeeReport.metadata?.status || 'draft'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h5 className="text-blue-700 font-medium mb-2">Total Hours</h5>
                  <p className="text-2xl font-bold text-blue-800">{selectedEmployeeReport.attendance?.totalHours || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <h5 className="text-green-700 font-medium mb-2">Present Days</h5>
                  <p className="text-2xl font-bold text-green-800">{selectedEmployeeReport.attendance?.presentDays || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <h5 className="text-purple-700 font-medium mb-2">Complete Days</h5>
                  <p className="text-2xl font-bold text-purple-800">{selectedEmployeeReport.attendance?.completeDays || 0}</p>
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
                      <span className="font-semibold">Rs. {(selectedEmployeeReport.salary?.basicSalary || 0).toLocaleString()}</span>
                    </div>
                    {selectedEmployeeReport.salary?.allowances && 
                      Object.entries(selectedEmployeeReport.salary.allowances).map(([key, value]) => (
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
                      <span>Rs. {(selectedEmployeeReport.salary?.grossSalary || 0).toLocaleString()}</span>
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
                    {selectedEmployeeReport.salary?.deductions && 
                      Object.entries(selectedEmployeeReport.salary.deductions).map(([key, value]) => (
                        value > 0 && (
                          <div key={key} className="flex justify-between py-2 border-b border-red-100">
                            <span>{key.toUpperCase()}:</span>
                            <span className="font-semibold">Rs. {value.toLocaleString()}</span>
                          </div>
                        )
                      ))
                    }
                    {(!selectedEmployeeReport.salary?.deductions || 
                      Object.values(selectedEmployeeReport.salary?.deductions || {}).every(val => val === 0)) && (
                      <div className="text-center py-4 text-gray-500">
                        <p>No deductions applied</p>
                      </div>
                    )}
                    <div className="flex justify-between py-3 font-bold text-lg border-t-2 border-red-300 bg-red-100 px-3 rounded">
                      <span>Total Deductions:</span>
                      <span>Rs. {(selectedEmployeeReport.salary?.totalDeductions || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg text-center shadow-lg">
                <h4 className="text-xl font-medium mb-3">Net Salary for {selectedMonth}</h4>
                <p className="text-4xl font-bold mb-2">
                  Rs. {(selectedEmployeeReport.salary?.netSalary || 0).toLocaleString()}
                </p>
                <p className="text-blue-100 text-sm">
                  Last updated: {selectedEmployeeReport.metadata?.lastModified ? 
                    new Date(selectedEmployeeReport.metadata.lastModified).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              {/* Daily Attendance Records */}
              {selectedEmployeeReport.attendance?.dailyRecords && selectedEmployeeReport.attendance.dailyRecords.length > 0 && (
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
                        {selectedEmployeeReport.attendance.dailyRecords.map((record, index) => (
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
              {selectedEmployeeReport.metadata?.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">Additional Notes</h4>
                  <p className="text-yellow-700">{selectedEmployeeReport.metadata.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlySalary;