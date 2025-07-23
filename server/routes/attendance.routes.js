import express from "express";
import {
  getAttendanceByEmployee,
  createAttendance,
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.get("/:employeeId", getAttendanceByEmployee);
router.post("/", createAttendance);

export default router;
