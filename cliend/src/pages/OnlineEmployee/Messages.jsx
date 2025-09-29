import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Mail, User, Calendar, MessageSquare, Reply, Check, X, AlertCircle, Clock, Filter, ChevronDown } from 'lucide-react';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [notification, setNotification] = useState(null);

  // Employee info (you should get this from your auth context)
  const [employee] = useState({
    id: 'ONLINE_EMP_001',
    name: 'Employee Name'
  });

  // Simple notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // API base URL - use window.location for dynamic detection or fallback
  const getApiBaseUrl = () => {
    // Try to detect if we're in development or production
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:4000';
      }
      // For production, adjust this to your actual API URL
      return `${window.location.protocol}//${hostname}:4000`;
    }
    return 'http://localhost:4000';
  };
  
  const API_BASE_URL = getApiBaseUrl();

  // Fetch contact messages with filters
  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        sortBy,
        sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      //if (filterPriority !== 'all') params.append('priority', filterPriority);
      if (filterCategory !== 'all') params.append('category', filterCategory);

      const response = await fetch(`${API_BASE_URL}/api/employee/contact-messages?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.currentPage || 1);
      } else {
        showNotification(data.message || 'Failed to fetch messages', 'error');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      showNotification('Failed to connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(currentPage);
  }, [searchTerm, filterStatus, filterPriority, filterCategory, sortBy, sortOrder, currentPage]);

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee/contact-messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: employee.id,
          employeeName: employee.name
        })
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true, readAt: new Date() } : msg
        ));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Send reply to contact message
  const sendReply = async () => {
    if (!replyText.trim()) {
      showNotification('Please enter a reply message', 'error');
      return;
    }

    try {
      setSendingReply(true);
      const response = await fetch(`${API_BASE_URL}/api/employee/contact-messages/${selectedMessage._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          replyMessage: replyText,
          employeeId: employee.id,
          employeeName: employee.name
        })
      });

      const result = await response.json();

      if (response.ok) {
        showNotification(result.emailSent ? 'Reply saved (email failed)' : 'Reply sent successfully!', result.emailSent ? 'warning' : 'success');
        setMessages(prev => prev.map(msg => 
          msg._id === selectedMessage._id 
            ? { 
                ...msg, 
                isReplied: true, 
                isRead: true,
                reply: result.reply 
              }
            : msg
        ));
        setReplyText('');
        setShowModal(false);
        setSelectedMessage(null);
      } else {
        showNotification(result.message || 'Failed to send reply', 'error');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      showNotification('Failed to send reply', 'error');
    } finally {
      setSendingReply(false);
    }
  };

{/*
  // Update message priority
  const updatePriority = async (messageId, priority) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee/contact-messages/${messageId}/priority`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priority,
          employeeId: employee.id,
          employeeName: employee.name
        })
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, priority } : msg
        ));
        showNotification('Priority updated successfully', 'success');
      } else {
        showNotification('Failed to update priority', 'error');
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      showNotification('Failed to update priority', 'error');
    }
  };
  */}

  // Update message status
  const updateStatus = async (messageId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee/contact-messages/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          employeeId: employee.id,
          employeeName: employee.name
        })
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, status } : msg
        ));
        showNotification('Status updated successfully', 'success');
      } else {
        showNotification('Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Failed to update status', 'error');
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/employee/contact-messages/${messageId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            employeeId: employee.id,
            employeeName: employee.name
          })
        });

        if (response.ok) {
          setMessages(prev => prev.filter(msg => msg._id !== messageId));
          showNotification('Message deleted successfully', 'success');
        } else {
          showNotification('Failed to delete message', 'error');
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        showNotification('Failed to delete message', 'error');
      }
    }
  };

  // View message details
  const viewMessage = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    if (!message.isRead) {
      markAsRead(message._id);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter messages based on search and status
  const messageStats = {
    total: messages.length,
    unread: messages.filter(msg => !msg.isRead).length,
    replied: messages.filter(msg => msg.isReplied).length,
    pending: messages.filter(msg => msg.isRead && !msg.isReplied).length
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          notification.type === 'warning' ? 'bg-yellow-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {notification.type === 'success' && <Check className="h-5 w-5 mr-2" />}
              {notification.type === 'error' && <X className="h-5 w-5 mr-2" />}
              {notification.type === 'warning' && <AlertCircle className="h-5 w-5 mr-2" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button
              onClick={hideNotification}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Contact Messages</h2>
        <p className="text-sm text-gray-500">Home &gt; Messages</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{messageStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{messageStats.unread}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Reply className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Replied</p>
              <p className="text-2xl font-bold text-gray-900">{messageStats.replied}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{messageStats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search messages by name, email, subject..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="new">New</option>
              {/*<option value="in_progress">In Progress</option> */}
              {/*<option value="resolved">Resolved</option> */}
            </select>

            {/*}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            */}

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="product_inquiry">Product Inquiry</option>
              <option value="complaint">Complaint</option>
              <option value="support">Support</option>
              <option value="billing">Billing</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No messages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject & Message
                  </th>
                  {/*<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr 
                    key={message._id}
                    className={`hover:bg-gray-50 ${!message.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-8 w-8 text-gray-400 bg-gray-100 rounded-full p-1" />
                        <div className="ml-3">
                          <p className={`text-sm ${!message.isRead ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                            {message.firstName} {message.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{message.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${!message.isRead ? 'font-semibold' : ''} text-gray-900 truncate max-w-xs`}>
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {message.message.length > 60 
                          ? `${message.message.substring(0, 60)}...` 
                          : message.message
                        }
                      </p>
                    </td>
                  {/*
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getPriorityColor(message.priority)}`}
                        value={message.priority}
                        onChange={(e) => updatePriority(message._id, e.target.value)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          !message.isRead 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {!message.isRead ? 'New' : 'Read'}
                        </span>
                        {message.isReplied && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Replied
                          </span>
                        )}
                         {/*{message.isNew && (
                          <span className="text-xs px-2 py-1 rounded-full font-medium border-0 focus:ring-2 focus:ring-blue-500">
                            New
                          </span>
                        )}*/}

                        {/*
                        <select
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(message.status)}`}
                          value={message.status}
                          onChange={(e) => updateStatus(message._id, e.target.value)}
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select> */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(message.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewMessage(message)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Message"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteMessage(message._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete Message"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Message from {selectedMessage.firstName} {selectedMessage.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                  <div className="flex space-x-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedMessage(null);
                    setReplyText('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Message Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedMessage.subject}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
                    <p className="text-sm text-gray-600">{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <p className="text-sm text-gray-600 capitalize">{selectedMessage.category?.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Previous Reply */}
                {selectedMessage.reply && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Previous Reply</label>
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedMessage.reply.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Replied by {selectedMessage.reply.employeeName || selectedMessage.reply.employeeId} on{' '}
                        {formatDate(selectedMessage.reply.repliedAt)}
                        {selectedMessage.reply.emailSent && (
                          <span className="ml-2 text-green-600">✓ Email sent</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reply Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedMessage.isReplied ? 'Send Another Reply' : 'Send Reply'}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="4"
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedMessage(null);
                      setReplyText('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {sendingReply ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Reply className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default Messages;
