import React, { useRef } from "react";
import QRCode from "react-qr-code";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const employees = [
  {
    id: "EMP001",
    name: "Nuwan Perera",
    role: "Mechanic",
    company: "Kamal Auto Parts",
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
  },
];

const EmployeeList = () => {
  const qrRefs = useRef({});

  const downloadPDF = async (emp) => {
    const qrElement = qrRefs.current[emp.id];

    if (!qrElement) return;

    const canvas = await html2canvas(qrElement);
    const imgData = canvas.toDataURL("image/png");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(emp.company, 20, 20);
    doc.text(`Name: ${emp.name}`, 20, 40);
    doc.text(`Role: ${emp.role}`, 20, 50);
    doc.text(`ID: ${emp.id}`, 20, 60);
    doc.addImage(imgData, "PNG", 20, 70, 50, 50);

    doc.save(`${emp.name}_ID_Card.pdf`);
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Employee ID Cards</h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {employees.map((emp) => (
          <div key={emp.id} className="border p-4 rounded shadow-md w-80 bg-white">
            <img
              src={emp.photo}
              alt="Employee"
              className="w-24 h-24 object-cover rounded-full mx-auto"
            />
            <h3 className="text-lg font-bold text-center mt-3">{emp.name}</h3>
            <p className="text-center text-sm">{emp.role}</p>
            <p className="text-center text-xs text-gray-500">{emp.company}</p>

            <div
              ref={(el) => (qrRefs.current[emp.id] = el)}
              className="bg-white p-2 mt-3 flex justify-center"
            >
              <QRCode value={`Attendance:${emp.id}`} size={100} />
            </div>

            <button
              onClick={() => downloadPDF(emp)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
            >
              Download ID Card
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeList;
