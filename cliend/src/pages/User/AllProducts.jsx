// src/pages/User/AllProducts.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';

const sampleProducts = Array(20).fill({
  id: 'ngk-plug',
  name: 'NGK Iridium Plug',
  price: 3200,
  rating: 4,
  image: assets.NGK, // replace with your correct asset
});

const AllProducts = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">All Products</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {sampleProducts.map((product, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 text-center shadow hover:shadow-md cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <img src={product.image} alt={product.name} className="h-28 w-full object-contain mb-2" />
            <h2 className="font-semibold text-sm">{product.name}</h2>
            <p className="text-gray-700 text-sm">Rs {product.price}</p>
            <div className="text-yellow-500 text-sm">
              {'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllProducts;
