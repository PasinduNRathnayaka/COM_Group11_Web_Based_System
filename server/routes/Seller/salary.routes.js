// routes/Seller/salary.routes.js
import express from 'express';
import { getMonthlySalary } from '../../controllers/Seller/salaryController.js';

const router = express.Router();

router.get('/monthly-salary', getMonthlySalary);

export default router;
