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
    imagePreview: null,
  });
  const [mainImageFile, setMainImageFile] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          ...data,
          imagePreview: `http://localhost:4000/uploads/employees/Product/${data.image}`,
        });
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    fetch("http://localhost:4000/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
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

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key !== "imagePreview") formData.append(key, val);
    });
    if (mainImageFile) formData.append("image", mainImageFile);

    try {
      const res = await fetch(`http://localhost:4000/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update product");

      alert("✅ Product updated!");
      navigate("/products");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update product.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50 p-6 space-y-8">
      <h2 className="text-xl font-bold">Edit Product</h2>
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
              onChange={handleChange}
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
        <button type="submit" className="bg-black text-white px-6 py-2 rounded">UPDATE</button>
        <button type="button" className="border px-6 py-2 rounded" onClick={() => navigate("/products")}>CANCEL</button>
      </div>
    </form>
  );
};

export default EditProductForm;