import React, { useEffect, useState, useMemo } from "react";
import { Search, Filter, RefreshCw, Package, Plus, ChevronLeft, ChevronRight, BarChart3, TrendingUp, AlertCircle } from "lucide-react";
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

  const navigate = (path) => {
    console.log('Navigate to:', path);
    // This would use your actual navigate function
    // navigate(path);
  };

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

  // Get unique categories
  const categories = useMemo(() => {
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
              {categories.map(cat => (
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
  );
};

export default ProductGrid;