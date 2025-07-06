import React from "react";

const employees = Array(6).fill({
  name: "Employee Name",
  role: "ROLE",
  contact: "CONTACT",
  photo: "/employee.png",       // Replace with actual image path
  qr: "/qrcode.png",            // Replace with actual QR code path
});

const EmployeeCard = ({ employee }) => (
  <div className="bg-[#d9e6f5] rounded-2xl p-4 w-60 flex flex-col items-center shadow-md">
    <img
      src={employee.photo}
      alt="Employee"
      className="w-20 h-20 rounded-full border-2 border-white shadow mb-2"
    />
    <h3 className="font-bold text-sm text-center">KAMAL AUTO PARTS</h3>
    <p className="mt-1 font-semibold text-sm">{employee.name}</p>
    <p className="text-xs">{employee.role}</p>
    <p className="text-xs mb-2">{employee.contact}</p>
    <img src={employee.qr} alt="QR Code" className="w-24 h-24 my-2" />
    <div className="flex gap-2 mt-2">
      <button className="bg-blue-500 text-white text-xs px-3 py-1 rounded">Download ID</button>
      <button className="bg-gray-600 text-white text-xs px-3 py-1 rounded">Edit</button>
    </div>
  </div>
);

const AllEmployeesPage = () => {
  return (
    <div className="bg-[#f3f3f3] min-h-screen p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">All Employees</h2>
          <p className="text-sm text-gray-500">Home &gt; All Employee</p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded">+ Add New Employee</button>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
        {employees.map((employee, index) => (
          <EmployeeCard key={index} employee={employee} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 gap-2">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            className={`w-8 h-8 rounded text-sm border ${
              num === 1 ? "bg-black text-white" : "bg-white"
            }`}
          >
            {num}
          </button>
        ))}
        <span>...</span>
        <button className="w-16 h-8 rounded border text-sm">Next &gt;</button>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-xs flex justify-between text-gray-500">
        <span>© 2025 - Admin Dashboard</span>
        <div className="flex gap-4">
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default AllEmployeesPage;
