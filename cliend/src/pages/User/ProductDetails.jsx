// src/pages/User/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import ProductReviewPopup from '../../components/ProductReviewPopup';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, user } = useAppContext();

  // State for product data
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviews, setReviews] = useState([]); // local review state

const getImageUrl = (path) => {
    if (!path) return assets.wheel1;
    return path.startsWith('http') ? path : `http://localhost:5000${path}`;
  };


  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // First, fetch all products
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        
        // Find the product by matching the ID with productId or _id
        const foundProduct = products.find(p => 
          p._id === id || 
          p.productId === id ||
          p.productName?.toLowerCase().replace(/\s+/g, '-') === id
        );

        if (!foundProduct) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        // Transform the database product to match your component's expected format
        const transformedProduct = {
          id: foundProduct._id,
          name: foundProduct.productName,
          brand: foundProduct.brand || 'Unknown Brand',
          price: foundProduct.salePrice || foundProduct.regularPrice,
          discount: foundProduct.regularPrice - (foundProduct.salePrice || foundProduct.regularPrice),
          images: [
            getImageUrl(foundProduct.image),
            ...(foundProduct.gallery?.map(getImageUrl) || []),
            ...(foundProduct.gallery?.length < 2 ? [{/*assets.wheel2, assets.wheel3*/}] : [])
          ],
          description: foundProduct.description || 'No description available',
          specs: [
            { key: 'Brand', value: foundProduct.brand || 'Unknown' },
            { key: 'Category', value: foundProduct.category || 'Automotive Parts' },
            { key: 'Product Code', value: foundProduct.code || 'N/A' },
            { key: 'Stock', value: `${foundProduct.stock || 0} units available` },
          ],
          // Default reviews (you can replace this with actual reviews from database later)
          reviews: [
            { name: 'John D.', rating: 5, comment: 'Great product! Highly recommended.', date: 'June 15, 2025' },
            { name: 'Sarah M.', rating: 4, comment: 'Good quality, fast delivery.', date: 'June 10, 2025' },
          ],
          faqs: [
            { question: 'Is this product genuine?', answer: 'Yes, all our products are genuine and come with warranty.' },
            { question: 'What is the return policy?', answer: '30-day return policy with full refund.' },
          ],
          stock: foundProduct.stock || 0,
        };

        setProduct(transformedProduct);
        setReviews(transformedProduct.reviews);

        // Fetch related products from the same category
        if (foundProduct.category) {
          try {
            const relatedResponse = await fetch(`/api/products/category/${foundProduct.category}`);
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              const related = relatedData
                .filter(p => p._id !== foundProduct._id) // Exclude current product
                .slice(0, 8) // Limit to 8 products
                .map(p => ({
                  id: p._id,
                  name: p.productName,
                  price: p.salePrice || p.regularPrice,
                   image: getImageUrl(p.image),
                }));
              setRelatedProducts(related);
            }
          } catch (err) {
            console.warn('Failed to fetch related products:', err);
            // Use fallback related products if API fails
            setRelatedProducts([
              {
                id: 'fallback-1',
                name: 'Related Product 1',
                price: 25000,
                image: assets.wheel5,
              },
              {
                id: 'fallback-2',
                name: 'Related Product 2',
                price: 30000,
                image: assets.wheel5,
              },
            ]);
          }
        }

      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please log in first.');
      return;
    }
    
    if (product.stock <= 0) {
      toast.error('Product is out of stock.');
      return;
    }
    
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available.`);
      return;
    }
    
    addToCart(product, quantity);
    toast.success('Added to cart!');
  };

  // Loading state
  if (loading) {
    return (
      <div className="px-4 md:px-10 py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Loading product...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="px-4 md:px-10 py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'Product not found!'}
          </h2>
          <button 
            onClick={() => navigate('/products')} 
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-10 py-10">
      {/* Product Top Section */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Image Thumbnails */}
        <div className="flex flex-col gap-3">
          {product.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="thumbnail"
              onClick={() => setSelectedImage(idx)}
              className={`w-20 h-20 object-contain border rounded cursor-pointer ${selectedImage === idx ? 'border-primary' : ''}`}
              onError={(e) => {
                e.target.src = assets.wheel1; // Fallback image
              }}
            />
          ))}
        </div>

        {/* Main Image and Info */}
        <div className="flex-1">
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            className="w-full max-w-md object-contain border rounded-xl"
            onError={(e) => {
              e.target.src = assets.wheel1; // Fallback image
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-2">Brand: {product.brand}</p>
          
          {/* Stock Status */}
          <div className="mb-2">
            <span className={`text-sm px-2 py-1 rounded ${
              product.stock > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="flex gap-2 items-center mb-4">
            <span className="text-xl text-primary font-bold">Rs {product.price.toLocaleString()}</span>
            {product.discount > 0 && (
              <span className="line-through text-sm text-red-500">
                Rs {(product.price + product.discount).toLocaleString()}
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-4 flex items-center gap-3">
            <span className="font-medium">Qty:</span>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
              className="w-16 px-2 py-1 border rounded"
              disabled={product.stock <= 0}
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleAddToCart} 
              className={`px-6 py-2 rounded ${
                product.stock > 0 
                  ? 'bg-black text-white hover:bg-gray-900' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button
              className="border border-black px-6 py-2 rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={product.stock <= 0}
              onClick={() => {
                if (!user) return toast.error('Please log in');
                navigate('/checkout');
              }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <div className="flex gap-100 border-b mb-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2 ${activeTab === 'details' ? 'border-b-2 border-primary font-semibold' : ''}`}
          >
            Product Details
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 ${activeTab === 'reviews' ? 'border-b-2 border-primary font-semibold' : ''}`}
          >
            Ratings & Reviews
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`pb-2 ${activeTab === 'faq' ? 'border-b-2 border-primary font-semibold' : ''}`}
          >
            FAQs
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="py-6">
            <p className="mb-4">{product.description}</p>
            <ul className="list-disc pl-6 mt-4">
              {product.specs.map((s, i) => (
                <li key={i}><strong>{s.key}:</strong> {s.value}</li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="py-6 space-y-4">
            {(showAllReviews ? reviews : reviews.slice(0, 2)).map((r, i) => (
              <div key={i} className="border rounded-lg p-4">
                <p className="font-semibold">{r.name}</p>
                <p className="text-yellow-500">{'★'.repeat(r.rating)}</p>
                <p className="text-gray-700">{r.comment}</p>
                <p className="text-xs text-gray-500">{r.date}</p>
              </div>
            ))}

            {reviews.length > 2 && (
              <div className="text-right mt-4">
                <button
                  onClick={() => setShowAllReviews((prev) => !prev)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {showAllReviews ? 'See Less' : 'See More'}
                </button>
              </div>
            )}

            {/* Leave a Review Button (only for logged in users) */}
            {user && (
              <div className="text-right mt-4">
                <button
                  onClick={() => setShowReviewPopup(true)}
                  className="text-sm font-semibold text-black border border-black px-4 py-2 rounded hover:bg-gray-100 transition"
                >
                  Leave a Review
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="py-6">
            {product.faqs.map((f, i) => (
              <div key={i} className="mb-3">
                <p className="font-semibold">Q: {f.question}</p>
                <p className="ml-4 text-gray-700">A: {f.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* You Might Also Like */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="cursor-pointer border rounded-lg p-3 hover:shadow-lg transition text-center"
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-28 object-contain mb-2"
                  onError={(e) => {
                    e.target.src = assets.wheel1; // Fallback image
                  }}
                />
                <h3 className="text-sm font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">Rs {item.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReviewPopup && (
        <ProductReviewPopup
          onClose={() => setShowReviewPopup(false)}
          onSubmit={(newReview) => {
            const today = new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            setReviews((prev) => [
              ...prev,
              {
                name: user?.name || 'Anonymous',
                ...newReview,
                date: today,
              },
            ]);
            toast.success('Review submitted successfully!');
          }}
        />
      )}
    </div>
  );
};

export default ProductDetails;

