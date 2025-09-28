import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar as CalendarIcon,
  Download,
  User
} from "lucide-react";

const EmployeeAttendancePage = () => {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Get employee data from localStorage or context
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setEmployeeData(parsedUser);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  const fetchEmployeeAttendance = async (employeeId) => {
    if (!employeeId) {
      setError("Employee ID not found");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(`http://localhost:4000/api/attendance?employeeId=${employeeId}`);
      setAttendanceHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch employee attendance history:", err);
      setError("Failed to load attendance data");
      setAttendanceHistory([]);
    } finally {
      setLoading(false);
    }
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

  const isUnderEightHours = (checkIn, checkOut) => {
    const hours = calculateHours(checkIn, checkOut);
    if (hours === "--") return false;
    return parseFloat(hours) < 8;
  };

  const getHoursStyle = (checkIn, checkOut) => {
    if (isUnderEightHours(checkIn, checkOut)) {
      return "text-red-600 font-semibold bg-red-50 px-2 py-1 rounded";
    }
    return "text-gray-900 font-medium";
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

  // Calculate statistics for filtered data
  const attendanceStats = useMemo(() => {
    const filteredRecords = processEmployeeHistory(attendanceHistory).filter((record) => {
      const recordDate = new Date(record.date);
      const month = recordDate.getMonth() + 1;
      const year = recordDate.getFullYear();
      const monthMatch = selectedMonth === "all" || parseInt(selectedMonth) === month;
      const yearMatch = selectedYear === "all" || parseInt(selectedYear) === year;
      return monthMatch && yearMatch;
    });

    const total = filteredRecords.length;
    const present = filteredRecords.filter(record => record.checkIn).length;
    const completed = filteredRecords.filter(record => record.checkIn && record.checkOut).length;
    const absent = total - present;
    const underEightHours = filteredRecords.filter(record => isUnderEightHours(record.checkIn, record.checkOut)).length;
    
    const totalHours = filteredRecords.reduce((sum, record) => {
      const hours = parseFloat(calculateHours(record.checkIn, record.checkOut));
      return sum + (isNaN(hours) ? 0 : hours);
    }, 0);

    const avgHours = completed > 0 ? (totalHours / completed).toFixed(1) : "0.0";

    return {
      total,
      present,
      completed,
      absent,
      underEightHours,
      totalHours: totalHours.toFixed(1),
      avgHours
    };
  }, [attendanceHistory, selectedMonth, selectedYear]);

  const handleRefresh = () => {
    if (employeeData?._id) {
      fetchEmployeeAttendance(employeeData._id);
    }
  };

  const handleExport = () => {
    const filteredRecords = processEmployeeHistory(attendanceHistory).filter((record) => {
      const recordDate = new Date(record.date);
      const month = recordDate.getMonth() + 1;
      const year = recordDate.getFullYear();
      const monthMatch = selectedMonth === "all" || parseInt(selectedMonth) === month;
      const yearMatch = selectedYear === "all" || parseInt(selectedYear) === year;
      return monthMatch && yearMatch;
    });

    const csvContent = [
      ["Date", "Check In", "Check Out", "Total Hours", "Status", "Under 8 Hours"],
      ...filteredRecords.map(record => [
        new Date(record.date).toLocaleDateString(),
        record.checkIn || "--",
        record.checkOut || "--",
        calculateHours(record.checkIn, record.checkOut),
        getAttendanceStatus(record.checkIn, record.checkOut),
        isUnderEightHours(record.checkIn, record.checkOut) ? "Yes" : "No"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `my-attendance-${selectedMonth !== "all" ? selectedMonth + "-" : ""}${selectedYear !== "all" ? selectedYear : "all"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (employeeData?._id) {
      fetchEmployeeAttendance(employeeData._id);
    }
  }, [employeeData]);

  if (loading && attendanceHistory.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading your attendance data...</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Attendance Records</h1>
          <p className="text-sm text-gray-500 flex items-center">
            Employee Dashboard <ChevronRight className="w-4 h-4 mx-1" /> Attendance
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

      {/* Employee Info Card */}
      {employeeData && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {employeeData.image ? (
                <img
                  src={employeeData.image.startsWith('/uploads/') 
                    ? `http://localhost:4000${employeeData.image}` 
                    : employeeData.image}
                  alt={employeeData.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full ${employeeData.image ? 'hidden' : 'flex'} items-center justify-center text-gray-400`}>
                <User className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{employeeData.name}</h2>
              <p className="text-sm text-gray-500">{employeeData.category} • ID: {employeeData.empId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Days</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Present</p>
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
              <p className="text-sm font-medium text-gray-500">Absent</p>
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
              <p className="text-sm font-medium text-gray-500">Under 8 Hours</p>
              <p className="text-2xl font-bold text-red-600">{attendanceStats.underEightHours}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold text-blue-600">{attendanceStats.totalHours}h</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
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

      {/* Attendance Records Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {error ? (
          <div className="text-center py-8 text-red-600">
            <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p>{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Check In</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Check Out</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Total Hours</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {processEmployeeHistory(attendanceHistory)
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
                    const isUnderEight = isUnderEightHours(record.checkIn, record.checkOut);
                    return (
                      <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 ${isUnderEight ? 'bg-red-50' : ''}`}>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-medium ${record.checkIn ? (isUnderEight ? 'text-red-900' : 'text-gray-900') : 'text-gray-400'}`}>
                            {record.checkIn || "--"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-medium ${record.checkOut ? (isUnderEight ? 'text-red-900' : 'text-gray-900') : 'text-gray-400'}`}>
                            {record.checkOut || "--"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={getHoursStyle(record.checkIn, record.checkOut)}>
                            {calculateHours(record.checkIn, record.checkOut)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
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
            
            {processEmployeeHistory(attendanceHistory).filter((record) => {
              const recordDate = new Date(record.date);
              const month = recordDate.getMonth() + 1;
              const year = recordDate.getFullYear();
              const monthMatch = selectedMonth === "all" || parseInt(selectedMonth) === month;
              const yearMatch = selectedYear === "all" || parseInt(selectedYear) === year;
              return monthMatch && yearMatch;
            }).length === 0 && !error && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No attendance records found for the selected period.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendancePage;