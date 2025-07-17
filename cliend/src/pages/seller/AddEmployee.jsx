import React, { useState, useEffect } from "react";
import axios from "axios";

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    empId: "",
    name: "",
    about: "",
    category: "",
    contact: "",
    rate: "",
    address: "",
    username: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  const [message, setMessage] = useState("");

  // Generate a unique EMP ID
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
    if (formData.password !== formData.confirmPassword) {
      return setMessage("Passwords do not match.");
    }

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      const res = await axios.post("http://localhost:4000/api/employees", payload);
      setMessage("✅ Employee added successfully");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add employee");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Add Employee</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>EMP ID</label>
          <input
            type="text"
            name="empId"
            value={formData.empId}
            readOnly
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>About</label>
          <textarea
            name="about"
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          ></textarea>
        </div>

        <div>
          <label>Category</label>
          <input
            type="text"
            name="category"
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
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
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

        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>

      {message && <p className="mt-4 text-center text-lg">{message}</p>}
    </div>
  );
};

export default AddEmployee;
