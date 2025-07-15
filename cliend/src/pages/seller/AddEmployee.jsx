import React, { useState } from "react";

// Helper Input component
const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input {...props} className="w-full border rounded p-2 text-sm" />
  </div>
);

// Helper Textarea component
const Textarea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <textarea {...props} className="w-full border rounded p-2 text-sm" rows="3" />
  </div>
);

const AddEmployee = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, imagePreview: URL.createObjectURL(file) }));
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...files] }));
  };

  const addNewCategory = () => {
    if (newCatName.trim()) {
      setCategories([...categories, newCatName]);
      setForm((prev) => ({ ...prev, category: newCatName }));
      setNewCatName("");
      setShowCatModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Employee Submitted:", form);
  };

  return (
    <div className="bg-[#f3f3f3] min-h-screen p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-md max-w-6xl mx-auto shadow-md"
      >
        <h2 className="text-xl font-semibold mb-1">Employee Details</h2>
        <p className="text-sm text-gray-500 mb-6">
          Home &gt; All Products &gt; Add New Employee
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side */}
          <div className="space-y-4">
            <Input label="Employee Name" name="name" value={form.name} onChange={handleChange} />
            <Textarea label="About" name="about" value={form.about} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <div className="flex gap-2">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="px-3 bg-gray-300 text-sm rounded"
                  onClick={() => setShowCatModal(true)}
                >
                  +
                </button>
              </div>
            </div>
            <Input label="Contact" name="contact" value={form.contact} onChange={handleChange} />
            <Input label="Hourly Rate" name="rate" value={form.rate} onChange={handleChange} placeholder="Rs:150" />
            <Input label="Address" name="address" value={form.address} onChange={handleChange} />
            <Input label="User Name" name="username" value={form.username} onChange={handleChange} />
            <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} />
            <Input label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
          </div>

          {/* Right side */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <div className="h-48 w-full bg-gray-200 rounded-md overflow-hidden">
                {form.imagePreview ? (
                  <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              <input type="file" onChange={handleImageUpload} className="mt-2 text-sm" />
            </div>

            {/* Gallery Upload */}
            <div>
              <label className="block text-sm font-medium mb-1">Employee Gallery</label>
              <div className="border border-dashed border-gray-400 p-4 rounded-md text-center text-gray-500 text-sm mb-4">
                <label className="cursor-pointer block">
                  <p>Drop your image here, or browse</p>
                  <p className="text-xs text-gray-400">jpeg, png are allowed</p>
                  <input type="file" multiple className="hidden" onChange={handleGalleryUpload} />
                </label>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {form.gallery.map((file, index) => (
                  <div key={index} className="flex items-center justify-between px-3 py-2 border rounded text-sm">
                    <span>{file.name}</span>
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-8 space-x-3">
          <button type="submit" className="bg-black text-white px-6 py-2 rounded-md text-sm">SAVE</button>
          <button type="button" className="bg-blue-900 text-white px-6 py-2 rounded-md text-sm">DELETE</button>
          <button type="button" className="bg-gray-200 px-6 py-2 rounded-md text-sm">CANCEL</button>
        </div>
      </form>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Enter category name"
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowCatModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={addNewCategory} className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployee;

