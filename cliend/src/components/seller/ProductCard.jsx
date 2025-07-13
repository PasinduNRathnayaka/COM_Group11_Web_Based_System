// src/components/ProductCard.jsx
import React from "react";
import { ArrowUp } from "lucide-react";

const ProductCard = ({ product, onEdit }) => {
  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `http://localhost:4000${product.image}`;

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-4 flex flex-col gap-4">
      {/* Image + Info */}
      <div className="flex items-start gap-4">
        <img
          src={imageUrl}
          alt={product.productName}
          className="w-20 h-20 object-cover rounded-md shadow-sm border"
        />
        <div className="flex-1 space-y-1">
          <h4 className="text-base font-semibold text-gray-800">
            {product.productName}
          </h4>
          <p className="text-xs text-gray-500">{product.category}</p>
          <p className="text-sm font-bold text-gray-700">
            Rs: {product.salePrice || product.regularPrice}
          </p>
          <p className="text-xs text-gray-500">{product.brand}</p>
        </div>
      </div>

      {/* Description */}
      <div className="text-xs text-gray-500">
        {product.description ||
          "Lorem ipsum is placeholder text commonly used in the graphic."}
      </div>

      {/* Sales & Stock */}
      <div className="bg-gray-50 border rounded-md p-3 space-y-2">
        <div className="flex justify-between text-xs font-medium text-gray-600">
          <span className="flex items-center gap-1">
            Sales <ArrowUp className="w-3 h-3 text-orange-500" />
          </span>
          <span>{product.sales || 1269}</span>
        </div>

        <div className="flex justify-between text-xs font-medium text-gray-600">
          <span>Remaining Products</span>
          <span>{product.stock}</span>
        </div>

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
        <button
          onClick={() => onEdit && onEdit(product)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-5 py-1.5 rounded-full shadow"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
