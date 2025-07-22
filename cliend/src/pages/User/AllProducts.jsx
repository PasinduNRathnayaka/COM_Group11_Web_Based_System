import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

const AllProducts = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: 'name', // name, price, rating, createdAt
    sortOrder: 'asc' // asc, desc
  });

  const productsPerPage = 20;

  // Helper functions from MainBanner (same style)
  const renderStarRating = (rating = 4) => {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating ? '★' : '☆'
    ).join('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK').format(price);
  };

  // Simple Product Card matching MainBanner's "For You" section style
  const ProductCard = ({ product, isLoading = false }) => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="w-24 h-24 mx-auto mb-3 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-3 bg-gray-200 animate-pulse rounded mb-1"></div>
          <div className="h-3 bg-gray-200 animate-pulse rounded w-16 mx-auto"></div>
        </div>
      );
    }

    if (!product) return null;

    const productPrice = product.salePrice || product.regularPrice || product.price || 0;
    const productImage = product.image
      ? (product.image.startsWith('http') ? product.image : `http://localhost:5000/${product.image.replace(/^\/+/, '')}`)
      : assets.Airfilter;

    return (
      <div className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition cursor-pointer">
        <Link to={`/product/${product._id || product.id}`}>
          <img
            src={productImage}
            alt={product.productName || product.name || 'Product'}
            className="w-24 h-24 mx-auto mb-3 object-contain"
            onError={(e) => {
              e.target.src = assets.Airfilter;
            }}
          />
          <p className="font-medium text-sm line-clamp-2" title={product.productName || product.name}>
            {product.productName || product.name || 'Unknown Product'}
          </p>
          <p className="text-sm text-gray-600 mt-1">Rs {formatPrice(productPrice)}</p>
          <p className="text-yellow-500 text-sm">{renderStarRating(product.rating)}</p>
        </Link>
      </div>
    );
  };

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      
      console.log('Fetching categories from: /api/categories');
      
      const response = await fetch('/api/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        },
      });

      console.log('Categories response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Categories data received:', data);
        const categoriesData = data.categories || data.data || data || [];
        setCategories(categoriesData);
      } else {
        console.warn('Failed to fetch categories, using defaults');
        // Fallback categories if API fails
        setCategories([
          { _id: 'engine', name: 'Engine', slug: 'engine' },
          { _id: 'spark-plugs', name: 'Spark Plugs', slug: 'spark-plugs' },
          { _id: 'air-filters', name: 'Air Filters', slug: 'air-filters' },
          { _id: 'fuel-filters', name: 'Fuel Filters', slug: 'fuel-filters' },
          { _id: 'ignition-coils', name: 'Ignition Coils', slug: 'ignition-coils' },
          { _id: 'brake-pads', name: 'Brake Pads', slug: 'brake-pads' },
          { _id: 'oil-filters', name: 'Oil Filters', slug: 'oil-filters' },
          { _id: 'brakes', name: 'Brakes', slug: 'brakes' },
          { _id: 'tires', name: 'Tires', slug: 'tires' },
          { _id: 'exterior', name: 'Exterior', slug: 'exterior' },
          { _id: 'interior', name: 'Interior', slug: 'interior' },
          { _id: 'filters', name: 'Filters', slug: 'filters' },
          { _id: 'lights', name: 'Lights', slug: 'lights' },
          { _id: 'exhaust', name: 'Exhaust', slug: 'exhaust' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Use fallback categories
      setCategories([
        { _id: 'engine', name: 'Engine', slug: 'engine' },
        { _id: 'spark-plugs', name: 'Spark Plugs', slug: 'spark-plugs' },
        { _id: 'air-filters', name: 'Air Filters', slug: 'air-filters' },
        { _id: 'fuel-filters', name: 'Fuel Filters', slug: 'fuel-filters' }
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch products from database with proper filtering and sorting
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: productsPerPage.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      // Add optional filters - make sure category matching works
      if (filters.category) {
        // Try multiple category matching approaches
        queryParams.append('category', filters.category);
        queryParams.append('categorySlug', filters.category);
        queryParams.append('categoryName', filters.category);
      }
      
      if (filters.minPrice && !isNaN(filters.minPrice)) {
        queryParams.append('minPrice', filters.minPrice);
      }
      
      if (filters.maxPrice && !isNaN(filters.maxPrice)) {
        queryParams.append('maxPrice', filters.maxPrice);
      }
      
      if (filters.search && filters.search.trim()) {
        // Search in multiple fields
        queryParams.append('search', filters.search.trim());
        queryParams.append('name', filters.search.trim());
        queryParams.append('productName', filters.search.trim());
      }

      console.log('Fetching products from:', `/api/products?${queryParams}`);

      const response = await fetch(`/api/products?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      // Handle different possible response structures
      let productsData = data.products || data.data || data.items || data || [];
      
      // Client-side filtering as backup if server-side filtering doesn't work
      if (Array.isArray(productsData)) {
        // Apply category filter
        if (filters.category) {
          productsData = productsData.filter(product => {
            const productCategory = product.category || product.categoryName || product.categorySlug || '';
            const productCategoryLower = productCategory.toLowerCase();
            const filterCategoryLower = filters.category.toLowerCase();
            
            return productCategoryLower === filterCategoryLower ||
                   productCategoryLower.includes(filterCategoryLower) ||
                   filterCategoryLower.includes(productCategoryLower);
          });
        }

        // Apply search filter
        if (filters.search && filters.search.trim()) {
          const searchTerm = filters.search.trim().toLowerCase();
          productsData = productsData.filter(product => {
            const productName = (product.productName || product.name || '').toLowerCase();
            const productDescription = (product.description || '').toLowerCase();
            const productBrand = (product.brand || '').toLowerCase();
            
            return productName.includes(searchTerm) ||
                   productDescription.includes(searchTerm) ||
                   productBrand.includes(searchTerm);
          });
        }

        // Apply price filters
        if (filters.minPrice && !isNaN(filters.minPrice)) {
          const minPrice = parseFloat(filters.minPrice);
          productsData = productsData.filter(product => {
            const price = product.salePrice || product.regularPrice || product.price || 0;
            return price >= minPrice;
          });
        }

        if (filters.maxPrice && !isNaN(filters.maxPrice)) {
          const maxPrice = parseFloat(filters.maxPrice);
          productsData = productsData.filter(product => {
            const price = product.salePrice || product.regularPrice || product.price || 0;
            return price <= maxPrice;
          });
        }

        // Apply sorting
        productsData.sort((a, b) => {
          let aValue, bValue;
          
          switch (filters.sortBy) {
            case 'name':
              aValue = (a.productName || a.name || '').toLowerCase();
              bValue = (b.productName || b.name || '').toLowerCase();
              break;
            case 'price':
              aValue = a.salePrice || a.regularPrice || a.price || 0;
              bValue = b.salePrice || b.regularPrice || b.price || 0;
              break;
            case 'rating':
              aValue = a.rating || 0;
              bValue = b.rating || 0;
              break;
            case 'createdAt':
              aValue = new Date(a.createdAt || a.dateAdded || 0);
              bValue = new Date(b.createdAt || b.dateAdded || 0);
              break;
            default:
              aValue = (a.productName || a.name || '').toLowerCase();
              bValue = (b.productName || b.name || '').toLowerCase();
          }
          
          if (filters.sortOrder === 'desc') {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
        });
      }
      
      const total = data.total || data.totalCount || data.count || productsData.length;
      const pages = data.totalPages || data.pages || Math.ceil(total / productsPerPage);
      
      console.log('Processed products:', productsData.length);
      console.log('Total products:', total);
      console.log('Total pages:', pages);

      if (productsData.length === 0 && currentPage === 1) {
        setError('No products found matching your criteria');
      }

      setProducts(productsData);
      setTotalPages(Math.max(pages, 1));
      setTotalProducts(total);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(`Failed to load products: ${err.message}`);
      
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when component mounts or dependencies change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters.sortBy, filters.sortOrder, filters.category, filters.minPrice, filters.maxPrice]);

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchProducts();
      }
    }, 500); // 500ms delay for search

    return () => clearTimeout(delayedSearch);
  }, [filters.search]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    console.log(`Filter change: ${filterName} = ${value}`);
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    
    // Reset to first page for non-search filters
    if (filterName !== 'search' && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Handle search form submit
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search submitted:', filters.search);
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchProducts();
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    console.log('Clearing all filters');
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setCurrentPage(1);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array(productsPerPage).fill(0).map((_, index) => (
        <ProductCard key={index} isLoading={true} />
      ))}
    </div>
  );

  // Generate pagination buttons
  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        buttons.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        buttons.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        buttons.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return buttons;
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0 text-gray-800">All Products</h1>
        
        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Sort Dropdown */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              console.log(`Sort change: ${sortBy} ${sortOrder}`);
              setFilters(prev => ({ ...prev, sortBy, sortOrder }));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="rating-desc">Rating (High to Low)</option>
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap gap-4 mb-6 p-6 bg-gray-50 rounded-lg border">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => {
              console.log('Category selected:', e.target.value);
              handleFilterChange('category', e.target.value);
            }}
            disabled={categoriesLoading}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option 
                key={category._id || category.id} 
                value={category.slug || category.category || category.name.toLowerCase()}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Min Price (Rs)</label>
          <input
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
            min="0"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Max Price (Rs)</label>
          <input
            type="number"
            placeholder="999999"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
            min="0"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleClearFilters}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.category || filters.search || filters.minPrice || filters.maxPrice) && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.category && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Category: {categories.find(cat => (cat.slug || cat.category || cat.name.toLowerCase()) === filters.category)?.name || filters.category}
              <button 
                onClick={() => handleFilterChange('category', '')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >×</button>
            </span>
          )}
          {filters.search && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Search: "{filters.search}"
              <button 
                onClick={() => handleFilterChange('search', '')}
                className="ml-2 text-green-600 hover:text-green-800"
              >×</button>
            </span>
          )}
          {filters.minPrice && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              Min: Rs {filters.minPrice}
              <button 
                onClick={() => handleFilterChange('minPrice', '')}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >×</button>
            </span>
          )}
          {filters.maxPrice && (
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
              Max: Rs {filters.maxPrice}
              <button 
                onClick={() => handleFilterChange('maxPrice', '')}
                className="ml-2 text-orange-600 hover:text-orange-800"
              >×</button>
            </span>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Error loading products</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {!loading && products.length > 0 && (
        <div className="mb-4 text-gray-600">
          Showing {((currentPage - 1) * productsPerPage) + 1} - {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
          {filters.category && (
            <span className="ml-2 text-blue-600">
              in category: {categories.find(cat => (cat.slug || cat.category || cat.name.toLowerCase()) === filters.category)?.name || filters.category}
            </span>
          )}
          {filters.search && (
            <span className="ml-2 text-green-600">
              for: "{filters.search}"
            </span>
          )}
        </div>
      )}

      {/* Products Grid - Same style as MainBanner For You section */}
      {loading ? (
        <LoadingSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl text-gray-300 mb-4">📦</div>
          <p className="text-gray-500 text-xl mb-2">No products found</p>
          <p className="text-gray-400">Try adjusting your search criteria or filters</p>
          {(filters.search || filters.category || filters.minPrice || filters.maxPrice) && (
            <button
              onClick={handleClearFilters}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Products Grid - Matching MainBanner's "For You" section exactly */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product._id || product.id || index} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
              
              {getPaginationButtons().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded transition-colors ${
                      currentPage === page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllProducts;