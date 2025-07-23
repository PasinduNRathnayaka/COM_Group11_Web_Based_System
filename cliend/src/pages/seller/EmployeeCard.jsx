import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const EmployeeCard = ({ employee, onDelete }) => {
  const navigate = useNavigate();
  const cardRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Function to load image as base64
  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        try {
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    
    try {
      // Wait a bit to ensure all content is rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Configure html2canvas with better options
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });

      // Create PDF with proper dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add the canvas as image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const fileName = `${employee.name.replace(/[^a-zA-Z0-9]/g, '_')}_ID_Card.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error("❌ PDF Download Failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Alternative PDF generation method using better image handling
  const handleDownloadPDFAlternative = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);

    try {
      // Create a clone of the card for PDF generation
      const originalCard = cardRef.current;
      const clonedCard = originalCard.cloneNode(true);
      
      // Set up the clone for rendering
      clonedCard.style.position = 'absolute';
      clonedCard.style.top = '-9999px';
      clonedCard.style.left = '-9999px';
      clonedCard.style.width = '320px';
      clonedCard.style.backgroundColor = 'white';
      
      document.body.appendChild(clonedCard);

      // Wait for images to load in clone
      const images = clonedCard.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        });
      }));

      // Generate canvas from clone
      const canvas = await html2canvas(clonedCard, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Remove clone
      document.body.removeChild(clonedCard);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions to fit the card properly
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.height / canvas.width;
      
      let imgWidth = pdfWidth - 20; // 10mm margin on each side
      let imgHeight = imgWidth * canvasAspectRatio;
      
      // If image is too tall, scale it down
      if (imgHeight > pdfHeight - 20) {
        imgHeight = pdfHeight - 20;
        imgWidth = imgHeight / canvasAspectRatio;
      }
      
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      const fileName = `${employee.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_ID_Card.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error("❌ PDF Download Failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* ID Card */}
      <div
        ref={cardRef}
        className="w-80 bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="bg-blue-800 text-center py-4">
          <h2 className="text-white text-xl font-bold">Kamal Auto Parts</h2>
          <p className="text-blue-200 text-sm">Employee ID Card</p>
        </div>

        {/* Employee Photo */}
        <div className="flex justify-center mt-6 mb-4">
          <div className="relative">
            <img
              src={`http://localhost:4000${employee.image}`}
              alt={employee.name}
              className="w-24 h-24 rounded-full border-4 border-blue-200 shadow-lg object-cover"
              style={{ maxWidth: '96px', maxHeight: '96px' }}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA3NkM2MS4yNTQ4IDc2IDcyIDY1LjI1NDggNzIgNTJDNzIgMzguNzQ1MiA2MS4yNTQ4IDI4IDQ4IDI4QzM0Ljc0NTIgMjggMjQgMzguNzQ1MiAyNCA1MkMyNCA2NS4yNTQ4IDM0Ljc0NTIgNzYgNDggNzZaIiBmaWxsPSIjOUM5QzlDIi8+Cjwvc3ZnPgo=';
              }}
            />
          </div>
        </div>

        {/* Employee Details */}
        <div className="text-center px-6 py-4">
          <h3 className="text-xl font-bold text-blue-900 mb-2">{employee.name}</h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700 font-medium">{employee.category}</p>
            <p className="text-gray-600">📞 {employee.contact}</p>
            <p className="text-gray-600">📍 {employee.address}</p>
            <p className="text-gray-600">ID: {employee.empId}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <img
              src={`http://localhost:4000${employee.qrCode}`}
              alt="QR Code"
              className="w-20 h-20 mx-auto"
              style={{ maxWidth: '80px', maxHeight: '80px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <p className="text-xs text-gray-500 mt-1">Scan for details</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDownloadPDFAlternative}
          disabled={isDownloading}
          className={`${
            isDownloading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700'
          } text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2`}
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
               Download PDF
            </>
          )}
        </button>
        
        <button
          onClick={() => navigate(`/seller/edit-employee/${employee._id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          ✏️ Edit
        </button>
        
        <button
          onClick={handleDelete}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
           Delete
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;