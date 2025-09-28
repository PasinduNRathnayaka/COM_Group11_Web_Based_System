import React, { useState, useEffect } from "react";
import { Eye } from 'lucide-react';
import EmployeeOrderDetails from './EmployeeOrderDetails';

const EmployeeOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'orderDate', direction: 'desc' });
  
  // New state for detail view
  const [viewingOrderId, setViewingOrderId] = useState(null);

  // Generate month options for the last 12 months
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
  
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Filter and search orders
  const filterOrders = (ordersData, month, status, search) => {
    let filtered = ordersData;

    // Filter by month
    if (month !== 'all') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        return orderMonth === month;
      });
    }

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(order => order.status === status);
    }

    // Search filter
    if (search) {
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  };

  // Sort orders
  const sortOrders = (ordersData, config) => {
    return [...ordersData].sort((a, b) => {
      if (config.key === 'orderDate') {
        const dateA = new Date(a[config.key]);
        const dateB = new Date(b[config.key]);
        return config.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (config.key === 'totalAmount') {
        return config.direction === 'asc' 
          ? a[config.key] - b[config.key] 
          : b[config.key] - a[config.key];
      }
      
      const valueA = a[config.key].toString().toLowerCase();
      const valueB = b[config.key].toString().toLowerCase();
      
      if (valueA < valueB) return config.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Fetch orders from database
  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/seller/orders');
      const data = await response.json();
      
      if (data.success) {
        setAllOrders(data.orders);
        const filtered = filterOrders(data.orders, selectedMonth, selectedStatus, searchTerm);
        const sorted = sortOrders(filtered, sortConfig);
        setOrders(sorted);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4000/api/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        const updatedAllOrders = allOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        setAllOrders(updatedAllOrders);
        
        const filtered = filterOrders(updatedAllOrders, selectedMonth, selectedStatus, searchTerm);
        const sorted = sortOrders(filtered, sortConfig);
        setOrders(sorted);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (month, status, search) => {
    const filtered = filterOrders(allOrders, month, status, search);
    const sorted = sortOrders(filtered, sortConfig);
    setOrders(sorted);
  };

  // Handle sort
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newConfig = { key, direction };
    setSortConfig(newConfig);
    
    const sorted = sortOrders(orders, newConfig);
    setOrders(sorted);
  };

  // Handle checkbox selection
  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  // Bulk status update
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0) return;
    
    try {
      await Promise.all(
        selectedOrders.map(orderId => updateStatus(orderId, newStatus))
      );
      setSelectedOrders([]);
    } catch (error) {
      console.error('Error updating bulk status:', error);
    }
  };

  // Handle view details
  const handleViewDetails = (orderId) => {
    setViewingOrderId(orderId);
  };

  const handleBackToList = () => {
    setViewingOrderId(null);
    // Refresh orders when returning to list
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    handleFilterChange(selectedMonth, selectedStatus, searchTerm);
  }, [selectedMonth, selectedStatus, searchTerm, allOrders]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Calculate summary stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const statusCounts = orders.reduce((counts, order) => {
    counts[order.status] = (counts[order.status] || 0) + 1;
    return counts;
  }, {});

  // If viewing order details, show the details component
  if (viewingOrderId) {
    return <EmployeeOrderDetails orderId={viewingOrderId} onBack={handleBackToList} />;
  }

  if (loading) {
    return (
      <div className="bg-[#f8fafc] min-h-screen p-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee - Order Management</h1>
            <nav className="text-sm text-gray-500 mt-1">
              <span>Employee Dashboard</span>
              <span className="mx-2">›</span>
              <span>Orders</span>
              <span className="mx-2">›</span>
              <span className="text-gray-900">Order List</span>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border">
              <span className="mr-2">📅</span>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rs {totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.delivered || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders or customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>

              {/* Month Filter */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[180px]"
              >
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[140px]"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedOrders.length} selected
                </span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusUpdate(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="">Bulk Actions</option>
                  <option value="confirmed">Mark as Confirmed</option>
                  <option value="processing">Mark as Processing</option>
                  <option value="shipped">Mark as Shipped</option>
                  <option value="delivered">Mark as Delivered</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedMonth !== 'all' || selectedStatus !== 'all' || searchTerm) && (
          <div className="px-6 py-3 bg-gray-50 border-b">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Active filters:</span>
              {selectedMonth !== 'all' && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {monthOptions.find(m => m.value === selectedMonth)?.label}
                  <button
                    onClick={() => setSelectedMonth('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedStatus !== 'all' && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                  {statusOptions.find(s => s.value === selectedStatus)?.label}
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedMonth('all');
                  setSelectedStatus('all');
                  setSearchTerm('');
                }}
                className="text-gray-500 hover:text-gray-700 ml-2"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Orders List ({orders.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input 
                    type="checkbox" 
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('orderId')}
                >
                  <div className="flex items-center gap-1">
                    Order ID {getSortIcon('orderId')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('orderDate')}
                >
                  <div className="flex items-center gap-1">
                    Date {getSortIcon('orderDate')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('customerName')}
                >
                  <div className="flex items-center gap-1">
                    Customer {getSortIcon('customerName')}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalAmount')}
                >
                  <div className="flex items-center gap-1">
                    Amount {getSortIcon('totalAmount')}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      {order.orderId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(order.orderDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customerName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {order.itemCount} items
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      Rs {order.totalAmount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewDetails(order.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {selectedMonth !== 'all' || selectedStatus !== 'all' || searchTerm
                ? 'Try adjusting your filters to see more results.'
                : 'Orders will appear here once customers start placing them.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeOrderListPage;