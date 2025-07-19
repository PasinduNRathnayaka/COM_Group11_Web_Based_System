import React from "react";

const EmployeeCard = ({ employee }) => {
  return (
    <div className="w-80 mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-blue-700">
      {/* Header with shop name */}
      <div className="bg-blue-800 text-center py-4 px-2">
        <h2 className="text-white text-xl font-bold">Kamal Auto Parts</h2>
      </div>

      {/* Employee image - moved down slightly */}
      <div className="flex justify-center mt-4">
        <img
          src={`http://localhost:4000${employee.image}`}
          alt={employee.name}
          className="w-24 h-24 rounded-full border-4 border-white shadow-md"
        />
      </div>

      {/* Employee Info */}
      <div className="text-center px-4 py-4">
        <h3 className="text-lg font-bold text-blue-900">{employee.name}</h3>
        <p className="text-sm text-gray-700 font-medium">
          {employee.category}
        </p>
        <p className="text-sm text-gray-600">Contact: {employee.contact}</p>
        <p className="text-sm text-gray-600">Address: {employee.address}</p>
      </div>

      {/* QR code - slightly bigger */}
      <div className="flex justify-center py-4 border-t border-gray-200">
        <img
          src={`http://localhost:4000${employee.qrCode}`}
          alt="QR Code"
          className="w-28 h-28"
        />
      </div>
    </div>
  );
};

export default EmployeeCard;
