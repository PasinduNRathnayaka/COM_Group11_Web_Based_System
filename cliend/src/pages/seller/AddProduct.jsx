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
    imagePreview: null,
  });

  const [mainImageFile, setMainImageFile] = useState(null);

  // Fetch categories from backend
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
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      setForm((prev) => ({ ...prev, imagePreview: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mainImageFile) {
      alert("❗ Please upload a main image.");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key !== "imagePreview") formData.append(key, val);
    });
    formData.append("image", mainImageFile);

    try {
      const res = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save product");

      const result = await res.json();
      alert("✅ Product saved!");
      console.log(result);

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
        imagePreview: null,
      });
      setMainImageFile(null);
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
              <select
                name="category"
                value={form.category}
                onChange={(e) => {
                  if (e.target.value === "__add__") setShowCatModal(true);
                  else handleChange(e);
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

          {/* Image Upload */}
          <div className="space-y-6">
            <div className="h-60 bg-gray-200 flex items-center justify-center rounded-lg">
              {form.imagePreview ? (
                <img src={form.imagePreview} alt="Preview" className="h-full object-contain" />
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
