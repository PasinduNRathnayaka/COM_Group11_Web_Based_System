import React, { useState } from "react";

/**
 * -----------------------------------------------------------------------------
 * AddEmployeeForm.jsx – Stand‑alone employee creation form with category/role
 * dropdown that allows creation of a new category (incl. image upload).
 * -----------------------------------------------------------------------------
 */

const AddEmployeeForm = () => {
  /* ──────────────────────────────── state ──────────────────────────────── */
  const [form, setForm] = useState({
    employeeId: `EMP-${Math.floor(100000 + Math.random() * 900000)}`,
    name: "",
    about: "",
    category: "",
    contact: "",
    rate: "",
    address: "",
    username: "",
    password: "",
    confirmPassword: "",
    imagePreview: null,
    gallery: [],
  });

  const [categories, setCategories] = useState(["Mechanic", "Electrician", "Sales"]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  /* ───────────────────────────── handlers ─────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) { setForm((p) => ({ ...p, imagePreview: URL.createObjectURL(file) })); }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    setForm((p) => ({ ...p, gallery: [...p.gallery, ...files] }));
  };

  const addNewCategory = () => {
    if (newCatName.trim()) {
      setCategories([...categories, newCatName]);
      setForm((p) => ({ ...p, category: newCatName }));
      setNewCatName("");
      setShowCatModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Employee submitted", form);
  };

  /* ───────────────────────────────── JSX ───────────────────────────────── */
  return (
    <div className="bg-[#f3f3f3] min-h-screen p-6">
    
      <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50 p-6 space-y-8">
         <div className="mb-6">
        <h2 className="text-xl font-bold">Add Employee Details</h2>
        <p className="text-sm text-gray-500">Home &gt; Add Employee Details</p>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {/* left */}
          <div className="space-y-5">
            {[
              { label: "Employee ID", name: "employeeId", disabled: true },
              { label: "Employee Name", name: "name" },
              { label: "About", name: "about", textarea: true },
            ].map((f) => (
              <div key={f.name}>
                <label className="block font-medium mb-1">{f.label}</label>
                {f.textarea ? (
                  <textarea
                    name={f.name}
                    value={form[f.name]}
                    disabled={f.disabled}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 h-24 resize-none ${f.disabled ? "bg-gray-100" : ""}`}
                  />
                ) : (
                  <input
                    name={f.name}
                    value={form[f.name]}
                    disabled={f.disabled}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 ${f.disabled ? "bg-gray-100" : ""}`}
                  />
                )}
              </div>
            ))}

            {/* Category dropdown */}
            <div>
              <label className="block font-medium mb-1">Category / Role</label>
              <select
                name="category"
                value={form.category}
                onChange={(e) => {
                  if (e.target.value === "__add__") setShowCatModal(true);
                  else handleChange(e);
                }}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select role</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__add__">+ Add new role</option>
              </select>
            </div>

            {[
              { label: "Contact", name: "contact", placeholder: "+94..." },
              { label: "Hourly Rate", name: "rate", placeholder: "Rs:150" },
              { label: "Address", name: "address" },
              { label: "User Name", name: "username" },
              { label: "Password", name: "password", type: "password" },
              { label: "Confirm Password", name: "confirmPassword", type: "password" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block font-medium mb-1">{f.label}</label>
                <input
                  name={f.name}
                  type={f.type || "text"}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            ))}
          </div>

          {/* right */}
          <div className="space-y-6">
            {/* preview */}
            <div className="h-60 bg-gray-200 flex items-center justify-center rounded-lg">
              {form.imagePreview ? (
                <img src={form.imagePreview} alt="preview" className="h-full object-contain" />
              ) : (
                <span className="text-gray-500">Employee Image Preview</span>
              )}
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Profile Image
              <input type="file" accept="image/*" onChange={handleImageUpload} className="block mt-2" />
            </label>

            <label className="block border-2 border-dashed border-gray-400 p-6 rounded-lg text-center cursor-pointer hover:border-blue-500 transition">
              <p className="text-gray-600">Drop or click to upload gallery images</p>
              <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
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

        <div className="flex justify-end gap-4 pt-6">
          <button type="submit" className="bg-black text-white px-6 py-2 rounded">SAVE</button>
          <button type="button" className="bg-red-600 text-white px-6 py-2 rounded">DELETE</button>
          <button type="button" className="border px-6 py-2 rounded">CANCEL</button>
        </div>
      </form>

      {/* add‑category modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-lg">
            <h3 className="font-semibold mb-4">Add New Role</h3>
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Role name"
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <input type="file" accept="image/*" className="mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCatModal(false)} className="px-4 py-1 border rounded">Cancel</button>
              <button onClick={addNewCategory} className="px-4 py-1 bg-blue-600 text-white rounded">Add</button>
            </div>
          </div>
        </div>
      )}
      <footer className="mt-10 text-xs flex justify-between text-gray-500">
        <span>© 2025 - Admin Dashboard</span>
        <div className="flex gap-4">
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default AddEmployeeForm;
