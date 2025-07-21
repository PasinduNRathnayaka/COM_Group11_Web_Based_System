import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: String,
  about: String,
  category: String,
  contact: String,
  rate: Number,
  address: String,
  username: { type: String, required: true, unique: true },
  password: String,
  email: { type: String, unique: true, sparse: true },
  image: String,
  qrCode: String,
}, { timestamps: true });

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export default Employee;

// --- utils/generateQR.js ---
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
