import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

/**
 * Generate a QR code and save it to the specified subfolder inside /uploads/employees
 * @param {string} text - The content to encode in the QR code
 * @param {string} filename - The name of the file to save (e.g., "EMP001-qr.png", "PRD123-qr.png")
 * @param {string} subfolder - (Optional) subfolder under /uploads/employees (e.g., "Product")
 * @returns {string} - Relative path to the saved QR file (e.g., "/uploads/employees/Product/PRD123-qr.png")
 */
export const generateQR = async (text, filename, subfolder = '') => {
  const baseDir = path.resolve('uploads/employees');
  const qrDir = path.join(baseDir, subfolder);

  if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

  const qrPath = path.join(qrDir, filename);
  await QRCode.toFile(qrPath, text);

  // Return path for client (frontend)
  const relativePath = path.join('/uploads/employees', subfolder, filename).replace(/\\/g, '/');
  return relativePath;
};
