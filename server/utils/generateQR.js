import QRCode from "qrcode";
import fs from "fs";
import path from "path";

// Generate QR image and save to disk
export const generateQR = async (empId) => {
  const qrDir = path.join("uploads", "employees", "qr");
  if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

  const filePath = path.join(qrDir, `${empId}.png`);
  const qrData = `EMPLOYEE_ID:${empId}`;

  await QRCode.toFile(filePath, qrData, {
    color: {
      dark: "#000000",
      light: "#ffffff"
    }
  });

  return filePath;
};
