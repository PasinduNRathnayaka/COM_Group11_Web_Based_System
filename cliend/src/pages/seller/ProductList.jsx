import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp } from "lucide-react";

// ProductCard Component
const ProductCard = ({ product }) => {
  const imageUrl = product.image
    ? `http://localhost:4000${product.image}`
    : "/placeholder.png";

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full max-w-sm transition-all hover:shadow-lg space-y-3">
      {/* Top Row: Image + Info */}
      <div className="flex items-start gap-4">
        <img
          src={imageUrl}
          alt={product.productName}
          className="w-16 h-16 object-cover rounded-md shadow"
        />
        <div className="flex-1">
          <h4 className="text-base font-semibold text-gray-800">
            {product.productName}
          </h4>
          <p className="text-xs text-gray-500">{product.category}</p>
          <p className="text-sm font-bold text-gray-800">
            Rs:{" "}
            <span className="text-black">
              {product.salePrice || product.regularPrice}
            </span>
          </p>
        </div>
      </div>

      {/* Name + Description */}
      <div>
        <p className="text-sm font-semibold text-gray-800">Name</p>
        <p className="text-xs text-gray-500">
          {product.description ||
            "Lorem ipsum is placeholder text commonly used in the graphic."}
        </p>
      </div>

      {/* Sales & Stock Box */}
      <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
        <div className="flex justify-between text-xs font-medium text-gray-600">
          <span className="flex items-center gap-1">
            Sales <ArrowUp className="w-3 h-3 text-orange-500" />
          </span>
          <span className="text-gray-700">{product.sales || 1269}</span>
        </div>

        <div className="flex justify-between text-xs font-medium text-gray-600">
          <span>Remaining Products</span>
          <span className="text-gray-700">{product.stock}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-400"
            style={{
              width: `${Math.min(
                (product.stock / (product.sales || product.stock || 1)) * 100,
                100
              )}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Edit Button */}
      <div className="flex justify-end">
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-5 py-1 rounded-full shadow">
          Edit
        </button>
      </div>
    </div>
  );
};

// ProductGrid Component
const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8; // 4 columns × 2 rows
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) =>
        console.error("❌ Error fetching products:", err.message)
      );
  }, []);

  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-8 gap-2 text-sm flex-wrap">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-200"
            >
              &lt; Prev
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => goToPage(idx + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === idx + 1
                    ? "bg-black text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-200"
            >
              Next &gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductGrid;
