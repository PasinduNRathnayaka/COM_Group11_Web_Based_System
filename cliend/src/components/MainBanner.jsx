import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import RateUsPopup from '../components/RateUsPopup'; 
import { useState, useEffect, useRef } from 'react';

const MainBanner = () => {

  const { user } = useAppContext();

  const [showRatePopup, setShowRatePopup] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  
  // Auto-sliding carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);
  const carouselRef = useRef(null);

  // Render compact star rating for product cards (copied from your other components)
const renderCompactStarRating = (rating, reviewCount) => {
  if (reviewCount === 0) {
    return (
      <div className="flex items-center justify-center mt-1">
        <div className="flex text-gray-300 text-xs">
          {'★'.repeat(5)}
        </div>
        <span className="text-xs text-gray-400 ml-1">(0)</span>
      </div>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center justify-center mt-1">
      <div className="flex text-yellow-500 text-xs">
        {/* Full stars */}
        {Array(fullStars).fill().map((_, i) => (
          <span key={`full-${i}`}>★</span>
        ))}
        {/* Half star */}
        {hasHalfStar && <span>★</span>}
        {/* Empty stars */}
        {Array(emptyStars).fill().map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-1">
        ({rating}) • {reviewCount}
      </span>
    </div>
  );
};

// Fetch reviews for a single product
const fetchProductReviews = async (productId) => {
  try {
    const response = await fetch(`/api/product-reviews/product/${productId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.reviews && Array.isArray(data.reviews)) {
        const reviews = data.reviews;
        const averageRating = reviews.length > 0 
          ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
          : 0;
        return {
          averageRating: parseFloat(averageRating),
          reviewCount: reviews.length
        };
      }
    }
    return { averageRating: 0, reviewCount: 0 };
  } catch (err) {
    console.warn(`Failed to fetch reviews for product ${productId}:`, err);
    return { averageRating: 0, reviewCount: 0 };
  }
};

  useEffect(() => {
  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        console.log('Reviews data:', data.reviews);
        setReviews(data.reviews || []);
      } else {
        console.error('Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  fetchReviews();
}, []);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/products');
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    const productsArray = Array.isArray(data) ? data : data.products || [];
    
    console.log('Fetching ratings for products...');
    
    // Fetch ratings for each product
    const productsWithRatings = await Promise.all(
      productsArray.map(async (product) => {
        const ratings = await fetchProductReviews(product._id || product.id);
        return {
          ...product,
          averageRating: ratings.averageRating,
          reviewCount: ratings.reviewCount
        };
      })
    );
    
    setProducts(productsWithRatings);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
          setCategories(getStaticCategories());
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(getStaticCategories());
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (user) {
      setShowRatePopup(false);
    }
  }, [user]);

  // Auto-sliding carousel effect
  useEffect(() => {
    if (products.length === 0) return;

    const itemsPerSlide = getItemsPerSlide();
    const maxSlides = Math.ceil(products.length / itemsPerSlide);

    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % maxSlides);
      }, 4000); // Slide every 4 seconds
    };

    startAutoSlide();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [products.length]);

  // Get items per slide based on screen size
  const getItemsPerSlide = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 768) return 4; // md screens and up
      if (window.innerWidth >= 640) return 3; // sm screens
      return 2; // mobile
    }
    return 4; // default
  };

  // Handle manual slide navigation
  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
    // Reset auto-slide timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const itemsPerSlide = getItemsPerSlide();
    const maxSlides = Math.ceil(products.length / itemsPerSlide);
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % maxSlides);
    }, 4000);
  };

  const nextSlide = () => {
    const itemsPerSlide = getItemsPerSlide();
    const maxSlides = Math.ceil(products.length / itemsPerSlide);
    goToSlide((currentSlide + 1) % maxSlides);
  };

  const prevSlide = () => {
    const itemsPerSlide = getItemsPerSlide();
    const maxSlides = Math.ceil(products.length / itemsPerSlide);
    goToSlide(currentSlide === 0 ? maxSlides - 1 : currentSlide - 1);
  };

  {/*const getStaticCategories = () => [
    { name: 'Engine', image: assets.Bugatti_Chiron_Engine, category: 'engine', _id: 'static-engine' },
    { name: 'Brakes', image: assets.brakes_suspension, category: 'brakes', _id: 'static-brakes' },
    { name: 'Tires', image: assets.Tires_and_Wheels, category: 'tires', _id: 'static-tires' },
    { name: 'Exterior', image: assets.Exterior_and_Body_parts, category: 'exterior', _id: 'static-exterior' },
    { name: 'Interior', image: assets.Interior, category: 'interior', _id: 'static-interior' },
    { name: 'Filters', image: assets.Filters, category: 'filters', _id: 'static-filters' },
    { name: 'Lights', image: assets.lights, category: 'lights', _id: 'static-lights' },
    { name: 'Exhaust', image: assets.exhaust, category: 'exhaust', _id: 'static-exhaust' },
  ];*/}

  const renderStarRating = (rating = 4) => {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating ? '★' : '☆'
    ).join('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK').format(price);
  };

  const ProductCard = ({ product, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 text-center min-w-[180px] flex-shrink-0">
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
    <div className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition cursor-pointer min-w-[180px] flex-shrink-0">
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
        {/* Real Rating Display - NEW ADDITION */}
        {renderCompactStarRating(product.averageRating || 0, product.reviewCount || 0)}
      </Link>
    </div>
  );
};

  const CategoryCard = ({ category, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <div className="w-full bg-gray-200 animate-pulse rounded mb-2" style={{ height: '150px' }}></div>
        <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!category) return null;

  const categoryImage = category.image
    ? (category.image.startsWith('http') ? category.image : `http://localhost:5000/${category.image.replace(/^\/+/, '')}`)
    : assets.Airfilter;

  // Create consistent category slug for URL
  const categorySlug = category.slug || category.category || category.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link 
      to={`/allproducts`}
      className="block" // Add block class for proper link behavior
    >
      <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition cursor-pointer flex flex-col">
        <div className="flex-grow mb-2">
          <img
            src={categoryImage}
            alt={category.name}
            className="w-full h-full object-cover rounded"
            style={{ maxHeight: '150px', width: '100%' }}
            onError={(e) => {
              e.target.src = assets.Airfilter;
            }}
          />
        </div>
        <p className="text-lg font-semibold">{category.name}</p>
      </div>
    </Link>
  );
};

  return (
    <>
      {/* Banner */}
      <div className='relative h-[300px] md:h-[400px] overflow-hidden'>
        <img src={assets.mainbanner_lr} alt="banner" className='w-full h-full object-cover hidden md:block' />
        <img src={assets.mainbanner_sm} alt="banner" className='w-full h-full object-cover md:hidden' />
      </div>

      {user && (
        <div className="w-full flex justify-end pr-6 mt-6">
          <button className="text-sm text-primary hover:underline font-semibold" onClick={() => setShowRatePopup(true)}>
            We'd love your feedback! Rate us & help us improve →
          </button>
        </div>
      )}

      <div className="flex flex-col items-center justify-center text-left px-4 mt-8 mb-12">
        <h1 className='text-2xl md:text-4xl font-bold mb-6'>Explore Genuine Auto Parts at the Best Prices</h1>

        {user && (
          <>
            <div className="flex flex-col md:flex-row gap-4">
              <Link to="/allproducts" className='group flex items-center gap-2 px-7 md:px-9 py-3 bg-primary hover:bg-primary-dull transition rounded text-white cursor-pointer'>
                Shop Now
                <img className='w-4 transition group-hover:translate-x-1' src={assets.arrow} alt="arrow" />
              </Link>
             {/* <Link to="/allproducts" className='group flex items-center gap-2 px-9 py-3 bg-primary hover:bg-primary-dull transition rounded text-white cursor-pointer'>
                Explore Deals
                <img className='w-4 transition group-hover:translate-x-1' src={assets.arrow} alt="arrow" />
              </Link>
              */}
            </div>
            {showRatePopup && <RateUsPopup onClose={() => setShowRatePopup(false)} />}
          </>
        )}
      </div>

      {/* Show categories & products */}
      {(user || !user) && (
        <>
          <div className="px-4 mt-12 mb-16">
            <h1 className="text-left text-xl md:text-2xl font-bold mb-6">Main Categories</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {categoriesLoading
                ? Array(8).fill(0).map((_, i) => <CategoryCard key={i} isLoading={true} />)
                : categories.map((category) => (
                    <CategoryCard key={category._id || category.category} category={category} />
                  ))}
            </div>
          </div>

          {/* For You Section - Updated with Auto-sliding Carousel */}
          <div className="px-4 mt-16 mb-20">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-left text-xl md:text-2xl font-bold">For You</h1>
              <div className="flex items-center gap-2">
                {/* Navigation arrows */}
                <button 
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Previous slide"
                >
                  <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button 
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Next slide"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Carousel Container */}
            <div className="relative overflow-hidden" ref={carouselRef}>
              <div 
                className="flex transition-transform duration-500 ease-in-out gap-6"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                  width: `${Math.ceil(products.length / getItemsPerSlide()) * 100}%`
                }}
              >
                {loading ? (
                  // Loading skeleton
                  Array(12).fill(0).map((_, i) => (
                    <div key={i} style={{ width: `${100 / getItemsPerSlide()}%` }} className="flex-shrink-0">
                      <ProductCard isLoading={true} />
                    </div>
                  ))
                ) : (
                  // Group products into slides
                  (() => {
                    const itemsPerSlide = getItemsPerSlide();
                    const slides = [];
                    for (let i = 0; i < products.length; i += itemsPerSlide) {
                      slides.push(products.slice(i, i + itemsPerSlide));
                    }
                    return slides.map((slideProducts, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {slideProducts.map((product) => (
                          <ProductCard key={product._id || product.id} product={product} />
                        ))}
                      </div>
                    ));
                  })()
                )}
              </div>
            </div>

            {/* Slide indicators */}
            {!loading && products.length > 0 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array(Math.ceil(products.length / getItemsPerSlide())).fill(0).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentSlide === index ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Link to="/allproducts" className="text-sm text-primary hover:underline font-semibold">
                View More →
              </Link>
            </div>
          </div>
        </>
      )}

      {!user && (
        <>
          {/* Happy customer */}
          <div className="px-4 mt-16 mb-20">
            <h1 className="text-left text-xl md:text-2xl font-bold mb-6">Our Happy Customers</h1>
            <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pb-2">
             {reviews.length > 0 ? (
              reviews.map((cust, i) => (
                <div key={i} className="min-w-[250px] sm:min-w-[280px] bg-white shadow rounded-xl p-4">
                  <p className="text-yellow-500 mb-2">
                    {'★'.repeat(cust.rating || 5)}{'☆'.repeat(5 - (cust.rating || 5))}
                  </p>
                  <p className="text-sm italic mb-2">"{cust.review}"</p>
                  <p className="text-sm font-semibold">{cust.user?.name || 'Anonymous'}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No customer reviews yet.</p>
            )}
            </div>
          </div>

          {/* About Section */}
          <div className="flex flex-col md:flex-row items-center gap-6 px-4 mt-20 mb-20">
            <img src={assets.wharehouse} alt="warehouse" className="h-28 md:h-44 w-full md:w-[40%] object-cover rounded-tr-[80px] rounded-br-[80px]" />
            <p className="text-sm md:text-base font-medium leading-relaxed text-justify">
              <strong>Kamal Auto Parts</strong> is your trusted online destination for high-quality auto parts, car accessories, and vehicle care products in Sri Lanka.
              We are dedicated to providing a wide range of genuine and imported products to vehicle owners, garages, and car enthusiasts across the island. Whether you're upgrading,
              maintaining, or repairing – Kamal Auto Parts is here to deliver reliability, performance, and value, all in one place.
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default MainBanner;