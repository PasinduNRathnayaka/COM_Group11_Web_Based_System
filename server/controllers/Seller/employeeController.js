import Employee from "../../models/Seller/Employee.js";
import { generateQR } from "../../utils/generateQR.js";
import path from "path";

// Add new employee
export const addEmployee = async (req, res) => {
  try {
    const {
      name,
      about,
      category,
      contact,
      hourlyRate,
      address,
      username,
      password,
    } = req.body;

    const image = req.file?.filename;

    if (!image) {
      return res.status(400).json({ message: "Employee image is required." });
    }

    // Generate unique EMP ID (e.g., EMP123456)
    const empId = "EMP" + Math.floor(100000 + Math.random() * 900000);

    // Generate QR and get the path
    const qrPath = await generateQR(empId);

    // Save employee
    const employee = new Employee({
      empId,
      name,
      about,
      category,
      contact,
      hourlyRate,
      address,
      username,
      password,
      image: `/uploads/employees/${image}`,
      qrCode: `/${qrPath.replace(/\\/g, "/")}`, // Normalize for Windows
    });

    await employee.save();
    res.status(201).json({ message: "Employee added successfully!", employee });
  } catch (error) {
    console.error("Add Employee Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
