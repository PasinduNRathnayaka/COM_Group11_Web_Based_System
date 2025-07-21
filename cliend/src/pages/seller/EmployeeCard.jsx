import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const EmployeeCard = ({ employee, onDelete }) => {
  const navigate = useNavigate();
  const cardRef = useRef();

  const handleDelete = async () => {
    const confirm = window.confirm(`Are you sure you want to delete ${employee.name}?`);
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:4000/api/employees/${employee._id}`);
      onDelete(employee._id);
    } catch (err) {
      alert("❌ Failed to delete employee.");
      console.error(err);
    }
  };

  const handleDownloadPDF = async () => {
    const input = cardRef.current;
    if (!input) return;

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${employee.name}-ID-Card.pdf`);
    } catch (error) {
      console.error("❌ PDF Download Failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* ID Card */}
      <div
        ref={cardRef}
        className="w-80 bg-white border border-black rounded-lg shadow-lg overflow-hidden"
      >
        <div className="bg-blue-800 text-center py-4">
          <h2 className="text-white text-xl font-bold">Kamal Auto Parts</h2>
        </div>

        <div className="flex justify-center mt-4">
          <img
            src={`http://localhost:4000${employee.image}`}
            alt={employee.name}
            crossOrigin="anonymous"
            className="w-24 h-24 rounded-full border-4 border-white shadow"
          />
        </div>

        <div className="text-center px-4 py-4">
          <h3 className="text-lg font-bold text-blue-900">{employee.name}</h3>
          <p className="text-sm text-gray-700">{employee.category}</p>
          <p className="text-sm text-gray-600">Contact: {employee.contact}</p>
          <p className="text-sm text-gray-600">Address: {employee.address}</p>
        </div>

        <div className="flex justify-center py-4 border-t border-gray-200">
          <img
            src={`http://localhost:4000${employee.qrCode}`}
            alt="QR Code"
            crossOrigin="anonymous"
            className="w-28 h-28"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-1">
        <button
          onClick={handleDownloadPDF}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Download PDF
        </button>
        <button
          onClick={() => navigate(`/seller/edit-employee/${employee._id}`)}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;
