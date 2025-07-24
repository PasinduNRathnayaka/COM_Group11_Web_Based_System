import React, { useState, useEffect, useRef } from "react";

const AddProductForm = () => {
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState(null);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to maximum 4 images
    if (files.length > 4) {
      alert("❗ You can upload maximum 4 images only.");
      return;
    }

    setSelectedImages(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    
    // Update file input
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      newImages.forEach(file => dt.items.add(file));
      fileInputRef.current.files = dt.files;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedImages.length === 0) {
      alert("❗ Please upload at least one image.");
      return;
    }

    const formData = new FormData();
    
    // Append form fields
    Object.entries(form).forEach(([key, val]) => {
      formData.append(key, val);
    });

    // Append images
    selectedImages.forEach((file, index) => {
      formData.append('images', file);
    });

    try {
      const res = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save product");

      alert("✅ Product saved!");

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
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save product.");
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName || !newCatImage) return alert("Fill name and image");

    const catData = new FormData();
    catData.append("name", newCatName);
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
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add category");
    }
  };

  const handleDeleteCategory = async (catId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:4000/api/categories/${catId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setCategories((prev) => prev.filter((cat) => cat._id !== catId));
      if (form.category === catId) setForm((prev) => ({ ...prev, category: "" }));
      alert("✅ Category deleted.");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete category");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50 p-6 space-y-8">
        <h2 className="text-xl font-bold">Add New Product</h2>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            {[{ label: "Product ID", name: "productId", disabled: true }, { label: "Product Name", name: "productName" }].map((f) => (
              <div key={f.name}>
                <label className="block font-medium mb-1">{f.label}</label>
                <input
                  name={f.name}
                  value={form[f.name]}
                  disabled={f.disabled}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${f.disabled ? "bg-gray-100" : ""}`}
                />
              </div>
            ))}

            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 h-24 resize-none"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Category</label>
              <div className="flex gap-2">
                <select
                  name="category"
                  value={form.category}
                  onChange={(e) => {
                    if (e.target.value === "__add__") setShowCatModal(true);
                    else setForm((prev) => ({ ...prev, category: e.target.value }));
                  }}
                  className="w-full border rounded px-3 py-2"
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
                    className="text-red-500 border border-red-300 rounded px-3 hover:bg-red-100"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Code</label>
                <input name="code" value={form.code} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block font-medium mb-1">Stock</label>
                <input name="stock" type="number" value={form.stock} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Regular Price</label>
                <input name="regularPrice" value={form.regularPrice} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block font-medium mb-1">Sale Price</label>
                <input name="salePrice" value={form.salePrice} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Tags</label>
              <input name="tags" value={form.tags} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload Product Images (1-4 images, JPG or PNG)
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  multiple
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="block mt-2"
                />
              </label>
              
              {selectedImages.length > 0 && (
                <div className="text-sm text-gray-600">
                  {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {/* Image Previews Grid */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {index === 0 ? 'Main' : `Image ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {imagePreviews.length === 0 && (
              <div className="h-60 bg-gray-200 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <span className="text-gray-500 block">No images selected</span>
                  <span className="text-sm text-gray-400">Upload 1-4 product images</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button type="submit" className="bg-black text-white px-6 py-2 rounded">SAVE</button>
          <button type="reset" className="border px-6 py-2 rounded">CANCEL</button>
        </div>
      </form>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-lg">
            <h3 className="font-semibold mb-4">Add New Category</h3>
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name"
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewCatImage(e.target.files[0])}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCatModal(false)} className="px-4 py-1 border rounded">Cancel</button>
              <button onClick={handleAddCategory} className="px-4 py-1 bg-blue-600 text-white rounded">Add</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductForm;