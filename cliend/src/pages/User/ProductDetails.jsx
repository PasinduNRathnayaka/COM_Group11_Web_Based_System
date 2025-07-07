// src/pages/User/ProductDetails.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, user } = useAppContext();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

 const allProducts = {
  'bmw-wheel': {
    id: 'bmw-wheel',
    name: 'BMW Alloy Wheels',
    brand: 'Bosch',
    price: 28000,
    discount: 3000,
    images: [assets.wheel1, assets.wheel2, assets.wheel3],
    description: 'Stylish alloy wheels for BMW models. Lightweight and durable.',
    specs: [
      { key: 'Material', value: 'Aluminum' },
      { key: 'Size', value: '18 inch' },
      { key: 'Color', value: 'Black & Silver' },
    ],
    reviews: [
      { name: 'Samantha D', rating: 5, comment: 'Top-notch quality!', date: 'April 9, 2025' },
      { name: 'Ethan M', rating: 4, comment: 'Great grip and stylish design.', date: 'April 12, 2025' },
    ],
    faqs: [
      { question: 'Is this suitable for BMW i8?', answer: 'Yes, it is compatible with BMW i8 and other models.' },
    ],
  },

  'airfilter': {
    id: 'airfilter',
    name: 'BMW Air Filter',
    brand: 'Bosch',
    price: 2500,
    discount: 200,
    images: [assets.Airfilter,assets.Airfilter1,assets.Airfilter2],
    description: 'High-performance air filter for BMW engines.',
    specs: [
      { key: 'Material', value: 'Synthetic Fiber' },
      { key: 'Fitment', value: 'BMW i8, i3, and similar' },
    ],
    reviews: [
      { name: 'Ruwan J.', rating: 5, comment: 'Perfect fit and great airflow.', date: 'June 1, 2025' },
    ],
    faqs: [
      { question: 'How often should I replace it?', answer: 'Recommended every 10,000 km.' },
    ],
  }
};

const product = allProducts[id];

if (!product) {
  return <div className="p-10 text-red-600">Product not found!</div>;
}


  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please log in first.');
      return;
    }
    addToCart(product, quantity);
    toast.success('Added to cart!');
  };

  const relatedProducts = [
  {
    id: 'wheel-sport',
    name: 'Sport Alloy Wheel',
    price: 22000,
    image: assets.wheel5,
  },
  {
    id: 'wheel-sport',
    name: 'Sport Alloy Wheel',
    price: 22000,
    image: assets.wheel5,
  },
   {
    id: 'wheel-sport',
    name: 'Sport Alloy Wheel',
    price: 22000,
    image: assets.wheel5,
  },
  {
    id: 'wheel-sport',
    name: 'Sport Alloy Wheel',
    price: 22000,
    image: assets.wheel5,
  },
   {
    id: 'wheel-sport',
    name: 'Sport Alloy Wheel',
    price: 22000,
    image: assets.wheel5,
  },
  {
    id: 'wheel-sport',
    name: 'Sport Alloy Wheel',
    price: 22000,
    image: assets.wheel5,
  },
  {
    id: 'wheel-sport',
    name: 'Sport Alloy Wheel',
    price: 22000,
    image: assets.wheel5,
  },
  {
    id: 'wheel-sport',
    name: 'Sport Alloy Wheel',
    price: 22000,
    image: assets.wheel5,
  },
];


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
            />
          ))}
        </div>

        {/* Main Image and Info */}
        <div className="flex-1">
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            className="w-full max-w-md object-contain border rounded-xl"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-2">Brand: {product.brand}</p>
          <div className="flex gap-2 items-center mb-4">
            <span className="text-xl text-primary font-bold">Rs {product.price}</span>
            <span className="line-through text-sm text-red-500">Rs {product.price + product.discount}</span>
          </div>

          {/* Quantity Selector */}
          <div className="mb-4 flex items-center gap-3">
            <span className="font-medium">Qty:</span>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-16 px-2 py-1 border rounded"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={handleAddToCart} className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900">
              Add to Cart
            </button>
            <button
              className="border border-black px-6 py-2 rounded hover:bg-gray-100"
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
            <p>{product.description}</p>
            <ul className="list-disc pl-6 mt-4">
              {product.specs.map((s, i) => (
                <li key={i}><strong>{s.key}:</strong> {s.value}</li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="py-6 space-y-4">
            {product.reviews.map((r, i) => (
              <div key={i} className="border rounded-lg p-4">
                <p className="font-semibold">{r.name}</p>
                <p className="text-yellow-500">{'★'.repeat(r.rating)}</p>
                <p className="text-gray-700">{r.comment}</p>
                <p className="text-xs text-gray-500">{r.date}</p>
              </div>
            ))}
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
<div className="mt-16">
  <h2 className="text-xl font-semibold mb-4">You Might Also Like</h2>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {relatedProducts.map((item) => (
      <div
        key={item.id}
        onClick={() => navigate(`/product/${item.id}`)}
        className="cursor-pointer border rounded-lg p-3 hover:shadow-lg transition text-center" 
      >
        <img src={item.image} alt={item.name} className="w-full h-28 object-contain mb-2" />
        <h3 className="text-sm font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-600">Rs {item.price}</p>
      </div>
    ))}
  </div>
</div>

    </div>
  );
};

export default ProductDetails;

