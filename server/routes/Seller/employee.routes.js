import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createEmployee, getEmployees } from '../../controllers/Seller/employeeController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const employeeUploadDir = path.resolve(__dirname, '../../uploads/employees');

if (!fs.existsSync(employeeUploadDir)) {
  fs.mkdirSync(employeeUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, employeeUploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post("/", upload.single('image'), createEmployee);
router.get("/", getEmployees);

export default router;
