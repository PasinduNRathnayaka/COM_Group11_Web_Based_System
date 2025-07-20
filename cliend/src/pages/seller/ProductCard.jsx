// ProductCard.jsx
import React from "react";
import { ArrowUp, Download, Pencil, Trash } from "lucide-react";

const ProductCard = ({ product, onDelete, onEdit }) => {
  const imageUrl = product.image || "/placeholder.png";
  const qrUrl = product.qrPath || null;

  const handleQRDownload = () => {
    if (qrUrl) {
      const link = document.createElement("a");
      link.href = qrUrl;
      link.download = `${product.productName}-qr.png`;
      link.click();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full max-w-sm transition-all hover:shadow-lg space-y-3">
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
            Rs: <span className="text-black">{product.salePrice || product.regularPrice}</span>
          </p>
        </div>
      </div>

      {qrUrl && (
        <div className="flex justify-center">
          <img
            src={qrUrl}
            alt={`${product.productName} QR code`}
            className="w-24 h-24 object-contain"
          />
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-gray-800">Description</p>
        <p className="text-xs text-gray-500">
          {product.description ||
            "Lorem ipsum is placeholder text commonly used in the graphic."}
        </p>
      </div>

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

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {qrUrl && (
          <button
            onClick={handleQRDownload}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm"
          >
            <Download className="w-4 h-4" /> QR
          </button>
        )}
        <button
          onClick={() => onEdit(product)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-1 rounded-full shadow flex items-center gap-1"
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={() => onDelete(product._id)}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-full shadow flex items-center gap-1"
        >
          <Trash className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
