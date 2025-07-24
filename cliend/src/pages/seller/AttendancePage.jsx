import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Eye,
  Calendar as CalendarIcon
} from "lucide-react";

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'

  const currentYear = new Date().getFullYear();

  const fetchAttendance = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:4000/api/attendance?date=${date}`);
      setAttendanceData(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      setError("Failed to load attendance data");
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeAttendance = async (employeeId) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/api/attendance?employeeId=${employeeId}`);
      setEmployeeHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch employee attendance history:", err);
      setEmployeeHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttendance = (employee) => {
    setViewingEmployee(employee);
    setSelectedMonth("all");
    setSelectedYear("all");
    fetchEmployeeAttendance(employee._id);
  };

  const handleBack = () => {
    setViewingEmployee(null);
    setEmployeeHistory([]);
  };

  const processEmployeeHistory = (records) => {
    const grouped = {};
    records.forEach(({ date, checkIn, checkOut }) => {
      if (!grouped[date]) {
        grouped[date] = {
          date,
          checkIn: checkIn || null,
          checkOut: checkOut || null,
        };
      } else {
        if (checkIn) {
          if (!grouped[date].checkIn || checkIn < grouped[date].checkIn) {
            grouped[date].checkIn = checkIn;
          }
        }
        if (checkOut) {
          if (!grouped[date].checkOut || checkOut > grouped[date].checkOut) {
            grouped[date].checkOut = checkOut;
          }
        }
      }
    });

    return Object.values(grouped).sort((a, b) => (a.date < b.date ? 1 : -1));
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "--";

    try {
      const [inH, inM, inS = 0] = checkIn.split(":").map(Number);
      const [outH, outM, outS = 0] = checkOut.split(":").map(Number);

      const checkInMinutes = inH * 60 + inM + inS / 60;
      const checkOutMinutes = outH * 60 + outM + outS / 60;

      let durationMinutes = checkOutMinutes - checkInMinutes;

      if (durationMinutes < 0) {
        durationMinutes += 24 * 60;
      }

      const hours = durationMinutes / 60;

      if (isNaN(hours) || hours < 0 || hours > 24) {
        return "--";
      }

      return hours.toFixed(2);
    } catch (err) {
      console.error("Error calculating hours:", err);
      return "--";
    }
  };

  const getAttendanceStatus = (checkIn, checkOut) => {
    if (!checkIn && !checkOut) return "absent";
    if (checkIn && !checkOut) return "present";
    if (checkIn && checkOut) return "completed";
    return "unknown";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50";
      case "present": return "text-blue-600 bg-blue-50";
      case "absent": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "present": return <Clock className="w-4 h-4" />;
      case "absent": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Calculate statistics
  const attendanceStats = useMemo(() => {
    const total = attendanceData.length;
    const present = attendanceData.filter(att => att.checkIn).length;
    const completed = attendanceData.filter(att => att.checkIn && att.checkOut).length;
    const absent = total - present;
    const avgHours = attendanceData.reduce((sum, att) => {
      const hours = parseFloat(calculateHours(att.checkIn, att.checkOut));
      return sum + (isNaN(hours) ? 0 : hours);
    }, 0) / (completed || 1);

    return {
      total,
      present,
      completed,
      absent,
      avgHours: avgHours.toFixed(1)
    };
  }, [attendanceData]);

  // Filter attendance data
  const filteredAttendanceData = useMemo(() => {
    return attendanceData.filter(att => {
      const matchesSearch = att.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           att.employee.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           att.employee.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const status = getAttendanceStatus(att.checkIn, att.checkOut);
      const matchesStatus = filterStatus === "all" || status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [attendanceData, searchTerm, filterStatus]);

  const handleRefresh = () => {
    fetchAttendance(selectedDate);
  };

  const handleExport = () => {
    const csvContent = [
      ["Employee ID", "Employee Name", "Category", "Date", "Check In", "Check Out", "Total Hours", "Status"],
      ...filteredAttendanceData.map(att => [
        att.employee.empId,
        att.employee.name,
        att.employee.category,
        att.date,
        att.checkIn || "--",
        att.checkOut || "--",
        calculateHours(att.checkIn, att.checkOut),
        getAttendanceStatus(att.checkIn, att.checkOut)
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  if (loading && !viewingEmployee) {
    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading attendance data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
          <p className="text-sm text-gray-500 flex items-center">
            Home <ChevronRight className="w-4 h-4 mx-1" /> Attendance
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {viewingEmployee ? (
        /* Employee Detail View */
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={`http://localhost:4000${viewingEmployee.image}`}
                  alt={viewingEmployee.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewingEmployee.name}</h2>
                <p className="text-sm text-gray-500">{viewingEmployee.category} • ID: {viewingEmployee.empId}</p>
              </div>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Overview
            </button>
          </div>

          {/* Employee History Filters */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Month:</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="all">All Months</option>
                  {[...Array(12)].map((_, i) => {
                    const monthName = new Date(0, i).toLocaleString("default", { month: "long" });
                    return (
                      <option key={i} value={i + 1}>{monthName}</option>
                    );
                  })}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Year:</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="all">All Years</option>
                  {[...Array(5)].map((_, i) => {
                    const year = currentYear - i;
                    return (
                      <option key={year} value={year}>{year}</option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Employee History Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Check In</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Check Out</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Total Hours</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {processEmployeeHistory(employeeHistory)
                  .filter((record) => {
                    const recordDate = new Date(record.date);
                    const month = recordDate.getMonth() + 1;
                    const year = recordDate.getFullYear();

                    const monthMatch = selectedMonth === "all" || parseInt(selectedMonth) === month;
                    const yearMatch = selectedYear === "all" || parseInt(selectedYear) === year;

                    return monthMatch && yearMatch;
                  })
                  .map((record, i) => {
                    const status = getAttendanceStatus(record.checkIn, record.checkOut);
                    return (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{record.checkIn || "--"}</td>
                        <td className="py-3 px-4">{record.checkOut || "--"}</td>
                        <td className="py-3 px-4 font-medium">{calculateHours(record.checkIn, record.checkOut)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            
            {processEmployeeHistory(employeeHistory).filter((record) => {
              const recordDate = new Date(record.date);
              const month = recordDate.getMonth() + 1;
              const year = recordDate.getFullYear();
              const monthMatch = selectedMonth === "all" || parseInt(selectedMonth) === month;
              const yearMatch = selectedYear === "all" || parseInt(selectedYear) === year;
              return monthMatch && yearMatch;
            }).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No attendance records found for the selected period.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Present Today</p>
                  <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Absent Today</p>
                  <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Hours</p>
                  <p className="text-2xl font-bold text-blue-600">{attendanceStats.avgHours}h</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls and Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-3 text-sm font-medium ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-3 text-sm font-medium ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Table
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Showing {filteredAttendanceData.length} of {attendanceData.length} employees</span>
              <span>Date: {new Date(selectedDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Content Area */}
          {filteredAttendanceData.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No attendance records found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? "Try adjusting your search or filters" 
                  : `No attendance data available for ${new Date(selectedDate).toLocaleDateString()}`}
              </p>
              {(searchTerm || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'cards' ? (
                /* Cards View */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredAttendanceData.map((att, index) => {
                    const status = getAttendanceStatus(att.checkIn, att.checkOut);
                    return (
                      <div key={index} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden">
                            <img
                              src={`http://localhost:4000${att.employee.image}`}
                              alt={att.employee.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "/default-avatar.png";
                              }}
                            />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{att.employee.name}</h3>
                          <p className="text-xs text-gray-500 mb-3">{att.employee.category}</p>
                          
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-3 ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </div>
                          
                          <div className="space-y-1 text-xs text-gray-600 mb-3">
                            <div>In: {att.checkIn || "--"}</div>
                            <div>Out: {att.checkOut || "--"}</div>
                            <div className="font-medium">Hours: {calculateHours(att.checkIn, att.checkOut)}</div>
                          </div>
                          
                          <button
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mx-auto"
                            onClick={() => handleViewAttendance(att.employee)}
                          >
                            <Eye className="w-3 h-3" />
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Table View */
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Employee</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">ID</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Department</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Check In</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Check Out</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Hours</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAttendanceData.map((att, index) => {
                          const status = getAttendanceStatus(att.checkIn, att.checkOut);
                          return (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                    <img
                                      src={`http://localhost:4000${att.employee.image}`}
                                      alt={att.employee.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = "/default-avatar.png";
                                      }}
                                    />
                                  </div>
                                  <span className="font-medium text-gray-900">{att.employee.name}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-gray-600">{att.employee.empId}</td>
                              <td className="py-4 px-6 text-gray-600">{att.employee.category}</td>
                              <td className="py-4 px-6">
                                <span className={att.checkIn ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                                  {att.checkIn || "--"}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={att.checkOut ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                                  {att.checkOut || "--"}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-medium text-gray-900">
                                {calculateHours(att.checkIn, att.checkOut)}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                  {getStatusIcon(status)}
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <button
                                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                  onClick={() => handleViewAttendance(att.employee)}
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AttendancePage;