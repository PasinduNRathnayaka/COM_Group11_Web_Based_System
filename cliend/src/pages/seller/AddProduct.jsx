import React, { useState, useEffect, useRef } from "react";
import { Upload, X, Plus, AlertCircle, Image as ImageIcon, Trash2 } from "lucide-react";

const AddProductForm = () => {
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [form, setForm] = useState({
    productId: `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
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

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);

  // Fetch categories
  useEffect(() => {
    fetch("http://localhost:4000/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error("❌ Error loading categories:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateImages = (files) => {
    const errors = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    files.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        errors[index] = 'Invalid file type. Only JPEG, PNG, and WebP are allowed.';
      } else if (file.size > maxSize) {
        errors[index] = 'File size too large. Maximum 5MB allowed.';
      }
    });

    return errors;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    processImages(files);
  };

  const processImages = (files) => {
    if (files.length > 4) {
      alert("❗ You can upload maximum 4 images only.");
      return;
    }

    const errors = validateImages(files);
    setImageErrors(errors);

    if (errors.some(error => error)) {
      return;
    }

    setSelectedImages(files);
    
    // Create previews
    const previews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    setImagePreviews(previews);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      processImages(files);
    }
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    
    // Update file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const reorderImages = (fromIndex, toIndex) => {
    const newImages = [...selectedImages];
    const newPreviews = [...imagePreviews];
    
    const [movedImage] = newImages.splice(fromIndex, 1);
    const [movedPreview] = newPreviews.splice(fromIndex, 1);
    
    newImages.splice(toIndex, 0, movedImage);
    newPreviews.splice(toIndex, 0, movedPreview);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedImages.length === 0) {
      alert("❗ Please upload at least one image.");
      return;
    }

    if (!form.productName.trim()) {
      alert("❗ Product name is required.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    
    // Append form fields
    Object.entries(form).forEach(([key, val]) => {
      formData.append(key, val);
    });

    // Append images
    selectedImages.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const res = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        body: formData,
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to save product");
      }

      alert("✅ Product saved successfully!");

      // Reset form
      setForm({
        productId: `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
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
      setSelectedImages([]);
      setImagePreviews([]);
      setImageErrors([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      alert(`❌ Failed to save product: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim() || !newCatImage) {
      alert("❗ Please fill in category name and select an image.");
      return;
    }

    const catData = new FormData();
    catData.append("name", newCatName.trim());
    catData.append("image", newCatImage);

    try {
      const res = await fetch("http://localhost:4000/api/categories", {
        method: "POST",
        body: catData,
      });

      if (!res.ok) throw new Error("Category creation failed");

      const newCat = await res.json();
      setCategories((prev) => [...prev, newCat]);
      setForm((prev) => ({ ...prev, category: newCat.name }));
      setShowCatModal(false);
      setNewCatImage(null);
      setNewCatName("");
      alert("✅ Category added successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add category");
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`http://localhost:4000/api/categories/${catId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setCategories((prev) => prev.filter((cat) => cat._id !== catId));
      if (form.category === catId) setForm((prev) => ({ ...prev, category: "" }));
      alert("✅ Category deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete category");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-gray-600 mt-1">Create a new product with images and details</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Ready to add product</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Product Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm font-bold">1</span>
                    </div>
                    Basic Information
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product ID
                      </label>
                      <input
                        name="productId"
                        value={form.productId}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-mono text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="productName"
                        value={form.productName}
                        onChange={handleChange}
                        required
                        placeholder="Enter product name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Enter product description"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                {/* Category & Brand */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-purple-600 text-sm font-bold">2</span>
                    </div>
                    Category & Brand
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <div className="flex gap-2">
                        <select
                          name="category"
                          value={form.category}
                          onChange={(e) => {
                            if (e.target.value === "__add__") setShowCatModal(true);
                            else setForm((prev) => ({ ...prev, category: e.target.value }));
                          }}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                          <option value="__add__">+ Add new category</option>
                        </select>
                        {form.category && (
                          <button
                            type="button"
                            onClick={() => {
                              const catToDelete = categories.find((c) => c.name === form.category);
                              if (catToDelete) handleDeleteCategory(catToDelete._id);
                            }}
                            className="px-3 py-3 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors duration-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <input
                        name="brand"
                        value={form.brand}
                        onChange={handleChange}
                        placeholder="Enter brand name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Inventory & Pricing */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm font-bold">3</span>
                    </div>
                    Inventory & Pricing
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Code
                      </label>
                      <input
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        placeholder="Enter product code"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div> */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity
                      </label>
                      <input
                        name="stock"
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Price (Rs:)
                      </label>
                      <input
                        name="regularPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.regularPrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sale Price (Rs:)
                      </label>
                      <input
                        name="salePrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.salePrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      placeholder="Enter tags separated by commas"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Images */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <ImageIcon size={16} className="text-orange-600" />
                    </div>
                    Product Images
                    <span className="text-red-500 ml-1">*</span>
                  </h2>

                  {/* Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      multiple
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                        <Upload size={20} className="text-gray-500" />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Drop images here or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPEG, WebP up to 5MB each
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                        <span>{selectedImages.length}/4 images</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span>Max 4 images</span>
                      </div>
                    </div>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h3 className="text-sm font-medium text-gray-700">
                        Selected Images ({imagePreviews.length})
                      </h3>
                      
                      <div className="space-y-2">
                        {imagePreviews.map((preview, index) => (
                          <div
                            key={index}
                            className="group relative flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200"
                          >
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                              <img
                                src={preview.url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="flex-1 ml-3 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {index === 0 ? 'Main Image' : `Image ${index + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(preview.size)}
                                  </p>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Requirements */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium mb-1">Image Requirements:</p>
                        <ul className="space-y-1 text-blue-700">
                          <li>• Upload 1-4 high-quality images</li>
                          <li>• First image will be the main product image</li>
                          <li>• Supported: PNG, JPEG, WebP</li>
                          <li>• Maximum file size: 5MB each</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>All fields marked with * are required</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to cancel? All data will be lost.")) {
                        window.location.reload();
                      }
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || selectedImages.length === 0}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Save Product</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
                <button
                  onClick={() => setShowCatModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewCatImage(e.target.files[0])}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductForm;