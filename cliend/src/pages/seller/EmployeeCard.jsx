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

  // Professional PDF generation with custom design
  const handleDownloadPDF = async () => {
    if (!employee) {
      alert("Employee data not found!");
      return;
    }

    setIsDownloading(true);
    console.log("Starting professional PDF generation...");

    try {
      // Create PDF with ID card dimensions (similar to credit card size but larger)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [85.60, 53.98] // Standard ID card size (3.375" x 2.125") scaled up
      });

      // Set background color
      pdf.setFillColor(255, 255, 255); // White background
      pdf.rect(0, 0, 85.60, 53.98, 'F');

      // Header section - Company background
      pdf.setFillColor(30, 58, 138); // Blue-800
      pdf.rect(0, 0, 85.60, 16, 'F');

      // Company name
      pdf.setTextColor(255, 255, 255); // White text
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KAMAL AUTO PARTS', 42.8, 8, { align: 'center' });
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Employee Identification Card', 42.8, 12, { align: 'center' });

      // Try to load and add employee image
      try {
        const imageUrl = `http://localhost:4000${employee.image}`;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = 60;
            canvas.height = 60;
            ctx.drawImage(img, 0, 0, 60, 60);
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Add circular image background
            pdf.setFillColor(219, 234, 254); // Blue-100
            pdf.circle(21, 30, 8, 'F');
            
            // Add employee image
            pdf.addImage(imgData, 'JPEG', 13, 22, 16, 16);
            resolve();
          };
          img.onerror = () => {
            console.log('Image failed to load, using placeholder');
            // Add placeholder circle
            pdf.setFillColor(156, 163, 175); // Gray-400
            pdf.circle(21, 30, 8, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.text('NO', 21, 28, { align: 'center' });
            pdf.text('IMG', 21, 32, { align: 'center' });
            resolve();
          };
          img.src = imageUrl;
        });
      } catch (error) {
        console.log('Error loading image:', error);
      }

      // Employee details section
      pdf.setTextColor(0, 0, 0); // Black text
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      
      // Employee name
      const name = employee.name || 'N/A';
      pdf.text(name.toUpperCase(), 35, 25);
      
      // Employee details
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99); // Gray-600
      
      pdf.text(`ID: ${employee.empId || 'N/A'}`, 35, 29);
      pdf.text(`Category: ${employee.category || 'N/A'}`, 35, 32);
      pdf.text(`Contact: ${employee.contact || 'N/A'}`, 35, 35);
      
      // Address (truncate if too long)
      const address = employee.address || 'N/A';
      const truncatedAddress = address.length > 25 ? address.substring(0, 25) + '...' : address;
      pdf.text(`Address: ${truncatedAddress}`, 35, 38);

      // Add QR code if available
      try {
        if (employee.qrCode) {
          const qrUrl = `http://localhost:4000${employee.qrCode}`;
          const qrCanvas = document.createElement('canvas');
          const qrCtx = qrCanvas.getContext('2d');
          const qrImg = new Image();
          qrImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            qrImg.onload = () => {
              qrCanvas.width = 40;
              qrCanvas.height = 40;
              qrCtx.drawImage(qrImg, 0, 0, 40, 40);
              const qrData = qrCanvas.toDataURL('image/jpeg', 0.8);
              
              // Add QR code
              pdf.addImage(qrData, 'JPEG', 65, 28, 12, 12);
              
              // QR label
              pdf.setFontSize(4);
              pdf.setTextColor(107, 114, 128); // Gray-500
              pdf.text('Scan for details', 71, 43, { align: 'center' });
              resolve();
            };
            qrImg.onerror = () => {
              console.log('QR code failed to load');
              resolve();
            };
            qrImg.src = qrUrl;
          });
        }
      } catch (error) {
        console.log('Error loading QR code:', error);
      }

      // Footer section
      pdf.setFillColor(241, 245, 249); // Gray-100
      pdf.rect(0, 45, 85.60, 8.98, 'F');
      
      pdf.setFontSize(4);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text('This card is property of Kamal Auto Parts', 42.8, 48, { align: 'center' });
      pdf.text(`Issued: ${new Date().toLocaleDateString()}`, 42.8, 51, { align: 'center' });

      // Generate filename and save
      const fileName = `${employee.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_ID_Card.pdf`;
      
      console.log("Saving professional PDF:", fileName);
      pdf.save(fileName);
      
      console.log("Professional PDF saved successfully!");

    } catch (error) {
      console.error("❌ Professional PDF Generation Failed:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Enhanced print function with better styling
  const handlePrintCard = () => {
    const printWindow = window.open('', '_blank');
    
    const cardHtml = `
      <div style="
        width: 350px;
        margin: 20px auto;
        background: white;
        border: 2px solid #ddd;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        font-family: 'Arial', sans-serif;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          text-align: center;
          padding: 15px;
        ">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold;">KAMAL AUTO PARTS</h2>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Employee Identification Card</p>
        </div>

        <!-- Body -->
        <div style="padding: 20px; text-align: center;">
          <div style="margin-bottom: 15px;">
            <img src="http://localhost:4000${employee.image}" 
                 style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 4px solid #dbeafe; box-shadow: 0 4px 10px rgba(0,0,0,0.1);"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNGM0Y0RjYiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5PIElNRzwvdGV4dD4KPC9zdmc+'" />
          </div>
          
          <h3 style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 20px;">${employee.name}</h3>
          
          <div style="text-align: center; background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 3px 0; color: #374151;"><strong>ID:</strong> ${employee.empId}</p>
            <p style="margin: 3px 0; color: #374151;"><strong>Category:</strong> ${employee.category}</p>
            <p style="margin: 3px 0; color: #374151;"><strong>Contact:</strong> ${employee.contact}</p>
            <p style="margin: 3px 0; color: #374151;"><strong>Address:</strong> ${employee.address}</p>
          </div>

          ${employee.qrCode ? `
          <div style="margin-top: 15px;">
            <img src="http://localhost:4000${employee.qrCode}" 
                 style="width: 60px; height: 60px;" />
            <p style="margin: 5px 0 0 0; font-size: 10px; color: #6b7280;">Scan for details</p>
          </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="
          background: #f1f5f9;
          text-align: center;
          padding: 10px;
          font-size: 10px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        ">
          <p style="margin: 0;">© ${new Date().getFullYear()} Kamal Auto Parts - Official Employee ID</p>
          <p style="margin: 2px 0 0 0;">Issued: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Employee ID Card - ${employee.name}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              @page { margin: 0.5in; }
            }
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif;
              background: #f3f4f6;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
          </style>
        </head>
        <body>
          ${cardHtml}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
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
          onClick={handlePrintCard}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Print Card
        </button>
        
        <button
          onClick={() => navigate(`/seller/edit-employee/${employee._id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Edit
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