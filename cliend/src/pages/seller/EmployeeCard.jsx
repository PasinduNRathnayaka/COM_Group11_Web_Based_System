import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";

const EmployeeCard = ({ employee }) => {
  const navigate = useNavigate();
  const cardRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => cardRef.current,
    documentTitle: `${employee.name}-ID-Card`,
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePrint}
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
        >
          Download / Print ID Card
        </button>

        <button
          onClick={() => navigate(`/seller/edit-employee/${employee._id}`)}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          Edit
        </button>
      </div>

      {/* Printable Card */}
      <div
        ref={cardRef}
        className="w-80 bg-white border border-black rounded-lg shadow-lg overflow-hidden mt-4"
      >
        {/* Header */}
        <div className="bg-blue-800 text-center py-4">
          <h2 className="text-white text-xl font-bold">Kamal Auto Parts</h2>
        </div>

        {/* Employee Image */}
        <div className="flex justify-center mt-4">
          <img
            src={`http://localhost:4000${employee.image}`}
            alt={employee.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow"
          />
        </div>

        {/* Info */}
        <div className="text-center px-4 py-4">
          <h3 className="text-lg font-bold text-blue-900">{employee.name}</h3>
          <p className="text-sm text-gray-700">{employee.category}</p>
          <p className="text-sm text-gray-600">Contact: {employee.contact}</p>
          <p className="text-sm text-gray-600">Address: {employee.address}</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center py-4 border-t border-gray-200">
          <img
            src={`http://localhost:4000${employee.qrCode}`}
            alt="QR Code"
            className="w-28 h-28"
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
