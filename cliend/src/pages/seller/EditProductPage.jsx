import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, X, Save, ArrowLeft, AlertCircle, Image as ImageIcon, RotateCcw, Trash2, Plus } from "lucide-react";

const EditProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
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
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`http://localhost:4000/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        
        const data = await res.json();
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
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('❌ Failed to load product data');
        navigate('/seller/product-list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

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

  // Handle new image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    processNewImages(files);
  };

  const processNewImages = (files) => {
    const remainingSlots = 4 - (existingImages.length - removedImageIndices.length);
    
    if (files.length > remainingSlots) {
      alert(`❗ You can only add ${remainingSlots} more image(s). Total limit is 4 images.`);
      return;
    }

    const errors = validateImages(files);
    if (errors.some(error => error)) {
      alert('❗ Please check your images: ' + errors.filter(e => e).join(', '));
      return;
    }

    setNewImages(files);
    const previews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    setNewImagePreviews(previews);
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
      processNewImages(files);
    }
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
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalRemainingImages = existingImages.length - removedImageIndices.length + newImages.length;
    
    if (totalRemainingImages === 0) {
      alert("❗ Please keep at least one image.");
      return;
    }

    if (!form.productName.trim()) {
      alert("❗ Product name is required.");
      return;
    }

    setIsSubmitting(true);

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

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to update product");
      }

      alert("✅ Product updated successfully!");
      navigate("/seller/product-list");
    } catch (err) {
      console.error("Update error:", err);
      alert(`❌ Error updating product: ${err.message}`);
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading product data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/seller/product-list")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600 mt-1">Update product information and images</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Editing: {form.productId}</span>
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
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Code
                    </label>
                    <input
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <ImageIcon size={16} className="text-orange-600" />
                  </div>
                  Product Images
                </h2>

                {/* Current Images */}
                {existingImages.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Current Images</h3>
                    <div className="space-y-2">
                      {existingImages.map((image, index) => (
                        <div
                          key={`existing-${index}`}
                          className={`group relative flex items-center p-3 rounded-xl border transition-all duration-200 ${
                            removedImageIndices.includes(index)
                              ? 'bg-red-50 border-red-200 opacity-60'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                            <img 
                              src={image} 
                              alt={`Current ${index + 1}`} 
                              className={`w-full h-full object-cover ${
                                removedImageIndices.includes(index) ? 'grayscale' : ''
                              }`}
                            />
                          </div>
                          
                          <div className="flex-1 ml-3 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {getImageLabel(index, true)}
                                  {removedImageIndices.includes(index) && (
                                    <span className="text-red-600 ml-2">(Will be removed)</span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">Current image</p>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                {removedImageIndices.includes(index) ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRestoreExistingImage(index)}
                                    className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200"
                                    title="Restore image"
                                  >
                                    <RotateCcw size={14} />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExistingImage(index)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200"
                                    title="Remove image"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Images */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Add New Images</h3>
                  
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 ${
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
                    
                    <div className="space-y-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                        <Plus size={16} className="text-gray-500" />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900">Add more images</p>
                        <p className="text-xs text-gray-500">
                          {existingImages.length - removedImageIndices.length + newImages.length}/4 images
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* New Image Previews */}
                  {newImagePreviews.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-600">New Images ({newImagePreviews.length})</h4>
                      {newImagePreviews.map((preview, index) => (
                        <div
                          key={`new-${index}`}
                          className="group relative flex items-center p-3 bg-blue-50 rounded-xl border border-blue-200"
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                            <img 
                              src={preview.url} 
                              alt={`New ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 ml-3 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {getImageLabel(index, false)}
                                </p>
                                <p className="text-xs text-blue-600">
                                  {formatFileSize(preview.size)}
                                </p>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => handleRemoveNewImage(index)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Info */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-amber-800">
                      <p className="font-medium mb-1">Image Management:</p>
                      <ul className="space-y-1 text-amber-700">
                        <li>• Current: {existingImages.length - removedImageIndices.length} images</li>
                        <li>• New: {newImages.length} images</li>
                        <li>• Total: {existingImages.length - removedImageIndices.length + newImages.length}/4</li>
                        <li>• First image will be the main product image</li>
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
                <span>Changes will be saved automatically</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/seller/product-list")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Update Product</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm;