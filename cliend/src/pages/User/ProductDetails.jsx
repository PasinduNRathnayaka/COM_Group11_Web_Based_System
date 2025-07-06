import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import OrderSummaryPopup from '../../components/OrderSummaryPopup';


const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, user } = useAppContext();

  const [showOrderSummary, setShowOrderSummary] = useState(false);


  // Mock product info (later replace this with backend data)
  const product = {
    id,
    name: 'BMW i8 Air Filter',
    brand: 'Bosch',
    price: 2500,
    discount: 200,
    image: assets.Airfilter,
    description: 'High-performance air filter compatible with BMW i8 and similar models.',
    specs: [
      { key: 'Material', value: 'Synthetic Fiber' },
      { key: 'Compatibility', value: 'BMW i8, Lifan 200-250cc' },
      { key: 'Made in', value: 'Germany' },
    ],
    reviews: [
      { name: 'Pasindu', comment: 'Great quality!', rating: 5 },
      { name: 'Alex', comment: 'Perfect fit.', rating: 4 },
    ],
  };

  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {

    if (!user) {
    toast.error("Please log in to add items to cart");
    return;
  }

    addToCart(product, quantity);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
  if (!user) {
    toast.error("Please log in to continue");
    return;
  }
  setShowOrderSummary(true);
};


  
  return (
    <>
    <div className="px-4 md:px-10 py-10">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full md:w-[350px] h-[300px] object-contain border rounded-xl"
        />

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 text-sm mb-1">Brand: {product.brand}</p>
          <p className="text-gray-600 text-sm mb-1">Product ID: {product.id}</p>

          {/* Price */}
          <div className="mt-4 mb-4">
            <span className="text-2xl font-bold text-primary">Rs {product.price}</span>
            <span className="ml-3 text-sm text-red-500 line-through">Rs {product.price + product.discount}</span>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-2 mb-6">
            <label className="font-medium">Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-16 px-2 py-1 border rounded"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-900"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button
              className="px-6 py-2 border border-black text-black rounded hover:bg-gray-100"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>

          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Product Description</h2>
        <p className="text-gray-700">{product.description}</p>
      </div>

      {/* Specs */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Specifications</h2>
        <ul className="list-disc ml-5 text-gray-700">
          {product.specs.map((spec, i) => (
            <li key={i}>
              <strong>{spec.key}:</strong> {spec.value}
            </li>
          ))}
        </ul>
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
        {product.reviews.map((rev, i) => (
          <div key={i} className="mb-3 border-b pb-2">
            <p className="text-sm font-medium">{rev.name}</p>
            <p className="text-yellow-500">{"★".repeat(rev.rating)}</p>
            <p className="text-sm">{rev.comment}</p>
          </div>
        ))}
      </div>

      {/* You Might Also Like */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold mb-4">You Might Also Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white shadow rounded p-3 text-center">

              <img src={assets.Airfilter} className="w-24 h-24 mx-auto mb-2" alt="suggested" />
              <p className="text-sm font-medium">Airfilter</p>
              <p className="text-sm text-gray-600">Rs 2500</p>

            </div>
          ))}
        </div>
      </div>
    </div>

    {showOrderSummary && (
  <OrderSummaryPopup
    product={product}
    quantity={quantity}
    onClose={() => setShowOrderSummary(false)}
  />
)}
</>      

  );
};

export default ProductDetails;


