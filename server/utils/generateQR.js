import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export const generateQR = async (text, filename) => {
  const qrDir = path.resolve('uploads/employees');
  if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

  const qrPath = path.join(qrDir, filename);
  await QRCode.toFile(qrPath, text);
  return `/uploads/employees/${filename}`;
};
