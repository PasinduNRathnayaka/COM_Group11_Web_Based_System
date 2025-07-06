import React from 'react';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';

const ProductDetails = () => {
  const { id } = useParams(); // get product ID from URL
  const { addToCart, user } = useAppContext();

  const product = {
    id: id,
    name: 'Air Filter',
    desc: 'High-quality air filter for vehicles',
    price: 2500,
    image: assets.Airfilter,
  };

  return (
    <div className="px-4 py-8 md:px-10">
      <div className="flex flex-col md:flex-row gap-6">
        <img src={product.image} alt={product.name} className="w-full md:w-1/2 h-auto object-contain rounded" />
        
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-sm text-gray-600 mb-4">{product.desc}</p>
          <p className="text-xl font-bold text-primary mb-6">Rs {product.price}</p>

          {user ? (
            <button
              className="bg-primary hover:bg-primary-dull text-white px-6 py-2 rounded"
              onClick={() => addToCart(product, 1)}
            >
              Add to Cart
            </button>
          ) : (
            <p className="text-red-500">Please log in to purchase.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
