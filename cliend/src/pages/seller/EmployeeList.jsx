import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeCard from "./EmployeeCard";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 6; // 3 columns x 2 rows

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

  const totalPages = Math.ceil(employees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const currentEmployees = employees.slice(startIndex, startIndex + employeesPerPage);

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
        <>
          <div className="grid grid-cols-3 gap-6 mb-6">
            {currentEmployees.map((emp) => (
              <EmployeeCard key={emp._id} employee={emp} onDelete={handleDelete} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeList;
