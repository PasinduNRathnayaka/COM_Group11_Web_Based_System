import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

const AllProducts = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: 'name', // name, price, rating
    sortOrder: 'asc' // asc, desc
  });

  const productsPerPage = 20;

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: productsPerPage,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/products?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`, // Add auth if needed
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      setProducts(data.products || data.data || []);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / productsPerPage));
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      
      // Fallback to sample data if API fails
      const sampleProducts = Array(20).fill(null).map((_, index) => ({
        id: `product-${index + 1}`,
        name: `NGK Iridium Plug ${index + 1}`,
        price: 3200 + (index * 100),
        rating: Math.floor(Math.random() * 5) + 1,
        image: assets.NGK,
        category: 'Spark Plugs',
        description: `High-quality spark plug for various vehicle models ${index + 1}`,
      }));
      
      setProducts(sampleProducts);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when component mounts or dependencies change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array(20).fill(0).map((_, index) => (
        <div key={index} className="border rounded-lg p-4 text-center shadow animate-pulse">
          <div className="h-28 w-full bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="px-6 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">All Products</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Search
            </button>
          </form>

          {/* Sort Dropdown */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy, sortOrder }));
            }}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="rating-desc">Rating (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          <option value="spark-plugs">Spark Plugs</option>
          <option value="air-filters">Air Filters</option>
          <option value="fuel-filters">Fuel Filters</option>
          <option value="ignition-coils">Ignition Coils</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
        />

        <button
          onClick={() => {
            setFilters({
              category: '',
              minPrice: '',
              maxPrice: '',
              search: '',
              sortBy: 'name',
              sortOrder: 'asc'
            });
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>Error loading products: {error}</p>
          <button
            onClick={fetchProducts}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
          <p className="text-gray-400">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product, index) => (
              <div
                key={product.id || index}
                className="border rounded-lg p-4 text-center shadow hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img 
                  src={product.image || assets.NGK} 
                  alt={product.name} 
                  className="h-28 w-full object-contain mb-2" 
                />
                <h2 className="font-semibold text-sm mb-1">{product.name}</h2>
                <p className="text-gray-700 text-sm mb-1">Rs {product.price}</p>
                <div className="text-yellow-500 text-sm">
                  {'★'.repeat(product.rating || 0)}{'☆'.repeat(5 - (product.rating || 0))}
                </div>
                {product.category && (
                  <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          )}

          {/* Products Count */}
          <div className="text-center mt-4 text-gray-600">
            Showing {products.length} of {totalPages * productsPerPage} products
          </div>
        </>
      )}
    </div>
  );
};

export default AllProducts;
