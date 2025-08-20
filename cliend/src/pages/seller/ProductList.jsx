import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { Search, Filter, RefreshCw, Package, Plus, ChevronLeft, ChevronRight, BarChart3, TrendingUp, AlertCircle, Settings, Edit, Trash2, X, ImageIcon } from "lucide-react";
import ProductCard from "./ProductCard";

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [productsPerPage, setProductsPerPage] = useState(8);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0
  });

  // Category management states
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDescription, setNewCatDescription] = useState("");
  const [newCatImage, setNewCatImage] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState(null);

  // Use the proper React Router navigate hook
  const navigate = useNavigate();

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:4000/api/products");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
        
        // Calculate stats
        const totalValue = data.reduce((sum, product) => 
          sum + (product.salePrice || product.regularPrice || 0) * (product.stock || 0), 0
        );
        const lowStock = data.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
        const outOfStock = data.filter(p => (p.stock || 0) === 0).length;
        
        setStats({
          totalProducts: data.length,
          totalValue: totalValue,
          lowStock: lowStock,
          outOfStock: outOfStock
        });
        
      } catch (err) {
        console.error("❌ Error fetching products:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("❌ Error loading categories:", err);
    }
  };

  // Load categories when modal opens
  useEffect(() => {
    if (showCategoryModal) {
      fetchCategories();
    }
  }, [showCategoryModal]);

  // Get unique categories
  const categories_from_products = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['all', ...cats.sort()];
  }, [products]);

  // Filter and sort products
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = (product.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.productName || '').localeCompare(b.productName || '');
        case 'price-low':
          return (a.salePrice || a.regularPrice || 0) - (b.salePrice || b.regularPrice || 0);
        case 'price-high':
          return (b.salePrice || b.regularPrice || 0) - (a.salePrice || a.regularPrice || 0);
        case 'stock-high':
          return (b.stock || 0) - (a.stock || 0);
        case 'stock-low':
          return (a.stock || 0) - (b.stock || 0);
        case 'sales':
          return (b.sales || 0) - (a.sales || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Handle delete with better UX
  const handleDelete = async (productId) => {
    try {
      const product = products.find(p => p._id === productId);
      const confirmMessage = `Are you sure you want to delete "${product?.productName || 'this product'}"? This action cannot be undone.`;
      
      if (!window.confirm(confirmMessage)) return;

      const res = await fetch(`http://localhost:4000/api/products/${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(prev => prev.filter(p => p._id !== productId));
        // Show success message (you can replace with a toast notification)
        console.log('✅ Product deleted successfully');
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (err) {
      console.error("❌ Error deleting product:", err.message);
      alert('Failed to delete product. Please try again.');
    }
  };

  // Refresh products
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/products");
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("❌ Error refreshing products:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Category management functions
  const resetCategoryForm = () => {
    setNewCatName("");
    setNewCatDescription("");
    setNewCatImage(null);
    setCatImagePreview(null);
    setEditingCategory(null);
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCatImage(file);
      setCatImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim() || !newCatImage) {
      alert("❗ Please fill in category name and select an image.");
      return;
    }

    const catData = new FormData();
    catData.append("name", newCatName.trim());
    catData.append("description", newCatDescription.trim());
    catData.append("image", newCatImage);

    try {
      const res = await fetch("http://localhost:4000/api/categories", {
        method: "POST",
        body: catData,
      });

      if (!res.ok) throw new Error("Category creation failed");

      const newCat = await res.json();
      setCategories((prev) => [...prev, newCat.category || newCat]);
      setShowCatForm(false);
      resetCategoryForm();
      alert("✅ Category added successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add category");
    }
  };

  const handleEditCategory = async () => {
    if (!newCatName.trim()) {
      alert("❗ Please fill in category name.");
      return;
    }

    const catData = new FormData();
    catData.append("name", newCatName.trim());
    catData.append("description", newCatDescription.trim());
    if (newCatImage) {
      catData.append("image", newCatImage);
    }

    try {
      const res = await fetch(`http://localhost:4000/api/categories/${editingCategory._id}`, {
        method: "PUT",
        body: catData,
      });

      if (!res.ok) throw new Error("Category update failed");

      const updatedCat = await res.json();
      setCategories((prev) => 
        prev.map(cat => cat._id === editingCategory._id ? updatedCat.category : cat)
      );
      
      setShowCatForm(false);
      resetCategoryForm();
      alert("✅ Category updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update category");
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Are you sure you want to move "${category.name}" to recycle bin?`)) return;

    try {
      const res = await fetch(`http://localhost:4000/api/categories/${category._id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deletedBy: 'Admin',
          reason: 'Deleted from category management'
        })
      });

      if (!res.ok) throw new Error("Delete failed");

      setCategories((prev) => prev.filter((cat) => cat._id !== category._id));
      alert("✅ Category moved to recycle bin successfully.");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete category");
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setNewCatName(category.name);
    setNewCatDescription(category.description || "");
    setCatImagePreview(category.image);
    setNewCatImage(null);
    setShowCatForm(true);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate smart pagination
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-gray-600 font-medium">Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">Error Loading Products</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Enhanced Header */}
        <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
            <p className="text-sm text-gray-500 flex items-center">
              Home <ChevronRight className="w-4 h-4 mx-1" /> All Products
            </p>
          </div>
          
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 xl:min-w-max">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Total Products</p>
                  <p className="text-lg font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Total Value</p>
                  <p className="text-lg font-bold text-gray-900">Rs {stats.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-500">Low Stock</p>
                  <p className="text-lg font-bold text-gray-900">{stats.lowStock}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500">Out of Stock</p>
                  <p className="text-lg font-bold text-gray-900">{stats.outOfStock}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-3 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, category, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-max"
              >
                {categories_from_products.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-max"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock-high">Stock: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
              <option value="sales">Most Sales</option>
            </select>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{startIndex + 1}-{Math.min(startIndex + productsPerPage, filteredProducts.length)}</span> of <span className="font-semibold">{filteredProducts.length}</span> products
                {searchTerm && <span className="text-blue-600"> (filtered)</span>}
              </p>
              <select
                value={productsPerPage}
                onChange={(e) => setProductsPerPage(Number(e.target.value))}
                className="text-sm px-3 py-1 border border-gray-300 rounded"
              >
                <option value={8}>8 per page</option>
                <option value={12}>12 per page</option>
                <option value={16}>16 per page</option>
                <option value={24}>24 per page</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Manage Categories
              </button>
              <button
                onClick={() => navigate("/seller/add-product")}
                className="flex items-center gap-2 bg-black text-white rounded-lg px-6 py-2 font-semibold hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No products match your filters' : 'No products found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? "Try adjusting your search terms or filters to find what you're looking for." 
                : "Get started by adding your first product to begin managing your inventory."}
            </p>
            {searchTerm || selectedCategory !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 rounded-lg px-4 py-2 font-medium hover:bg-gray-200 transition-colors mr-3"
              >
                Clear Filters
              </button>
            ) : null}
            <button
              onClick={() => navigate("/seller/add-product")}
              className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-6 py-2 font-semibold hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid - Using your existing layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {currentProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600 order-2 sm:order-1">
                    Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 order-1 sm:order-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1 mx-2">
                      {getPageNumbers().map((pageNum, idx) => (
                        pageNum === '...' ? (
                          <span key={idx} className="px-2 py-2 text-gray-500">...</span>
                        ) : (
                          <button
                            key={idx}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? "bg-black text-white border-black"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      ))}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Category Management</h2>
                    <p className="text-sm text-gray-600">Add, edit, or delete product categories</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      resetCategoryForm();
                      setShowCatForm(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Category</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCategoryModal(false);
                      resetCategoryForm();
                      setShowCatForm(false);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex h-[calc(90vh-120px)]">
              {/* Category List */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Categories ({categories.length})
                </h3>
                
                {categories.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No categories found</h4>
                    <p className="text-gray-500 mb-4">Add your first category to get started</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {categories.map((category) => (
                      <div key={category._id} className="flex items-center p-4 bg-gray-50 rounded-xl border hover:shadow-sm transition-shadow">
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-200 mr-4">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={24} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-gray-900 truncate">
                            {category.name}
                          </h4>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Created: {new Date(category.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => openEditModal(category)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit category"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete category"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Form */}
              {showCatForm && (
                <div className="w-96 border-l border-gray-200 overflow-y-auto p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowCatForm(false);
                        resetCategoryForm();
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Enter category name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newCatDescription}
                        onChange={(e) => setNewCatDescription(e.target.value)}
                        placeholder="Enter category description (optional)"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Image <span className="text-red-500">*</span>
                      </label>
                      
                      {/* Image preview */}
                      {catImagePreview && (
                        <div className="mb-3 relative inline-block">
                          <img
                            src={catImagePreview}
                            alt="Category preview"
                            className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCatImagePreview(null);
                              setNewCatImage(null);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryImageChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPEG, or WebP. Max file size: 5MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-300">
                    <button
                      onClick={() => {
                        setShowCatForm(false);
                        resetCategoryForm();
                      }}
                      className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingCategory ? handleEditCategory : handleAddCategory}
                      disabled={!newCatName.trim() || (!newCatImage && !editingCategory)}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center space-x-2"
                    >
                      {editingCategory ? (
                        <>
                          <Edit size={16} />
                          <span>Update Category</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span>Add Category</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductGrid;