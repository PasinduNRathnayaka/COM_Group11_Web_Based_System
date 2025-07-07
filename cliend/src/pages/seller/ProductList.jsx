import React from "react";

const productData = Array.from({ length: 12 }).map((_, index) => ({
  id: index,
  name: "Lorem Ipsum",
  type: "Battery",
  price: "Rs:110.40",
  sales: 1269,
  remaining: 1269,
  image: "/battery.png", // Replace with actual path if needed
}));

const ProductCard = ({ product }) => (
  <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 w-full">
    <img src={product.image} alt={product.name} className="w-16 h-16 mx-auto" />
    <h4 className="text-sm font-semibold text-center">{product.name}</h4>
    <p className="text-xs text-center text-gray-500">{product.type}</p>
    <p className="text-center font-bold text-sm">{product.price}</p>
    <p className="text-xs text-center text-gray-500">Name</p>
    <p className="text-xs text-center text-gray-400 mb-2">
      Lorem Ipsum is placeholder text commonly used in the graphic.
    </p>
    <div className="text-xs flex justify-between px-2">
      <span>
        Sales <span className="text-orange-500">⬆</span> {product.sales}
      </span>
      <span>
        Remaining Products <span className="text-orange-500">━</span> {product.remaining}
      </span>
    </div>
    <button className="bg-blue-600 text-white text-xs rounded px-4 py-1 mt-2 self-center">
      Edit
    </button>
  </div>
);

const ProductGrid = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">All Products</h2>
          <p className="text-sm text-gray-500">Home &gt; All Products</p>
        </div>
        <button className="bg-black text-white rounded px-4 py-2 text-sm font-semibold">
          + Add New Product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productData.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="flex justify-center mt-8 gap-2 text-sm">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            className="px-3 py-1 border rounded hover:bg-gray-200"
          >
            {num}
          </button>
        ))}
        <span className="px-2 py-1">...</span>
        <button className="px-3 py-1 border rounded hover:bg-gray-200">10</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-200">Next &gt;</button>
      </div>
      <footer className="mt-10 text-xs flex justify-between text-gray-500">
        <span>© 2025 - Admin Dashboard</span>
        <div className="flex gap-4">
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default ProductGrid;
