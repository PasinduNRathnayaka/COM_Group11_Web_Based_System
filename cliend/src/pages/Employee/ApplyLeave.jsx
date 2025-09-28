import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Send, X, Eye, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const EmployeeLeave = () => {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('apply');

  const [formData, setFormData] = useState({
    leaveType: 'full-day',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Fetch employee's leave history
  useEffect(() => {
    if (user && user.empId) {
      fetchLeaveHistory();
    }
  }, [user]);

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/leaves/employee/${user._id}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaveHistory(data.leaves);
      } else {
        console.error('Failed to fetch leave history:', data.error);
      }
    } catch (error) {
      console.error('Error fetching leave history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-set end date if start date changes and it's a single day
    if (name === 'startDate') {
      setFormData(prev => ({
        ...prev,
        endDate: value // Default end date to start date
      }));
    }
  };

  const calculateLeaveDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    if (formData.leaveType === 'half-day') {
      return daysDiff * 0.5;
    }
    return daysDiff;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(formData.startDate);

    if (startDate < today) {
      alert('Leave start date cannot be in the past');
      return;
    }

    if (new Date(formData.endDate) < startDate) {
      alert('End date must be after or same as start date');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch('http://localhost:4000/api/leaves/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: user._id,
          ...formData
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Leave application submitted successfully!');
        setFormData({
          leaveType: 'full-day',
          startDate: '',
          endDate: '',
          reason: ''
        });
        fetchLeaveHistory(); // Refresh history
        setActiveTab('history'); // Switch to history tab
      } else {
        alert(`Failed to submit leave application: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting leave application:', error);
      alert('Failed to submit leave application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelLeaveApplication = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/leaves/${leaveId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Leave application cancelled successfully');
        fetchLeaveHistory(); // Refresh history
      } else {
        alert(`Failed to cancel leave application: ${data.error}`);
      }
    } catch (error) {
      console.error('Error cancelling leave application:', error);
      alert('Failed to cancel leave application. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
              <p className="text-gray-600 mt-1">Apply for leave and manage your applications</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Employee: {user?.name}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('apply')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'apply'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Apply for Leave
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors relative ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Leave History
              {leaveHistory.filter(leave => leave.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {leaveHistory.filter(leave => leave.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'apply' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Leave Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock size={16} className="inline mr-2" />
                      Leave Type
                    </label>
                    <select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="full-day">Full Day</option>
                      <option value="half-day">Half Day</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Leave Duration Display */}
                  <div className="flex items-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 w-full">
                      <div className="text-sm text-blue-700">
                        <span className="font-medium">Leave Duration:</span>
                      </div>
                      <div className="text-lg font-bold text-blue-800">
                        {calculateLeaveDays()} {calculateLeaveDays() === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText size={16} className="inline mr-2" />
                    Reason for Leave
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Please provide a detailed reason for your leave application..."
                    rows={4}
                    maxLength={500}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {formData.reason.length}/500 characters
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setFormData({
                      leaveType: 'full-day',
                      startDate: '',
                      endDate: '',
                      reason: ''
                    })}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Clear Form
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'history' && (
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading leave history...</p>
                  </div>
                ) : leaveHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Applications</h3>
                    <p className="text-gray-600">You haven't submitted any leave applications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Leave Applications</h3>
                    
                    {leaveHistory.map((leave) => (
                      <div key={leave._id} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(leave.status)}`}>
                                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Applied on {formatDate(leave.appliedDate)}
                              </span>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Leave Period</p>
                                <p className="text-gray-900">
                                  {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'} ({leave.leaveType})
                                </p>
                              </div>
                              
                              {leave.reviewedDate && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Reviewed</p>
                                  <p className="text-gray-900">{formatDate(leave.reviewedDate)}</p>
                                  <p className="text-sm text-gray-500">by {leave.reviewedBy}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-1">Reason</p>
                              <p className="text-gray-900 text-sm">{leave.reason}</p>
                            </div>
                            
                            {leave.adminComment && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-1">Admin Comment</p>
                                <p className="text-gray-900 text-sm bg-white p-3 rounded-lg border">
                                  {leave.adminComment}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {leave.status === 'pending' && (
                            <button
                              onClick={() => cancelLeaveApplication(leave._id)}
                              className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Cancel Application"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeave;