import express from "express";
import multer from "multer";
import path from "path";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  deleteEmployee,
  updateEmployee,
} from "../../controllers/Seller/employeeController.js";

const router = express.Router();

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/employees/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ POST Create Employee
router.post("/", upload.single("image"), createEmployee);

// ✅ GET All Employees
router.get("/", getAllEmployees);

// ✅ GET Employee By ID
router.get("/:id", getEmployeeById);

// ✅ PUT Update Employee
router.put("/:id", upload.single("image"), updateEmployee);

// ✅ DELETE Employee
router.delete("/:id", deleteEmployee);

export default router;
