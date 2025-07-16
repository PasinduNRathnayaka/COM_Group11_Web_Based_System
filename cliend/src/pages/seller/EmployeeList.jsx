import React, { useEffect, useState } from "react";
import axios from "axios";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const handleDownload = (empId) => {
    window.print(); // or generate downloadable ID if needed
  };

  return (
    <div className="p-6 bg-[#e7e6e2] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-1">All Employees</h2>
        <p className="text-sm text-gray-500 mb-6">Home &gt; All Employee</p>

        {employees.length === 0 ? (
          <p className="text-gray-500 text-sm">No employees found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((emp) => (
              <div
                key={emp._id}
                className="rounded-[30px] bg-[#c9d8e7] p-4 text-center shadow-md"
              >
                {/* Logo */}
                <h1 className="text-base font-bold text-center mb-2 text-blue-900 tracking-wide">
                  KAMAL AUTO PARTS
                </h1>

                {/* Profile Photo */}
                <div className="flex justify-center mb-2">
                  <img
                    src={`http://localhost:4000/uploads/employees/${emp.image}`}
                    alt={emp.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
                  />
                </div>

                {/* Info */}
                <p className="font-semibold text-[15px]">{emp.name}</p>
                <p className="text-sm text-gray-700">{emp.category}</p>
                <p className="text-sm text-gray-500">{emp.contact}</p>

                {/* QR Code */}
                <div className="my-4 flex justify-center">
                  <img
                    src={`http://localhost:4000/uploads/${emp.qrCodePath}`}
                    alt="QR"
                    className="w-24 h-24 object-contain"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleDownload(emp._id)}
                    className="bg-blue-800 text-white px-4 py-1 text-xs rounded-full"
                  >
                    Download ID
                  </button>
                  <button className="bg-[#464ee6] text-white px-4 py-1 text-xs rounded-full">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
