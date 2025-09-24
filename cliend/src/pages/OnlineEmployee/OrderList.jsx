import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch orders function
  const fetchOrders = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:4000/api/orders?page=${pageNum}`);
      
      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages);
        setPage(pageNum);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Load orders on component mount and when page changes
  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/orders/${orderId}/status`,
        { status: newStatus }
      );

      if (response.data.success) {
        // Refresh orders list
        fetchOrders(page);
        alert('Order status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.message || 'Failed to update order status');
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Order List</h2>
      <p className="text-sm text-gray-500 mb-6">Home &gt; Order List</p>
      
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <button 
            onClick={() => fetchOrders(page)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-auto border-separate border-spacing-y-2">
                <thead className="text-left text-gray-600">
                  <tr>
                    <th className="p-2">Product(s)</th>
                    <th className="p-2">Order ID</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Customer Name</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order, index) => (
                      <tr key={order._id || index} className="bg-gray-50 hover:bg-gray-100">
                        <td className="p-2">
                          <div className="max-w-xs truncate" title={order.product}>
                            {order.product}
                          </div>
                        </td>
                        <td className="p-2 font-mono text-xs">{order.orderId}</td>
                        <td className="p-2">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="p-2">{order.customerName}</td>
                        <td className="p-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-2 font-semibold">Rs {order.amount.toFixed(2)}</td>
                        <td className="p-2">
                          <button
                            onClick={() => {
                              // You can implement view order details here
                              console.log('View order:', order.orderId);
                            }}
                            className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded ${
                      page === 1 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {generatePageNumbers().map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => pageNum !== '...' && handlePageChange(pageNum)}
                      disabled={pageNum === '...'}
                      className={`px-3 py-1 rounded ${
                        pageNum === page
                          ? 'bg-black text-white'
                          : pageNum === '...'
                          ? 'bg-transparent cursor-default'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded ${
                      page === totalPages 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="mt-8 text-center text-sm text-gray-400">
        © 2025 · OnlineEmployee Dashboard
      </footer>
    </div>
  );
};

export default OrderList;
