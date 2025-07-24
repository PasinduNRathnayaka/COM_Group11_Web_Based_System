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
  
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [removedImageIndices, setRemovedImageIndices] = useState([]);

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
        
        // Handle both single image and gallery
        const images = [];
        if (data.image) images.push(data.image);
        if (data.gallery && Array.isArray(data.gallery)) {
          images.push(...data.gallery);
        }
        setExistingImages(images);
        
        setNewImages([]);
        setNewImagePreviews([]);
        setRemovedImageIndices([]);
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
    const files = Array.from(e.target.files);
    const remainingSlots = 4 - (existingImages.length - removedImageIndices.length);
    
    if (files.length > remainingSlots) {
      alert(`❗ You can only add ${remainingSlots} more image(s). Total limit is 4 images.`);
      return;
    }

    setNewImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(previews);
  };

  // Remove existing image
  const handleRemoveExistingImage = (index) => {
    setRemovedImageIndices(prev => [...prev, index]);
  };

  // Restore existing image
  const handleRestoreExistingImage = (index) => {
    setRemovedImageIndices(prev => prev.filter(i => i !== index));
  };

  // Remove new image
  const handleRemoveNewImage = (index) => {
    const updatedNewImages = newImages.filter((_, i) => i !== index);
    const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);
    
    setNewImages(updatedNewImages);
    setNewImagePreviews(updatedPreviews);
    
    // Update file input
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      updatedNewImages.forEach(file => dt.items.add(file));
      fileInputRef.current.files = dt.files;
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalRemainingImages = existingImages.length - removedImageIndices.length + newImages.length;
    
    if (totalRemainingImages === 0) {
      alert("❗ Please keep at least one image.");
      return;
    }

    const formData = new FormData();

    // Append text fields
    for (const [key, value] of Object.entries(form)) {
      formData.append(key, value);
    }

    // Append new images
    newImages.forEach((file) => {
      formData.append("images", file);
    });

    // Append removed image indices
    formData.append("removedImageIndices", JSON.stringify(removedImageIndices));

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

  const getImageLabel = (index, isExisting) => {
    if (isExisting) {
      if (index === 0 && existingImages.length === 1) return 'Main Image';
      if (index === 0) return 'Main Image';
      return `Image ${index + 1}`;
    } else {
      const existingCount = existingImages.length - removedImageIndices.length;
      if (existingCount === 0 && index === 0) return 'Main Image (New)';
      return `Image ${existingCount + index + 1} (New)`;
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

        {/* Image Management Section */}
        <div className="space-y-6">
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Current Images</h3>
              <div className="grid grid-cols-2 gap-4">
                {existingImages.map((image, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <div className={`aspect-square rounded-lg overflow-hidden ${
                      removedImageIndices.includes(index) ? 'opacity-50 grayscale' : ''
                    }`}>
                      <img 
                        src={image} 
                        alt={`Existing ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {removedImageIndices.includes(index) ? (
                      <button
                        type="button"
                        onClick={() => handleRestoreExistingImage(index)}
                        className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    )}
                    
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {getImageLabel(index, true)}
                      {removedImageIndices.includes(index) && ' (Removed)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Add New Images
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  multiple
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="block mt-2"
                />
              </label>
              
              <div className="text-sm text-gray-500 mt-1">
                Current: {existingImages.length - removedImageIndices.length} image(s), 
                New: {newImages.length} image(s), 
                Total: {existingImages.length - removedImageIndices.length + newImages.length}/4
              </div>
            </div>

            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">New Images to Add</h4>
                <div className="grid grid-cols-2 gap-4">
                  {newImagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={preview} 
                          alt={`New ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                      <div className="absolute bottom-2 left-2 bg-blue-600 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {getImageLabel(index, false)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Empty State */}
          {existingImages.length === 0 && newImagePreviews.length === 0 && (
            <div className="h-60 bg-gray-200 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <span className="text-gray-500 block">No images</span>
                <span className="text-sm text-gray-400">Add product images</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button 
          type="submit" 
          className="bg-black text-white px-6 py-2 rounded"
        >
          UPDATE
        </button>
        <button 
          type="button" 
          className="border px-6 py-2 rounded" 
          onClick={() => navigate("/seller/product-list")}
        >
          CANCEL
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;