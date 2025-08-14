import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SummaryCard = ({ title, value, change, icon, isLoading }) => (
  <div className="flex-1 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow p-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-gray-600 text-sm">{title}</p>
      {icon && <span className="text-gray-400">{icon}</span>}
    </div>
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ) : (
      <>
        <h3 className="text-xl font-bold">{value}</h3>
        <p className="text-xs text-green-600 mt-1">{change}</p>
      </>
    )}
  </div>
);

const SalesGraph = () => {
  const [salesData, setSalesData] = useState([]);
  const [timeRange, setTimeRange] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchRealSalesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching real sales data...');
      
      // Fetch bills data
      const billsResponse = await fetch('http://localhost:4000/api/bills');
      const billsData = billsResponse.ok ? await billsResponse.json() : { bills: [] };
      
      // Fetch seller orders data - using the same endpoint as OrderListPage
      const ordersResponse = await fetch('http://localhost:4000/api/seller/orders');
      const ordersData = ordersResponse.ok ? await ordersResponse.json() : { orders: [] };
      
      console.log('📊 Bills data:', billsData);
      console.log('📦 Orders data:', ordersData);
      
      const bills = billsData.bills || [];
      const orders = ordersData.orders || [];
      
      // Generate chart data based on real data
      const chartData = processRealData(bills, orders, timeRange);
      setSalesData(chartData);
      
      // Calculate total revenue
      const billRevenue = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
      const orderRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      setTotalRevenue(billRevenue + orderRevenue);
      
      console.log('✅ Processed sales data:', chartData);
      
    } catch (err) {
      console.error('❌ Error fetching sales data:', err);
      setError(`Failed to fetch sales data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const processRealData = (bills, orders, range) => {
    const now = new Date();
    const salesMap = new Map();

    // Helper function to get period key
    const getPeriodKey = (date, range) => {
      const d = new Date(date);
      switch (range) {
        case 'weekly':
          // Get day of week for last 7 days
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return dayNames[d.getDay()];
        case 'monthly':
          // Get month name
          return d.toLocaleDateString('en', { month: 'short' });
        case 'yearly':
          // Get year
          return d.getFullYear().toString();
        default:
          return d.toISOString().split('T')[0];
      }
    };

    // Initialize periods with zero sales
    if (range === 'weekly') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString('en', { weekday: 'short' });
        salesMap.set(key, { period: key, sales: 0, date: date.toISOString() });
      }
    } else if (range === 'monthly') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const key = date.toLocaleDateString('en', { month: 'short' });
        salesMap.set(key, { period: key, sales: 0, year: date.getFullYear(), monthIndex: date.getMonth() });
      }
    } else if (range === 'yearly') {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = (now.getFullYear() - i).toString();
        salesMap.set(year, { period: year, sales: 0 });
      }
    }

    // Process bills data
    bills.forEach(bill => {
      const billDate = new Date(bill.billDate || bill.createdAt);
      const periodKey = getPeriodKey(billDate, range);
      
      // Check if this bill falls within our time range
      const isInRange = isDateInRange(billDate, range, now);
      
      if (isInRange && salesMap.has(periodKey)) {
        const existing = salesMap.get(periodKey);
        existing.sales += bill.totalAmount || 0;
      }
    });

    // Process orders data
    orders.forEach(order => {
      const orderDate = new Date(order.orderDate || order.createdAt);
      const periodKey = getPeriodKey(orderDate, range);
      
      // Check if this order falls within our time range
      const isInRange = isDateInRange(orderDate, range, now);
      
      if (isInRange && salesMap.has(periodKey)) {
        const existing = salesMap.get(periodKey);
        existing.sales += order.totalAmount || 0;
      }
    });

    // Convert map to array and sort
    const result = Array.from(salesMap.values());
    
    if (range === 'monthly') {
      // Sort months chronologically
      result.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthIndex - b.monthIndex;
      });
    }
    
    return result;
  };

  const isDateInRange = (date, range, now) => {
    const diffTime = now.getTime() - date.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    switch (range) {
      case 'weekly':
        return diffDays <= 7;
      case 'monthly':
        return diffDays <= 365; // Last year
      case 'yearly':
        return diffDays <= 365 * 5; // Last 5 years
      default:
        return true;
    }
  };

  useEffect(() => {
    fetchRealSalesData();
  }, [timeRange]);

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `Rs ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `Rs ${(value / 1000).toFixed(1)}K`;
    }
    return `Rs ${Math.round(value).toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          <p className="text-blue-600">
            Sales: <span className="font-bold">{formatCurrency(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow p-4 min-w-[420px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-semibold text-lg">Sales Graph</h4>
          <p className="text-sm text-gray-600 capitalize">{timeRange} Overview (Real Data)</p>
        </div>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['weekly', 'monthly', 'yearly'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                timeRange === range
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading real sales data...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-red-600 p-4">
          <span className="text-center mb-3">{error}</span>
          <button 
            onClick={fetchRealSalesData}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Retry Loading Data
          </button>
        </div>
      ) : salesData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p className="mb-2">No sales data found</p>
            <p className="text-sm">Try adding some bills or orders first</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e0e0e0' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#2563eb"
              strokeWidth={3} 
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      
      {!loading && !error && salesData.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600">Total Revenue</p>
            <p className="font-bold text-lg">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Period Average</p>
            <p className="font-bold text-lg">{formatCurrency(salesData.reduce((sum, item) => sum + item.sales, 0) / salesData.length)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Data Points</p>
            <p className="font-bold text-lg">{salesData.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const BestSellers = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealBestSellers = async () => {
      try {
        console.log('🔄 Fetching real best sellers data...');
        
        // Try to get analytics data first
        const analyticsResponse = await fetch('http://localhost:4000/api/bills/analytics/summary');
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          console.log('📊 Analytics data:', analyticsData);
          
          if (analyticsData.topProducts && analyticsData.topProducts.length > 0) {
            setBestSellers(analyticsData.topProducts.slice(0, 3));
            setLoading(false);
            return;
          }
        }
        
        // Fallback: Calculate from bills data
        const billsResponse = await fetch('http://localhost:4000/api/bills');
        if (billsResponse.ok) {
          const billsData = await billsResponse.json();
          const bills = billsData.bills || [];
          
          // Calculate best sellers from bills
          const productSales = new Map();
          
          bills.forEach(bill => {
            bill.items?.forEach(item => {
              const key = item.productId;
              if (!productSales.has(key)) {
                productSales.set(key, {
                  _id: key,
                  productName: item.productName,
                  totalQuantity: 0,
                  totalRevenue: 0
                });
              }
              
              const product = productSales.get(key);
              product.totalQuantity += item.quantity || 0;
              product.totalRevenue += item.totalPrice || (item.quantity * item.unitPrice) || 0;
            });
          });
          
          // Convert to array and sort by quantity
          const sortedProducts = Array.from(productSales.values())
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 3);
          
          console.log('✅ Calculated best sellers:', sortedProducts);
          setBestSellers(sortedProducts);
        }
        
      } catch (error) {
        console.error('❌ Error fetching best sellers:', error);
        setBestSellers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealBestSellers();
  }, []);

  return (
    <div className="w-64 bg-white border border-gray-200 rounded-lg shadow p-4">
      <h4 className="font-semibold mb-4">Best Seller Items (Real Data)</h4>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      ) : bestSellers.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p className="text-sm">No sales data yet</p>
          <p className="text-xs">Start creating bills to see best sellers</p>
        </div>
      ) : (
        <ul className="space-y-3 text-sm">
          {bestSellers.map((item, index) => (
            <li key={item._id || index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-xs block truncate" title={item.productName}>
                    {item.productName}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="font-bold text-xs">Rs {(item.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">{item.totalQuantity} sold</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button className="mt-4 w-full py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        VIEW REPORT
      </button>
    </div>
  );
};

const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper functions from AttendancePage
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

  const isUnderEightHours = (checkIn, checkOut) => {
    const hours = calculateHours(checkIn, checkOut);
    if (hours === "--") return false;
    return parseFloat(hours) < 8;
  };

  useEffect(() => {
    const fetchTodaysAttendance = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Fetching today\'s attendance data...');
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        
        // Fetch attendance data for today - same API as AttendancePage
        const response = await fetch(`http://localhost:4000/api/attendance?date=${todayStr}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Today\'s attendance data:', data);
          setAttendanceData(data || []);
        } else {
          console.error('Failed to fetch attendance data');
          setError('Failed to fetch attendance data');
          setAttendanceData([]);
        }
        
      } catch (err) {
        console.error('❌ Error fetching attendance:', err);
        setError('Failed to load attendance data');
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysAttendance();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">Today's Attendance (Real Data)</h4>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString()}
        </span>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading attendance data...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          <p className="mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : attendanceData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No attendance records found for today</p>
          <p className="text-sm">Employee check-ins will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-bold text-lg">{attendanceData.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Present</p>
              <p className="font-bold text-lg text-green-600">
                {attendanceData.filter(att => att.checkIn).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="font-bold text-lg text-blue-600">
                {attendanceData.filter(att => att.checkIn && att.checkOut).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Under 8h</p>
              <p className="font-bold text-lg text-red-600">
                {attendanceData.filter(att => isUnderEightHours(att.checkIn, att.checkOut)).length}
              </p>
            </div>
          </div>

          {/* Attendance table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 border-b text-left font-semibold text-gray-700">Employee</th>
                  <th className="px-3 py-2 border-b text-left font-semibold text-gray-700">ID</th>
                  <th className="px-3 py-2 border-b text-left font-semibold text-gray-700">Check In</th>
                  <th className="px-3 py-2 border-b text-left font-semibold text-gray-700">Check Out</th>
                  <th className="px-3 py-2 border-b text-left font-semibold text-gray-700">Hours</th>
                  <th className="px-3 py-2 border-b text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.slice(0, 10).map((att, index) => {
                  const status = getAttendanceStatus(att.checkIn, att.checkOut);
                  const isUnderEight = isUnderEightHours(att.checkIn, att.checkOut);
                  
                  return (
                    <tr key={index} className={`hover:bg-gray-50 transition-colors ${
                      isUnderEight ? 'bg-red-50' : ''
                    }`}>
                      <td className="px-3 py-3 border-b">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            <img
                              src={`http://localhost:4000${att.employee.image}`}
                              alt={att.employee.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600" style={{ display: 'none' }}>
                              {att.employee.name.charAt(0)}
                            </div>
                          </div>
                          <span className={`font-medium ${isUnderEight ? 'text-red-900' : 'text-gray-900'}`}>
                            {att.employee.name}
                          </span>
                        </div>
                      </td>
                      <td className={`px-3 py-3 border-b ${isUnderEight ? 'text-red-700' : 'text-gray-600'}`}>
                        {att.employee.empId}
                      </td>
                      <td className="px-3 py-3 border-b">
                        <span className={att.checkIn ? (isUnderEight ? 'text-red-900 font-medium' : 'text-green-600 font-medium') : 'text-gray-400'}>
                          {att.checkIn || "--"}
                        </span>
                      </td>
                      <td className="px-3 py-3 border-b">
                        <span className={att.checkOut ? (isUnderEight ? 'text-red-900 font-medium' : 'text-red-600 font-medium') : 'text-gray-400'}>
                          {att.checkOut || "--"}
                        </span>
                      </td>
                      <td className="px-3 py-3 border-b">
                        <span className={isUnderEight ? 'text-red-600 font-semibold bg-red-50 px-2 py-1 rounded' : 'text-gray-900 font-medium'}>
                          {calculateHours(att.checkIn, att.checkOut)}
                        </span>
                      </td>
                      <td className="px-3 py-3 border-b">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {attendanceData.length > 10 && (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500">
                Showing first 10 of {attendanceData.length} employees
              </p>
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                View All Attendance
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [summaryData, setSummaryData] = useState({
    totalSales: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalBills: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealSummaryData = async () => {
      try {
        console.log('🔄 Fetching real summary data...');
        
        // Fetch bills data
        const billsResponse = await fetch('http://localhost:4000/api/bills');
        const billsData = billsResponse.ok ? await billsResponse.json() : { bills: [] };
        
        // Fetch seller orders data - using the same endpoint as OrderListPage
        const ordersResponse = await fetch('http://localhost:4000/api/seller/orders');
        const ordersData = ordersResponse.ok ? await ordersResponse.json() : { orders: [] };

        const bills = billsData.bills || [];
        const orders = ordersData.success ? ordersData.orders : [];
        
        console.log('📊 Real bills:', bills.length);
        console.log('📦 Real orders:', orders.length);

        // Calculate real totals
        const billsRevenue = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
        const ordersRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const totalSales = billsRevenue + ordersRevenue;
        
        // Count order statuses based on the same logic as OrderListPage
        const activeOrders = orders.filter(order => 
          ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
        ).length;
        
        const completedOrders = orders.filter(order => 
          order.status === 'delivered'
        ).length;

        const realSummary = {
          totalSales,
          activeOrders,
          completedOrders,
          totalBills: bills.length
        };
        
        console.log('✅ Real summary data:', realSummary);
        setSummaryData(realSummary);
        
      } catch (error) {
        console.error('❌ Error fetching summary data:', error);
        // Keep loading state to show we tried but failed
        setSummaryData({
          totalSales: 0,
          activeOrders: 0,
          completedOrders: 0,
          totalBills: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRealSummaryData();
  }, []);

  const summaryCards = [
    { 
      title: "Total Sales", 
      value: `Rs ${summaryData.totalSales.toLocaleString()}`, 
      change: "From bills + orders",
      icon: "📈"
    },
    { 
      title: "Active Orders", 
      value: summaryData.activeOrders.toString(), 
      change: "Pending/Processing",
      icon: "📦"
    },
    { 
      title: "Completed Orders", 
      value: summaryData.completedOrders.toString(), 
      change: "Delivered",
      icon: "✅"
    },
    { 
      title: "Total Bills", 
      value: summaryData.totalBills.toString(), 
      change: "All time",
      icon: "🧾"
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-100 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Real-time data from your database</p>
      </div>

      {/* Summary cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} isLoading={loading} />
        ))}
      </section>

      {/* Sales graph & best sellers */}
      <section className="flex flex-wrap gap-4">
        <SalesGraph />
        <BestSellers />
      </section>

      {/* Attendance table */}
      <section>
        <AttendanceTable />
      </section>
    </div>
  );
};

export default Dashboard;