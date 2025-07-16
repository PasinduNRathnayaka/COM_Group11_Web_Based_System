import fs from "fs";
import path from "path";
import Employee from "../../models/Seller/Employee.js";
import { generateQR } from "../../utils/generateQR.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📌 Create Employee
export const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      about,
      category,
      contact,
      rate,
      address,
      username,
      password,
    } = req.body;

    const image = req.file ? req.file.filename : null;

    if (!employeeId || !name || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate QR code
    const qrPath = `uploads/employees/qr-${employeeId}.png`;
    await generateQR(employeeId, qrPath);

    // Save to DB
    const employee = new Employee({
      employeeId,
      name,
      about,
      category,
      contact,
      rate,
      address,
      username,
      password,
      image,
      qrCodePath: `employees/qr-${employeeId}.png`,
    });

    await employee.save();
    res.status(201).json({ message: "Employee created successfully", employee });
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Get All Employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// 📌 Get Employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employee" });
  }
};

// 📌 Update Employee
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const updatedData = req.body;

    if (req.file) {
      // Remove old image
      if (employee.image) {
        const oldPath = path.join(__dirname, "../../uploads/employees", employee.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updatedData.image = req.file.filename;
    }

    Object.assign(employee, updatedData);
    await employee.save();
    res.json({ message: "Employee updated", employee });
  } catch (err) {
    res.status(500).json({ error: "Failed to update employee" });
  }
};

// 📌 Delete Employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Delete image
    if (employee.image) {
      const imagePath = path.join(__dirname, "../../uploads/employees", employee.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    // Delete QR code
    if (employee.qrCodePath) {
      const qrPath = path.join(__dirname, "../../uploads", employee.qrCodePath);
      if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
    }

    await employee.deleteOne();
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete employee" });
  }
};
