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

const SummaryCard = ({ title, value, change, icon, isLoading, onClick }) => (
  <div 
    className={`flex-1 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow p-4 ${
      onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200' : ''
    }`}
    onClick={onClick}
  >
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
    {/* {onClick && (
      <div className="mt-2 text-xs text-blue-600 opacity-75">
        Click to view details →
      </div>
    )} */}
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
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [reportData, setReportData] = useState(null);

  // Generate month options for the last 12 months
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({ value, label });
    }
    
    return months;
  };

  const monthOptions = generateMonthOptions();

  const fetchBestSellersForMonth = async (month) => {
    try {
      console.log(`🔄 Fetching best sellers for ${month}...`);
      setLoading(true);
      
      // Parse the selected month
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      
      // Fetch bills data for the selected month
      const billsResponse = await fetch('http://localhost:4000/api/bills');
      const billsData = billsResponse.ok ? await billsResponse.json() : { bills: [] };
      
      // Fetch orders data for the selected month
      const ordersResponse = await fetch('http://localhost:4000/api/seller/orders');
      const ordersData = ordersResponse.ok ? await ordersResponse.json() : { orders: [] };
      
      // Fetch products data for complete information
      const productsResponse = await fetch('http://localhost:4000/api/products');
      const productsData = productsResponse.ok ? await productsResponse.json() : [];
      
      const bills = billsData.bills || [];
      const orders = ordersData.orders || [];
      const products = productsData || [];
      
      // Filter data by selected month
      const filteredBills = bills.filter(bill => {
        const billDate = new Date(bill.billDate || bill.createdAt);
        return billDate >= startDate && billDate <= endDate;
      });
      
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate || order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
      
      // Calculate best sellers from bills and orders
      const productSales = new Map();
      
      // Process bills
      filteredBills.forEach(bill => {
        bill.items?.forEach(item => {
          const key = item.productId || item.productName;
          if (!productSales.has(key)) {
            productSales.set(key, {
              productId: item.productId,
              productName: item.productName,
              billQuantity: 0,
              billRevenue: 0,
              orderQuantity: 0,
              orderRevenue: 0,
              totalQuantity: 0,
              totalRevenue: 0,
              category: 'Unknown',
              remainingStock: 0,
              unitPrice: item.unitPrice || 0
            });
          }
          
          const product = productSales.get(key);
          product.billQuantity += item.quantity || 0;
          product.billRevenue += item.totalPrice || (item.quantity * item.unitPrice) || 0;
          product.totalQuantity += item.quantity || 0;
          product.totalRevenue += item.totalPrice || (item.quantity * item.unitPrice) || 0;
        });
      });
      
      // Process orders
      filteredOrders.forEach(order => {
        order.items?.forEach(item => {
          const key = item.productId || item.productName;
          if (!productSales.has(key)) {
            productSales.set(key, {
              productId: item.productId,
              productName: item.productName,
              billQuantity: 0,
              billRevenue: 0,
              orderQuantity: 0,
              orderRevenue: 0,
              totalQuantity: 0,
              totalRevenue: 0,
              category: 'Unknown',
              remainingStock: 0,
              unitPrice: item.unitPrice || 0
            });
          }
          
          const product = productSales.get(key);
          product.orderQuantity += item.quantity || 0;
          product.orderRevenue += item.totalPrice || (item.quantity * item.unitPrice) || 0;
          product.totalQuantity += item.quantity || 0;
          product.totalRevenue += item.totalPrice || (item.quantity * item.unitPrice) || 0;
        });
      });
      
      // Enhance with product details
      productSales.forEach((salesData, key) => {
        const productInfo = products.find(p => 
          p.productId === salesData.productId || p.productName === salesData.productName
        );
        
        if (productInfo) {
          salesData.category = productInfo.category || 'Unknown';
          salesData.remainingStock = productInfo.stock || 0;
          salesData.image = productInfo.image;
          salesData.description = productInfo.description;
        }
      });
      
      // Convert to array and sort by total quantity sold
      const sortedProducts = Array.from(productSales.values())
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10); // Get top 10
      
      setBestSellers(sortedProducts);
      
      // Prepare comprehensive report data
      const totalBillRevenue = filteredBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
      const totalOrderRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const totalRevenue = totalBillRevenue + totalOrderRevenue;
      
      setReportData({
        month: monthOptions.find(m => m.value === month)?.label || month,
        period: { startDate, endDate },
        summary: {
          totalBillRevenue,
          totalOrderRevenue,
          totalRevenue,
          totalBills: filteredBills.length,
          totalOrders: filteredOrders.length,
          totalItems: sortedProducts.reduce((sum, item) => sum + item.totalQuantity, 0),
          uniqueProducts: sortedProducts.length
        },
        bestSellers: sortedProducts,
        bills: filteredBills,
        orders: filteredOrders,
        products: products
      });
      
      console.log('✅ Best sellers data processed:', sortedProducts);
      
    } catch (error) {
      console.error('❌ Error fetching best sellers:', error);
      setBestSellers([]);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const generateDetailedReport = () => {
    if (!reportData) {
      alert('No data available for report generation');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Monthly Sales Report - ${reportData.month}</title>
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
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .report-title {
            font-size: 20px;
            color: #374151;
            margin-bottom: 10px;
          }
          .period {
            font-size: 14px;
            color: #6b7280;
          }
          .summary-section {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 15px;
          }
          .summary-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #2563eb;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .summary-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin: 30px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .table th {
            background: #2563eb;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
          }
          .table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          .table tr:hover {
            background-color: #f9fafb;
          }
          .highlight-row {
            background-color: #fef3c7 !important;
            font-weight: 600;
          }
          .category-badge {
            background: #dbeafe;
            color: #1d4ed8;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
          }
          .revenue-cell {
            font-weight: 600;
            color: #059669;
          }
          .stock-low {
            color: #dc2626;
            font-weight: 600;
          }
          .stock-good {
            color: #059669;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .chart-placeholder {
            background: #f3f4f6;
            padding: 40px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
            color: #6b7280;
            border: 2px dashed #d1d5db;
          }
          @media print {
            body { margin: 10px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">KAMAL AUTO PARTS</div>
          <div class="report-title">Comprehensive Monthly Sales Report</div>
          <div class="period">Period: ${reportData.month}</div>
          <div class="period">Generated on: ${new Date().toLocaleString()}</div>
        </div>

        <div class="summary-section">
          <h2 style="margin-top: 0; color: #1f2937;">📊 Executive Summary</h2>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-value">Rs. ${reportData.summary.totalRevenue.toLocaleString()}</div>
              <div class="summary-label">Total Revenue</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">Rs. ${reportData.summary.totalBillRevenue.toLocaleString()}</div>
              <div class="summary-label">Bill Revenue</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">Rs. ${reportData.summary.totalOrderRevenue.toLocaleString()}</div>
              <div class="summary-label">Online Order Revenue</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${reportData.summary.totalBills}</div>
              <div class="summary-label">Total Bills</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${reportData.summary.totalOrders}</div>
              <div class="summary-label">Online Orders</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${reportData.summary.totalItems}</div>
              <div class="summary-label">Items Sold</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${reportData.summary.uniqueProducts}</div>
              <div class="summary-label">Unique Products</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">Rs. ${(reportData.summary.totalRevenue / (reportData.summary.totalBills + reportData.summary.totalOrders) || 0).toFixed(0)}</div>
              <div class="summary-label">Average Order Value</div>
            </div>
          </div>
        </div>

        <div class="section-title">🏆 Best Selling Items Analysis</div>
        <table class="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Total Sold</th>
              <th>Bill Sales</th>
              <th>Online Sales</th>
              <th>Revenue</th>
              <th>Avg Price</th>
              <th>Stock Left</th>
              <th>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.bestSellers.map((item, index) => `
              <tr ${index === 0 ? 'class="highlight-row"' : ''}>
                <td><strong>#${index + 1}</strong></td>
                <td><strong>${item.productName}</strong></td>
                <td><span class="category-badge">${item.category}</span></td>
                <td><strong>${item.totalQuantity}</strong></td>
                <td>${item.billQuantity}</td>
                <td>${item.orderQuantity}</td>
                <td class="revenue-cell">Rs. ${item.totalRevenue.toLocaleString()}</td>
                <td>Rs. ${item.totalQuantity > 0 ? (item.totalRevenue / item.totalQuantity).toFixed(0) : '0'}</td>
                <td>${item.remainingStock}</td>
                <td class="${item.remainingStock < 10 ? 'stock-low' : 'stock-good'}">
                  ${item.remainingStock < 10 ? '⚠️ Low' : '✅ Good'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">💰 Revenue Breakdown</div>
        <table class="table">
          <thead>
            <tr>
              <th>Revenue Source</th>
              <th>Amount (Rs.)</th>
              <th>Percentage</th>
              <th>Count</th>
              <th>Average Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Direct Sales (Bills)</strong></td>
              <td class="revenue-cell">Rs. ${reportData.summary.totalBillRevenue.toLocaleString()}</td>
              <td>${((reportData.summary.totalBillRevenue / reportData.summary.totalRevenue) * 100).toFixed(1)}%</td>
              <td>${reportData.summary.totalBills}</td>
              <td>Rs. ${(reportData.summary.totalBillRevenue / reportData.summary.totalBills || 0).toFixed(0)}</td>
            </tr>
            <tr>
              <td><strong>Online Orders</strong></td>
              <td class="revenue-cell">Rs. ${reportData.summary.totalOrderRevenue.toLocaleString()}</td>
              <td>${((reportData.summary.totalOrderRevenue / reportData.summary.totalRevenue) * 100).toFixed(1)}%</td>
              <td>${reportData.summary.totalOrders}</td>
              <td>Rs. ${(reportData.summary.totalOrderRevenue / reportData.summary.totalOrders || 0).toFixed(0)}</td>
            </tr>
            <tr class="highlight-row">
              <td><strong>TOTAL</strong></td>
              <td class="revenue-cell"><strong>Rs. ${reportData.summary.totalRevenue.toLocaleString()}</strong></td>
              <td><strong>100%</strong></td>
              <td><strong>${reportData.summary.totalBills + reportData.summary.totalOrders}</strong></td>
              <td><strong>Rs. ${((reportData.summary.totalRevenue) / (reportData.summary.totalBills + reportData.summary.totalOrders) || 0).toFixed(0)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">📦 Inventory Status Report</div>
        <table class="table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Sold This Month</th>
              <th>Stock Turnover</th>
              <th>Reorder Status</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.bestSellers.map(item => {
              const turnover = item.remainingStock > 0 ? (item.totalQuantity / (item.remainingStock + item.totalQuantity) * 100).toFixed(1) : '100.0';
              return `
                <tr>
                  <td><strong>${item.productName}</strong></td>
                  <td><span class="category-badge">${item.category}</span></td>
                  <td class="${item.remainingStock < 10 ? 'stock-low' : 'stock-good'}">${item.remainingStock}</td>
                  <td>${item.totalQuantity}</td>
                  <td>${turnover}%</td>
                  <td class="${item.remainingStock < 10 ? 'stock-low' : 'stock-good'}">
                    ${item.remainingStock < 5 ? '🚨 Critical - Reorder Now' : 
                      item.remainingStock < 10 ? '⚠️ Low - Reorder Soon' : 
                      '✅ Adequate'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p><strong>Kamal Auto Parts - Monthly Sales Report</strong></p>
          <p>This comprehensive report provides insights into sales performance, best-selling items, revenue analysis, and inventory status.</p>
          <p>Report generated automatically on ${new Date().toLocaleString()} | For internal use only</p>
        </div>
      </body>
      </html>
    `;

    // Create and download PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const viewDetailedReport = () => {
    if (!reportData) {
      alert('No data available for report generation');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Monthly Sales Report - ${reportData.month}</title>
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
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .report-title {
            font-size: 20px;
            color: #374151;
            margin-bottom: 10px;
          }
          .period {
            font-size: 14px;
            color: #6b7280;
          }
          .summary-section {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 15px;
          }
          .summary-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #2563eb;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .summary-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin: 30px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .table th {
            background: #2563eb;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
          }
          .table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          .table tr:hover {
            background-color: #f9fafb;
          }
          .highlight-row {
            background-color: #fef3c7 !important;
            font-weight: 600;
          }
          .category-badge {
            background: #dbeafe;
            color: #1d4ed8;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
          }
          .revenue-cell {
            font-weight: 600;
            color: #059669;
          }
          .stock-low {
            color: #dc2626;
            font-weight: 600;
          }
          .stock-good {
            color: #059669;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .chart-placeholder {
            background: #f3f4f6;
            padding: 40px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
            color: #6b7280;
            border: 2px dashed #d1d5db;
          }
          @media print {
            body { margin: 10px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">KAMAL AUTO PARTS</div>
          <div class="report-title">Comprehensive Monthly Sales Report</div>
          <div class="period">Period: ${reportData.month}</div>
          <div class="period">Generated on: ${new Date().toLocaleString()}</div>
        </div>

        <div class="summary-section">
          <h2 style="margin-top: 0; color: #1f2937;">📊 Executive Summary</h2>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-value">Rs. ${reportData.summary.totalRevenue.toLocaleString()}</div>
              <div class="summary-label">Total Revenue</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">Rs. ${reportData.summary.totalBillRevenue.toLocaleString()}</div>
              <div class="summary-label">Bill Revenue</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">Rs. ${reportData.summary.totalOrderRevenue.toLocaleString()}</div>
              <div class="summary-label">Online Order Revenue</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${reportData.summary.totalBills}</div>
              <div class="summary-label">Total Bills</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${reportData.summary.totalOrders}</div>
              <div class="summary-label">Online Orders</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${reportData.summary.totalItems}</div>
              <div class="summary-label">Items Sold</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${reportData.summary.uniqueProducts}</div>
              <div class="summary-label">Unique Products</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">Rs. ${(reportData.summary.totalRevenue / (reportData.summary.totalBills + reportData.summary.totalOrders) || 0).toFixed(0)}</div>
              <div class="summary-label">Average Order Value</div>
            </div>
          </div>
        </div>

        <div class="section-title">🏆 Best Selling Items Analysis</div>
        <table class="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Total Sold</th>
              <th>Bill Sales</th>
              <th>Online Sales</th>
              <th>Revenue</th>
              <th>Avg Price</th>
              <th>Stock Left</th>
              <th>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.bestSellers.map((item, index) => `
              <tr ${index === 0 ? 'class="highlight-row"' : ''}>
                <td><strong>#${index + 1}</strong></td>
                <td><strong>${item.productName}</strong></td>
                <td><span class="category-badge">${item.category}</span></td>
                <td><strong>${item.totalQuantity}</strong></td>
                <td>${item.billQuantity}</td>
                <td>${item.orderQuantity}</td>
                <td class="revenue-cell">Rs. ${item.totalRevenue.toLocaleString()}</td>
                <td>Rs. ${item.totalQuantity > 0 ? (item.totalRevenue / item.totalQuantity).toFixed(0) : '0'}</td>
                <td>${item.remainingStock}</td>
                <td class="${item.remainingStock < 10 ? 'stock-low' : 'stock-good'}">
                  ${item.remainingStock < 10 ? '⚠️ Low' : '✅ Good'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">💰 Revenue Breakdown</div>
        <table class="table">
          <thead>
            <tr>
              <th>Revenue Source</th>
              <th>Amount (Rs.)</th>
              <th>Percentage</th>
              <th>Count</th>
              <th>Average Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Direct Sales (Bills)</strong></td>
              <td class="revenue-cell">Rs. ${reportData.summary.totalBillRevenue.toLocaleString()}</td>
              <td>${((reportData.summary.totalBillRevenue / reportData.summary.totalRevenue) * 100).toFixed(1)}%</td>
              <td>${reportData.summary.totalBills}</td>
              <td>Rs. ${(reportData.summary.totalBillRevenue / reportData.summary.totalBills || 0).toFixed(0)}</td>
            </tr>
            <tr>
              <td><strong>Online Orders</strong></td>
              <td class="revenue-cell">Rs. ${reportData.summary.totalOrderRevenue.toLocaleString()}</td>
              <td>${((reportData.summary.totalOrderRevenue / reportData.summary.totalRevenue) * 100).toFixed(1)}%</td>
              <td>${reportData.summary.totalOrders}</td>
              <td>Rs. ${(reportData.summary.totalOrderRevenue / reportData.summary.totalOrders || 0).toFixed(0)}</td>
            </tr>
            <tr class="highlight-row">
              <td><strong>TOTAL</strong></td>
              <td class="revenue-cell"><strong>Rs. ${reportData.summary.totalRevenue.toLocaleString()}</strong></td>
              <td><strong>100%</strong></td>
              <td><strong>${reportData.summary.totalBills + reportData.summary.totalOrders}</strong></td>
              <td><strong>Rs. ${((reportData.summary.totalRevenue) / (reportData.summary.totalBills + reportData.summary.totalOrders) || 0).toFixed(0)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">📦 Inventory Status Report</div>
        <table class="table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Sold This Month</th>
              <th>Stock Turnover</th>
              <th>Reorder Status</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.bestSellers.map(item => {
              const turnover = item.remainingStock > 0 ? (item.totalQuantity / (item.remainingStock + item.totalQuantity) * 100).toFixed(1) : '100.0';
              return `
                <tr>
                  <td><strong>${item.productName}</strong></td>
                  <td><span class="category-badge">${item.category}</span></td>
                  <td class="${item.remainingStock < 10 ? 'stock-low' : 'stock-good'}">${item.remainingStock}</td>
                  <td>${item.totalQuantity}</td>
                  <td>${turnover}%</td>
                  <td class="${item.remainingStock < 10 ? 'stock-low' : 'stock-good'}">
                    ${item.remainingStock < 5 ? '🚨 Critical - Reorder Now' : 
                      item.remainingStock < 10 ? '⚠️ Low - Reorder Soon' : 
                      '✅ Adequate'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p><strong>Kamal Auto Parts - Monthly Sales Report</strong></p>
          <p>This comprehensive report provides insights into sales performance, best-selling items, revenue analysis, and inventory status.</p>
          <p>Report generated automatically on ${new Date().toLocaleString()} | For internal use only</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window without printing
  const reportWindow = window.open('', '_blank');
  reportWindow.document.write(htmlContent);
  reportWindow.document.close();
  
  // Remove the print and close calls
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  useEffect(() => {
    fetchBestSellersForMonth(selectedMonth);
  }, [selectedMonth]);
  return (
     <div className="w-64 bg-white border border-gray-200 rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">Best Seller Items</h4>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Real Data</span>
      </div>
      
      {/* Month Selection */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Select Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          {monthOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

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
          <p className="text-sm">No sales data for {monthOptions.find(m => m.value === selectedMonth)?.label}</p>
          <p className="text-xs">Try selecting a different month</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3 text-sm mb-4">
            {bestSellers.slice(0, 3).map((item, index) => (
              <li key={item.productId || index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-xs block truncate" title={item.productName}>
                      {item.productName}
                    </span>
                    <span className="text-xs text-gray-500">{item.category}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-bold text-xs">Rs {item.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{item.totalQuantity} sold</p>
                </div>
              </li>
            ))}
          </ul>
          
          {/* Summary Stats */}
          {reportData && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <p className="font-bold text-green-600">Rs {reportData.summary.totalRevenue.toLocaleString()}</p>
                  <p className="text-gray-600">Total Revenue</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-blue-600">{reportData.summary.totalItems}</p>
                  <p className="text-gray-600">Items Sold</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="space-y-2">
        <button 
          onClick={viewDetailedReport}
          className="w-full py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          VIEW DETAILED REPORT
        </button>
        
        <button
          onClick={generateDetailedReport}
          disabled={!reportData || loading}
          className="w-full py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          <span>📄</span>
          DOWNLOAD PDF REPORT
        </button>
      </div>
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

// Bills List Modal Component
const BillsListModal = ({ isOpen, onClose, bills }) => {
  const [selectedBill, setSelectedBill] = useState(null);
  const [monthlyBills, setMonthlyBills] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Generate month options
  const generateMonthOptions = () => {
    const months = [{ value: 'all', label: 'All Months' }];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({ value, label });
    }
    
    return months;
  };

  const monthOptions = generateMonthOptions();

  // Filter bills by month
  useEffect(() => {
    if (!bills || bills.length === 0) {
      setMonthlyBills([]);
      return;
    }

    let filtered = bills;

    if (selectedMonth !== 'all') {
      filtered = bills.filter(bill => {
        const billDate = new Date(bill.billDate || bill.createdAt);
        const billMonth = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`;
        return billMonth === selectedMonth;
      });
    }

    // Sort by date (newest first)
    filtered = filtered.sort((a, b) => new Date(b.billDate || b.createdAt) - new Date(a.billDate || a.createdAt));
    
    setMonthlyBills(filtered);
  }, [bills, selectedMonth]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Bills</h2>
              <p className="text-sm text-gray-600 mt-1">View and manage all billing records</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          
          {/* Month Filter */}
          <div className="mt-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[200px]"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="ml-3 text-sm text-gray-500">
              {monthlyBills.length} bills {selectedMonth !== 'all' ? 'in selected month' : 'total'}
            </span>
          </div>
        </div>

        {/* Bills List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {monthlyBills.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🧾</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
              <p className="text-gray-500">
                {selectedMonth !== 'all' ? 'No bills found for the selected month.' : 'No bills have been created yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthlyBills.map((bill) => (
                <div
                  key={bill._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedBill(bill)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">#{bill.billNumber}</h4>
                      <p className="text-xs text-gray-500">{formatDate(bill.billDate || bill.createdAt)}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {bill.paymentStatus || 'Paid'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{bill.customerName || 'Walk-in Customer'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items:</span>
                      <span>{bill.items?.length || 0} items</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-gray-600">Total:</span>
                      <span className="text-green-600">Rs {bill.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-blue-600">
                    Click to view details →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Bill Details</h3>
                  <p className="text-sm text-gray-600">#{selectedBill.billNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Bill Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Bill Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Date:</span> {formatDate(selectedBill.billDate || selectedBill.createdAt)}</p>
                    <p><span className="text-gray-600">Status:</span> <span className="text-green-600 font-medium">{selectedBill.paymentStatus || 'Paid'}</span></p>
                    <p><span className="text-gray-600">Amount:</span> <span className="font-semibold">Rs {selectedBill.totalAmount?.toFixed(2) || '0.00'}</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Name:</span> {selectedBill.customerName || 'Walk-in Customer'}</p>
                    <p><span className="text-gray-600">Phone:</span> {selectedBill.customerPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Items ({selectedBill.items?.length || 0})</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Product</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-700">Qty</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-700">Unit Price</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedBill.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{item.productName}</td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">Rs {item.unitPrice?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-2 text-right font-medium">Rs {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedBill.notes && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedBill.notes}</p>
                </div>
              )}
            </div>
          </div>
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
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [bills, setBills] = useState([]);

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

        // Store bills for modal
        setBills(bills);

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

  // Navigation handlers
  const handleTotalBillsClick = () => {
    setShowBillsModal(true);
  };

  const handleActiveOrdersClick = () => {
    // Navigate to seller/orders page with active orders filter
    window.location.href = '/seller/orders?status=active';
  };

  const handleCompletedOrdersClick = () => {
    // Navigate to seller/orders page with completed orders filter
    window.location.href = '/seller/orders?status=delivered';
  };

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
      icon: "📦",
      onClick: handleActiveOrdersClick
    },
    { 
      title: "Completed Orders", 
      value: summaryData.completedOrders.toString(), 
      change: "Delivered",
      icon: "✅",
      onClick: handleCompletedOrdersClick
    },
    { 
      title: "Total Bills", 
      value: summaryData.totalBills.toString(), 
      change: "All time",
      icon: "🧾",
      onClick: handleTotalBillsClick
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

      {/* Bills Modal */}
      <BillsListModal 
        isOpen={showBillsModal}
        onClose={() => setShowBillsModal(false)}
        bills={bills}
      />
    </div>
  );
};

export default Dashboard;