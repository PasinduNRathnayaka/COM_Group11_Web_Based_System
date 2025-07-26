import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: String,
  about: String,
  category: String, // This can be: 'employee', 'seller', 'admin', 'online_employee', etc.
  role: String, // Alternative field for role-based distinction
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