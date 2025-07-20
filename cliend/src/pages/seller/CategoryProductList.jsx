import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowUp, Download, Pencil, Trash } from "lucide-react";

const CategoryProductList = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:4000/api/products/category/${categoryName}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, [categoryName]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await fetch(`http://localhost:4000/api/products/${id}`, {
          method: "DELETE",
        });
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleQRDownload = (qrUrl, productName) => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `${productName}-qr.png`;
    link.click();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">
        Products in <span className="capitalize">{categoryName}</span>
      </h2>

      {products.length === 0 ? (
        <p className="text-gray-600">No products found in this category.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const imageUrl = product.image || "/placeholder.png";
            const qrUrl = product.qrPath || null;

            return (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow p-4 w-full max-w-sm transition-all hover:shadow-lg space-y-3"
              >
                {/* Image First */}
                <div className="flex justify-center">
                  <img
                    src={imageUrl}
                    alt={product.productName}
                    className="w-24 h-24 object-cover rounded-md shadow"
                  />
                </div>

                {/* QR + Info */}
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
                  <p className="text-sm font-semibold text-gray-800">
                    Description
                  </p>
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
                    <span className="text-gray-700">
                      {product.sales || 1269}
                    </span>
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
                          (product.stock /
                            (product.sales || product.stock || 1)) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2">
                  {qrUrl && (
                    <button
                      onClick={() =>
                        handleQRDownload(qrUrl, product.productName)
                      }
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm"
                    >
                      <Download className="w-4 h-4" /> QR
                    </button>
                  )}
                  <button
                    onClick={() =>
                      navigate(`/seller/edit-product/${product._id}`)
                    }
                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-1 rounded-full shadow flex items-center gap-1"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-full shadow flex items-center gap-1"
                  >
                    <Trash className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryProductList;
