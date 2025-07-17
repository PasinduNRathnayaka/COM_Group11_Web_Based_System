import React, { useState, useEffect } from "react";
import axios from "axios";

const AddEmployeeForm = () => {
  const [formData, setFormData] = useState({
    empId: "",
    name: "",
    about: "",
    category: "",
    contact: "",
    rate: "",
    address: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Generate unique empId on mount
  useEffect(() => {
    const randomId = `EMP${Date.now().toString().slice(-6)}`;
    setFormData((prev) => ({ ...prev, empId: randomId }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        // Append only non-null for file, others as is
        if (key === "image" && value) {
          payload.append(key, value);
        } else if (key !== "image") {
          payload.append(key, value);
        }
      }

      const res = await axios.post("http://localhost:4000/api/employees", payload);

      setMessage("✅ Employee added successfully!");
      setLoading(false);

      // Reset form (generate new empId)
      const newEmpId = `EMP${Date.now().toString().slice(-6)}`;
      setFormData({
        empId: newEmpId,
        name: "",
        about: "",
        category: "",
        contact: "",
        rate: "",
        address: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        image: null,
      });
    } catch (err) {
      console.error("Failed to add employee:", err.response?.data || err.message);
      setMessage(`❌ Failed to add employee. ${err.response?.data?.message || ''}`);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">Add New Employee</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Employee ID</label>
          <input
            type="text"
            name="empId"
            value={formData.empId}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>About</label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 resize-none"
          />
        </div>

        <div>
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Contact</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Hourly Rate</label>
          <input
            type="number"
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Email (optional)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@example.com"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="w-full"
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      {message && (
        <p className="mt-4 text-center text-lg text-red-600">{message}</p>
      )}
    </div>
  );
};

export default AddEmployeeForm;
