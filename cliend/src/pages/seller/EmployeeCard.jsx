import React from "react";

const EmployeeCard = ({ employee }) => {
  // Construct full URL for images served from backend
  const profileUrl = employee.image ? `http://localhost:4000${employee.image}` : "/placeholder.png";
  const qrUrl = employee.qrCode ? `http://localhost:4000${employee.qrCode}` : null;

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full max-w-sm transition-all hover:shadow-lg space-y-3">
      <div className="flex items-start gap-4">
        <img src={profileUrl} alt={employee.name} className="w-16 h-16 object-cover rounded-md shadow" />
        <div className="flex-1">
          <h4 className="text-base font-semibold text-gray-800">{employee.name}</h4>
          <p className="text-xs text-gray-500">{employee.category}</p>
          <p className="text-sm text-gray-600">{employee.contact}</p>
          <p className="text-xs text-gray-400">{employee.address}</p>
        </div>
      </div>

      <div className="text-sm">
        <p className="font-medium">
          Username: <span className="text-gray-700">{employee.username}</span>
        </p>
        <p>Rate: Rs. {employee.rate}/hr</p>
      </div>

      {qrUrl && (
        <div className="flex justify-center">
          <img src={qrUrl} alt="QR Code" className="h-24 w-24 object-contain border rounded" />
        </div>
      )}

      <div className="flex justify-end">
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-5 py-1 rounded-full shadow">
          Edit
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;
