import React, { useState } from "react";

const AddProductForm = () => {
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
    gallery: [],
  });

  const [categories, setCategories] = useState(["Battery", "Filter", "Oil"]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleMainImgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((p) => ({ ...p, imagePreview: URL.createObjectURL(file) }));
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    setForm((p) => ({ ...p, gallery: [...p.gallery, ...files] }));
  };

  const addNewCategory = () => {
    if (newCatName.trim()) {
      setCategories((prev) => [...prev, newCatName]);
      setForm((p) => ({ ...p, category: newCatName }));
      setNewCatName("");
      setNewCatImage(null);
      setShowCatModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      productId: form.productId,
      productName: form.productName,
      description: form.description,
      category: form.category,
      brand: form.brand,
      code: form.code,
      stock: Number(form.stock),
      regularPrice: Number(form.regularPrice),
      salePrice: Number(form.salePrice),
      tags: form.tags,
      image: "", // Skip blob URL for now (you can replace with actual uploaded image URL later)
      gallery: form.gallery.map((file) => file.name),
    };

    try {
      const res = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error("Failed to save product");

      const result = await res.json();
      console.log("✅ Product added:", result);
      alert("✅ Product saved successfully!");

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
        gallery: [],
      });
    } catch (err) {
      console.error("❌ Error saving product:", err.message);
      alert("❌ Failed to save product");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50 p-6 space-y-8">
        <h2 className="text-xl font-bold">Product Details</h2>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-5">
            {[
              { label: "Product ID", name: "productId", disabled: true },
              { label: "Product Name", name: "productName" },
            ].map((f) => (
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
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__add__">+ Add new category</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Brand Name</label>
              <input name="brand" value={form.brand} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Code</label>
                <input name="code" value={form.code} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block font-medium mb-1">Stock Quantity</label>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
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

          <div className="space-y-6">
            <div className="h-60 bg-gray-200 flex items-center justify-center rounded-lg">
              {form.imagePreview ? (
                <img src={form.imagePreview} alt="preview" className="h-full object-contain" />
              ) : (
                <span className="text-gray-500">Main Image Preview</span>
              )}
            </div>

            <label className="block text-sm font-medium text-gray-700">
              Upload Main Image
              <input type="file" accept="image/*" onChange={handleMainImgUpload} className="block mt-2" />
            </label>

            <label className="block border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition">
              <p className="text-gray-600">Drop or click to upload gallery images</p>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
            </label>

            {form.gallery.length > 0 && (
              <ul className="space-y-2 text-sm">
                {form.gallery.map((file, i) => (
                  <li key={i} className="truncate">{file.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="submit" className="bg-black text-white px-6 py-2 rounded">
            SAVE
          </button>
          <button type="button" className="bg-red-600 text-white px-6 py-2 rounded">
            DELETE
          </button>
          <button type="button" className="border px-6 py-2 rounded">
            CANCEL
          </button>
        </div>
      </form>

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
            <input type="file" accept="image/*" onChange={(e) => setNewCatImage(e.target.files[0])} className="mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCatModal(false)} className="px-4 py-1 border rounded">
                Cancel
              </button>
              <button onClick={addNewCategory} className="px-4 py-1 bg-blue-600 text-white rounded">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductForm;
