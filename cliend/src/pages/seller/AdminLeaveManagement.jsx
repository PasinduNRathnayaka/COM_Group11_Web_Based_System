import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Check, 
  X, 
  User, 
  Filter,
  Search,
  ChevronDown,
  MessageSquare,
  Eye,
  Users,
  CheckCircle,
  XCircle,
  Clock3
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const AdminLeaveManagement = () => {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    adminComment: ''
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'appliedDate',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchLeaveApplications();
  }, [filters]);

  const fetchLeaveApplications = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      queryParams.append('sortBy', filters.sortBy);
      queryParams.append('sortOrder', filters.sortOrder);
      
      const response = await fetch(`http://localhost:4000/api/leaves/admin/all?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaves(data.leaves);
        setStats(data.summary);
      } else {
        console.error('Failed to fetch leave applications:', data.error);
      }
    } catch (error) {
      console.error('Error fetching leave applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedLeave) return;

    try {
      const response = await fetch(`http://localhost:4000/api/leaves/admin/review/${selectedLeave._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...reviewData,
          reviewedBy: user?.name || 'Admin'
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Leave application ${reviewData.status} successfully!`);
        setShowReviewModal(false);
        setSelectedLeave(null);
        setReviewData({ status: 'approved', adminComment: '' });
        fetchLeaveApplications(); // Refresh the list
      } else {
        alert(`Failed to ${reviewData.status} leave application: ${data.error}`);
      }
    } catch (error) {
      console.error('Error reviewing leave application:', error);
      alert('Failed to process leave application. Please try again.');
    }
  };

  const openReviewModal = (leave, status) => {
    setSelectedLeave(leave);
    setReviewData({ status, adminComment: '' });
    setShowReviewModal(true);
  };

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = !filters.search || 
      leave.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
      leave.employeeEmpId.toLowerCase().includes(filters.search.toLowerCase()) ||
      leave.reason.toLowerCase().includes(filters.search.toLowerCase());
      
    const matchesTab = activeTab === 'all' || leave.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock3 size={16} />;
      case 'approved':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      default:
        return <Clock3 size={16} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateLeaveDays = (startDate, endDate, leaveType) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    if (leaveType === 'half-day') {
      return daysDiff * 0.5;
    }
    return daysDiff;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
              <p className="text-gray-600 mt-1">Review and manage employee leave applications</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Admin: {user?.name}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock3 className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {/* Tabs and Filters */}
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between p-6">
              <div className="flex space-x-1">
                {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                    {tab !== 'all' && stats[tab] > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                        {stats[tab]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search and Sort */}
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or reason..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>

                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="appliedDate">Applied Date</option>
                  <option value="startDate">Start Date</option>
                  <option value="employeeName">Employee Name</option>
                </select>

                <button
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                  }))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <ChevronDown size={16} className={`transform transition-transform ${
                    filters.sortOrder === 'asc' ? 'rotate-180' : ''
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Leave Applications List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading leave applications...</p>
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Applications</h3>
                <p className="text-gray-600">
                  {activeTab === 'all' 
                    ? 'No leave applications found matching your search criteria.'
                    : `No ${activeTab} leave applications found.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredLeaves.map((leave) => (
                  <div key={leave._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                          {leave.employeeId?.image ? (
                            <img
                              src={leave.employeeId.image.startsWith('/uploads/') 
                                ? `http://localhost:4000${leave.employeeId.image}` 
                                : leave.employeeId.image}
                              alt={leave.employeeName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <User size={20} />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{leave.employeeName}</h3>
                          <p className="text-sm text-gray-500">ID: {leave.employeeEmpId}</p>
                          <p className="text-sm text-gray-500">{leave.employeeId?.department || 'No Department'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(leave.status)}`}>
                          {getStatusIcon(leave.status)}
                          <span>{leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Leave Period</p>
                        <p className="text-gray-900 font-medium">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {calculateLeaveDays(leave.startDate, leave.endDate, leave.leaveType)} days ({leave.leaveType})
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Applied On</p>
                        <p className="text-gray-900">{formatDateTime(leave.appliedDate)}</p>
                      </div>

                      {leave.reviewedDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Reviewed On</p>
                          <p className="text-gray-900">{formatDateTime(leave.reviewedDate)}</p>
                          <p className="text-sm text-gray-500">by {leave.reviewedBy}</p>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Reason for Leave</p>
                      <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">{leave.reason}</p>
                    </div>

                    {leave.adminComment && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Admin Comment</p>
                        <p className="text-gray-900 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                          {leave.adminComment}
                        </p>
                      </div>
                    )}

                    {leave.status === 'pending' && (
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => openReviewModal(leave, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <X size={16} />
                          <span>Reject</span>
                        </button>
                        
                        <button
                          onClick={() => openReviewModal(leave, 'approved')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <Check size={16} />
                          <span>Approve</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {reviewData.status === 'approved' ? 'Approve' : 'Reject'} Leave Application
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">{selectedLeave.employeeName}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                  </p>
                  <p className="text-sm text-gray-600">{selectedLeave.reason}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Comment (Optional)
                </label>
                <textarea
                  value={reviewData.adminComment}
                  onChange={(e) => setReviewData(prev => ({ 
                    ...prev, 
                    adminComment: e.target.value 
                  }))}
                  placeholder={`Add a comment for ${reviewData.status === 'approved' ? 'approval' : 'rejection'}...`}
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {reviewData.adminComment.length}/300 characters
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleReview}
                  className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                    reviewData.status === 'approved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {reviewData.status === 'approved' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveManagement;