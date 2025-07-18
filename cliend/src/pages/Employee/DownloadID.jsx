// src/pages/employee/DownloadID.jsx
import React, { useRef } from "react";
import html2canvas from "html2canvas";

const DownloadID = () => {
  const idCardRef = useRef(null);

  const waitForImagesToLoad = (container) => {
    const images = container.querySelectorAll("img");
    const promises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) resolve();
        else {
          img.onload = img.onerror = () => resolve();
        }
      });
    });
    return Promise.all(promises);
  };

  const handleDownload = async () => {
    const element = idCardRef.current;
    if (!element) return;

    // Wait for images
    await waitForImagesToLoad(element);

    // Convert to image
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true, // important for public folder assets
    });

    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = "Employee_ID.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const employee = {
    name: "Kasun Perera",
    role: "Sales Assistant",
    contact: "0712345678",
    photo: "/id_sample_fixed.png",
    qrCode: "/sample_qr.png",
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h2 className="text-xl font-semibold text-gray-700 mb-1">Download ID</h2>
      <p className="text-sm text-gray-500 mb-6">Home &gt; Download ID</p>

      {/* ID Card */}
      <div
        ref={idCardRef}
        className="bg-blue-100 rounded-3xl px-6 py-8 shadow-lg w-72 text-center relative"
      >
        <h3 className="text-lg font-bold text-blue-900 mb-3">KAMAL AUTO PARTS</h3>

        <img
          src={employee.photo}
          alt="Employee"
          className="w-24 h-24 rounded-full mx-auto object-cover mb-3 border-4 border-white shadow"
        />

        <div className="text-gray-900 font-semibold text-lg">{employee.name}</div>
        <div className="text-gray-600 text-sm">{employee.role}</div>
        <div className="text-gray-500 text-sm mb-4">{employee.contact}</div>

        <img
          src={employee.qrCode}
          alt="QR Code"
          className="w-24 h-24 mx-auto mt-2 mb-4"
        />
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="mt-8 bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded-md"
      >
        DOWNLOAD
      </button>
    </div>
  );
};

export default DownloadID;
