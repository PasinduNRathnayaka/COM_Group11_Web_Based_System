import React, { useEffect, useState } from "react";
import axios from "axios";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/employees");
        setEmployees(res.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Employees</h2>
      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <div
              key={emp._id}
              className="border rounded-lg shadow p-4 flex flex-col items-center text-center bg-white"
            >
              <img
                src={`http://localhost:4000/uploads/employees/${emp.image}`}
                alt={emp.name}
                className="w-24 h-24 rounded-full object-cover mb-3"
              />
              <h3 className="font-semibold text-lg">{emp.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{emp.category}</p>
              <p className="text-sm">EMP ID: <span className="font-mono">{emp.empId}</span></p>
              <img
                src={`http://localhost:4000/${emp.qrCode}`}
                alt="QR Code"
                className="w-20 h-20 mt-3"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
