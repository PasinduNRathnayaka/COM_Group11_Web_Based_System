import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const imageUrl = product.image
    ? `http://localhost:4000${product.image}`
    : "/placeholder.png"; // fallback image

  return (
  <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center gap-3 w-full transition-all hover:shadow-xl">
    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
      <img
        src={imageUrl}
        alt={product.productName}
        className="w-full h-full object-cover"
      />
    </div>

    <div className="text-center space-y-1 w-full">
      <h4 className="text-base font-semibold text-gray-800 truncate">
        {product.productName}
      </h4>
      <p className="text-xs text-gray-500">{product.category}</p>
      <p className="text-sm font-bold text-green-600">
        Rs: {product.salePrice || product.regularPrice}
      </p>
      <p className="text-xs text-gray-500">{product.brand}</p>
      <p className="text-xs text-gray-400">
        {product.description || "No description provided."}
      </p>
    </div>

    <div className="w-full flex justify-between text-xs text-gray-600 mt-2 px-1">
      <span>
        Code: <span className="text-orange-500">{product.code}</span>
      </span>
      <span>
        Stock: <span className="text-orange-500">{product.stock}</span>
      </span>
    </div>

    <button
      className="mt-3 bg-blue-600 hover:bg-blue-700 transition text-white text-sm rounded-full px-5 py-1.5 shadow-sm"
    >
      Edit
    </button>
  </div>
);

};

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) =>
        console.error("❌ Error fetching products:", err.message)
      );
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">All Products</h2>
          <p className="text-sm text-gray-500">Home &gt; All Products</p>
        </div>
        <button
          onClick={() => navigate("/seller/add-product")}
          className="bg-black text-white rounded px-4 py-2 text-sm font-semibold"
        >
          + Add New Product
        </button>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8 gap-2 text-sm">
        {[1, 2, 3, 4].map((num) => (
          <button key={num} className="px-3 py-1 border rounded hover:bg-gray-200">
            {num}
          </button>
        ))}
        <span className="px-2 py-1">...</span>
        <button className="px-3 py-1 border rounded hover:bg-gray-200">10</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-200">Next &gt;</button>
      </div>
    </div>
  );
};

export default ProductGrid;
