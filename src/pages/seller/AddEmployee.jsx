// pages/seller/AddEmployee.jsx
import React, { useState } from 'react';

const AddEmployee = () => {
  const [employee, setEmployee] = useState({
    name: '',
    role: '',
    nic: '',
    hourlyRate: '',
    username: '',
    password: '',
    photo: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setEmployee((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Employee Added:", employee);
    // 👉 Store employee in DB here
  };

  return (
    <div className="max-h-screen flex items-center justify-center bg-white">
    <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-2 max-w-2xl w-full rounded-lg shadow-xl border border-blue-300">
      <h2 className="text-xl font-bold mb-4 text-center">Add New Employee</h2>

      <div className="flex items-center gap-5 flex-wrap">
      <label className="block text-base font-medium text-gray-700" htmlFor="photo">Upload Photo</label>
                    <input type="file" accept="image/*" name="photo" onChange={handleChange} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
      <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-name">Full Name:</label>
                    <input type="text" name="name" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" onChange={handleChange} required />
      </div>
      <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-name">Role:</label>
                    <input type="text" name="role" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" onChange={handleChange} required />
      </div>
      <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-name">NIC Number:</label>
                    <input type="text" name="nic" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" onChange={handleChange} required />
      </div>
      <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-name">Hourly Rate:</label>
                    <input type="number" name="hourlyRate" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" onChange={handleChange} required />
      </div>
      <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-name">Username:</label>
                    <input type="text" name="username" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" onChange={handleChange} required />
      </div>
      <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-name">Password:</label>
                    <input type="password" name="password" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" onChange={handleChange} required />
      </div>
      </div>

      <button className="px-6 py-2 bg-indigo-600 text-white rounded">Add Employee</button>
    </form>
    </div>
  );
};

export default AddEmployee;
