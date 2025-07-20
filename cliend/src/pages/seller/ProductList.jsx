import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard"; // 👈 Make sure this path is correct

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8; // Adjust based on your layout
  const navigate = useNavigate();

  // Fetch products on mount
  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) =>
        console.error("❌ Error fetching products:", err.message)
      );
  }, []);

  // Handle delete from child
  const handleDelete = async (productId) => {
    try {
      const confirm = window.confirm("Are you sure to delete this product?");
      if (!confirm) return;

      const res = await fetch(`http://localhost:4000/api/products/${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p._id !== productId));
      } else {
        console.error("❌ Failed to delete product");
      }
    } catch (err) {
      console.error("❌ Error deleting product:", err.message);
    }
  };

  // Pagination logic
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
              <ProductCard
                key={product._id}
                product={product}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
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
