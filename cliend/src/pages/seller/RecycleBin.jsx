import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Calendar, 
  User, 
  Package, 
  Users, 
  FolderOpen,
  Search,
  Filter,
  CheckCircle,
  X
} from 'lucide-react';
import axios from 'axios';

const RecycleBin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [filterBy, setFilterBy] = useState('all');

  // Fetch deleted items
  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      const [productsRes, employeesRes, categoriesRes] = await Promise.all([
        axios.get('http://localhost:4000/api/products/recycle-bin'),
        axios.get('http://localhost:4000/api/employees/recycle-bin'),
        axios.get('http://localhost:4000/api/categories/recycle-bin')
      ]);

      setProducts(productsRes.data);
      setEmployees(employeesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching deleted items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  // Get current items based on active tab
  const getCurrentItems = () => {
    let items = [];
    switch (activeTab) {
      case 'products':
        items = products;
        break;
      case 'employees':
        items = employees;
        break;
      case 'categories':
        items = categories;
        break;
      default:
        items = [];
    }

    // Apply search filter
    if (searchTerm) {
      items = items.filter(item => {
        const searchFields = activeTab === 'products' 
          ? [item.productName, item.brand, item.category]
          : activeTab === 'employees'
          ? [item.name, item.empId, item.category]
          : [item.name, item.description];
        
        return searchFields.some(field => 
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply date filter
    if (filterBy !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterBy) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      items = items.filter(item => new Date(item.deletedAt) >= filterDate);
    }

    return items;
  };

  // Handle restore item
  const handleRestore = async (itemId) => {
    try {
      const endpoint = `http://localhost:4000/api/${activeTab}/${itemId}/restore`;
      await axios.post(endpoint);
      
      alert('✅ Item restored successfully!');
      fetchDeletedItems();
      setSelectedItems([]);
    } catch (error) {
      console.error('Error restoring item:', error);
      alert('❌ Failed to restore item');
    }
  };

  // Handle permanent delete
  const handlePermanentDelete = async (itemId) => {
    try {
      const endpoint = `http://localhost:4000/api/${activeTab}/${itemId}/permanent`;
      await axios.delete(endpoint);
      
      alert('✅ Item permanently deleted!');
      fetchDeletedItems();
      setSelectedItems([]);
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      alert('❌ Failed to permanently delete item');
    }
  };

  // Handle bulk operations
  const handleBulkOperation = async (operation) => {
    if (selectedItems.length === 0) return;

    try {
      const promises = selectedItems.map(itemId => {
        const endpoint = operation === 'restore' 
          ? `http://localhost:4000/api/${activeTab}/${itemId}/restore`
          : `http://localhost:4000/api/${activeTab}/${itemId}/permanent`;
        
        return operation === 'restore' 
          ? axios.post(endpoint) 
          : axios.delete(endpoint);
      });

      await Promise.all(promises);
      
      const message = operation === 'restore' 
        ? `✅ ${selectedItems.length} items restored successfully!`
        : `✅ ${selectedItems.length} items permanently deleted!`;
      
      alert(message);
      fetchDeletedItems();
      setSelectedItems([]);
    } catch (error) {
      console.error(`Error with bulk ${operation}:`, error);
      alert(`❌ Failed to ${operation} selected items`);
    }
  };

  // Handle clear entire recycle bin
  const handleClearRecycleBin = async () => {
    try {
      const endpoint = `http://localhost:4000/api/${activeTab}/recycle-bin/clear`;
      const response = await axios.post(endpoint);
      
      alert(`✅ ${response.data.message}`);
      fetchDeletedItems();
      setSelectedItems([]);
    } catch (error) {
      console.error('Error clearing recycle bin:', error);
      alert('❌ Failed to clear recycle bin');
    }
  };

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Select all items
  const selectAllItems = () => {
    const currentItems = getCurrentItems();
    const allIds = currentItems.map(item => item._id);
    setSelectedItems(selectedItems.length === allIds.length ? [] : allIds);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString();
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'products': return products.length;
      case 'employees': return employees.length;
      case 'categories': return categories.length;
      default: return 0;
    }
  };

  const currentItems = getCurrentItems();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Recycle Bin</h1>
                <p className="text-gray-600">Manage deleted items and restore or permanently delete them</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-500">
                {products.length + employees.length + categories.length} items in recycle bin
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'products', name: 'Products', icon: Package },
                { id: 'employees', name: 'Employees', icon: Users },
                { id: 'categories', name: 'Categories', icon: FolderOpen }
              ].map(tab => {
                const Icon = tab.icon;
                const count = getTabCount(tab.id);
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedItems([]);
                      setSearchTerm('');
                    }}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Controls */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All time</option>
                    <option value="today">Today</option>
                    <option value="week">Past week</option>
                    <option value="month">Past month</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedItems.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkOperation('restore')}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => {
                      setConfirmAction(() => () => handleBulkOperation('delete'));
                      setShowConfirmModal(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Forever</span>
                  </button>
                </div>
              )}

              {/* Clear All Button */}
              {currentItems.length > 0 && (
                <button
                  onClick={() => {
                    setConfirmAction(() => handleClearRecycleBin);
                    setShowConfirmModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No deleted {activeTab} found
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : `All ${activeTab} are currently active`
                }
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === currentItems.length}
                    onChange={selectAllItems}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({currentItems.length})
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <div key={item._id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => toggleItemSelection(item._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      {/* Item Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Image/Avatar */}
                            <div className="flex-shrink-0">
                              {activeTab === 'products' ? (
                                <img
                                  src={item.image || '/placeholder.png'}
                                  alt={item.productName}
                                  className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                />
                              ) : activeTab === 'employees' ? (
                                <img
                                  src={item.image || '/placeholder-avatar.png'}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-full object-cover bg-gray-100"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <FolderOpen className="w-6 h-6 text-blue-600" />
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {activeTab === 'products' ? item.productName : item.name}
                              </h3>
                              
                              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                {activeTab === 'products' && (
                                  <>
                                    <span>ID: {item.productId}</span>
                                    <span>•</span>
                                    <span>Category: {item.category}</span>
                                    {item.brand && (
                                      <>
                                        <span>•</span>
                                        <span>Brand: {item.brand}</span>
                                      </>
                                    )}
                                  </>
                                )}
                                
                                {activeTab === 'employees' && (
                                  <>
                                    <span>ID: {item.empId}</span>
                                    <span>•</span>
                                    <span>Category: {item.category}</span>
                                    {item.contact && (
                                      <>
                                        <span>•</span>
                                        <span>Contact: {item.contact}</span>
                                      </>
                                    )}
                                  </>
                                )}
                                
                                {activeTab === 'categories' && (
                                  <>
                                    {item.description && (
                                      <span>{item.description}</span>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Deletion Info */}
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Deleted: {formatDate(item.deletedAt)}</span>
                                </div>
                                {item.deletedBy && (
                                  <div className="flex items-center space-x-1">
                                    <User className="w-3 h-3" />
                                    <span>By: {item.deletedBy}</span>
                                  </div>
                                )}
                                {item.deletionReason && (
                                  <div className="flex items-center space-x-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Reason: {item.deletionReason}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleRestore(item._id)}
                              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setConfirmAction(() => () => handlePermanentDelete(item._id));
                                setShowConfirmModal(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete Forever</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirm Permanent Deletion
                    </h3>
                    <p className="text-sm text-gray-500">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700">
                    Are you sure you want to permanently delete these items? 
                    This will remove all associated files and data permanently.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setConfirmAction(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      confirmAction?.();
                      setShowConfirmModal(false);
                      setConfirmAction(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Forever</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success/Info Messages */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <h4 className="font-medium mb-1">Recycle Bin Information</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Items in the recycle bin can be restored or permanently deleted</li>
                <li>• Restored items will return to their original location</li>
                <li>• Permanently deleted items cannot be recovered</li>
                <li>• Use bulk operations to manage multiple items at once</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecycleBin;