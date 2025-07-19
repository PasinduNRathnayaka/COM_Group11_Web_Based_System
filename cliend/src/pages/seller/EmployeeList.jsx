import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeCard from "./EmployeeCard";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("❌ Error fetching employees:", err.message));
  }, []);

  const handleDelete = (id) => {
    setEmployees((prev) => prev.filter((emp) => emp._id !== id));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">All Employees</h2>
        <button
          onClick={() => navigate("/seller/add-employee")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Employee
        </button>
      </div>

      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {employees.map((emp) => (
            <EmployeeCard key={emp._id} employee={emp} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;