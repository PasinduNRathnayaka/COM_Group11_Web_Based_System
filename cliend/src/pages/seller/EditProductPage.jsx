import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    productId: "",
    productName: "",
    description: "",
    category: "",
    brand: "",
    code: "",
    stock: "",
    regularPrice: "",
    salePrice: "",
    tags: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  // Fetch product data
  useEffect(() => {
    fetch(`http://localhost:4000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          productId: data.productId || "",
          productName: data.productName || "",
          description: data.description || "",
          category: data.category || "",
          brand: data.brand || "",
          code: data.code || "",
          stock: data.stock || 0,
          regularPrice: data.regularPrice || "",
          salePrice: data.salePrice || "",
          tags: data.tags || "",
        });
        setImagePreview(data.image || null); // full URL from backend
        setMainImageFile(null);
        setImageRemoved(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      })
      .catch(console.error);
  }, [id]);

  // Fetch categories
  useEffect(() => {
    fetch("http://localhost:4000/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle new image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageRemoved(false);
    }
  };

  // Remove image handler
  const handleRemoveImage = () => {
    setImagePreview(null);
    setMainImageFile(null);
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append text fields
    for (const [key, value] of Object.entries(form)) {
      formData.append(key, value);
    }

    // Append image file if new one selected
    if (mainImageFile) {
      formData.append("image", mainImageFile);
    }

    // Tell backend if image was removed explicitly
    formData.append("imageRemoved", imageRemoved.toString());

    try {
      const res = await fetch(`http://localhost:4000/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update product");
      }

      alert("✅ Product updated successfully!");
      navigate("/seller/product-list");
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Error updating product.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50 p-6 space-y-8">
      <h2 className="text-xl font-bold">Edit Product</h2>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-5">
          {/* Product ID - disabled */}
          <div>
            <label className="block font-medium mb-1">Product ID</label>
            <input
              name="productId"
              value={form.productId}
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block font-medium mb-1">Product Name</label>
            <input
              name="productName"
              value={form.productName}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 h-24 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-medium mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block font-medium mb-1">Brand</label>
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Code and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Code</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Stock</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Regular Price</label>
              <input
                name="regularPrice"
                value={form.regularPrice}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Sale Price</label>
              <input
                name="salePrice"
                value={form.salePrice}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium mb-1">Tags</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Image Upload & Preview */}
        <div className="space-y-6">
          <div className="h-60 bg-gray-200 flex items-center justify-center rounded-lg relative">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="h-full object-contain" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow"
                >
                  Remove Image
                </button>
              </>
            ) : (
              <span className="text-gray-500">Main Image Preview</span>
            )}
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Upload Main Image (JPG or PNG)
            <input
              type="file"
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="block mt-2"
            />
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button type="submit" className="bg-black text-white px-6 py-2 rounded" onClick={() => navigate("/seller/product-list")}>
          UPDATE
        </button>
        <button type="button" className="border px-6 py-2 rounded" onClick={() => navigate("/seller/product-list")}>
          CANCEL
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;
