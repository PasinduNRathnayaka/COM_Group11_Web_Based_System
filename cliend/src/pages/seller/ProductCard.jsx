import React from "react";
import { ArrowUp, Download, Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const ProductCard = ({ product, onDelete }) => {
  const navigate = useNavigate();

  const imageUrl = product.image || "/placeholder.png";
  const qrUrl = product.qrPath || null;

  const handleQRDownload = async () => {
    try {
      if (!qrUrl) return;

      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${product.productName}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to move "${product.productName}" to recycle bin?\n\nThis item can be restored later from the recycle bin.`
    );
    
    if (!confirmDelete) return;

    try {
      // Soft delete - move to recycle bin
      await axios.delete(`http://localhost:4000/api/products/${product._id}`, {
        data: {
          deletedBy: 'Admin', // You can get this from context/auth
          reason: 'Moved to recycle bin via product management'
        }
      });
      
      alert("✅ Product moved to recycle bin successfully!");
      
      // Call the onDelete callback to refresh the list
      if (onDelete) {
        onDelete(product._id);
      }
    } catch (error) {
      console.error("Error moving product to recycle bin:", error);
      alert("❌ Failed to move product to recycle bin");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full max-w-sm transition-all hover:shadow-lg space-y-3">
      {/* Product Image */}
      <div className="flex justify-center">
        <img
          src={imageUrl}
          alt={product.productName}
          className="w-24 h-24 object-cover rounded-md shadow"
        />
      </div>

      {/* QR & Info */}
      <div className="flex items-start gap-4">
        {qrUrl && (
          <img
            src={qrUrl}
            alt={`${product.productName} QR code`}
            className="w-16 h-16 object-contain"
          />
        )}
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

      {/* Description */}
      <div>
        <p className="text-sm font-semibold text-gray-800">Description</p>
        <p className="text-xs text-gray-500">
          {product.description ||
            "Lorem ipsum is placeholder text commonly used in the graphic."}
        </p>
      </div>

      {/* Stats */}
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

      {/* Actions */}
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
          onClick={() => navigate(`/seller/edit-product/${product._id}`)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-1 rounded-full shadow flex items-center gap-1"
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded-full shadow flex items-center gap-1"
          title="Move to Recycle Bin"
        >
          <Trash className="w-4 h-4" /> Move to Bin
        </button>
      </div>
    </div>
  );
};

export default ProductCard;