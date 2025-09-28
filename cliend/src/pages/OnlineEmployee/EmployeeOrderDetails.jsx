import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Package, User, MapPin, CreditCard, Calendar, Truck } from 'lucide-react';

const EmployeeOrderDetails = ({ orderId, onBack }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch order details
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/seller/orders/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`http://localhost:4000/api/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Generate PDF function
  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    const pdfContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Order Details - ${order.orderId}</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                color: #333;
                line-height: 1.6;
            }
            .header { 
                text-align: center; 
                border-bottom: 2px solid #333; 
                padding-bottom: 20px; 
                margin-bottom: 30px;
            }
            .company-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #2563eb; 
                margin-bottom: 5px;
            }
            .order-title { 
                font-size: 24px; 
                margin: 20px 0; 
                color: #333;
            }
            .section { 
                margin-bottom: 30px; 
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 8px;
            }
            .section-title { 
                font-size: 18px; 
                font-weight: bold; 
                color: #374151;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
            }
            .info-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 8px;
            }
            .info-label { 
                font-weight: bold; 
                color: #4b5563;
                min-width: 120px;
            }
            .info-value { 
                color: #1f2937;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 10px;
            }
            th, td { 
                border: 1px solid #d1d5db; 
                padding: 12px; 
                text-align: left;
            }
            th { 
                background-color: #f3f4f6; 
                font-weight: bold;
                color: #374151;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-confirmed { background: #dbeafe; color: #1e40af; }
            .status-processing { background: #e9d5ff; color: #7c3aed; }
            .status-shipped { background: #c7d2fe; color: #4338ca; }
            .status-delivered { background: #d1fae5; color: #065f46; }
            .status-cancelled { background: #fee2e2; color: #dc2626; }
            .total-section {
                text-align: right;
                margin-top: 20px;
                font-size: 18px;
                font-weight: bold;
            }
            .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
            }
            @media print {
                body { margin: 0; }
                .section { break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">Kamal Auto Parts</div>
            <div>Order Delivery Document</div>
        </div>

        <div class="order-title">Order Details - ${order.orderId}</div>

        <div class="section">
            <div class="section-title">Order Information</div>
            <div class="info-row">
                <span class="info-label">Order ID:</span>
                <span class="info-value">${order.orderId}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${new Date(order.orderDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${order.firstName} ${order.lastName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${order.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${order.phone}</span>
            </div>
            ${order.companyName ? `
            <div class="info-row">
                <span class="info-label">Company:</span>
                <span class="info-value">${order.companyName}</span>
            </div>
            ` : ''}
        </div>

        <div class="section">
            <div class="section-title">Delivery Address</div>
            <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${order.streetAddress}</span>
            </div>
            <div class="info-row">
                <span class="info-label">City:</span>
                <span class="info-value">${order.city}</span>
            </div>
            <div class="info-row">
                <span class="info-label">ZIP Code:</span>
                <span class="info-value">${order.zipCode}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Country:</span>
                <span class="info-value">${order.country}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Order Items</div>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.quantity}</td>
                            <td>Rs. ${item.price.toFixed(2)}</td>
                            <td>Rs. ${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-section">
                <div>Total Amount: Rs. ${order.totalAmount.toFixed(2)}</div>
            </div>
        </div>

        ${order.orderNotes ? `
        <div class="section">
            <div class="section-title">Order Notes</div>
            <p>${order.orderNotes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>This document was generated on ${new Date().toLocaleDateString()} for delivery purposes.</p>
            <p>Thank you for your business!</p>
        </div>
    </body>
    </html>
    `;

    printWindow.document.write(pdfContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-2xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
        <p className="text-gray-500 mb-4">The requested order could not be found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <nav className="text-sm text-gray-500 mt-1">
              <span>Dashboard</span>
              <span className="mx-2">›</span>
              <span>Orders</span>
              <span className="mx-2">›</span>
              <span className="text-gray-900">{order.orderId}</span>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            Download PDF
          </button>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Package className="text-blue-600" size={24} />
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-semibold text-gray-900">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(order.orderDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="font-semibold text-gray-900">Rs. {order.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Items ({order.items.length})</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.productName}
                            className="w-16 h-16 object-contain rounded-lg bg-white border"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{item.productName}</h4>
                          <p className="text-sm text-gray-600">Unit Price: Rs. {item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <User className="text-blue-600" size={24} />
                <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                  <p className="font-semibold text-gray-900">{order.firstName} {order.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email Address</p>
                  <p className="font-semibold text-gray-900">{order.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="font-semibold text-gray-900">{order.phone}</p>
                </div>
                {order.companyName && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Company</p>
                    <p className="font-semibold text-gray-900">{order.companyName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <MapPin className="text-blue-600" size={24} />
                <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">{order.streetAddress}</p>
                <p className="text-gray-600">{order.city}, {order.zipCode}</p>
                <p className="text-gray-600">{order.country}</p>
              </div>
            </div>
          </div>

          {order.orderNotes && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Notes</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700">{order.orderNotes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Update Status</label>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    disabled={updatingStatus}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {updatingStatus && (
                    <p className="text-sm text-gray-500">Updating status...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <CreditCard className="text-blue-600" size={24} />
                <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium text-gray-900">
                  {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-lg text-gray-900">Rs. {order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="p-6 space-y-3">
              <button
                onClick={generatePDF}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={18} />
                Download Delivery PDF
              </button>
              
              {/* <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package size={18} />
                Print Order Details
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOrderDetails;