import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Printer, Download, ArrowLeft } from "lucide-react";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/api/orders/${orderId}`);
        
        if (response.data.success) {
          setOrder(response.data.order);
          setNotes(response.data.order.orderNotes || '');
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Update order status
  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await axios.put(
        `http://localhost:4000/api/orders/${orderId}/status`,
        { status: newStatus }
      );

      if (response.data.success) {
        setOrder(prev => ({ ...prev, status: newStatus }));
        alert('Order status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Save order notes
  const saveOrderNotes = async () => {
    try {
      setSavingNotes(true);
      const response = await axios.put(
        `http://localhost:4000/api/orders/${orderId}/notes`,
        { orderNotes: notes }
      );

      if (response.data.success) {
        setOrder(prev => ({ ...prev, orderNotes: notes }));
        alert('Order notes saved successfully!');
      }
    } catch (error) {
      console.error('Error saving order notes:', error);
      alert(error.response?.data?.message || 'Failed to save order notes');
    } finally {
      setSavingNotes(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!order) return { subtotal: 0, tax: 0, total: 0 };
    
    const subtotal = order.totalAmount || 0;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Print order
  const handlePrint = () => {
    window.print();
  };

  // Download order info (placeholder)
  const handleDownload = () => {
    alert('Download functionality will be implemented');
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
          <Button 
            onClick={() => navigate('/online_employee/order-list')} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order List
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-gray-600">Order not found</p>
          <Button 
            onClick={() => navigate('/online_employee/order-list')} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Button 
          onClick={() => navigate('/online_employee/order-list')} 
          variant="outline" 
          size="sm"
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Order Details</h2>
          <p className="text-sm text-gray-500">Home &gt; Order Details</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Order ID: {order.orderId}</h2>
        <div className="flex items-center space-x-2">
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(e.target.value)}
            disabled={updatingStatus}
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {updatingStatus && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Order Date: {new Date(order.orderDate).toLocaleDateString()} 
        {order.estimatedDelivery && (
          <span> - Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Customer</h4>
            <p><strong>Name:</strong> {order.customer?.name}</p>
            <p><strong>Email:</strong> {order.customer?.email}</p>
            <p><strong>Phone:</strong> {order.customer?.phone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Order Info</h4>
            <p><strong>Payment:</strong> {order.paymentMethod}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> Rs {order.totalAmount?.toFixed(2)}</p>
            <Button className="mt-2 w-full" variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Download info
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Deliver to</h4>
            <p>{order.shippingAddress?.streetAddress}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.zipCode}</p>
            <p>{order.shippingAddress?.country}</p>
            {order.shippingAddress?.companyName && (
              <p><strong>Company:</strong> {order.shippingAddress.companyName}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Payment Info</h4>
            <p>💳 {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</p>
            <p><strong>Amount:</strong> Rs {order.totalAmount?.toFixed(2)}</p>
            <p><strong>Status:</strong> {order.status}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Notes</h4>
            <Textarea 
              placeholder="Type some notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
        <div className="flex justify-end items-center">
          <Button variant="outline" className="mr-2" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button onClick={saveOrderNotes} disabled={savingNotes}>
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold text-lg mb-4">Products</h4>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="p-2">Product Name</th>
                  <th className="p-2">Image</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{item.productName}</td>
                    <td className="p-2">
                      {item.image ? (
                        <img 
                          src={`http://localhost:4000${item.image}`} 
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="p-2">Rs {item.price?.toFixed(2)}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">Rs {(item.price * item.quantity)?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="w-full sm:w-1/3 text-sm text-right space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>Rs {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>Rs 0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>Rs 0.00</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-lg text-black">
                <span>Total:</span>
                <span>Rs {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-sm text-gray-400">
        © 2025 · OnlineEmployee Dashboard
      </footer>
    </div>
  );
};

export default OrderDetails;