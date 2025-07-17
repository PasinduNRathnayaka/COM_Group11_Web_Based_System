import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  about: { type: String },
  category: { type: String },
  contact: { type: String },
  hourlyRate: { type: String },
  address: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String }, // path to uploaded image
  qrCode: { type: String }, // path to QR code image
}, {
  timestamps: true
});

// Avoid OverwriteModelError in dev with hot reload
const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
export default Employee;
