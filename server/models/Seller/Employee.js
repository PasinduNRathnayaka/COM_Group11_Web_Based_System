import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    about: String,
    category: {
      type: String,
      required: true,
    },
    contact: String,
    rate: String,
    address: String,
    username: String,
    password: String,
    image: String,        // File name only
    qrCodePath: String,   // Relative path for QR code
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
export default Employee;
