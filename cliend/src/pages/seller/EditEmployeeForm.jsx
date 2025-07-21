// EditEmployeeForm.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditEmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    image: null,
  });
  const [previewImage, setPreviewImage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:4000/api/employees/${id}`).then((res) => {
      setFormData(res.data);
      setPreviewImage(`http://localhost:4000${res.data.image}`);
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image" && value instanceof File) {
          payload.append(key, value);
        } else {
          payload.append(key, value);
        }
      });

      await axios.put(`http://localhost:4000/api/employees/${id}`, payload);
      setMessage("✅ Employee updated successfully!");
      setTimeout(() => navigate("/seller/employee-list"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">Edit Employee</h2>

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
          <label>Upload New Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
          {previewImage && <img src={previewImage} alt="Preview" className="w-24 h-24 mt-2 rounded-full object-cover" />}
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>

      {message && <p className="mt-4 text-center text-lg text-red-600">{message}</p>}
    </div>
  );
};

export default EditEmployeeForm;
