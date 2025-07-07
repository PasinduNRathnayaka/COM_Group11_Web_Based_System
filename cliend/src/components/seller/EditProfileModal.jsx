import React, { useState } from "react";

const EditProfileModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Local form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
  });

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);

    // TODO: Send to API or context here

    // Optional: Close modal after submit
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[90%] max-w-md rounded-lg shadow-lg p-6 relative">
        <h2 className="font-semibold text-lg mb-4">ADMIN &gt; EDIT PROFILE</h2>

        <div className="flex items-center gap-4 mb-6">
          <img
            src="https://via.placeholder.com/64"
            alt="admin"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <p className="font-medium">Edit your details</p>
            <p className="text-sm text-gray-500">Make changes and save</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="flex flex-col">
            <label className="font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              className="border rounded px-3 py-2"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="border rounded px-3 py-2"
              value={formData.email}
              onChange={handleChange}
              placeholder="yourname@example.com"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              className="border rounded px-3 py-2"
              value={formData.password}
              onChange={handleChange}
              placeholder="**********"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              className="border rounded px-3 py-2"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </form>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl leading-none text-gray-400 hover:text-red-500"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default EditProfileModal;
