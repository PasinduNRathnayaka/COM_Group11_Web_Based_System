import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Mail, User, Calendar, MessageSquare, Reply, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, read, unread, replied
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Fetch contact messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      //const response = await fetch('http://localhost:4000/api/employee/contact-messages');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE_URL}/api/employee/contact-messages`);
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages || []);
      } else {
        toast.error(data.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Filter messages based on search and status
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'read' && message.isRead) ||
      (filterStatus === 'unread' && !message.isRead) ||
      (filterStatus === 'replied' && message.isReplied);

    return matchesSearch && matchesStatus;
  });

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/employee/contact-messages/${messageId}/read`, {
        method: 'PUT'
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true } : msg
        ));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Send reply to contact message
  const sendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      setSendingReply(true);
      const response = await fetch(`http://localhost:4000/api/employee/contact-messages/${selectedMessage._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          replyMessage: replyText,
          employeeId: 'ONLINE_EMP_001' // Replace with actual employee ID from context
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Reply sent successfully!');
        setMessages(prev => prev.map(msg => 
          msg._id === selectedMessage._id 
            ? { ...msg, isReplied: true, reply: result.reply }
            : msg
        ));
        setReplyText('');
        setShowModal(false);
        setSelectedMessage(null);
      } else {
        toast.error(result.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Something went wrong!');
    } finally {
      setSendingReply(false);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const response = await fetch(`http://localhost:4000/api/employee/contact-messages/${messageId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setMessages(prev => prev.filter(msg => msg._id !== messageId));
          toast.success('Message deleted successfully');
        } else {
          toast.error('Failed to delete message');
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Something went wrong!');
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

  // Get message stats
  const messageStats = {
    total: messages.length,
    unread: messages.filter(msg => !msg.isRead).length,
    replied: messages.filter(msg => msg.isReplied).length,
    pending: messages.filter(msg => msg.isRead && !msg.isReplied).length
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Messages</h2>
      <p className="text-sm text-gray-500 mb-6">Home &gt; Messages</p>
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
            <Calendar className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{messageStats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
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
          
          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
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
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.map((message) => (
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
                        {message.message.length > 50 
                          ? `${message.message.substring(0, 50)}...` 
                          : message.message
                        }
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(message.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          !message.isRead 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {!message.isRead ? 'Unread' : 'Read'}
                        </span>
                        {message.isReplied && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Replied
                          </span>
                        )}
                      </div>
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
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Message from {selectedMessage.firstName} {selectedMessage.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedMessage.email}</p>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
                  <p className="text-sm text-gray-600">{formatDate(selectedMessage.createdAt)}</p>
                </div>

                {/* Previous Reply */}
                {selectedMessage.reply && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Previous Reply</label>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedMessage.reply.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Replied by {selectedMessage.reply.employeeId} on{' '}
                        {formatDate(selectedMessage.reply.repliedAt)}
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

       <footer className="mt-8 text-center text-sm text-gray-400">
        © 2025 · OnlineEmployee Dashboard
      </footer>
      
    </div>
  );
};

export default Messages;

