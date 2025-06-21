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
    <form onSubmit={handleSubmit} className="p-8 max-w-2xl bg-white rounded shadow space-y-5">
      <h2 className="text-xl font-bold mb-4">Add New Employee</h2>

      <input type="file" accept="image/*" name="photo" onChange={handleChange} required />

      <input type="text" name="name" placeholder="Full Name" className="input" onChange={handleChange} required />
      <input type="text" name="role" placeholder="Role" className="input" onChange={handleChange} required />
      <input type="text" name="nic" placeholder="NIC Number" className="input" onChange={handleChange} required />
      <input type="number" name="hourlyRate" placeholder="Hourly Rate" className="input" onChange={handleChange} required />
      <input type="text" name="username" placeholder="Username" className="input" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" className="input" onChange={handleChange} required />

      <button className="px-6 py-2 bg-indigo-600 text-white rounded">Add Employee</button>
    </form>
  );
};

export default AddEmployee;
